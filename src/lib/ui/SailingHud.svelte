<script lang="ts">
	import { onMount } from 'svelte';
	import { ko } from '../i18n/ko';
	import type { Sailing } from '../sailing/sailing.svelte';
	import IslandPanel from './IslandPanel.svelte';
	import Joystick from './Joystick.svelte';
	import MapOverlay from './MapOverlay.svelte';

	// 3D 위에 겹치는 화면 요소와 키보드 입력.
	// sceneReady가 false(로딩 중, 3D 실패)여도 지도 버튼·지도·패널은 동작한다.
	let { game, sceneReady }: { game: Sailing; sceneReady: boolean } = $props();

	let coarsePointer = $state(false);
	onMount(() => {
		const query = window.matchMedia('(pointer: coarse)');
		coarsePointer = query.matches;
		const onChange = () => (coarsePointer = query.matches);
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	});

	const pressed = { up: false, down: false, left: false, right: false };
	const KEY_MAP: Record<string, keyof typeof pressed> = {
		KeyW: 'up',
		ArrowUp: 'up',
		KeyS: 'down',
		ArrowDown: 'down',
		KeyA: 'left',
		ArrowLeft: 'left',
		KeyD: 'right',
		ArrowRight: 'right'
	};

	function syncKeys() {
		game.keys.forward = (pressed.up ? 1 : 0) - (pressed.down ? 1 : 0);
		game.keys.turn = (pressed.left ? 1 : 0) - (pressed.right ? 1 : 0);
	}

	function releaseAll() {
		pressed.up = pressed.down = pressed.left = pressed.right = false;
		syncKeys();
	}

	/** 버튼·링크에 초점이 있으면 Enter는 그 요소의 동작으로 남겨 둔다. */
	function focusOnControl(): boolean {
		const el = document.activeElement;
		return (
			!!el && el !== document.body && el.matches('a, button, input, textarea, select, [tabindex]')
		);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey || e.altKey) return;

		if (e.key === 'Escape') {
			if (game.mapOpen) game.mapOpen = false;
			else if (game.openIslandId) closePanel();
			return;
		}
		if (e.code === 'KeyM') {
			e.preventDefault();
			releaseAll();
			game.toggleMap();
			return;
		}
		if (!game.controlsActive) return;

		if (e.code === 'KeyE' || (e.key === 'Enter' && !focusOnControl())) {
			if (game.nearIslandId) {
				e.preventDefault();
				releaseAll();
				game.dock();
			}
			return;
		}
		const dir = KEY_MAP[e.code];
		if (dir && sceneReady) {
			e.preventDefault();
			pressed[dir] = true;
			syncKeys();
		}
	}

	function onkeyup(e: KeyboardEvent) {
		const dir = KEY_MAP[e.code];
		if (dir) {
			pressed[dir] = false;
			syncKeys();
		}
	}

	function closePanel() {
		game.closePanel();
		// 패널 안에 남은 초점을 풀어 Enter 정박과 방향키가 바로 다시 먹게 한다.
		(document.activeElement as HTMLElement | null)?.blur();
	}

	// 패널이나 지도가 열리면 누르고 있던 키를 놓은 것으로 친다.
	$effect(() => {
		if (!game.controlsActive) releaseAll();
	});

	const showDock = $derived(sceneReady && game.controlsActive && game.nearIsland !== null);
	const showHint = $derived(sceneReady && game.controlsActive && !game.hasMoved);
</script>

<svelte:window {onkeydown} {onkeyup} onblur={releaseAll} />

<div class="pointer-events-none absolute inset-0 z-20 overflow-hidden">
	{#if game.teleportCount > 0 && !game.reducedMotion}
		{#key game.teleportCount}
			<div class="teleport-fade absolute inset-0 bg-white"></div>
		{/key}
	{/if}

	<button
		type="button"
		class="pointer-events-auto absolute top-4 right-4 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md hover:bg-white focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
		aria-label={ko.map.openWithKey}
		title={ko.map.openWithKey}
		aria-expanded={game.mapOpen}
		onclick={() => game.toggleMap()}
	>
		{ko.map.open}
	</button>

	{#if showDock && game.nearIsland}
		<div
			class={[
				'pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-white/90 py-2 pr-2 pl-4 text-sm text-slate-900 shadow-lg',
				coarsePointer ? 'bottom-44' : 'bottom-24'
			]}
			role="status"
		>
			<span class="font-semibold whitespace-nowrap">{ko.dock.prompt(game.nearIsland.name)}</span>
			<button
				type="button"
				class="rounded-xl bg-sky-600 px-3 py-1.5 font-semibold whitespace-nowrap text-white hover:bg-sky-700 focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none"
				onclick={() => game.dock()}
			>
				{ko.dock.action}
				<kbd class="ml-1 rounded bg-white/25 px-1.5 font-mono text-xs">{ko.dock.key}</kbd>
			</button>
		</div>
	{/if}

	{#if showHint}
		<p
			class={[
				'absolute left-1/2 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl bg-slate-900/70 px-4 py-2 text-center text-sm text-white',
				coarsePointer ? 'top-20' : 'bottom-6'
			]}
		>
			{coarsePointer ? ko.controls.hintTouch : ko.controls.hint}
		</p>
	{/if}

	{#if sceneReady && coarsePointer && game.controlsActive}
		<Joystick {game} />
	{/if}

	{#if game.openIsland}
		<IslandPanel island={game.openIsland} onclose={closePanel} />
	{/if}

	{#if game.mapOpen}
		<MapOverlay {game} />
	{/if}
</div>

<style>
	.teleport-fade {
		animation: teleport-fade 0.45s ease-out forwards;
	}
	@keyframes teleport-fade {
		from {
			opacity: 0.85;
		}
		to {
			opacity: 0;
		}
	}
</style>
