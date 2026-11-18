<script lang="ts">
	import { T } from '@threlte/core';
	import { asset } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three';
	import { onDestroy, onMount } from 'svelte';
	import type { Project } from '../content/types';

	// 프로젝트 섬 깃발 (ui-plan §3.10). 깃발 천에 로고를 그리고, 로고가 없으면 이름 앞 글자를 그린다.
	// 텍스처는 작은 캔버스(64px)에 그려 NearestFilter로 써서 픽셀 화면과 같은 각진 모양이 된다.
	// 깃발 그룹의 +z가 선착장 쪽을 보게 놓으면(부모가 회전) 정박한 배와 구경 카메라에서 앞면이 보인다.
	let { project, night }: { project: Project; night: number } = $props();

	/** 텍스처 한 변 픽셀 수. 픽셀 렌더에서 깃발이 화면에 20~40픽셀 정도로 보이므로 이 이상은 의미가 없다 */
	const TEX = 64;
	/** 깃발 천 크기 (세계 단위) */
	const CLOTH = 2.4;
	const POLE = 5.2;

	// slug로 정해지는 바탕색 하나 (§3.10)
	function slugColor(slug: string): string {
		let h = 0;
		for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
		return `hsl(${h % 360} 45% 38%)`;
	}

	const canvas = typeof document === 'undefined' ? null : document.createElement('canvas');
	let texture = $state<CanvasTexture | null>(null);

	function makeTexture(draw: (ctx: CanvasRenderingContext2D) => void) {
		if (!canvas) return;
		canvas.width = TEX;
		canvas.height = TEX;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = slugColor(project.slug);
		ctx.fillRect(0, 0, TEX, TEX);
		// 테두리 한 줄: 바다·하늘과 깃발 경계가 픽셀 화면에서도 보이게
		ctx.strokeStyle = 'rgba(255,255,255,0.85)';
		ctx.lineWidth = 3;
		ctx.strokeRect(1.5, 1.5, TEX - 3, TEX - 3);
		draw(ctx);
		texture?.dispose();
		const tex = new CanvasTexture(canvas);
		tex.colorSpace = SRGBColorSpace;
		tex.magFilter = NearestFilter;
		tex.minFilter = NearestFilter;
		tex.generateMipmaps = false;
		texture = tex;
	}

	function drawLetter() {
		const letter = Array.from(project.title.trim())[0] ?? '?';
		const font = `800 ${Math.round(TEX * 0.62)}px Pretendard, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
		const paint = () =>
			makeTexture((ctx) => {
				ctx.font = font;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.lineWidth = 6;
				ctx.strokeStyle = 'rgba(0,0,0,0.55)';
				ctx.strokeText(letter, TEX / 2, TEX / 2 + 2);
				ctx.fillStyle = '#fff8e6';
				ctx.fillText(letter, TEX / 2, TEX / 2 + 2);
			});
		paint();
		// 웹 글꼴이 늦게 오면 한 번 더 그린다
		document.fonts?.load(font, letter).then(paint, () => {});
	}

	function drawLogo(src: string) {
		const img = new Image();
		img.decoding = 'async';
		img.onload = () =>
			makeTexture((ctx) => {
				const pad = 6;
				const box = TEX - pad * 2;
				const scale = Math.min(box / img.naturalWidth, box / img.naturalHeight);
				const w = img.naturalWidth * scale;
				const h = img.naturalHeight * scale;
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = 'high';
				ctx.drawImage(img, (TEX - w) / 2, (TEX - h) / 2, w, h);
			});
		img.onerror = drawLetter;
		img.src = asset(src as AssetPath);
	}

	// 가로세로 비가 1.6을 넘는 로고(Mongscape 256×107)는 정사각형 깃발에서 글자가 2~3픽셀로 뭉개지므로
	// 앞 글자를 쓴다. 로고는 패널 머리와 목록 카드에 그대로 나온다.
	const WIDE_LOGO = 1.6;
	onMount(() => {
		const logo = project.logo;
		if (logo && logo.width / logo.height <= WIDE_LOGO) drawLogo(logo.src);
		else drawLetter();
	});

	onDestroy(() => texture?.dispose());

	// 밤에도 깃발이 읽히도록 천에 약한 자체 발광을 준다
	const glow = $derived(0.18 + night * 0.35);
</script>

<T.Group>
	<T.Mesh position.y={POLE / 2} castShadow>
		<T.CylinderGeometry args={[0.09, 0.12, POLE, 5]} />
		<T.MeshStandardMaterial color="#5a4632" flatShading />
	</T.Mesh>
	<T.Mesh position.y={POLE + 0.1}>
		<T.ConeGeometry args={[0.18, 0.3, 4]} />
		<T.MeshStandardMaterial color="#e2a93b" flatShading />
	</T.Mesh>
	{#if texture}
		<!-- 앞면(+z)과 뒷면(−z)을 따로 두어 어느 쪽에서 봐도 글자가 뒤집히지 않게 한다 -->
		{#each [0, Math.PI] as turn (turn)}
			<T.Mesh position={[CLOTH / 2 + 0.1, POLE - CLOTH / 2 - 0.15, 0]} rotation.y={turn} castShadow>
				<T.PlaneGeometry args={[CLOTH, CLOTH]} />
				<T.MeshStandardMaterial
					map={texture}
					emissiveMap={texture}
					emissive="#ffffff"
					emissiveIntensity={glow}
					roughness={1}
				/>
			</T.Mesh>
		{/each}
	{/if}
</T.Group>
