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
	import TitleScreen from '#lib/ui/TitleScreen.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// 콘텐츠는 빌드 시점에 고정되므로 한 번만 만든다.
	const game = new Sailing(buildIslands(untrack(() => data.projects)));
	const projectIslands = game.islands
		.filter((island) => island.project)
		.map((island) => ({ id: island.id, name: island.name, slug: island.project!.slug }));

	type SceneStatus = 'loading' | 'ready' | 'no-webgl' | 'failed';
	let status = $state<SceneStatus>('loading');
	let hourOverride = $state<number | null>(null);
	let renderStyle = $state<RenderStyle>(DEFAULT_RENDER_STYLE);

	/**
	 * 로딩 단계 (제목 화면의 로딩 줄). 실제로 지나간 단계 수만 센다.
	 * 1: WebGL 확인, 2: 바다 코드(SeaCanvas 청크) 받음, 3: 캔버스가 그려지기 시작함
	 */
	const LOAD_STEPS = 3;
	let loadStep = $state(0);

	/** 'title': 제목 화면, 'sea': 항해 화면. 서버 렌더링 결과는 제목 화면이다. */
	let screen = $state<'title' | 'sea'>('title');
	// 제목 화면이 떠 있는 동안 장면은 프레임을 낮춘다 (T-027)
	$effect(() => {
		game.titleShown = screen === 'title';
	});
	/** 다른 날 다시 온 방문자: 로딩이 끝나면 "항해 시작"에 초점 */
	let returning = $state(false);

	// 같은 탭에서 항해를 시작했는지(sessionStorage), 전에 와 본 적 있는지(localStorage).
	// 저장소 접근이 막히면 매번 제목 화면을 보여 준다.
	const SAILED_KEY = 'djp:sailed';
	const VISITED_KEY = 'djp:visited';
	function readFlag(storage: () => Storage, key: string): boolean {
		try {
			return storage().getItem(key) === '1';
		} catch {
			return false;
		}
	}
	function writeFlag(storage: () => Storage, key: string): void {
		try {
			storage().setItem(key, '1');
		} catch {
			// 저장하지 못하면 다음에 제목 화면을 다시 보여 줄 뿐이다
		}
	}

	function enterSea() {
		screen = 'sea';
		writeFlag(() => sessionStorage, SAILED_KEY);
		writeFlag(() => localStorage, VISITED_KEY);
	}

	/** 제목 화면의 "프로젝트 바로 보기": 그 섬으로 옮기고 패널을 연다. 바다가 아직 없어도 패널은 열린다. */
	function openProject(islandId: string) {
		enterSea();
		game.teleport(islandId);
	}

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

	let sceneHost = $state<HTMLDivElement>();
	/** 장면이 붙인 캔버스가 나타나고 두 프레임이 지나면 그려지기 시작한 것으로 본다 */
	function waitForFirstFrames() {
		const check = () => {
			if (!sceneHost?.querySelector('canvas')) {
				requestAnimationFrame(check);
				return;
			}
			requestAnimationFrame(() => requestAnimationFrame(() => (loadStep = LOAD_STEPS)));
		};
		requestAnimationFrame(check);
	}

	onMount(async () => {
		game.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		hourOverride = parseHourOverride(window.location.search);
		renderStyle = parseRenderStyle(window.location.search);
		returning = readFlag(() => localStorage, VISITED_KEY);

		// #project-<slug>로 들어오면 제목 화면 없이 그 섬에 정박한 상태로 시작한다.
		const target = game.islands.find((island) => `#${island.id}` === window.location.hash);
		if (target) openProject(target.id);
		else if (readFlag(() => sessionStorage, SAILED_KEY)) screen = 'sea';

		if (!hasWebGL()) {
			status = 'no-webgl';
			return;
		}
		loadStep = 1;
		try {
			SeaCanvas = (await import('#lib/scene/SeaCanvas.svelte')).default;
			loadStep = 2;
			status = 'ready';
			waitForFirstFrames();
		} catch (error) {
			console.error(error);
			status = 'failed';
		}
	});
</script>

<svelte:head>
	<title>{ko.site.title}</title>
</svelte:head>

<main class="relative h-dvh w-full overflow-hidden bg-map-sea">
	<div class="absolute inset-0" aria-hidden="true" bind:this={sceneHost}>
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

	{#if screen === 'title'}
		<TitleScreen
			profile={data.profile}
			projects={projectIslands}
			{status}
			progress={loadStep / LOAD_STEPS}
			focusStart={returning}
			onstart={enterSea}
			onproject={openProject}
		/>
	{:else}
		{#if status === 'no-webgl' || status === 'failed'}
			<section
				class="absolute top-1/2 left-1/2 z-10 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 ui-panel p-5"
				role="alert"
			>
				<p class="font-semibold">
					{status === 'no-webgl' ? ko.fallback.noWebgl : ko.fallback.loadFailed}
				</p>
				<p class="mt-2 text-body-sm text-ink-muted">{ko.fallback.hint}</p>
				<a
					class="mt-4 inline-block font-semibold text-link underline underline-offset-4"
					href={resolve('list/')}
				>
					{ko.fallback.listLink}
				</a>
			</section>
		{/if}

		<!-- 정지 화면이면 배 조작(키, 조이스틱, 정박 안내)을 끈다. 정지 안내는 SailingHud가 띄운다 -->
		<SailingHud
			{game}
			profile={data.profile}
			sceneReady={status === 'ready' && !game.sceneStill}
			onshowtitle={() => (screen = 'title')}
		/>
	{/if}
</main>
