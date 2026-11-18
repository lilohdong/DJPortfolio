<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { PCFShadowMap } from 'three';
	import { untrack } from 'svelte';
	import SeaScene from './SeaScene.svelte';
	import { canvasDpr, detectRenderer, Quality } from './quality.svelte';
	import type { Sailing } from '../sailing/sailing.svelte';
	import type { RenderStyle } from '../sailing/render-style';

	let {
		game,
		hourOverride,
		renderStyle
	}: { game: Sailing; hourOverride: number | null; renderStyle: RenderStyle } = $props();

	// 픽셀 렌더는 PixelRender가 직접 그리므로 Threlte 기본 렌더를 끈다.
	const pixel = $derived(renderStyle.kind === 'pixel');

	// 품질 단계: ?quality= 가 있으면 고정, 없으면 자동. 그래픽 가속이 없으면 가장 낮은 단계로 시작한다.
	const quality = new Quality(
		untrack(() => renderStyle.quality),
		detectRenderer(),
		untrack(() => renderStyle.qualityDebug)
	);
	// 고해상도 화면에서도 캔버스 실제 픽셀 수에 상한을 둔다
	const dpr = $derived(canvasDpr(quality.level));
</script>

<!-- three 0.187에서 PCFSoftShadowMap(Threlte 기본값)이 없어져 경고가 나므로 PCF로 지정 -->
<Canvas {dpr} shadows={PCFShadowMap} autoRender={!pixel}>
	<SeaScene {game} {hourOverride} {renderStyle} {quality} />
</Canvas>
