<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import { ko } from '#lib/i18n/ko.ts';
	import ProjectArticle from '#lib/ui/ProjectArticle.svelte';
	import type { PageProps } from './$types';

	// 프로젝트 개별 페이지 (docs/ui-plan.md §3.8). 섬 패널과 같은 글을 접는 구간까지 펼쳐 보여 준다.
	let { data }: PageProps = $props();
	const project = $derived(data.project);
	const t = ko.projectPage;
</script>

<svelte:head>
	<title>{t.title(project.title)}</title>
	{#if project.summary}<meta name="description" content={project.summary} />{/if}
</svelte:head>

<div class="min-h-dvh bg-panel text-ink">
	<div class="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
		<nav class="flex flex-wrap items-center justify-between gap-4 text-body-sm">
			<a class="font-semibold text-link underline underline-offset-4" href={resolve('list/')}>
				{t.backToList}
			</a>
			<a class="ui-btn" href={resolve(`/#project-${project.slug}`)}>
				{ko.list.toSailing}
			</a>
		</nav>

		<header>
			<div class="flex items-center gap-3">
				{#if project.logo}
					<img
						class="h-10 w-auto max-w-32 shrink-0 object-contain"
						src={asset(project.logo.src as AssetPath)}
						alt=""
						width={project.logo.width}
						height={project.logo.height}
					/>
				{/if}
				<h1 class="font-display text-[36px] leading-[48px]">{project.title}</h1>
			</div>
			{#if project.summary}
				<p class="mt-2 text-body text-ink-muted">{project.summary}</p>
			{/if}
		</header>

		<article class="text-body">
			<ProjectArticle {project} mode="page" />
		</article>

		{#if data.prev || data.next}
			<nav
				class="flex flex-wrap items-center justify-between gap-4 border-t-2 border-line/25 pt-6"
				aria-label={t.pageNav}
			>
				{#if data.prev}
					<a class="ui-btn" href={resolve(`projects/${data.prev.slug}/`)}>
						<span aria-hidden="true">◀</span>
						{t.prev(data.prev.title)}
					</a>
				{:else}
					<span></span>
				{/if}
				{#if data.next}
					<a class="ui-btn" href={resolve(`projects/${data.next.slug}/`)}>
						{t.next(data.next.title)}
						<span aria-hidden="true">▶</span>
					</a>
				{/if}
			</nav>
		{/if}
	</div>
</div>
