<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	// 공통 버튼. href가 있으면 링크로, 없으면 button으로 그린다.
	// 모양은 layout.css의 ui-btn(보조), ui-btn-primary(주) 유틸리티가 정한다.
	type Common = {
		variant?: 'primary' | 'secondary';
		/** 버튼 오른쪽에 붙이는 단축키 표시 (예: "E", "M", "Esc") */
		shortcut?: string;
		children: Snippet;
	};
	type Props = Common &
		((HTMLButtonAttributes & { href?: undefined }) | (HTMLAnchorAttributes & { href: string }));

	let { variant = 'secondary', shortcut, children, class: className, ...rest }: Props = $props();

	const classes = $derived(['ui-btn', variant === 'primary' && 'ui-btn-primary', className]);
</script>

{#snippet content()}
	{@render children()}
	{#if shortcut}
		<kbd class="ui-kbd" aria-hidden="true">{shortcut}</kbd>
	{/if}
{/snippet}

{#if rest.href !== undefined}
	<!-- href는 부르는 쪽에서 resolve()나 외부 주소로 넘긴다 -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a class={classes} {...rest as HTMLAnchorAttributes}>{@render content()}</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
	<button type="button" class={classes} {...rest as HTMLButtonAttributes}>
		{@render content()}
	</button>
{/if}
