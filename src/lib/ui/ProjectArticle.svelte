<script lang="ts">
	import type { BodyBlock, ContentImage, Project } from '../content/types';
	import { ko } from '../i18n/ko';
	import ContentFigure from './ContentFigure.svelte';
	import ImageZoom from './ImageZoom.svelte';
	import Button from './kit/Button.svelte';
	import Chip from './kit/Chip.svelte';

	// 프로젝트 글 (docs/ui-plan.md §3.6). 섬 패널과 프로젝트 페이지가 함께 쓴다.
	// 순서: 기간, 팀, 역할 → 링크 → 대표 그림 → 한 일 → 본문(사진이 사이사이)
	//       → 접힌 자세한 내용과 사진 더 보기 → 사용 기술
	// 제목, 요약, 로고는 부르는 쪽(패널 머리, 페이지 머리)이 그린다.
	// page 모드는 접는 구간을 처음부터 펼쳐 둔다.
	let { project, mode = 'panel' }: { project: Project; mode?: 'panel' | 'page' } = $props();

	const t = ko.panel;
	const period = $derived(t.formatPeriod(project.period.start, project.period.end));
	const team = $derived(project.team.note ?? t.formatTeam(project.team.size, project.team.type));
	const hasMore = $derived(project.more.length > 0 || project.extraImages.length > 0);

	let expanded = $state(false);
	const open = $derived(mode === 'page' || expanded);
	let zoomed = $state<ContentImage | null>(null);
	const zoom = (image: ContentImage) => (zoomed = image);
</script>

{#snippet blocks(list: BodyBlock[], eager: boolean)}
	{#each list as block, i (i)}
		{#if block.type === 'text'}
			<p>{block.text}</p>
		{:else}
			<ContentFigure image={block.image} onzoom={zoom} {eager} />
		{/if}
	{/each}
{/snippet}

{#snippet sectionTitle(label: string)}
	<h3 class="mb-2 font-display text-label text-accent">{label}</h3>
{/snippet}

<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-body-sm">
	{#if period}
		<dt class="font-semibold text-ink-muted">{t.period}</dt>
		<dd>
			{period}
			{#if project.period.note}
				<span class="text-ink-muted">{t.formatPeriodNote(project.period.note)}</span>
			{/if}
		</dd>
	{/if}
	{#if team}
		<dt class="font-semibold text-ink-muted">{t.team}</dt>
		<dd>{team}</dd>
	{/if}
	{#if project.role}
		<dt class="font-semibold text-ink-muted">{t.role}</dt>
		<dd>{project.role}</dd>
	{/if}
</dl>

{#if project.links.length > 0}
	<!-- 링크 줄: 기간, 팀, 역할 바로 아래 (ui-plan §3.6) -->
	<ul class="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label={t.links}>
		{#each project.links as link (link.label)}
			<li>
				{#if link.url}
					<!-- 외부 주소(https://…)만 들어오므로 resolve()를 거치지 않는다 (로더에서 검사) -->
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						class="text-body-sm font-semibold text-link underline underline-offset-4"
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{link.label}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{:else}
					<span class="text-body-sm text-ink-muted">{link.label}</span>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

{#if project.cover}
	<div class="mt-5">
		<ContentFigure image={project.cover} onzoom={zoom} eager />
	</div>
{/if}

{#if project.highlights.length > 0}
	<section class="mt-6">
		{@render sectionTitle(t.highlights)}
		<ul class="list-[square] space-y-1 pl-5 marker:text-accent">
			{#each project.highlights as item (item)}
				<li>{item}</li>
			{/each}
		</ul>
	</section>
{/if}

{#if project.body.length > 0 || hasMore}
	<section class="mt-6" aria-label={t.about}>
		<div class="space-y-4">{@render blocks(project.body, false)}</div>

		{#if hasMore}
			<!-- 접힌 부분의 사진은 펼치기 전에 미리 받아 둔다(eager). 펼쳤을 때 빈 칸으로 보이지 않게 한다 -->
			<div id="project-more-{project.slug}" class="mt-4 space-y-4" hidden={!open}>
				{@render blocks(project.more, true)}
				{#if project.extraImages.length > 0}
					<div class="pt-2">
						{@render sectionTitle(t.morePhotos)}
						<div class="grid grid-cols-2 gap-3">
							{#each project.extraImages as image (image.key)}
								<ContentFigure {image} onzoom={zoom} eager />
							{/each}
						</div>
					</div>
				{/if}
			</div>
			{#if mode === 'panel'}
				<Button
					class="mt-4"
					aria-expanded={expanded}
					aria-controls="project-more-{project.slug}"
					onclick={() => (expanded = !expanded)}
				>
					{expanded ? t.readLess : t.readMore}
					<span aria-hidden="true">{expanded ? '▴' : '▾'}</span>
				</Button>
			{/if}
		{/if}
	</section>
{/if}

{#if project.stack.length > 0}
	<section class="mt-6">
		{@render sectionTitle(t.stack)}
		<ul class="flex flex-wrap gap-2">
			{#each project.stack as item (item)}
				<Chip as="li">{item}</Chip>
			{/each}
		</ul>
	</section>
{/if}

{#if zoomed}
	<ImageZoom image={zoomed} onclose={() => (zoomed = null)} />
{/if}
