<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { PCFShadowMap } from 'three';
	import SeaScene from './SeaScene.svelte';
	import type { Sailing } from '../sailing/sailing.svelte';

	let { game, hourOverride }: { game: Sailing; hourOverride: number | null } = $props();
</script>

<!-- three 0.187에서 PCFSoftShadowMap(Threlte 기본값)이 없어져 경고가 나므로 PCF로 지정 -->
<Canvas dpr={[1, 2]} shadows={PCFShadowMap}>
	<SeaScene {game} {hourOverride} />
</Canvas>
