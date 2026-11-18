<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import type { Project } from '../content/types';
	import { ko } from '../i18n/ko';

	// 목록 페이지의 프로젝트 카드 (docs/ui-plan.md §3.8).
	// 로고, 대표 이미지, 이름, 요약, 기간과 팀, 기술 칩 4개까지. 누르면 프로젝트 페이지로 간다.
	let { project }: { project: Project } = $props();

	const t = ko.panel;
	const period = $derived(t.formatPeriod(project.period.start, project.period.end));
	const team = $derived(project.team.note ?? t.formatTeam(project.team.size, project.team.type));
	const STACK_LIMIT = 4;
</script>

<a
	class="group flex h-full flex-col ui-panel hover:bg-panel-hover"
	href={resolve(`projects/${project.slug}/`)}
	aria-label={ko.list.openProject(project.title)}
>
	{#if project.cover}
		<img
			class="block aspect-video w-full border-b-(length:--ui-border-width) border-line bg-shadow object-cover object-top"
			src={asset(project.cover.src as AssetPath)}
			alt=""
			width={project.cover.width}
			height={project.cover.height}
			loading="lazy"
			decoding="async"
		/>
	{/if}
	<div class="flex flex-1 flex-col gap-2 p-4">
		<div class="flex items-center gap-3">
			{#if project.logo}
				<img
					class="h-8 w-auto max-w-24 shrink-0 object-contain"
					src={asset(project.logo.src as AssetPath)}
					alt=""
					width={project.logo.width}
					height={project.logo.height}
					loading="lazy"
				/>
			{/if}
			<h3 class="font-display text-title">{project.title}</h3>
		</div>
		{#if project.summary}
			<p class="text-body-sm">{project.summary}</p>
		{/if}
		<p class="flex flex-wrap gap-x-3 text-body-sm text-ink-muted">
			{#if period}<span>{period}</span>{/if}
			{#if team}<span>{team}</span>{/if}
		</p>
		{#if project.stack.length > 0}
			<ul class="mt-auto flex flex-wrap gap-2 pt-2">
				{#each project.stack.slice(0, STACK_LIMIT) as item (item)}
					<li class="ui-chip">{item}</li>
				{/each}
			</ul>
		{/if}
	</div>
</a>
