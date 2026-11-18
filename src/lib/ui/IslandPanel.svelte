<script lang="ts">
	import { ko } from '../i18n/ko';
	import type { Island } from '../sailing/islands';

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
	class="pointer-events-auto absolute inset-x-0 bottom-0 flex max-h-[70dvh] flex-col rounded-t-2xl bg-white/95 text-slate-800 shadow-2xl backdrop-blur md:inset-y-4 md:right-4 md:left-auto md:max-h-none md:w-[26rem] md:rounded-2xl"
	aria-labelledby="island-panel-title"
>
	<div class="flex items-start justify-between gap-3 border-b border-slate-200 px-5 pt-5 pb-3">
		<div class="min-w-0">
			<h2
				id="island-panel-title"
				bind:this={heading}
				tabindex="-1"
				class="text-xl font-bold text-slate-900 outline-none"
			>
				{project ? project.title : ko.lighthousePanel.heading}
			</h2>
			{#if project?.summary}
				<p class="mt-1 text-sm text-slate-600">{project.summary}</p>
			{/if}
		</div>
		<button
			type="button"
			class="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
			aria-label={t.closeWithKey}
			title={t.closeWithKey}
			onclick={onclose}
		>
			{t.close}
		</button>
	</div>

	<div class="overflow-y-auto px-5 py-4 text-sm leading-relaxed">
		{#if project}
			<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
				{#if period}
					<dt class="font-semibold text-slate-500">{t.period}</dt>
					<dd>
						{period}{#if project.period.note}<span class="text-slate-500">
								· {project.period.note}
							</span>{/if}
					</dd>
				{/if}
				{#if team}
					<dt class="font-semibold text-slate-500">{t.team}</dt>
					<dd>{team}</dd>
				{/if}
				{#if project.role}
					<dt class="font-semibold text-slate-500">{t.role}</dt>
					<dd>{project.role}</dd>
				{/if}
			</dl>

			{#if project.highlights.length > 0}
				<h3 class="mt-5 mb-1.5 font-semibold text-slate-900">{t.highlights}</h3>
				<ul class="list-disc space-y-1 pl-5">
					{#each project.highlights as item (item)}
						<li>{item}</li>
					{/each}
				</ul>
			{/if}

			{#if project.stack.length > 0}
				<h3 class="mt-5 mb-1.5 font-semibold text-slate-900">{t.stack}</h3>
				<ul class="flex flex-wrap gap-1.5">
					{#each project.stack as item (item)}
						<li class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">{item}</li>
					{/each}
				</ul>
			{/if}

			{#if project.links.length > 0}
				<h3 class="mt-5 mb-1.5 font-semibold text-slate-900">{t.links}</h3>
				<ul class="space-y-1">
					{#each project.links as link (link.label)}
						<li>
							{#if link.url}
								<!-- 외부 주소(https://…)만 들어오므로 resolve()를 거치지 않는다 (로더에서 검사) -->
								<!-- eslint-disable svelte/no-navigation-without-resolve -->
								<a
									class="font-medium text-sky-700 underline"
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
								>
									{link.label}
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							{:else}
								<span class="text-slate-600">{link.label}</span>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}

			{#if project.paragraphs.length > 0}
				<h3 class="mt-5 mb-1.5 font-semibold text-slate-900">{t.about}</h3>
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
