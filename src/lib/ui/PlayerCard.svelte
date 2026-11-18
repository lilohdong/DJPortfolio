<script lang="ts">
	import { asset } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import type { Profile } from '../content/types';
	import { ko } from '../i18n/ko';

	// 항해 화면 왼쪽 위의 플레이어 정보 카드. 누르면 제목 화면으로 간다.
	// 글은 모두 content/profile.md에서 온다(이름, 한 줄 소개, 상태). 지어낸 수치(레벨, 연차)는 넣지 않는다.
	// 줄: 이름 / 한 줄 소개 / 상태 칩 / 들른 섬. 초상화는 정사각형 그대로 다 보이고 줄지 않는다.
	// 모바일에서는 초상화, 이름, 들른 섬만 둔다.
	let {
		profile,
		visited,
		total,
		ontitle
	}: { profile: Profile; visited: number; total: number; ontitle: () => void } = $props();

	const t = ko.nameTag;

	/**
	 * scripts/make-portrait.js(npm run portrait)로 만든 초상화. 머리부터 어깨까지 자른 240×240 사진.
	 * 화면에는 데스크톱 80px, 모바일 40px로 부드럽게 줄여 보여 준다(배율 3까지 선명).
	 */
	const PORTRAIT = { src: 'content/profile/portrait.webp', size: 240 };
</script>

<button
	type="button"
	class="pointer-events-auto absolute top-4 left-4 flex max-w-[calc(100%-11rem)] items-start gap-3 ui-panel p-2 pr-4 text-left hover:bg-panel-hover md:max-w-sm"
	title={t.toTitle}
	onclick={ontitle}
>
	{#if profile.photo}
		<img
			class="box-content block size-10 shrink-0 border-(length:--ui-border-width) border-line bg-shadow object-cover md:size-20"
			src={asset(PORTRAIT.src as AssetPath)}
			alt={profile.photo.alt}
			width={PORTRAIT.size}
			height={PORTRAIT.size}
			decoding="async"
		/>
	{/if}
	<span class="flex min-w-0 flex-col gap-1">
		<span class="truncate font-display text-label">{profile.name}</span>
		{#if profile.headline}
			<span class="hidden truncate font-display text-label text-accent md:block">
				{profile.headline}
			</span>
		{/if}
		{#if profile.status}
			<span class="hidden md:block">
				<span class="ui-chip">{profile.status}</span>
			</span>
		{/if}
		{#if total > 0}
			<span class="flex flex-wrap items-center gap-x-2 gap-y-1">
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
				<span class="font-display text-label whitespace-nowrap text-ink-muted" aria-hidden="true">
					{t.progress(visited, total)}
				</span>
			</span>
		{/if}
	</span>
	<span class="sr-only">{t.toTitle}</span>
</button>
