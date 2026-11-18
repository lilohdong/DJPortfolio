<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import type { Profile } from '../content/types';
	import { ko } from '../i18n/ko';

	// 소개 글 (docs/ui-plan.md §3.7). 등대섬 패널과 목록 페이지가 함께 쓴다.
	// 기술을 누르면 그 기술을 쓴 프로젝트가 펼쳐진다. 패널에서는 그 섬으로 가는 버튼,
	// 페이지에서는 프로젝트 페이지 링크다 (onselectproject가 있으면 버튼).
	let {
		profile,
		projectTitles,
		identity = true,
		onselectproject
	}: {
		profile: Profile;
		/** slug → 프로젝트 이름. 화면에 있는 프로젝트만 넣는다 */
		projectTitles: Record<string, string>;
		/** 사진, 이름, 한 줄 소개를 그릴지 (페이지 머리에 이미 있으면 false) */
		identity?: boolean;
		onselectproject?: (slug: string) => void;
	} = $props();

	const t = ko.profile;
	let openSkill = $state<string | null>(null);

	const graduation = (item: Profile['education'][number]) =>
		t.formatGraduation(item.graduation, item.status);
</script>

{#snippet sectionTitle(label: string)}
	<h3 class="mb-2 font-display text-label text-accent">{label}</h3>
{/snippet}

{#snippet projectLink(slug: string)}
	{#if onselectproject}
		<button
			type="button"
			class="text-body-sm font-semibold text-link underline underline-offset-4"
			onclick={() => onselectproject(slug)}
		>
			{projectTitles[slug]}
		</button>
	{:else}
		<a
			class="text-body-sm font-semibold text-link underline underline-offset-4"
			href={resolve(`projects/${slug}/`)}
		>
			{projectTitles[slug]}
		</a>
	{/if}
{/snippet}

{#if identity}
	<div class="flex items-start gap-4">
		{#if profile.photo}
			<img
				class="w-24 shrink-0 border-(length:--ui-border-width) border-line"
				src={asset(profile.photo.src as AssetPath)}
				alt={profile.photo.alt}
				width={profile.photo.width}
				height={profile.photo.height}
			/>
		{/if}
		<div class="min-w-0">
			<p class="font-display text-title">{profile.name}</p>
			{#if profile.headline}
				<p class="mt-1 font-display text-label text-accent">{profile.headline}</p>
			{/if}
			<p class="mt-2 flex flex-wrap gap-x-3 text-body-sm text-ink-muted">
				{#if profile.status}<span>{profile.status}</span>{/if}
				{#if profile.location}<span>{profile.location}</span>{/if}
			</p>
		</div>
	</div>
{/if}

{#if profile.intro.length > 0 || profile.introPoints.length > 0}
	<div class={[identity && 'mt-5', 'space-y-3']}>
		{#each profile.intro as line, i (i)}
			<p>{line}</p>
		{/each}
		{#if profile.introPoints.length > 0}
			<ul class="list-[square] space-y-1 pl-5 marker:text-accent">
				{#each profile.introPoints as point (point)}
					<li>{point}</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

{#if profile.skills.length > 0}
	<section class="mt-6">
		{@render sectionTitle(t.skills)}
		<div class="space-y-4">
			{#each profile.skills as group (group.group)}
				<div>
					<h4 class="mb-2 text-body-sm font-semibold text-ink-muted">{group.group}</h4>
					<ul class="flex flex-wrap gap-2">
						{#each group.items as item (item.name)}
							{@const id = `${group.group}/${item.name}`}
							{@const linked = item.projects.filter((slug) => slug in projectTitles)}
							<li>
								{#if linked.length > 0}
									<button
										type="button"
										class={[
											'ui-chip cursor-pointer hover:bg-panel-hover',
											openSkill === id && 'border-accent!'
										]}
										aria-expanded={openSkill === id}
										onclick={() => (openSkill = openSkill === id ? null : id)}
									>
										{item.name}
									</button>
								{:else}
									<span class="ui-chip">{item.name}</span>
								{/if}
							</li>
						{/each}
					</ul>
					{#each group.items as item (item.name)}
						{@const linked = item.projects.filter((slug) => slug in projectTitles)}
						{#if openSkill === `${group.group}/${item.name}` && linked.length > 0}
							<ul
								class="mt-2 flex flex-wrap gap-x-4 gap-y-1"
								aria-label={t.skillProjects(item.name)}
							>
								{#each linked as slug (slug)}
									<li>{@render projectLink(slug)}</li>
								{/each}
							</ul>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	</section>
{/if}

{#if profile.education.length > 0}
	<section class="mt-6">
		{@render sectionTitle(t.education)}
		<ul class="space-y-1 text-body-sm">
			{#each profile.education as item (item.school)}
				<li>
					<span class="font-semibold">{item.school}</span>
					{#if item.major}<span>{item.major}</span>{/if}
					{#if item.degree}<span>{item.degree}</span>{/if}
					{#if graduation(item)}<span class="text-ink-muted">{graduation(item)}</span>{/if}
				</li>
			{/each}
		</ul>
	</section>
{/if}

{#if profile.activities.length > 0}
	<section class="mt-6">
		{@render sectionTitle(t.activities)}
		<ul class="space-y-2 text-body-sm">
			{#each profile.activities as item (item.title)}
				<li>
					<span class="font-semibold">{item.title}</span>
					{#if item.date}<span class="text-ink-muted">{item.date}</span>{/if}
					{#if item.detail}<p class="text-ink-muted">{item.detail}</p>{/if}
					{#if item.project && item.project in projectTitles}
						<p>{@render projectLink(item.project)}</p>
					{/if}
				</li>
			{/each}
		</ul>
	</section>
{/if}

{#if profile.certifications.length > 0}
	<section class="mt-6">
		{@render sectionTitle(t.certifications)}
		<ul class="flex flex-wrap gap-2">
			{#each profile.certifications as item (item)}
				<li class="ui-chip">{item}</li>
			{/each}
		</ul>
	</section>
{/if}

{#if profile.contact.email || profile.contact.github || profile.contact.links.length > 0}
	<section class="mt-6">
		{@render sectionTitle(t.contact)}
		<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-body-sm">
			{#if profile.contact.email}
				<dt class="font-semibold text-ink-muted">{t.email}</dt>
				<dd>
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						class="font-semibold text-link underline underline-offset-4"
						href="mailto:{profile.contact.email}"
					>
						{profile.contact.email}
					</a>
				</dd>
			{/if}
			{#if profile.contact.github}
				<dt class="font-semibold text-ink-muted">{t.github}</dt>
				<dd>
					<a
						class="font-semibold text-link underline underline-offset-4"
						href={profile.contact.github}
						target="_blank"
						rel="noopener noreferrer"
					>
						{profile.contact.github.replace(/^https?:\/\//, '')}
					</a>
				</dd>
			{/if}
			{#each profile.contact.links as link (link.label)}
				<dt class="font-semibold text-ink-muted">{link.label}</dt>
				<dd>
					<a
						class="font-semibold text-link underline underline-offset-4"
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{link.url?.replace(/^https?:\/\//, '')}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</dd>
			{/each}
		</dl>
	</section>
{/if}
