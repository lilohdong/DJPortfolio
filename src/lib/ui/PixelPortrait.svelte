<script lang="ts">
	import { asset } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import type { ContentImage } from '../content/types';

	// 플레이어 카드의 초상화. 프로필 사진의 얼굴 부분을 정사각형으로 잘라
	// 작은 해상도(resolution)로 줄인 뒤 image-rendering: pixelated로 키워 픽셀 화면과 맞춘다.
	// 캔버스를 못 쓰면(스크립트 꺼짐, 그리기 실패) 같은 자리에 원본 사진을 작게 보여 준다.
	let {
		photo,
		resolution = 32,
		class: className = ''
	}: { photo: ContentImage; resolution?: number; class?: string } = $props();

	let canvas = $state<HTMLCanvasElement>();
	let drawn = $state(false);
	const src = $derived(asset(photo.src as AssetPath));

	// 사진 안에서 얼굴이 있는 정사각형 (사진 크기 대비 비율). 지금 프로필 사진(세로 3:4) 기준
	const CROP = { x: 0.08, y: 0.08, size: 0.84 };

	$effect(() => {
		if (!canvas) return;
		const img = new Image();
		img.decoding = 'async';
		img.onload = () => {
			const ctx = canvas?.getContext('2d');
			if (!ctx) return;
			const side = Math.min(img.naturalWidth, img.naturalHeight) * CROP.size;
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			ctx.drawImage(
				img,
				img.naturalWidth * CROP.x,
				img.naturalHeight * CROP.y,
				side,
				side,
				0,
				0,
				resolution,
				resolution
			);
			drawn = true;
		};
		img.src = src;
	});
</script>

<span
	class={[
		'relative block shrink-0 overflow-hidden border-(length:--ui-border-width) border-line bg-shadow',
		className
	]}
	role="img"
	aria-label={photo.alt}
>
	<canvas
		bind:this={canvas}
		width={resolution}
		height={resolution}
		class={['pixelated absolute inset-0 size-full', !drawn && 'invisible']}
		aria-hidden="true"
	></canvas>
	{#if !drawn}
		<img class="size-full object-cover object-top" {src} alt="" />
	{/if}
</span>

<style>
	.pixelated {
		image-rendering: pixelated;
	}
</style>
