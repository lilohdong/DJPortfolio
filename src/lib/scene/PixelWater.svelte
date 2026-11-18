<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		Color,
		Fog,
		PlaneGeometry,
		ShaderMaterial,
		SRGBColorSpace,
		Vector3,
		Vector4,
		type Mesh
	} from 'three';
	import { onDestroy } from 'svelte';
	import { PIER_RADIUS, PIER_TIP, type Sailing } from '../sailing/sailing.svelte';
	import type { Palette } from '../sailing/time-of-day';

	// 픽셀 스타일 수면.
	// - 조명 음영을 쓰지 않는 안정된 바탕색 (밝기 단계가 화면 전체에서 출렁이지 않게)
	// - 세계 좌표에 고정된 도트 물결 무늬 (배가 움직이면 흘러 지나간다)
	// - 섬·선착장 둘레의 얕은 물빛과 거품 띠, 배 뒤 항적
	// - 카메라에서 멀수록 짙어지는 바다색, 안개
	// 무늬 굵기는 화면 픽셀 크기(fwidth)에 맞춰 늘려, 저해상도에서 1픽셀 아래로 가늘어져 깜빡이지 않게 한다.

	let { game, palette }: { game: Sailing; palette: Palette } = $props();

	const { scene } = useThrelte();

	const MAX_ISLANDS = 16;
	const WAKE_POINTS = 32;
	/** 항적이 남는 시간 (초) */
	const WAKE_LIFE = 3.2;
	/** 항적 점을 찍는 간격 (초) */
	const WAKE_INTERVAL = 0.1;
	/** 배 중심에서 고물(뒤끝)까지 거리 */
	const STERN_OFFSET = 1.5;
	const MAX_SPEED = 16;
	/** 수면에서 본 섬 반지름 비율 (Island.svelte의 모래 받침: 위 r, 아래 1.22r, 높이 2.4의 중간) */
	const SHORE_RATIO = 1.11;

	const islandData = Array.from({ length: MAX_ISLANDS }, () => new Vector3());
	const pierData = Array.from({ length: MAX_ISLANDS }, () => new Vector3());
	const wakeData = Array.from({ length: WAKE_POINTS }, () => new Vector4());

	const material = new ShaderMaterial({
		uniforms: {
			time: { value: 0 },
			nearColor: { value: new Color() },
			farColor: { value: new Color() },
			shallowColor: { value: new Color() },
			glintColor: { value: new Color() },
			foamColor: { value: new Color() },
			fogColor: { value: new Color() },
			fogNear: { value: 70 },
			fogFar: { value: 210 },
			islands: { value: islandData },
			piers: { value: pierData },
			islandCount: { value: 0 },
			wake: { value: wakeData }
		},
		defines: { MAX_ISLANDS, WAKE_POINTS, WAKE_LIFE: WAKE_LIFE.toFixed(2) },
		vertexShader: /* glsl */ `
			varying vec3 vWorld;
			varying float vViewDepth;
			void main() {
				vec4 world = modelMatrix * vec4(position, 1.0);
				vWorld = world.xyz;
				vec4 mv = viewMatrix * world;
				vViewDepth = -mv.z;
				gl_Position = projectionMatrix * mv;
			}
		`,
		fragmentShader: /* glsl */ `
			uniform float time;
			uniform vec3 nearColor;
			uniform vec3 farColor;
			uniform vec3 shallowColor;
			uniform vec3 glintColor;
			uniform vec3 foamColor;
			uniform vec3 fogColor;
			uniform float fogNear;
			uniform float fogFar;
			uniform vec3 islands[MAX_ISLANDS];
			uniform vec3 piers[MAX_ISLANDS];
			uniform int islandCount;
			uniform vec4 wake[WAKE_POINTS];
			varying vec3 vWorld;
			varying float vViewDepth;

			float hash(vec2 p) {
				return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
			}

			void main() {
				vec2 w = vWorld.xz;
				// 이 화면 픽셀 하나가 덮는 세계 크기
				vec2 fw = max(fwidth(w), vec2(1e-3));
				float px = max(fw.x, fw.y);

				// 바탕색: 가까운 물은 밝고, 먼 바다는 짙게
				float camDist = length(w - cameraPosition.xz);
				vec3 color = mix(nearColor, farColor, smoothstep(18.0, 95.0, camDist));

				// 섬 둘레: 두 단계 얕은 물빛 + 거품 띠
				float shallow = 0.0;
				float foam = 0.0;
				float band = max(0.45, px * 1.1);
				for (int i = 0; i < MAX_ISLANDS; i++) {
					if (i >= islandCount) break;
					vec2 d = w - islands[i].xy;
					float dist = length(d);
					float edge = dist - islands[i].z;
					float ang = atan(d.y, d.x);
					// 물가선이 천천히 들고 난다
					float wob = 0.35 * sin(ang * 7.0 + time * 0.7) + 0.2 * sin(ang * 13.0 - time * 0.45);
					float s1 = step(edge, 2.8 + wob * 0.6);
					float s2 = step(edge, 6.0 + wob);
					shallow = max(shallow, 0.5 * (s1 + s2));
					foam = max(foam, step(abs(edge - 0.45 - wob * 0.5), band));
					// 한 겹 바깥의 끊긴 거품
					float seg = step(0.5, hash(vec2(floor(ang * 9.0), float(i))));
					float ring = 1.9 + 0.35 * sin(time * 0.5 + float(i));
					foam = max(foam, seg * step(abs(edge - ring), band * 0.8));
					// 선착장 끝 기둥 둘레
					float pier = length(w - piers[i].xy) - piers[i].z;
					foam = max(foam, step(abs(pier - 0.35), band * 0.8));
				}
				color = mix(color, shallowColor, shallow * 0.8);

				// 항적: 고물에서 뒤로 이어지는 점들. 가장 가까운 구간 하나만 보고,
				// 오래될수록 양옆으로 벌어지며 조각조각 끊긴다.
				float best = 1e5;
				float bestAge = 0.0;
				float bestLife = 0.0;
				float bestAlong = 0.0;
				float bestCap = 0.0;
				for (int i = 0; i < WAKE_POINTS - 1; i++) {
					vec4 a = wake[i];
					vec4 b = wake[i + 1];
					if (a.w <= 0.0 || b.w <= 0.0) continue;
					vec2 ab = b.xy - a.xy;
					float len2 = dot(ab, ab);
					float t = len2 > 1e-4 ? clamp(dot(w - a.xy, ab) / len2, 0.0, 1.0) : 0.0;
					float dist = length(w - (a.xy + ab * t));
					if (dist < best) {
						bool lastSeg = i == WAKE_POINTS - 2;
						if (!lastSeg) lastSeg = wake[i + 2].w <= 0.0;
						best = dist;
						bestAge = mix(a.z, b.z, t);
						bestLife = clamp(1.0 - bestAge / WAKE_LIFE, 0.0, 1.0) * mix(a.w, b.w, t);
						bestAlong = float(i) + t;
						// 맨 끝 너머(둥근 마개 모양)는 그리지 않는다
						bestCap = (lastSeg && t > 0.999) ? 1.0 : 0.0;
					}
				}
				float spread = 0.55 + bestAge * 0.7;
				float th = max(0.13, px * 0.6);
				float wakeLines = step(abs(best - spread), th) * (1.0 - bestCap);
				float wakeCenter = step(best, 0.3) * step(bestAge, 0.12);
				float keep = step(hash(vec2(floor(bestAlong * 1.5), 3.0)), bestLife * 1.3);
				float wakeFoam = max(wakeLines * keep, wakeCenter) * step(0.06, bestLife);

				// 도트 물결 무늬: 세계 좌표에 고정, 아주 천천히 흐르며 길어졌다 짧아진다.
				vec2 p = w + vec2(time * 0.22, time * 0.06);
				vec2 cellSize = vec2(4.2, 2.8);
				vec2 cell = floor(p / cellSize);
				float h = hash(cell);
				vec2 jitter = (vec2(hash(cell + 7.1), hash(cell + 3.3)) - 0.5) * cellSize * 0.5;
				vec2 local = p - (cell + 0.5) * cellSize - jitter;
				float pulse = max(0.0, sin(time * 0.45 + h * 6.2832));
				float halfLen = pulse * (0.4 + h * 0.4) * step(0.55, h);
				float halfThick = max(0.12, fw.y * 0.75);
				float glint = step(abs(local.y), halfThick) * step(abs(local.x), halfLen);
				// 1픽셀보다 짧은 조각은 깜빡임만 만드므로 그리지 않는다
				glint *= step(fw.x * 1.5, halfLen);
				// 멀리서는 무늬가 픽셀보다 작아져 지글거리므로 지운다
				glint *= 1.0 - smoothstep(0.35, 0.7, px);

				color = mix(color, glintColor, glint * (1.0 - shallow * 0.5));
				color = mix(color, foamColor, max(foam, wakeFoam));

				float fogFactor = smoothstep(fogNear, fogFar, vViewDepth);
				gl_FragColor = vec4(mix(color, fogColor, fogFactor), 1.0);
			}
		`
	});

	const geometry = new PlaneGeometry(900, 900, 1, 1);
	geometry.rotateX(-Math.PI / 2);
	let mesh = $state<Mesh>();

	// 섬·선착장 위치
	$effect(() => {
		const list = game.islands.slice(0, MAX_ISLANDS);
		list.forEach((island, i) => {
			islandData[i].set(island.x, island.z, island.size * SHORE_RATIO);
			const tip = island.size + PIER_TIP;
			pierData[i].set(island.x + island.dir.x * tip, island.z + island.dir.z * tip, PIER_RADIUS);
		});
		material.uniforms.islandCount.value = list.length;
	});

	// 시간대 색
	const mixColor = (a: Color, b: Color, t: number) => a.clone().lerp(b, t);
	const luminance = (c: Color) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
	$effect(() => {
		const u = material.uniforms;
		const water = new Color().setRGB(...palette.water, SRGBColorSpace);
		const horizon = new Color().setRGB(...palette.skyHorizon, SRGBColorSpace);
		const sun = new Color().setRGB(...palette.sunColor, SRGBColorSpace);
		const white = new Color(1, 1, 1);
		const teal = new Color().setRGB(0.15, 0.85, 0.9, SRGBColorSpace);
		// 밤에는 거품·반짝임도 어둡게
		const light = 1 - 0.6 * palette.night;
		// 톤 매핑(AgX)이 밝은 색의 채도를 깎아 노을·새벽 물이 회색으로 보이므로 채도를 올려 둔다.
		const hsl = { h: 0, s: 0, l: 0 };
		water.getHSL(hsl);
		water.setHSL(hsl.h, Math.min(1, hsl.s * 1.5 + 0.12), hsl.l);
		const near = water.clone().multiplyScalar(1.7);
		(u.nearColor.value as Color).copy(near);
		(u.farColor.value as Color).copy(water.clone().multiplyScalar(1.05));
		// 얕은 물: 밝기보다 색(청록)으로 구분한다. 너무 밝으면 톤 매핑에서 회색으로 바랜다.
		(u.shallowColor.value as Color).copy(
			teal.clone().multiplyScalar((luminance(near) * 1.4) / luminance(teal))
		);
		// 반짝임: 물빛을 밝힌 색에 해(달) 빛을 조금 섞는다. 회색이 되지 않게 물빛을 바탕으로.
		(u.glintColor.value as Color).copy(
			mixColor(
				near.clone().multiplyScalar(1.35 + 0.35 * light),
				mixColor(white, sun, 0.4).multiplyScalar(1.4 * light),
				0.18 * light
			)
		);
		// 거품: 톤 매핑 뒤에도 흰색으로 읽히도록 충분히 밝게. 밤에는 어둡게.
		(u.foamColor.value as Color).copy(
			mixColor(white, horizon, 0.12).multiplyScalar(0.35 + 2.6 * light * light)
		);
	});

	// 항적 기록: [0]은 지금 고물 위치, 뒤로 갈수록 오래된 점
	interface WakePoint {
		x: number;
		z: number;
		born: number;
		strength: number;
	}
	let trail: WakePoint[] = [];
	let lastSample = -Infinity;

	useTask(() => {
		if (!mesh) return;
		const { x, z, heading, speed } = game.boat;
		const t = game.time;
		mesh.position.set(x, 0, z);

		const u = material.uniforms;
		u.time.value = t;
		if (scene.fog instanceof Fog) {
			(u.fogColor.value as Color).copy(scene.fog.color);
			u.fogNear.value = scene.fog.near;
			u.fogFar.value = scene.fog.far;
		}

		const sx = x + Math.sin(heading) * STERN_OFFSET;
		const sz = z + Math.cos(heading) * STERN_OFFSET;
		const strength = Math.min(1, Math.abs(speed) / (MAX_SPEED * 0.5));
		// 텔레포트하면 이전 자취와 이어지지 않게 지운다
		if (trail.length > 0 && Math.hypot(trail[0].x - sx, trail[0].z - sz) > 6) trail = [];
		if (t - lastSample >= WAKE_INTERVAL) {
			lastSample = t;
			if (strength > 0.05) trail.unshift({ x: sx, z: sz, born: t, strength });
		}
		trail = trail.filter((p) => t - p.born < WAKE_LIFE).slice(0, WAKE_POINTS - 1);

		const head = trail.length > 0 && strength > 0.05;
		wakeData[0].set(sx, sz, 0, head ? strength : 0);
		for (let i = 1; i < WAKE_POINTS; i++) {
			const p = trail[i - 1];
			if (p) wakeData[i].set(p.x, p.z, t - p.born, p.strength);
			else wakeData[i].set(0, 0, 0, 0);
		}
	});

	onDestroy(() => {
		material.dispose();
		geometry.dispose();
	});
</script>

<T.Mesh bind:ref={mesh} {geometry} {material} frustumCulled={false} />
