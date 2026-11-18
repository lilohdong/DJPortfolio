<script lang="ts">
	import { asset } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import type { BodyBlock, ContentImage } from '../content/types';
	import { ko } from '../i18n/ko';
	import type { Island } from '../sailing/islands';
	import ContentFigure from './ContentFigure.svelte';
	import ImageZoom from './ImageZoom.svelte';
	import Button from './kit/Button.svelte';
	import Chip from './kit/Chip.svelte';

	// 정박 화면의 글 패널 (docs/ui-plan.md §3.6).
	// 순서: 머리(로고, 제목, 요약) → 기간, 팀, 역할 → 대표 그림 → 한 일 → 본문(사진이 사이사이)
	//       → 접힌 자세한 내용과 사진 더 보기 → 사용 기술 → 링크 → 이전, 다음 섬
	// 다른 섬으로 바뀔 때는 부르는 쪽이 {#key}로 새로 만들어 펼침 상태와 스크롤을 처음으로 돌린다.
	let {
		island,
		prev = null,
		next = null,
		onclose,
		onnavigate
	}: {
		island: Island;
		prev?: Island | null;
		next?: Island | null;
		onclose: () => void;
		onnavigate?: (islandId: string) => void;
	} = $props();

	const t = ko.panel;
	const project = $derived(island.project);
	const period = $derived(
		project ? t.formatPeriod(project.period.start, project.period.end) : null
	);
	const team = $derived(
		project ? (project.team.note ?? t.formatTeam(project.team.size, project.team.type)) : null
	);
	const hasMore = $derived(
		!!project && (project.more.length > 0 || project.extraImages.length > 0)
	);

	let expanded = $state(false);
	let zoomed = $state<ContentImage | null>(null);

	let heading = $state<HTMLHeadingElement>();
	$effect(() => {
		// 패널이 열리면 제목으로 초점을 옮긴다 (화면 낭독기, 키보드 스크롤).
		heading?.focus({ preventScroll: true });
	});

	const zoom = (image: ContentImage) => (zoomed = image);
</script>

{#snippet blocks(list: BodyBlock[])}
	{#each list as block, i (i)}
		{#if block.type === 'text'}
			<p>{block.text}</p>
		{:else}
			<ContentFigure image={block.image} onzoom={zoom} />
		{/if}
	{/each}
{/snippet}

{#snippet sectionTitle(label: string)}
	<h3 class="mb-2 font-display text-label text-accent">{label}</h3>
{/snippet}

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
					<div class="space-y-4">{@render blocks(project.body)}</div>

					{#if hasMore}
						<div id="island-panel-more" class="mt-4 space-y-4" hidden={!expanded}>
							{@render blocks(project.more)}
							{#if project.extraImages.length > 0}
								<div class="pt-2">
									{@render sectionTitle(t.morePhotos)}
									<div class="grid grid-cols-2 gap-3">
										{#each project.extraImages as image (image.key)}
											<ContentFigure {image} onzoom={zoom} />
										{/each}
									</div>
								</div>
							{/if}
						</div>
						<Button
							class="mt-4"
							aria-expanded={expanded}
							aria-controls="island-panel-more"
							onclick={() => (expanded = !expanded)}
						>
							{expanded ? t.readLess : t.readMore}
							<span aria-hidden="true">{expanded ? '▴' : '▾'}</span>
						</Button>
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

			{#if project.links.length > 0}
				<section class="mt-6">
					{@render sectionTitle(t.links)}
					<ul class="space-y-1">
						{#each project.links as link (link.label)}
							<li>
								{#if link.url}
									<!-- 외부 주소(https://…)만 들어오므로 resolve()를 거치지 않는다 (로더에서 검사) -->
									<!-- eslint-disable svelte/no-navigation-without-resolve -->
									<a
										class="font-semibold text-link underline underline-offset-4"
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
									>
										{link.label}
									</a>
									<!-- eslint-enable svelte/no-navigation-without-resolve -->
								{:else}
									<span class="text-ink-muted">{link.label}</span>
								{/if}
							</li>
						{/each}
					</ul>
				</section>
			{/if}
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

	{#if zoomed}
		<ImageZoom image={zoomed} onclose={() => (zoomed = null)} />
	{/if}
</aside>
