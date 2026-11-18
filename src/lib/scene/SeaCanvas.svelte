<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { PCFShadowMap } from 'three';
	import SeaScene from './SeaScene.svelte';
	import type { Sailing } from '../sailing/sailing.svelte';
	import type { RenderStyle } from '../sailing/render-style';

	let {
		game,
		hourOverride,
		renderStyle
	}: { game: Sailing; hourOverride: number | null; renderStyle: RenderStyle } = $props();

	// 픽셀 렌더는 PixelRender가 직접 그리므로 Threlte 기본 렌더를 끈다.
	const pixel = $derived(renderStyle.kind === 'pixel');
</script>

<!-- three 0.187에서 PCFSoftShadowMap(Threlte 기본값)이 없어져 경고가 나므로 PCF로 지정 -->
<Canvas dpr={[1, 2]} shadows={PCFShadowMap} autoRender={!pixel}>
	<SeaScene {game} {hourOverride} {renderStyle} />
</Canvas>
