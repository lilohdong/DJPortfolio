<script lang="ts">
	import type { Snippet } from 'svelte';

	// 짧은 꼬리표 (사용 기술 등). 목록 안에서 쓰면 li로 그린다.
	let { as = 'span', children }: { as?: 'span' | 'li'; children: Snippet } = $props();
</script>

<svelte:element this={as} class="ui-chip">{@render children()}</svelte:element>
