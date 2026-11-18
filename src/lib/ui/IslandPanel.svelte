<script lang="ts">
	import { asset } from '$app/paths';
	import { page } from '$app/state';
	import type { AssetPath } from '$app/types';
	import type { Profile } from '../content/types';
	import { ko } from '../i18n/ko';
	import type { Island } from '../sailing/islands';
	import ProfileArticle from './ProfileArticle.svelte';
	import ProjectArticle from './ProjectArticle.svelte';
	import Button from './kit/Button.svelte';

	// 정박 화면의 글 패널 (docs/ui-plan.md §3.6, §3.7).
	// 프로젝트 섬은 ProjectArticle, 등대섬은 ProfileArticle을 보여 준다.
	// 다른 섬으로 바뀔 때는 부르는 쪽이 {#key}로 새로 만들어 펼침 상태와 스크롤을 처음으로 돌린다.
	let {
		island,
		islands = [],
		prev = null,
		next = null,
		onclose,
		onnavigate
	}: {
		island: Island;
		/** 바다에 떠 있는 섬 전체. 등대섬 패널의 기술에서 프로젝트 섬으로 갈 때 쓴다 */
		islands?: Island[];
		prev?: Island | null;
		next?: Island | null;
		onclose: () => void;
		onnavigate?: (islandId: string) => void;
	} = $props();

	const t = ko.panel;
	const project = $derived(island.project);
	// 프로필은 +layout.server.ts가 모든 페이지에 넘긴다.
	const profile = $derived(page.data.profile as Profile | undefined);
	const projectTitles = $derived(
		Object.fromEntries(
			islands.filter((i) => i.project).map((i) => [i.project!.slug, i.project!.title])
		)
	);

	let heading = $state<HTMLHeadingElement>();
	$effect(() => {
		// 패널이 열리면 제목으로 초점을 옮긴다 (화면 낭독기, 키보드 스크롤).
		heading?.focus({ preventScroll: true });
	});
</script>

<aside
	class="pointer-events-auto absolute inset-x-0 bottom-0 flex max-h-[70dvh] flex-col border-x-0 border-b-0 ui-panel md:top-20 md:right-4 md:bottom-4 md:left-auto md:max-h-none md:w-[26rem] md:border-x-(length:--ui-border-width) md:border-b-(length:--ui-border-width) xl:w-[30rem]"
	aria-labelledby="island-panel-title"
>
	<!-- 머리: 스크롤해도 위에 남는다 -->
	<div class="flex items-start justify-between gap-4 border-b-2 border-line/25 px-5 pt-5 pb-4">
		<div class="min-w-0">
			<div class="flex items-center gap-3">
				{#if project?.logo}
					<!-- 제목이 바로 옆에 있으므로 로고는 꾸밈으로 둔다 -->
					<img
						class="h-8 w-auto max-w-24 shrink-0 object-contain"
						src={asset(project.logo.src as AssetPath)}
						alt=""
						width={project.logo.width}
						height={project.logo.height}
					/>
				{/if}
				<h2
					id="island-panel-title"
					bind:this={heading}
					tabindex="-1"
					class="font-display text-title outline-none"
				>
					{project ? project.title : ko.lighthousePanel.heading}
				</h2>
			</div>
			{#if project?.summary}
				<p class="mt-2 text-body-sm text-ink-muted">{project.summary}</p>
			{/if}
		</div>
		<Button
			class="shrink-0"
			shortcut={t.closeKey}
			aria-label={t.closeWithKey}
			title={t.closeWithKey}
			onclick={onclose}
		>
			{t.close}
		</Button>
	</div>

	<div class="flex-1 overflow-y-auto overscroll-contain px-5 py-5 text-body">
		{#if project}
			<ProjectArticle {project} />
		{:else if profile}
			<ProfileArticle
				{profile}
				{projectTitles}
				onselectproject={onnavigate ? (slug) => onnavigate(`project-${slug}`) : undefined}
			/>
		{:else}
			<p>{ko.lighthousePanel.body}</p>
		{/if}
	</div>

	{#if onnavigate && (prev || next)}
		<nav
			class="flex items-center justify-between gap-2 border-t-2 border-line/25 px-5 py-3"
			aria-label={t.islandNav}
		>
			{#if prev}
				<Button class="min-w-0" onclick={() => onnavigate(prev.id)}>
					<span aria-hidden="true">◀</span>
					<span class="truncate">{t.prevIsland(prev.name)}</span>
				</Button>
			{:else}
				<span></span>
			{/if}
			{#if next}
				<Button class="min-w-0" onclick={() => onnavigate(next.id)}>
					<span class="truncate">{t.nextIsland(next.name)}</span>
					<span aria-hidden="true">▶</span>
				</Button>
			{/if}
		</nav>
	{/if}
</aside>
