<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Fog, type DirectionalLight, type PerspectiveCamera } from 'three';
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

	useTask((delta) => {
		game.step(delta);
		const { x, z, heading } = game.boat;

		if (camera) {
			if (game.cameraSnap) {
				cameraYaw = heading;
			} else {
				const k = 1 - Math.exp(-YAW_FOLLOW * Math.min(delta, 0.1));
				cameraYaw += Math.atan2(Math.sin(heading - cameraYaw), Math.cos(heading - cameraYaw)) * k;
			}
			const fx = -Math.sin(cameraYaw);
			const fz = -Math.cos(cameraYaw);
			camera.position.set(x - fx * CAMERA_BACK, CAMERA_UP, z - fz * CAMERA_BACK);
			camera.lookAt(x + fx * LOOK_AHEAD, LOOK_HEIGHT, z + fz * LOOK_AHEAD);
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
