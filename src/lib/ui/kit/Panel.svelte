<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	// 공통 패널 틀: 남색 바탕, 밝은 테두리, 번지지 않는 그림자 (layout.css의 ui-panel).
	// as로 의미에 맞는 요소(section, aside, dialog 안 div …)를 고른다.
	type Props = HTMLAttributes<HTMLElement> & {
		as?: 'div' | 'section' | 'aside' | 'header' | 'nav';
		children: Snippet;
	};

	let { as = 'div', children, class: className, ...rest }: Props = $props();
</script>

<svelte:element this={as} class={['ui-panel', className]} {...rest}>
	{@render children()}
</svelte:element>
