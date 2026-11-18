<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>목록 보기 | DJ Portfolio</title>
</svelte:head>

<main class="mx-auto flex max-w-2xl flex-col gap-4 p-6">
	<h1 class="text-2xl font-bold text-slate-900">목록 보기</h1>
	<p class="text-slate-700">포트폴리오 내용을 목록으로 볼 수 있는 페이지입니다. 준비 중입니다.</p>
	<a class="w-fit text-sm font-medium text-slate-900 underline" href={resolve('/')}>
		항해 보기로 돌아가기
	</a>
</main>
