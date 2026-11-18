<script lang="ts">
	import './layout.css';
	import { asset } from '$app/paths';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- 글꼴은 static/fonts/에 같이 배포한다. asset()을 거쳐 하위 경로 배포에서도 맞는 주소가 된다 -->
	<link rel="stylesheet" href={asset('fonts/fonts.css')} />
	<!-- 제목과 HUD 버튼이 첫 화면에 바로 쓰는 픽셀 글꼴은 미리 받는다 -->
	<link
		rel="preload"
		href={asset('fonts/galmuri/Galmuri11-Bold.woff2')}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

{@render children()}
