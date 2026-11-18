<script lang="ts">
	import { untrack } from 'svelte';
	import { ko } from '../i18n/ko';
	import type { Island } from '../sailing/islands';
	import type { Sailing } from '../sailing/sailing.svelte';
	import Button from './kit/Button.svelte';

	let { game }: { game: Sailing } = $props();

	const t = ko.map;
	const b = $derived(game.bounds);
	const width = $derived(b.maxX - b.minX);
	const height = $derived(b.maxZ - b.minZ);
	const left = (x: number) => ((x - b.minX) / width) * 100;
	const top = (z: number) => ((z - b.minZ) / height) * 100;

	// 지도를 열 때의 배 위치 (매 프레임 갱신하지 않는다)
	const boat = untrack(() => ({ ...game.boat }));

	/** 배가 지금 있는 섬: 패널을 연 섬, 아니면 선착장 근처 섬 */
	const hereId = $derived(game.openIslandId ?? game.nearIslandId);

	/** 지도 위 섬 한 변 길이 (cqw). 대표 프로젝트는 한 단계 크게 그린다. 화면에서는 최소 12px. */
	function islandSize(island: Island): number {
		const base = (island.size * 2 * 100) / width;
		return island.project?.featured ? base * 1.25 : base;
	}

	// 이름표는 섬 아래에 둔다. 아래쪽에 다른 섬이나 이름표가 있으면 위로 돌린다.
	// 정확한 글자 폭은 모르므로 지도 폭에 대한 대략적인 비율로 겹침을 판단한다.
	const LABEL_HEIGHT = 7; // 지도 높이 대비 %
	const LABEL_CHAR_WIDTH = 1.6; // 지도 폭 대비 %, 글자 하나
	const labelAbove = $derived.by(() => {
		const boxes = game.islands.map((island) => {
			const cx = left(island.x);
			const cy = top(island.z);
			const half = (islandSize(island) / 2) * (width / height);
			const labelHalf = (island.name.length * LABEL_CHAR_WIDTH) / 2;
			return { id: island.id, cx, cy, half, labelHalf };
		});
		const above: Record<string, boolean> = {};
		for (const a of boxes) {
			const labelTop = a.cy + a.half;
			const labelBottom = labelTop + LABEL_HEIGHT;
			above[a.id] =
				labelBottom > 100 ||
				boxes.some(
					(o) =>
						o.id !== a.id &&
						Math.abs(o.cx - a.cx) < a.labelHalf + Math.max(o.half, o.labelHalf) &&
						o.cy - o.half < labelBottom &&
						o.cy + o.half + LABEL_HEIGHT > labelTop &&
						o.cy > a.cy
				);
		}
		return above;
	});

	let list = $state<HTMLUListElement>();
	$effect(() => {
		// 키보드로 바로 고를 수 있게 첫 섬에 초점
		list?.querySelector('button')?.focus();
	});
</script>

<div
	class="pointer-events-auto absolute inset-0 flex items-center justify-center bg-shadow/60 p-4"
	role="presentation"
	onclick={(e) => {
		if (e.target === e.currentTarget) game.mapOpen = false;
	}}
>
	<div
		class="flex max-h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto ui-panel p-5"
		role="dialog"
		aria-modal="true"
		aria-labelledby="map-title"
	>
		<div class="flex items-center justify-between gap-4">
			<h2 id="map-title" class="font-display text-title">{t.title}</h2>
			<Button
				shortcut={t.closeKey}
				aria-label={t.closeWithKey}
				title={t.closeWithKey}
				onclick={() => (game.mapOpen = false)}
			>
				{t.close}
			</Button>
		</div>

		<!-- 바다 그림: 화면 낭독기에는 아래 섬 목록이 같은 역할을 한다 -->
		<div
			class="map-sea @container relative w-full overflow-hidden border-(length:--ui-border-width) border-line"
			style:aspect-ratio="{width} / {height}"
			aria-hidden="true"
		>
			{#each game.islands as island (island.id)}
				{@const side = `max(12px, ${islandSize(island)}cqw)`}
				{@const here = island.id === hereId}
				<button
					type="button"
					tabindex="-1"
					class={[
						'absolute flex items-center gap-1',
						labelAbove[island.id] ? 'flex-col-reverse' : 'flex-col'
					]}
					style:left="{left(island.x)}%"
					style:top="{top(island.z)}%"
					style:translate="-50% {labelAbove[island.id]
						? `calc(-100% + ${side} / 2)`
						: `calc(${side} / -2)`}"
					onclick={() => game.teleport(island.id)}
				>
					<span
						class={[
							'block aspect-square border-2 border-map-sand bg-map-land',
							here && 'outline-2 outline-offset-2 outline-accent'
						]}
						style:width={side}
					></span>
					<span class="font-display text-label whitespace-nowrap ui-outline-text">
						{island.name}
					</span>
				</button>
			{/each}
			<span
				class="absolute block size-0 -translate-x-1/2 -translate-y-1/2 border-x-[6px] border-b-[12px] border-x-transparent border-b-accent"
				style:left="{left(boat.x)}%"
				style:top="{top(boat.z)}%"
				style:rotate="{-boat.heading}rad"
				title={t.boat}
			></span>
		</div>

		<h3 class="font-display text-label text-ink-muted">{t.islandList}</h3>
		<ul class="grid gap-2 sm:grid-cols-2" bind:this={list}>
			{#each game.islands as island (island.id)}
				{@const here = island.id === hereId}
				<li>
					<button
						type="button"
						class={[
							'flex w-full items-center gap-3 border-(length:--ui-border-width) bg-panel-raised px-3 py-2 text-left hover:bg-panel-hover',
							here ? 'border-accent' : 'border-transparent'
						]}
						aria-label={here ? `${t.goTo(island.name)}, ${t.here}` : t.goTo(island.name)}
						onclick={() => game.teleport(island.id)}
					>
						<span class="w-6 shrink-0 text-right font-display text-label text-ink-muted">
							{island.project?.order ?? ''}
						</span>
						<span class="min-w-0">
							<span class="block font-display text-label">{island.name}</span>
							{#if island.caption}
								<span class="block truncate text-body-sm text-ink-muted">{island.caption}</span>
							{/if}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	/* 4px 체크 무늬 바다: 픽셀 화면과 같은 격자 */
	.map-sea {
		background: repeating-conic-gradient(var(--color-map-sea) 0 25%, var(--color-map-sea-alt) 0 50%)
			0 0 / 8px 8px;
	}
</style>
