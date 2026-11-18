<script lang="ts">
	import { onMount } from 'svelte';
	import { asset } from '$app/paths';
	import type { AssetPath } from '$app/types';

	// 플레이어 카드의 픽셀 초상화.
	// 그림은 scripts/make-portrait.js가 프로필 사진에서 미리 만들어 둔 작은 PNG(grid×grid)다.
	// 픽셀 경계가 번지지 않도록 화면 픽셀 기준 정수배로만 키운다.
	// 예: 격자 40, 원하는 크기 80px → 배율 1에서 80px(2배), 배율 2에서 80px(4배),
	//     배율 1.25에서는 정수배가 되는 64px 또는 96px 중 가까운 쪽.
	let {
		src,
		grid,
		alt,
		size
	}: {
		/** static/ 기준 경로 */
		src: string;
		/** 그림의 가로세로 픽셀 수 */
		grid: number;
		alt: string;
		/** 원하는 CSS 크기(px). 실제 크기는 이 값에 가장 가까운 정수배로 맞춘다 */
		size: number;
	} = $props();

	let dpr = $state(1);
	onMount(() => {
		// 창을 다른 배율의 화면으로 옮기면 다시 맞춘다.
		let query: MediaQueryList;
		const update = () => {
			dpr = window.devicePixelRatio || 1;
			query?.removeEventListener('change', update);
			query = window.matchMedia(`(resolution: ${dpr}dppx)`);
			query.addEventListener('change', update);
		};
		update();
		return () => query?.removeEventListener('change', update);
	});

	/** 화면 픽셀로 grid의 정수배(1배 이상)가 되는 CSS 크기 */
	const cssSize = $derived.by(() => {
		const scale = Math.max(1, Math.round((size * dpr) / grid));
		return (scale * grid) / dpr;
	});
</script>

<img
	class="pixelated block shrink-0 border-(length:--ui-border-width) border-line bg-shadow"
	src={asset(src as AssetPath)}
	{alt}
	width={grid}
	height={grid}
	style:width="{cssSize}px"
	style:height="{cssSize}px"
	style:box-sizing="content-box"
/>

<style>
	.pixelated {
		image-rendering: pixelated;
	}
</style>
