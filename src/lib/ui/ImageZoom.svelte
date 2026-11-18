<script lang="ts">
	import { asset } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import type { ContentImage } from '../content/types';
	import { ko } from '../i18n/ko';
	import Button from './kit/Button.svelte';

	// 사진 크게 보기. 브라우저 기본 모달(dialog)이라 초점이 안에 갇히고 Esc로 닫힌다.
	let { image, onclose }: { image: ContentImage; onclose: () => void } = $props();

	const t = ko.panel;
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (dialog && !dialog.open) dialog.showModal();
	});

	function onkeydown(e: KeyboardEvent) {
		// Esc가 바깥(항해 화면)으로 올라가 섬 패널까지 닫지 않게 여기서 멈춘다.
		// 화살표와 W A S D도 배를 움직이지 않게 막는다.
		e.stopPropagation();
	}
</script>

<dialog
	bind:this={dialog}
	class="m-auto max-h-none max-w-none bg-transparent p-0 text-ink backdrop:bg-shadow/85"
	aria-label={image.alt}
	{onkeydown}
	{onclose}
	onclick={(e) => {
		// 사진 바깥(어두운 바탕)을 누르면 닫는다
		if (e.target === e.currentTarget) dialog?.close();
	}}
>
	<div class="flex flex-col items-end gap-3 p-4">
		<Button
			shortcut={t.closeKey}
			aria-label={t.zoomCloseWithKey}
			title={t.zoomCloseWithKey}
			onclick={() => dialog?.close()}
		>
			{t.zoomClose}
		</Button>
		<figure class="flex flex-col gap-3">
			<img
				class="block h-auto max-h-[80dvh] w-auto max-w-[min(92vw,1600px)] border-(length:--ui-border-width) border-line bg-shadow object-contain"
				src={asset(image.src as AssetPath)}
				alt={image.alt}
				width={image.width}
				height={image.height}
			/>
			{#if image.caption}
				<figcaption class="text-body-sm">{image.caption}</figcaption>
			{/if}
		</figure>
	</div>
</dialog>
