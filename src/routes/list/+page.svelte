<script lang="ts">
	import { resolve } from '$app/paths';
	import { ko } from '#lib/i18n/ko.ts';
</script>

<svelte:head>
	<title>{ko.site.listTitle}</title>
</svelte:head>

<main class="mx-auto flex max-w-2xl flex-col gap-4 p-6">
	<h1 class="text-2xl font-bold text-slate-900">{ko.list.heading}</h1>
	<p class="text-slate-700">{ko.list.body}</p>
	<a class="w-fit text-sm font-medium text-slate-900 underline" href={resolve('/')}>
		{ko.list.backToSailing}
	</a>
</main>
