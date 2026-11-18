<script lang="ts">
	import { T } from '@threlte/core';
	import { asset } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import {
		CanvasTexture,
		LinearMipmapLinearFilter,
		NearestFilter,
		SRGBColorSpace,
		type MeshBasicMaterial
	} from 'three';
	import { onDestroy, onMount } from 'svelte';
	import type { Project } from '../content/types';
	import { makeClothMaterial, SHARP_LAYER, sharpMeshes } from './sharp-flags';

	// 프로젝트 섬 깃발 (ui-plan §3.10). 깃발 천에 로고를 그리고, 로고가 없으면 이름 앞 글자를 그린다.
	// 천은 픽셀 렌더 뒤에 화면 해상도로 한 번 더 그려 로고가 선명하게 보인다(sharp-flags.ts).
	// 깃발 그룹의 +z가 선착장 쪽을 보게 놓으면(부모가 회전) 정박한 배와 구경 카메라에서 앞면이 보인다.
	let { project, night }: { project: Project; night: number } = $props();

	/** 가로세로 비가 이보다 큰 로고(Mongscape 256×107)는 가로로 긴 깃발에 그린다 */
	const WIDE_LOGO = 1.6;
	const wide = $derived(
		project.logo !== null && project.logo.width / project.logo.height > WIDE_LOGO
	);
	/** 텍스처 크기. 화면 해상도로 그리므로 구경 화면에서 깃발이 차지하는 픽셀 수(약 100)에 맞춘다 */
	const TEX_H = 128;
	const texW = $derived(wide ? 256 : 128);
	/** 깃발 천 크기 (세계 단위) */
	const clothH = $derived(wide ? 1.9 : 2.4);
	const clothW = $derived(wide ? 3.8 : 2.4);
	const POLE = 5.2;

	// slug로 정해지는 바탕색 하나 (§3.10)
	function slugColor(slug: string): string {
		let h = 0;
		for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
		return `hsl(${h % 360} 45% 38%)`;
	}

	const canvas = typeof document === 'undefined' ? null : document.createElement('canvas');
	let material = $state<MeshBasicMaterial | null>(null);

	function makeTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
		if (!canvas) return;
		const w = texW;
		const h = TEX_H;
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = slugColor(project.slug);
		ctx.fillRect(0, 0, w, h);
		// 테두리 한 줄: 바다·하늘과 깃발 경계가 보이게
		ctx.strokeStyle = 'rgba(255,255,255,0.85)';
		ctx.lineWidth = 6;
		ctx.strokeRect(3, 3, w - 6, h - 6);
		draw(ctx, w, h);
		const tex = new CanvasTexture(canvas);
		tex.colorSpace = SRGBColorSpace;
		// 가까이서는 텍셀이 각지게(Nearest), 멀리서는 밉맵으로 줄여 작은 깃발이 깜빡이지 않게
		tex.magFilter = NearestFilter;
		tex.minFilter = LinearMipmapLinearFilter;
		tex.generateMipmaps = true;
		material?.map?.dispose();
		material?.dispose();
		material = makeClothMaterial(tex);
	}

	function drawLetter() {
		const letter = Array.from(project.title.trim())[0] ?? '?';
		const font = `800 ${Math.round(TEX_H * 0.62)}px Pretendard, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
		const paint = () =>
			makeTexture((ctx, w, h) => {
				ctx.font = font;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.lineWidth = 10;
				ctx.strokeStyle = 'rgba(0,0,0,0.55)';
				ctx.strokeText(letter, w / 2, h / 2 + 4);
				ctx.fillStyle = '#fff8e6';
				ctx.fillText(letter, w / 2, h / 2 + 4);
			});
		paint();
		// 웹 글꼴이 늦게 오면 한 번 더 그린다
		document.fonts?.load(font, letter).then(paint, () => {});
	}

	function drawLogo(src: string) {
		const img = new Image();
		img.decoding = 'async';
		img.onload = () =>
			makeTexture((ctx, w, h) => {
				const pad = 12;
				const scale = Math.min((w - pad * 2) / img.naturalWidth, (h - pad * 2) / img.naturalHeight);
				const dw = img.naturalWidth * scale;
				const dh = img.naturalHeight * scale;
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = 'high';
				ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
			});
		img.onerror = drawLetter;
		img.src = asset(src as AssetPath);
	}

	onMount(() => {
		if (project.logo) drawLogo(project.logo.src);
		else drawLetter();
	});

	onDestroy(() => {
		material?.map?.dispose();
		material?.dispose();
	});

	// 조명을 받지 않는 천이라 밤에는 밝기를 낮춘다 (주변보다는 조금 밝게 두어 읽히게)
	$effect(() => {
		material?.color.setScalar(1 - night * 0.55);
	});
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
	{#if material}
		<!-- 앞면(+z)과 뒷면(−z)을 따로 두어 어느 쪽에서 봐도 글자가 뒤집히지 않게 한다 -->
		{#each [0, Math.PI] as turn (turn)}
			<T.Mesh
				position={[clothW / 2 + 0.1, POLE - clothH / 2 - 0.15, 0]}
				rotation.y={turn}
				{material}
				castShadow
				oncreate={(ref) => {
					ref.layers.enable(SHARP_LAYER);
					sharpMeshes.add(ref);
					return () => {
						sharpMeshes.delete(ref);
					};
				}}
			>
				<T.PlaneGeometry args={[clothW, clothH]} />
			</T.Mesh>
		{/each}
	{/if}
</T.Group>
