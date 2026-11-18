<script lang="ts">
	import { asset } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import type { ContentImage } from '../content/types';
	import { ko } from '../i18n/ko';

	// 패널 안 사진 한 장. 누르면 onzoom으로 크게 보기를 연다.
	// 세로로 긴 휴대폰 캡처가 패널을 다 차지하지 않게 높이를 제한하고 남는 자리는 어둡게 둔다.
	let {
		image,
		onzoom,
		eager = false
	}: { image: ContentImage; onzoom: (image: ContentImage) => void; eager?: boolean } = $props();

	// src는 콘텐츠 파일에서 오는 문자열이라 static/ 파일 목록 타입으로 바꿔 넘긴다 (로더가 형식을 검사함).
	const src = $derived(asset(image.src as AssetPath));
</script>

<figure>
	<button
		type="button"
		class="block w-full cursor-zoom-in border-(length:--ui-border-width) border-line/35 bg-shadow"
		aria-label={ko.panel.enlarge(image.alt)}
		onclick={() => onzoom(image)}
	>
		<img
			class="mx-auto block h-auto max-h-72 w-auto max-w-full object-contain"
			{src}
			alt={image.alt}
			width={image.width}
			height={image.height}
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
		/>
	</button>
	{#if image.caption}
		<figcaption class="mt-2 text-body-sm text-ink-muted">{image.caption}</figcaption>
	{/if}
</figure>
