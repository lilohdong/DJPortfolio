<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Fog, Vector3, type DirectionalLight, type PerspectiveCamera } from 'three';
	import type { Island as IslandData } from '../sailing/islands';
	import {
		panelShift,
		visitPose,
		VISIT_ORBIT_LIMIT,
		VISIT_TRANSITION
	} from '../sailing/visit-camera';
	import { onMount } from 'svelte';
	import Boat from './Boat.svelte';
	import Island from './Island.svelte';
	import Ocean from './Ocean.svelte';
	import PixelRender from './PixelRender.svelte';
	import PixelWater from './PixelWater.svelte';
	import Sky from './Sky.svelte';
	import { kstHour, paletteAt, sunAzimuth, toHex } from '../sailing/time-of-day';
	import type { Sailing } from '../sailing/sailing.svelte';
	import type { RenderStyle } from '../sailing/render-style';

	let {
		game,
		hourOverride,
		renderStyle
	}: { game: Sailing; hourOverride: number | null; renderStyle: RenderStyle } = $props();

	const { scene } = useThrelte();
	const pixel = $derived(renderStyle.kind === 'pixel');

	// 시간대: 고정 값(?t=)이 없으면 KST 현재 시각을 30초마다 다시 읽는다.
	let now = $state(kstHour());
	onMount(() => {
		const id = setInterval(() => (now = kstHour()), 30_000);
		return () => clearInterval(id);
	});
	const hour = $derived(hourOverride ?? now);
	const palette = $derived(paletteAt(hour));

	const sunDir = $derived.by<[number, number, number]>(() => {
		const az = sunAzimuth(hour);
		const el = Math.max(palette.sunElevation, 0.08);
		return [Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el)];
	});

	const fog = new Fog('#bfe3f5', 70, 210);
	scene.fog = fog;
	$effect(() => {
		fog.color.set(toHex(palette.fog));
	});

	// 카메라: 배를 중심으로 한 극좌표로 따라간다. 요(yaw) 각도만 부드럽게 따라가고
	// 배까지의 거리·높이·내려다보는 각도는 늘 같다. 예전처럼 위치를 직선 보간하면
	// 회전 중에는 카메라가 원호 대신 현을 따라 배에 가까워졌다가, 회전이 끝나면 뒤로 물러나며
	// 화면이 가운데로 모이는 것처럼 보였다. 텔레포트·즉시 정박 때는 보간 없이 붙는다.
	const CAMERA_BACK = 15;
	const CAMERA_UP = 7.5;
	const LOOK_AHEAD = 6;
	const LOOK_HEIGHT = 1.5;
	/** 요 따라잡기 속도 (예전 위치 보간과 같은 값) */
	const YAW_FOLLOW = 3.2;
	let camera = $state<PerspectiveCamera>();
	let sun = $state<DirectionalLight>();
	let cameraYaw = 0;

	// 정박 구경 (ui-plan §3.5 안 1의 1단계). 패널이 열리면 카메라가 섬 가까이로 들어가고,
	// 닫히면 항해 카메라로 돌아온다. 두 자리 사이를 VISIT_TRANSITION초 동안 부드럽게 옮긴다.
	const { size, dom } = useThrelte();
	let visitBlend = 0;
	let visitIsland: IslandData | null = null;
	let orbit = 0;
	let orbitInput = 0;
	const sailPos = new Vector3();
	const sailLook = new Vector3();
	const visitPos = new Vector3();
	const visitLook = new Vector3();
	const look = new Vector3();
	/** 키(A/D)로 돌려 볼 때 초당 각도 */
	const ORBIT_KEY_SPEED = 1.1;
	/** 마우스로 끌 때 픽셀당 각도 */
	const ORBIT_DRAG = 0.006;

	// 지도를 열어도 구경 자리는 유지한다 (지도가 화면을 덮으므로 카메라를 굳이 옮기지 않음)
	const visiting = () => game.openIslandId !== null;
	const canLookAround = () => visiting() && !game.mapOpen;
	const clampOrbit = (a: number) => Math.max(-VISIT_ORBIT_LIMIT, Math.min(VISIT_ORBIT_LIMIT, a));

	onMount(() => {
		// 데스크톱 둘러보기: 장면을 마우스로 끌기 (모바일은 아래 시트와 손가락이 부딪혀 넣지 않음)
		let dragX: number | null = null;
		const down = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse' || e.button !== 0 || !canLookAround()) return;
			dragX = e.clientX;
		};
		const move = (e: PointerEvent) => {
			if (dragX === null) return;
			orbit = clampOrbit(orbit - (e.clientX - dragX) * ORBIT_DRAG);
			dragX = e.clientX;
		};
		const up = () => (dragX = null);
		// 키보드 둘러보기: A, D (패널이 열려 있으면 배 조작은 멈춰 있으므로 겹치지 않는다)
		const held = { a: false, d: false };
		const sync = () => (orbitInput = (held.a ? 1 : 0) - (held.d ? 1 : 0));
		const keydown = (e: KeyboardEvent) => {
			if (!canLookAround() || e.ctrlKey || e.metaKey || e.altKey) return;
			if (e.code === 'KeyA') held.a = true;
			if (e.code === 'KeyD') held.d = true;
			sync();
		};
		const keyup = (e: KeyboardEvent) => {
			if (e.code === 'KeyA') held.a = false;
			if (e.code === 'KeyD') held.d = false;
			sync();
		};
		const blur = () => {
			held.a = held.d = false;
			orbitInput = 0;
			dragX = null;
		};
		dom.addEventListener('pointerdown', down);
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
		window.addEventListener('keydown', keydown);
		window.addEventListener('keyup', keyup);
		window.addEventListener('blur', blur);
		return () => {
			dom.removeEventListener('pointerdown', down);
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
			window.removeEventListener('keydown', keydown);
			window.removeEventListener('keyup', keyup);
			window.removeEventListener('blur', blur);
		};
	});

	useTask((delta) => {
		game.step(delta);
		const { x, z, heading } = game.boat;

		if (camera) {
			const snap = game.cameraSnap;
			if (snap) {
				cameraYaw = heading;
			} else {
				const k = 1 - Math.exp(-YAW_FOLLOW * Math.min(delta, 0.1));
				cameraYaw += Math.atan2(Math.sin(heading - cameraYaw), Math.cos(heading - cameraYaw)) * k;
			}
			const fx = -Math.sin(cameraYaw);
			const fz = -Math.cos(cameraYaw);
			sailPos.set(x - fx * CAMERA_BACK, CAMERA_UP, z - fz * CAMERA_BACK);
			sailLook.set(x + fx * LOOK_AHEAD, LOOK_HEIGHT, z + fz * LOOK_AHEAD);

			// 구경할 섬이 바뀌면 둘러보기 각도를 처음으로
			const target = visiting() ? (game.openIsland ?? null) : null;
			if (target && target !== visitIsland) {
				visitIsland = target;
				orbit = 0;
			}
			const goal = target ? 1 : 0;
			if (game.reducedMotion) visitBlend = goal;
			else {
				const step = Math.min(delta, 0.1) / VISIT_TRANSITION;
				visitBlend =
					goal > visitBlend ? Math.min(goal, visitBlend + step) : Math.max(goal, visitBlend - step);
			}
			if (target) orbit = clampOrbit(orbit + orbitInput * ORBIT_KEY_SPEED * Math.min(delta, 0.1));

			const { width, height } = size.current;
			const shift = panelShift(width, height);
			const e = visitBlend * visitBlend * (3 - 2 * visitBlend);
			if (e > 0 && visitIsland) {
				const pose = visitPose(visitIsland, orbit, shift.compact);
				visitPos.set(pose.x, pose.y, pose.z);
				visitLook.set(pose.lookX, pose.lookY, pose.lookZ);
				camera.position.lerpVectors(sailPos, visitPos, e);
				look.lerpVectors(sailLook, visitLook, e);
				camera.lookAt(look);
				// 패널이 덮는 자리를 피해 화면 중심만 옮긴다 (카메라 각도는 그대로)
				camera.setViewOffset(width, height, shift.x * e, shift.y * e, width, height);
			} else {
				if (visitBlend === 0) visitIsland = null;
				camera.position.copy(sailPos);
				camera.lookAt(sailLook);
				if (camera.view) camera.clearViewOffset();
			}
			game.cameraSnap = false;
		}

		if (sun) {
			// 그림자 범위가 배 주변을 덮도록 해를 배 기준으로 옮긴다.
			sun.position.set(x + sunDir[0] * 80, sunDir[1] * 80, z + sunDir[2] * 80);
			sun.target.position.set(x, 0, z);
			sun.target.updateMatrixWorld();
		}
	});
</script>

<T.PerspectiveCamera makeDefault bind:ref={camera} fov={50} near={0.5} far={1600} />

<Sky {palette} {sunDir} />

<T.HemisphereLight
	color={toHex(palette.ambientColor)}
	groundColor={toHex(palette.water)}
	intensity={palette.ambientIntensity}
/>
<T.DirectionalLight
	bind:ref={sun}
	color={toHex(palette.sunColor)}
	intensity={palette.sunIntensity}
	castShadow
	shadow.mapSize={[1024, 1024]}
	shadow.camera.left={-45}
	shadow.camera.right={45}
	shadow.camera.top={45}
	shadow.camera.bottom={-45}
	shadow.camera.far={200}
	shadow.bias={-0.0005}
	oncreate={(ref) => {
		ref.shadow.camera.updateProjectionMatrix();
	}}
/>

{#if pixel}
	<PixelWater {game} {palette} />
	<PixelRender pixelSize={renderStyle.pixelSize} />
{:else}
	<Ocean {game} color={toHex(palette.water)} />
{/if}

{#each game.islands as island (island.id)}
	<Island {island} night={palette.night} />
{/each}

<Boat {game} flatWater={pixel} />
