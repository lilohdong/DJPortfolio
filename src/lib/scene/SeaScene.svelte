<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Fog, Vector3, type DirectionalLight, type PerspectiveCamera } from 'three';
	import { onMount } from 'svelte';
	import Boat from './Boat.svelte';
	import Island from './Island.svelte';
	import Ocean from './Ocean.svelte';
	import Sky from './Sky.svelte';
	import { kstHour, paletteAt, sunAzimuth, toHex } from '../sailing/time-of-day';
	import type { Sailing } from '../sailing/sailing.svelte';

	let { game, hourOverride }: { game: Sailing; hourOverride: number | null } = $props();

	const { scene } = useThrelte();

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

	// 카메라: 배 뒤 위쪽에서 부드럽게 따라간다. 텔레포트·즉시 정박 때는 보간 없이 붙는다.
	const CAMERA_BACK = 15;
	const CAMERA_UP = 7.5;
	let camera = $state<PerspectiveCamera>();
	let sun = $state<DirectionalLight>();
	const desired = new Vector3();
	const target = new Vector3();
	const lookTarget = new Vector3();

	useTask((delta) => {
		game.step(delta);
		const { x, z, heading } = game.boat;
		const fx = -Math.sin(heading);
		const fz = -Math.cos(heading);

		if (camera) {
			desired.set(x - fx * CAMERA_BACK, CAMERA_UP, z - fz * CAMERA_BACK);
			target.set(x + fx * 6, 1.5, z + fz * 6);
			const k = game.cameraSnap ? 1 : 1 - Math.exp(-3.2 * Math.min(delta, 0.1));
			camera.position.lerp(desired, k);
			lookTarget.lerp(target, k);
			camera.lookAt(lookTarget);
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

<Ocean {game} color={toHex(palette.water)} />

{#each game.islands as island (island.id)}
	<Island {island} night={palette.night} />
{/each}

<Boat {game} />
