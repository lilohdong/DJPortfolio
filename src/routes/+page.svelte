<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { resolve } from '$app/paths';

	// 캔버스(Three.js)는 서버 렌더링 결과에 넣지 않고 브라우저에서만 불러온다.
	let SeaCanvas = $state<Component | null>(null);

	onMount(async () => {
		SeaCanvas = (await import('#lib/scene/SeaCanvas.svelte')).default;
	});
</script>

<svelte:head>
	<title>DJ Portfolio</title>
</svelte:head>

<main class="relative h-dvh w-full overflow-hidden bg-sky-200">
	<div class="absolute inset-0">
		{#if SeaCanvas}
			<SeaCanvas />
		{/if}
	</div>

	<header class="absolute top-0 left-0 flex flex-col gap-2 p-4">
		<h1 class="text-xl font-bold text-slate-900">DJ Portfolio</h1>
		<p class="text-sm text-slate-700">항해 보기 (준비 중)</p>
		<a
			class="w-fit rounded bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900 underline"
			href={resolve('/list')}
		>
			목록으로 보기
		</a>
	</header>
</main>
