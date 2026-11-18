<script lang="ts">
	import { T, useScheduler, useTask, useThrelte } from '@threlte/core';
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
	import { canvasDpr, LOWEST_LEVEL, type Quality } from './quality.svelte';

	let {
		game,
		hourOverride,
		renderStyle,
		quality
	}: {
		game: Sailing;
		hourOverride: number | null;
		renderStyle: RenderStyle;
		quality: Quality;
	} = $props();

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
	/** 마우스로 끌어 둘러보는 중이면 끈 자리의 x */
	let dragX: number | null = null;
	const clampOrbit = (a: number) => Math.max(-VISIT_ORBIT_LIMIT, Math.min(VISIT_ORBIT_LIMIT, a));

	onMount(() => {
		// 데스크톱 둘러보기: 장면을 마우스로 끌기 (모바일은 아래 시트와 손가락이 부딪혀 넣지 않음)
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

	// ── 프레임 조절과 자동 품질 (T-029) ──
	// Threlte 기본 루프는 모니터 주사율(144Hz면 144번)대로 장면을 그린다. 루프를 바꿔
	// 상태별 상한을 두고, 프레임 시간이 길면 품질을 한 단계씩 낮춘다.
	const { renderer } = useThrelte();
	const { scheduler, frameInvalidated } = useScheduler();
	const TITLE_FPS = 15;
	const VISIT_SETTLED_FPS = 20;
	const IDLE_FPS = 30;
	const REDUCED_MOTION_FPS = 30;
	/** 정지 화면에서도 가끔 한 장 그려 시간대 색 등이 따라오게 한다 */
	const STILL_FPS = 0.2;
	/** 자동 품질: 이 시간 동안 모아 판단한다 */
	const MEASURE_WINDOW = 2000;
	/** 시작 직후와 품질을 바꾼 직후에는 셰이더 컴파일 등으로 느리므로 재지 않는다 */
	const WARMUP = 3000;
	/** 정지 화면으로 바꾸는 기준: 가장 낮은 단계에서도 프레임당 이 이상 걸리면 */
	const STILL_FRAME_MS = 100;

	let idle = false;
	let visitSettled = false;
	let stillDirty = true;

	// 정지 화면에서는 패널·지도·이동이 바뀔 때만 한 장 다시 그린다
	$effect(() => {
		void game.openIslandId;
		void game.teleportCount;
		void game.mapOpen;
		stillDirty = true;
	});

	function targetFps(): number {
		if (document.visibilityState === 'hidden') return 0;
		if (game.sceneStill) return stillDirty ? 1000 : STILL_FPS;
		let fps = quality.settings.fpsCap;
		if (game.reducedMotion) fps = Math.min(fps, REDUCED_MOTION_FPS);
		// 낮은 단계에서는 상한에 비례해 함께 낮춘다 (상한 30이면 제목 15, 구경 15, 정지 20)
		if (game.titleShown) return Math.min(fps / 2, TITLE_FPS);
		if (visitSettled) return Math.min(fps / 2, VISIT_SETTLED_FPS);
		if (idle) return Math.min((fps * 2) / 3, IDLE_FPS);
		return fps;
	}

	let measureFrom = 0;
	let frames = 0;
	let slowFrames = 0;
	let workSum = 0;
	let intervalSum = 0;
	let lastRun = 0;

	function resetMeasure(now: number, wait: number) {
		measureFrom = now + wait;
		frames = slowFrames = workSum = intervalSum = 0;
	}

	function measure(now: number, work: number, expected: number) {
		const interval = lastRun ? now - lastRun : expected;
		lastRun = now;
		if (game.sceneStill || now < measureFrom) return;
		// 탭이 가려졌다 돌아온 간격 같은 것은 빼고 다시 잰다
		if (interval > 1000) return resetMeasure(now, 0);
		frames += 1;
		workSum += work;
		intervalSum += interval;
		// 목표: 프레임당 20ms 안팎. 상한보다 1.6배 이상, 25ms 넘게 늦은 프레임을 느린 프레임으로 센다
		if (interval > Math.max(expected * 1.6, 25)) slowFrames += 1;
		if (now - measureFrom < MEASURE_WINDOW) return;
		const avgWork = workSum / frames;
		const avgInterval = intervalSum / frames;
		const slow = slowFrames / frames > 0.4 || avgWork > 14;
		if (!quality.forced && quality.level >= LOWEST_LEVEL) {
			if (avgWork > STILL_FRAME_MS || avgInterval > STILL_FRAME_MS * 2.5) game.sceneStill = true;
		} else if (slow && quality.lower()) {
			return resetMeasure(now, WARMUP);
		}
		resetMeasure(now, 0);
	}

	// 가장 낮은 단계는 캔버스를 CSS보다 작게 그리므로 브라우저가 늘릴 때 계단 모양을 지키게 한다
	$effect(() => {
		renderer.domElement.style.imageRendering = canvasDpr(quality.level) < 1 ? 'pixelated' : '';
	});

	onMount(() => {
		resetMeasure(performance.now(), WARMUP);
		// 그림자 지도는 해 자리가 바뀔 때만 다시 그린다 (아래 useTask에서 needsUpdate)
		renderer.shadowMap.autoUpdate = !pixel;
		renderer.shadowMap.needsUpdate = true;
		let last = -Infinity;
		renderer.setAnimationLoop((time) => {
			const fps = targetFps();
			if (fps <= 0) return;
			const interval = 1000 / fps;
			// 주사율이 상한보다 높으면 몇 번 건너뛴다. 평균이 상한에 맞도록 마지막 시각을 간격만큼 민다.
			if (time - last < interval - 1.5) return;
			last = Math.max(last + interval, time - interval);
			const start = performance.now();
			scheduler.run(time);
			frameInvalidated.current = false;
			stillDirty = false;
			measure(start, performance.now() - start, interval);
		});
	});

	let shadowX = NaN;
	let shadowZ = NaN;
	let shadowSun: readonly number[] | null = null;
	let shadowOn = true;

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
			if (game.reducedMotion || game.sceneStill) visitBlend = goal;
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

			// 프레임 조절용 상태: 가만히 있는지, 구경 카메라가 자리를 잡았는지
			const b = game.boat;
			const input =
				game.keys.forward !== 0 ||
				game.keys.turn !== 0 ||
				game.joystick.forward !== 0 ||
				game.joystick.turn !== 0;
			const yawGap = Math.abs(
				Math.atan2(Math.sin(heading - cameraYaw), Math.cos(heading - cameraYaw))
			);
			idle =
				!input &&
				Math.abs(b.speed) < 0.05 &&
				Math.abs(b.turnVelocity) < 0.01 &&
				yawGap < 0.002 &&
				visitBlend === 0;
			visitSettled = target !== null && visitBlend === 1 && orbitInput === 0 && dragX === null;
		}

		if (sun) {
			// 그림자 범위가 배 주변을 덮도록 해를 배 기준으로 옮긴다.
			// 4칸 단위로 끊어 옮기고, 자리나 해 방향이 바뀔 때만 그림자 지도를 다시 그린다.
			const sx = Math.round(x / 4) * 4;
			const sz = Math.round(z / 4) * 4;
			const on = quality.settings.shadows;
			sun.castShadow = on;
			if (sx !== shadowX || sz !== shadowZ || sunDir !== shadowSun || on !== shadowOn) {
				shadowX = sx;
				shadowZ = sz;
				shadowSun = sunDir;
				shadowOn = on;
				sun.position.set(sx + sunDir[0] * 80, sunDir[1] * 80, sz + sunDir[2] * 80);
				sun.target.position.set(sx, 0, sz);
				sun.target.updateMatrixWorld();
				renderer.shadowMap.needsUpdate = true;
			}
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
	<PixelWater {game} {palette} still={game.reducedMotion} />
	<PixelRender
		pixelSize={renderStyle.pixelSize + quality.settings.extraPx}
		sharpFlags={quality.settings.sharpFlags === 'always' || game.openIslandId !== null}
	/>
{:else}
	<Ocean {game} color={toHex(palette.water)} />
{/if}

{#each game.islands as island (island.id)}
	<Island {island} night={palette.night} />
{/each}

<Boat {game} flatWater={pixel} still={game.reducedMotion} />
