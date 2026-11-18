<script lang="ts">
	import { onMount } from 'svelte';
	import { ko } from '../i18n/ko';
	import type { Sailing } from '../sailing/sailing.svelte';
	import IslandPanel from './IslandPanel.svelte';
	import Joystick from './Joystick.svelte';
	import MapOverlay from './MapOverlay.svelte';
	import Button from './kit/Button.svelte';

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
			else if (helpOpen) helpOpen = false;
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

	/** ? 버튼으로 연 조작 안내. 처음 들어왔을 때(배를 아직 안 움직였을 때)는 저절로 보인다. */
	let helpOpen = $state(false);

	// 패널 바닥의 이전, 다음 섬. 섬 목록은 등대섬 다음에 프로젝트가 order 순서로 놓여 있고,
	// 마지막 프로젝트 다음은 등대섬으로 돌아간다. 섬이 둘뿐이면 이전과 다음이 같으므로 다음만 둔다.
	const neighbors = $derived.by(() => {
		const list = game.islands;
		const i = list.findIndex((island) => island.id === game.openIslandId);
		if (i < 0 || list.length < 2) return { prev: null, next: null };
		const next = list[(i + 1) % list.length];
		const prev = list.length > 2 ? list[(i - 1 + list.length) % list.length] : null;
		return { prev, next };
	});

	const showDock = $derived(sceneReady && game.controlsActive && game.nearIsland !== null);
	// 정박 안내와 처음 안내가 함께 뜨면 처음 안내는 숨긴다. ?로 직접 연 안내는 그대로 둔다.
	const showHint = $derived(
		sceneReady && game.controlsActive && (helpOpen || (!game.hasMoved && !showDock))
	);
</script>

<svelte:window {onkeydown} {onkeyup} onblur={releaseAll} />

<div class="pointer-events-none absolute inset-0 z-20 overflow-hidden">
	{#if game.teleportCount > 0 && !game.reducedMotion}
		{#key game.teleportCount}
			<div class="teleport-fade absolute inset-0 bg-flash"></div>
		{/key}
	{/if}

	<div class="pointer-events-auto absolute top-4 right-4 flex gap-2">
		<Button
			shortcut={coarsePointer ? undefined : ko.map.key}
			aria-label={ko.map.openWithKey}
			title={ko.map.openWithKey}
			aria-expanded={game.mapOpen}
			onclick={() => game.toggleMap()}
		>
			{ko.map.open}
		</Button>
		<Button
			class="min-w-9"
			aria-label={helpOpen ? ko.controls.helpHide : ko.controls.helpShow}
			title={helpOpen ? ko.controls.helpHide : ko.controls.helpShow}
			aria-expanded={helpOpen}
			aria-controls="controls-hint"
			disabled={!sceneReady}
			onclick={() => (helpOpen = !helpOpen)}
		>
			{ko.controls.helpButton}
		</Button>
	</div>

	{#if showDock && game.nearIsland}
		<div
			class={[
				'pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-4 ui-panel py-2 pr-2 pl-4',
				coarsePointer ? 'bottom-44' : 'bottom-20'
			]}
			role="status"
		>
			<span class="font-display text-label whitespace-nowrap">
				{ko.dock.prompt(game.nearIsland.name)}
			</span>
			<Button
				variant="primary"
				shortcut={coarsePointer ? undefined : ko.dock.key}
				onclick={() => game.dock()}
			>
				{ko.dock.action}
			</Button>
		</div>
	{/if}

	{#if showHint}
		<p
			id="controls-hint"
			class={[
				'absolute left-1/2 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 ui-panel px-4 py-2 text-center text-body-sm',
				// 터치 화면에서는 왼쪽 위 이름표 아래에 둔다 (조이스틱이 아래쪽을 쓴다)
				coarsePointer ? 'top-24' : 'bottom-4'
			]}
		>
			{coarsePointer ? ko.controls.hintTouch : ko.controls.hint}
		</p>
	{/if}

	{#if sceneReady && coarsePointer && game.controlsActive}
		<Joystick {game} />
	{/if}

	{#if game.openIsland}
		{#key game.openIsland.id}
			<IslandPanel
				island={game.openIsland}
				prev={neighbors.prev}
				next={neighbors.next}
				onclose={closePanel}
				onnavigate={(id) => game.teleport(id)}
			/>
		{/key}
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
