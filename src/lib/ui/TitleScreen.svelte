<script lang="ts">
	import { resolve } from '$app/paths';
	import { tick } from 'svelte';
	import type { Profile } from '../content/types';
	import { ko } from '../i18n/ko';

	// 제목 화면 (docs/ui-plan.md §3.2 안 B-1). 게임 로딩 화면처럼 이름, 한 줄 소개, 메뉴, 로딩 줄을 둔다.
	// - "항해 시작"만 로딩이 끝나야 눌리고, 나머지 메뉴는 처음부터 눌린다.
	// - 메뉴는 마우스, 터치, 키보드(위아래 화살표와 Enter)로 고른다.
	// - 스크립트가 꺼져 있어도 글자는 보이고, 메뉴는 /list와 /projects/<slug> 링크로 동작한다.
	type Status = 'loading' | 'ready' | 'no-webgl' | 'failed';
	let {
		profile,
		projects,
		status,
		progress,
		focusStart = false,
		onstart,
		onproject
	}: {
		profile: Profile;
		/** 바로 갈 수 있는 프로젝트 섬 (id, 이름, slug) */
		projects: { id: string; name: string; slug: string }[];
		status: Status;
		/** 로딩 진행 0~1. 실제로 지나간 단계 수로 채운다 */
		progress: number;
		/** 다시 온 방문자: 로딩이 끝나면 "항해 시작"에 초점을 둔다 */
		focusStart?: boolean;
		onstart: () => void;
		onproject: (islandId: string) => void;
	} = $props();

	const t = ko.titleScreen;
	const BAR_CELLS = 10;

	let view = $state<'menu' | 'projects'>('menu');
	let menu = $state<HTMLElement>();
	let startButton = $state<HTMLButtonElement>();
	let projectsButton = $state<HTMLAnchorElement>();

	const arrived = $derived(status === 'ready' && progress >= 1);
	const failed = $derived(status === 'no-webgl' || status === 'failed');
	const filled = $derived(Math.max(1, Math.round(progress * BAR_CELLS)));

	$effect(() => {
		if (arrived && focusStart) startButton?.focus();
	});

	/** 위아래 화살표로 메뉴 항목 사이를 옮긴다 */
	function onkeydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		const items = [...(menu?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? [])];
		if (items.length === 0) return;
		e.preventDefault();
		const i = items.indexOf(document.activeElement as HTMLElement);
		const step = e.key === 'ArrowDown' ? 1 : -1;
		items[(i + step + items.length) % items.length]?.focus();
	}

	async function showProjects(e: MouseEvent) {
		e.preventDefault();
		view = 'projects';
		await tick();
		menu?.querySelector<HTMLElement>('[data-menu-item]')?.focus();
	}

	async function backToMenu() {
		view = 'menu';
		await tick();
		projectsButton?.focus();
	}

	function start() {
		if (arrived) onstart();
	}
</script>

<svelte:head>
	<!-- 스크립트가 꺼져 있으면 바다를 띄울 수 없으므로 항해 시작과 로딩 줄을 숨긴다 -->
	<noscript>
		<style>
			.js-only {
				display: none !important;
			}
		</style>
	</noscript>
</svelte:head>

{#snippet marker()}
	<span
		class="w-4 shrink-0 text-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
		aria-hidden="true"
	>
		▶
	</span>
{/snippet}

<div
	class={[
		'title-screen absolute inset-0 z-30 flex items-center justify-center overflow-y-auto p-4',
		// 바다가 준비되면 뒤의 실제 바다가 비친다
		status === 'ready' ? 'bg-shadow/45' : 'title-sea'
	]}
>
	<section class="w-full max-w-lg ui-panel p-6 md:p-8" aria-labelledby="title-name">
		<h1
			id="title-name"
			class="font-display text-[36px] leading-[48px] md:text-[48px] md:leading-[56px]"
		>
			{profile.name}
		</h1>
		{#if profile.headline}
			<p class="mt-2 font-display text-[24px] leading-[32px] text-accent">{profile.headline}</p>
		{/if}

		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<nav class="mt-8" aria-label={t.menuLabel} bind:this={menu} {onkeydown}>
			{#if view === 'menu'}
				<ul class="flex flex-col gap-1 font-display text-[24px] leading-[32px]">
					<li class="js-only">
						<button
							type="button"
							class="group flex w-full items-center gap-2 py-1 text-left aria-disabled:text-ink-muted aria-disabled:opacity-60"
							data-menu-item
							aria-disabled={!arrived}
							aria-label={arrived ? undefined : t.startLoading}
							bind:this={startButton}
							onclick={start}
						>
							{@render marker()}{t.start}
						</button>
					</li>
					<li>
						<a
							class="group flex items-center gap-2 py-1"
							href={resolve('list/')}
							data-menu-item
							bind:this={projectsButton}
							onclick={showProjects}
						>
							{@render marker()}{t.projects}
						</a>
					</li>
					<li>
						<a class="group flex items-center gap-2 py-1" href={resolve('list/')} data-menu-item>
							{@render marker()}{t.list}
						</a>
					</li>
					<li>
						<!-- 스크립트 없이도 펼쳐지도록 details를 쓴다 -->
						<details class="group/contact">
							<summary
								class="group flex cursor-pointer list-none items-center gap-2 py-1 [&::-webkit-details-marker]:hidden"
								data-menu-item
							>
								{@render marker()}{t.contact}
							</summary>
							<dl
								class="mt-2 ml-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-sans text-body-sm"
							>
								{#if profile.contact.email}
									<dt class="text-ink-muted">{t.email}</dt>
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
									<dt class="text-ink-muted">{t.github}</dt>
									<dd>
										<a
											class="font-semibold text-link underline underline-offset-4"
											href={profile.contact.github}
											target="_blank"
											rel="noopener noreferrer"
										>
											{profile.contact.github.replace(/^https?:\/\//, '')}
										</a>
										<!-- eslint-enable svelte/no-navigation-without-resolve -->
									</dd>
								{/if}
							</dl>
						</details>
					</li>
				</ul>
			{:else}
				<h2 class="mb-3 font-display text-label text-ink-muted">{t.projectsHeading}</h2>
				<ul class="flex flex-col gap-1 font-display text-[24px] leading-[32px]">
					{#each projects as project (project.id)}
						<li>
							<a
								class="group flex items-center gap-2 py-1"
								href={resolve(`projects/${project.slug}/`)}
								data-menu-item
								onclick={(e) => {
									e.preventDefault();
									onproject(project.id);
								}}
							>
								{@render marker()}{project.name}
							</a>
						</li>
					{/each}
					<li>
						<button
							type="button"
							class="group flex w-full items-center gap-2 py-1 text-left text-ink-muted"
							data-menu-item
							onclick={backToMenu}
						>
							{@render marker()}{t.back}
						</button>
					</li>
				</ul>
			{/if}
		</nav>

		<!-- 로딩 줄: 가짜 퍼센트를 쓰지 않고 실제로 지나간 단계만큼 채운다 -->
		<div class="js-only mt-8 border-t-2 border-line/25 pt-4" role="status">
			{#if failed}
				<p class="text-body-sm">{status === 'no-webgl' ? t.noWebgl : t.loadFailed}</p>
			{:else if arrived}
				<p class="font-display text-label text-accent">{t.ready}</p>
			{:else}
				<div class="flex items-center gap-3">
					<span class="flex gap-1" aria-hidden="true">
						{#each { length: BAR_CELLS }, i (i)}
							<span class={['block size-3 border border-line/60', i < filled && 'bg-accent']}
							></span>
						{/each}
					</span>
					<p class="font-display text-label">
						{t.loading}<span class="loading-dots" aria-hidden="true">
							<span>.</span><span>.</span><span>.</span>
						</span>
					</p>
				</div>
			{/if}
		</div>
	</section>
</div>

<style>
	/* 바다가 뜨기 전 배경: 지도와 같은 4px 체크 무늬 바다 */
	.title-sea {
		background: repeating-conic-gradient(var(--color-map-sea) 0 25%, var(--color-map-sea-alt) 0 50%)
			0 0 / 8px 8px;
	}

	/* 로딩 줄 뒤의 점 세 개가 하나씩 켜진다 */
	.loading-dots span {
		animation: dot 1.2s steps(1, end) infinite;
		opacity: 0;
	}
	.loading-dots span:nth-child(2) {
		animation-delay: 0.3s;
	}
	.loading-dots span:nth-child(3) {
		animation-delay: 0.6s;
	}
	@keyframes dot {
		0%,
		100% {
			opacity: 0;
		}
		25%,
		75% {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.loading-dots span {
			animation: none;
			opacity: 1;
		}
	}
</style>
