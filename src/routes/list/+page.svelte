<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import { ko } from '#lib/i18n/ko.ts';
	import ProfileArticle from '#lib/ui/ProfileArticle.svelte';
	import ProjectCard from '#lib/ui/ProjectCard.svelte';
	import type { PageProps } from './$types';

	// 목록 페이지 (docs/ui-plan.md §3.8). 배를 몰지 않는 방문자가 같은 내용을 읽는 곳이다.
	// 머리(이름, 한 줄 소개, 연락처, 항해 보기로 전환) → 소개 → 대표 프로젝트 → 그 밖의 프로젝트
	let { data }: PageProps = $props();

	const profile = $derived(data.profile);
	const featured = $derived(data.projects.filter((p) => p.featured));
	const others = $derived(data.projects.filter((p) => !p.featured));
	const projectTitles = $derived(Object.fromEntries(data.projects.map((p) => [p.slug, p.title])));
</script>

<svelte:head>
	<title>{ko.site.listTitle}</title>
	{#if profile.headline}<meta
			name="description"
			content="{profile.name}, {profile.headline}"
		/>{/if}
</svelte:head>

<div class="min-h-dvh bg-panel text-ink">
	<div class="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 md:px-8 md:py-12">
		<header class="flex flex-wrap items-start justify-between gap-6">
			<div class="flex items-start gap-4">
				{#if profile.photo}
					<img
						class="w-20 shrink-0 border-(length:--ui-border-width) border-line md:w-24"
						src={asset(profile.photo.src as AssetPath)}
						alt={profile.photo.alt}
						width={profile.photo.width}
						height={profile.photo.height}
					/>
				{/if}
				<div>
					<h1 class="font-display text-[36px] leading-[48px]">{profile.name}</h1>
					{#if profile.headline}
						<p class="mt-1 font-display text-[24px] leading-[32px] text-accent">
							{profile.headline}
						</p>
					{/if}
					<p class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-body-sm">
						{#if profile.contact.email}
							<!-- eslint-disable svelte/no-navigation-without-resolve -->
							<a
								class="font-semibold text-link underline underline-offset-4"
								href="mailto:{profile.contact.email}"
							>
								{profile.contact.email}
							</a>
						{/if}
						{#if profile.contact.github}
							<a
								class="font-semibold text-link underline underline-offset-4"
								href={profile.contact.github}
								target="_blank"
								rel="noopener noreferrer"
							>
								{ko.profile.github}
							</a>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						{/if}
					</p>
				</div>
			</div>
			<a class="ui-btn" href={resolve('/')}>{ko.list.toSailing}</a>
		</header>

		<section class="ui-panel p-5 text-body md:p-6" aria-label={ko.panel.about}>
			<ProfileArticle {profile} {projectTitles} identity={false} />
		</section>

		<section aria-labelledby="list-projects">
			<h2 id="list-projects" class="mb-4 font-display text-title">{ko.list.projectsHeading}</h2>
			<ul class="grid gap-6 md:grid-cols-2">
				{#each featured as project (project.slug)}
					<li><ProjectCard {project} /></li>
				{/each}
			</ul>
		</section>

		{#if others.length > 0}
			<section aria-labelledby="list-others">
				<h2 id="list-others" class="mb-4 font-display text-title">{ko.list.otherProjects}</h2>
				<ul class="grid gap-6 md:grid-cols-2">
					{#each others as project (project.slug)}
						<li><ProjectCard {project} /></li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
</div>
