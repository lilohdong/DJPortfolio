<script lang="ts">
	import { ko } from '../i18n/ko';
	import type { Island } from '../sailing/islands';
	import Button from './kit/Button.svelte';
	import Chip from './kit/Chip.svelte';

	let { island, onclose }: { island: Island; onclose: () => void } = $props();

	const t = ko.panel;
	const project = $derived(island.project);
	const period = $derived(
		project ? t.formatPeriod(project.period.start, project.period.end) : null
	);
	const team = $derived(
		project ? (project.team.note ?? t.formatTeam(project.team.size, project.team.type)) : null
	);

	let heading = $state<HTMLHeadingElement>();
	$effect(() => {
		// 패널이 열리거나 다른 섬으로 바뀌면 제목으로 초점을 옮긴다 (화면 낭독기·키보드 스크롤).
		void island.id;
		heading?.focus({ preventScroll: true });
	});
</script>

<aside
	class="pointer-events-auto absolute inset-x-0 bottom-0 flex max-h-[70dvh] flex-col border-x-0 border-b-0 ui-panel md:inset-y-4 md:right-4 md:left-auto md:max-h-none md:w-[26rem] md:border-x-(length:--ui-border-width) md:border-b-(length:--ui-border-width)"
	aria-labelledby="island-panel-title"
>
	<div class="flex items-start justify-between gap-4 border-b-2 border-line/25 px-5 pt-5 pb-4">
		<div class="min-w-0">
			<h2
				id="island-panel-title"
				bind:this={heading}
				tabindex="-1"
				class="font-display text-title outline-none"
			>
				{project ? project.title : ko.lighthousePanel.heading}
			</h2>
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

	<div class="overflow-y-auto px-5 py-5 text-body">
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

			{#if project.highlights.length > 0}
				<h3 class="mt-6 mb-2 font-display text-label text-accent">{t.highlights}</h3>
				<ul class="list-[square] space-y-1 pl-5 marker:text-accent">
					{#each project.highlights as item (item)}
						<li>{item}</li>
					{/each}
				</ul>
			{/if}

			{#if project.stack.length > 0}
				<h3 class="mt-6 mb-2 font-display text-label text-accent">{t.stack}</h3>
				<ul class="flex flex-wrap gap-2">
					{#each project.stack as item (item)}
						<Chip as="li">{item}</Chip>
					{/each}
				</ul>
			{/if}

			{#if project.links.length > 0}
				<h3 class="mt-6 mb-2 font-display text-label text-accent">{t.links}</h3>
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
			{/if}

			{#if project.paragraphs.length > 0}
				<h3 class="mt-6 mb-2 font-display text-label text-accent">{t.about}</h3>
				<div class="space-y-3">
					{#each project.paragraphs as paragraph, i (i)}
						<p>{paragraph}</p>
					{/each}
				</div>
			{/if}
		{:else}
			<p>{ko.lighthousePanel.body}</p>
		{/if}
	</div>
</aside>
