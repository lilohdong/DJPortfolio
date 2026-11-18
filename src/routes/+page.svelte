<script lang="ts">
	import { onMount, untrack, type Component } from 'svelte';
	import { resolve } from '$app/paths';
	import { ko } from '#lib/i18n/ko.ts';
	import { buildIslands } from '#lib/sailing/islands.ts';
	import { Sailing } from '#lib/sailing/sailing.svelte.ts';
	import { parseHourOverride } from '#lib/sailing/time-of-day.ts';
	import {
		DEFAULT_RENDER_STYLE,
		parseRenderStyle,
		type RenderStyle
	} from '#lib/sailing/render-style.ts';
	import SailingHud from '#lib/ui/SailingHud.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// 콘텐츠는 빌드 시점에 고정되므로 한 번만 만든다.
	const game = new Sailing(buildIslands(untrack(() => data.projects)));

	type SceneStatus = 'loading' | 'ready' | 'no-webgl' | 'failed';
	let status = $state<SceneStatus>('loading');
	let hourOverride = $state<number | null>(null);
	let renderStyle = $state<RenderStyle>(DEFAULT_RENDER_STYLE);

	// 캔버스(Three.js)는 서버 렌더링 결과에 넣지 않고 브라우저에서만 불러온다.
	let SeaCanvas = $state<Component<{
		game: Sailing;
		hourOverride: number | null;
		renderStyle: RenderStyle;
	}> | null>(null);

	function hasWebGL(): boolean {
		try {
			const canvas = document.createElement('canvas');
			return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
		} catch {
			return false;
		}
	}

	onMount(async () => {
		game.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		hourOverride = parseHourOverride(window.location.search);
		renderStyle = parseRenderStyle(window.location.search);
		if (!hasWebGL()) {
			status = 'no-webgl';
			return;
		}
		try {
			SeaCanvas = (await import('#lib/scene/SeaCanvas.svelte')).default;
			status = 'ready';
		} catch (error) {
			console.error(error);
			status = 'failed';
		}
	});
</script>

<svelte:head>
	<title>{ko.site.title}</title>
</svelte:head>

<main class="relative h-dvh w-full overflow-hidden bg-sky-200">
	<div class="absolute inset-0" aria-hidden="true">
		{#if SeaCanvas && status === 'ready'}
			<svelte:boundary
				onerror={(error) => {
					console.error(error);
					status = 'failed';
				}}
			>
				<SeaCanvas {game} {hourOverride} {renderStyle} />
			</svelte:boundary>
		{/if}
	</div>

	<header class="pointer-events-none absolute top-0 left-0 z-10 flex flex-col gap-2 p-4">
		<h1 class="w-fit rounded bg-white/80 px-2 py-0.5 text-xl font-bold text-slate-900">
			{ko.home.heading}
		</h1>
		<a
			class="pointer-events-auto w-fit rounded bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900 underline"
			href={resolve('list/')}
		>
			{ko.home.listLink}
		</a>
		{#if status === 'loading'}
			<p class="text-sm text-slate-700">{ko.home.loading}</p>
		{/if}
	</header>

	{#if status === 'no-webgl' || status === 'failed'}
		<section
			class="absolute top-1/2 left-1/2 z-10 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/95 p-5 text-slate-800 shadow-xl"
			role="alert"
		>
			<p class="font-semibold text-slate-900">
				{status === 'no-webgl' ? ko.fallback.noWebgl : ko.fallback.loadFailed}
			</p>
			<p class="mt-2 text-sm">{ko.fallback.hint}</p>
			<a class="mt-3 inline-block font-medium text-sky-700 underline" href={resolve('list/')}>
				{ko.fallback.listLink}
			</a>
		</section>
	{/if}

	<SailingHud {game} sceneReady={status === 'ready'} />
</main>
