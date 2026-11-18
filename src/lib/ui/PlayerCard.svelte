<script lang="ts">
	import type { Profile } from '../content/types';
	import { ko } from '../i18n/ko';
	import PixelPortrait from './PixelPortrait.svelte';

	// 항해 화면 왼쪽 위의 플레이어 정보 카드. 누르면 제목 화면으로 간다.
	// 값은 모두 content/profile.md에서 온다. 지어낸 수치(레벨, 연차)는 넣지 않는다.
	// 모바일에서는 초상화, 이름, 진행 표시만 둔다.
	let {
		profile,
		visited,
		total,
		ontitle
	}: { profile: Profile; visited: number; total: number; ontitle: () => void } = $props();

	const t = ko.nameTag;
</script>

<button
	type="button"
	class="pointer-events-auto absolute top-4 left-4 flex max-w-[calc(100%-10rem)] items-center gap-3 ui-panel p-2 pr-4 text-left hover:bg-panel-hover"
	title={t.toTitle}
	onclick={ontitle}
>
	{#if profile.photo}
		<PixelPortrait photo={profile.photo} class="size-10 md:size-16" />
	{/if}
	<span class="flex min-w-0 flex-col gap-1">
		<span class="font-display text-label">{profile.name}</span>
		{#if profile.headline}
			<span class="hidden font-display text-label text-accent md:block">{profile.headline}</span>
		{/if}
		<span class="flex items-center gap-2">
			{#if profile.status}
				<span class="ui-chip hidden md:inline-block">{profile.status}</span>
			{/if}
			{#if total > 0}
				<span class="flex items-center gap-1">
					<span class="sr-only">{t.progressLabel(visited, total)}</span>
					<span class="flex gap-1" aria-hidden="true">
						{#each { length: total }, i (i)}
							<span
								class={[
									'block size-2 border border-line/60',
									i < visited ? 'bg-accent' : 'bg-transparent'
								]}
							></span>
						{/each}
					</span>
					<span class="font-display text-label text-ink-muted" aria-hidden="true">
						{t.progress(visited, total)}
					</span>
				</span>
			{/if}
		</span>
	</span>
	<span class="sr-only">{t.toTitle}</span>
</button>
