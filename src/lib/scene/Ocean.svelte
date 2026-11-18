<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { PlaneGeometry, type Mesh } from 'three';
	import { waveHeight } from '../sailing/waves';
	import type { Sailing } from '../sailing/sailing.svelte';

	/** color: CSS 색 문자열 (sRGB) */
	let { game, color }: { game: Sailing; color: string } = $props();

	// 로우폴리 수면. 배를 따라 격자 간격 단위로 옮겨 다니고, 파도는 세계 좌표로 계산해 이음매가 없다.
	const SIZE = 440;
	const CELL = 5.5;
	const SEGMENTS = Math.round(SIZE / CELL);

	const geometry = new PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
	geometry.rotateX(-Math.PI / 2);
	const positions = geometry.attributes.position;
	const baseX = Float32Array.from({ length: positions.count }, (_, i) => positions.getX(i));
	const baseZ = Float32Array.from({ length: positions.count }, (_, i) => positions.getZ(i));

	let mesh = $state<Mesh>();

	useTask(() => {
		if (!mesh) return;
		const ox = Math.round(game.boat.x / CELL) * CELL;
		const oz = Math.round(game.boat.z / CELL) * CELL;
		mesh.position.set(ox, 0, oz);
		const t = game.time;
		for (let i = 0; i < positions.count; i++) {
			positions.setY(i, waveHeight(baseX[i] + ox, baseZ[i] + oz, t));
		}
		positions.needsUpdate = true;
	});
</script>

<T.Mesh bind:ref={mesh} frustumCulled={false} receiveShadow>
	<T is={geometry} />
	<T.MeshStandardMaterial {color} flatShading roughness={0.55} metalness={0.05} />
</T.Mesh>
