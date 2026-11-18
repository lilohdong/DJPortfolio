<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		BackSide,
		BufferAttribute,
		BufferGeometry,
		Color,
		SphereGeometry,
		type Group
	} from 'three';
	import type { Palette } from '../sailing/time-of-day';

	// 하늘 반구(위→수평선 색 그라데이션), 해/달, 별. 카메라를 따라다녀 끝이 보이지 않는다.
	let { palette, sunDir }: { palette: Palette; sunDir: [number, number, number] } = $props();

	const RADIUS = 800;
	const { camera } = useThrelte();

	const dome = new SphereGeometry(RADIUS, 24, 14);
	const domePositions = dome.attributes.position;
	const domeColors = new BufferAttribute(new Float32Array(domePositions.count * 3), 3);
	dome.setAttribute('color', domeColors);

	const top = new Color();
	const horizon = new Color();
	const mixed = new Color();

	$effect(() => {
		top.setRGB(...palette.skyTop).convertSRGBToLinear();
		horizon.setRGB(...palette.skyHorizon).convertSRGBToLinear();
		for (let i = 0; i < domePositions.count; i++) {
			const h = Math.max(0, domePositions.getY(i) / RADIUS);
			mixed.copy(horizon).lerp(top, Math.min(1, Math.pow(h * 1.6, 0.7)));
			domeColors.setXYZ(i, mixed.r, mixed.g, mixed.b);
		}
		domeColors.needsUpdate = true;
	});

	// 별: 위쪽 반구에 흩뿌린 점
	const stars = new BufferGeometry();
	{
		const count = 500;
		const pos = new Float32Array(count * 3);
		let seed = 7;
		const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
		for (let i = 0; i < count; i++) {
			const a = rand() * Math.PI * 2;
			const y = 0.08 + rand() * 0.92;
			const rr = Math.sqrt(1 - y * y);
			pos.set([Math.cos(a) * rr * 760, y * 760, Math.sin(a) * rr * 760], i * 3);
		}
		stars.setAttribute('position', new BufferAttribute(pos, 3));
	}

	const sunHex = $derived(
		'#' + new Color().setRGB(...palette.sunColor, 'srgb').getHexString('srgb')
	);
	const sunPos = $derived<[number, number, number]>([
		sunDir[0] * 700,
		sunDir[1] * 700,
		sunDir[2] * 700
	]);

	let group = $state<Group>();
	useTask(() => {
		if (group) group.position.copy(camera.current.position);
	});
</script>

<T.Group bind:ref={group}>
	<T.Mesh geometry={dome} renderOrder={-1} frustumCulled={false}>
		<T.MeshBasicMaterial
			vertexColors
			side={BackSide}
			fog={false}
			depthWrite={false}
			toneMapped={false}
		/>
	</T.Mesh>
	<T.Points geometry={stars} frustumCulled={false}>
		<T.PointsMaterial
			color="#ffffff"
			size={2}
			sizeAttenuation={false}
			transparent
			opacity={Math.max(0, palette.night - 0.3) / 0.7}
			fog={false}
			depthWrite={false}
		/>
	</T.Points>
	<T.Mesh position={sunPos}>
		<T.SphereGeometry args={[palette.night > 0.6 ? 14 : 24, 12, 8]} />
		<T.MeshBasicMaterial color={sunHex} fog={false} toneMapped={false} />
	</T.Mesh>
</T.Group>
