<script lang="ts">
	import { untrack } from 'svelte';
	import { ko } from '../i18n/ko';
	import type { Sailing } from '../sailing/sailing.svelte';

	let { game }: { game: Sailing } = $props();

	const t = ko.map;
	const b = $derived(game.bounds);
	const width = $derived(b.maxX - b.minX);
	const height = $derived(b.maxZ - b.minZ);
	const left = (x: number) => ((x - b.minX) / width) * 100;
	const top = (z: number) => ((z - b.minZ) / height) * 100;

	// 지도를 열 때의 배 위치 (매 프레임 갱신하지 않는다)
	const boat = untrack(() => ({ ...game.boat }));

	let list = $state<HTMLUListElement>();
	$effect(() => {
		// 키보드로 바로 고를 수 있게 첫 섬에 초점
		list?.querySelector('button')?.focus();
	});
</script>

<div
	class="pointer-events-auto absolute inset-0 flex items-center justify-center bg-slate-900/50 p-4"
	role="presentation"
	onclick={(e) => {
		if (e.target === e.currentTarget) game.mapOpen = false;
	}}
>
	<div
		class="flex max-h-full w-full max-w-3xl flex-col gap-3 overflow-y-auto rounded-2xl bg-white p-4 text-slate-800 shadow-2xl"
		role="dialog"
		aria-modal="true"
		aria-labelledby="map-title"
	>
		<div class="flex items-center justify-between">
			<h2 id="map-title" class="text-lg font-bold text-slate-900">{t.title}</h2>
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
				onclick={() => (game.mapOpen = false)}
			>
				{t.close}
			</button>
		</div>

		<!-- 바다 그림: 화면 낭독기에는 아래 섬 목록이 같은 역할을 한다 -->
		<div
			class="@container relative w-full overflow-hidden rounded-xl bg-sky-700"
			style:aspect-ratio="{width} / {height}"
			aria-hidden="true"
		>
			{#each game.islands as island (island.id)}
				<button
					type="button"
					tabindex="-1"
					class="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
					style:left="{left(island.x)}%"
					style:top="{top(island.z)}%"
					onclick={() => game.teleport(island.id)}
				>
					<span
						class="block aspect-square min-w-3.5 rounded-full border-2 border-amber-100 bg-emerald-500"
						style:width="{(island.size * 2 * 100) / width}cqw"
					></span>
					<span
						class="rounded bg-white/90 px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap text-slate-900"
					>
						{island.name}
					</span>
				</button>
			{/each}
			<span
				class="absolute block size-0 -translate-x-1/2 -translate-y-1/2 border-x-[6px] border-b-[12px] border-x-transparent border-b-white"
				style:left="{left(boat.x)}%"
				style:top="{top(boat.z)}%"
				style:rotate="{-boat.heading}rad"
				title={t.boat}
			></span>
		</div>

		<h3 class="text-sm font-semibold text-slate-600">{t.islandList}</h3>
		<ul class="grid gap-2 sm:grid-cols-2" bind:this={list}>
			{#each game.islands as island (island.id)}
				<li>
					<button
						type="button"
						class="w-full rounded-xl border border-slate-200 px-3 py-2 text-left hover:bg-sky-50 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
						aria-label={t.goTo(island.name)}
						onclick={() => game.teleport(island.id)}
					>
						<span class="block font-semibold text-slate-900">{island.name}</span>
						{#if island.caption}
							<span class="block text-xs text-slate-600">{island.caption}</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
