<script lang="ts">
	import type { Profile } from '../content/types';
	import { ko } from '../i18n/ko';

	// 이메일과 GitHub로 가는 작은 아이콘 버튼 (등대섬 패널과 목록 페이지 머리).
	// 아이콘은 기기마다 모양이 다른 이모지 대신 인라인 SVG로 그린다.
	// 이메일은 상표 그림이 아닌 일반 봉투, GitHub는 GitHub 표시(Octicons mark-github, MIT).
	// 주소를 글자로 보는 곳은 소개 아래쪽 "연락처" 구역이다.
	let { contact }: { contact: Profile['contact'] } = $props();

	const t = ko.profile;
	const buttonClass = 'ui-btn size-9 p-0!';
</script>

{#if contact.email || contact.github}
	<div class="flex gap-3">
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		{#if contact.email}
			<a class={buttonClass} href="mailto:{contact.email}" aria-label={t.email} title={t.email}>
				<svg
					viewBox="0 0 16 16"
					width="18"
					height="18"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					aria-hidden="true"
				>
					<path d="M1.75 3.25h12.5v9.5H1.75z" />
					<path d="M1.75 3.75 8 8.75l6.25-5" />
				</svg>
			</a>
		{/if}
		{#if contact.github}
			<a
				class={buttonClass}
				href={contact.github}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={t.github}
				title={t.github}
			>
				<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
					<path
						d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
					/>
				</svg>
			</a>
		{/if}
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
{/if}
