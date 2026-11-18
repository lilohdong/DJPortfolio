<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { DoubleSide, ExtrudeGeometry, Shape, ShapeGeometry, type Group } from 'three';
	import { waveHeight } from '../sailing/waves';
	import type { Sailing } from '../sailing/sailing.svelte';

	let { game }: { game: Sailing } = $props();

	// 기본 도형으로 만든 작은 돛단배. 앞쪽은 −z.
	const hullShape = new Shape()
		.moveTo(-0.85, -1.4)
		.lineTo(0.85, -1.4)
		.lineTo(0.95, 0.5)
		.lineTo(0, 1.9)
		.lineTo(-0.95, 0.5)
		.closePath();
	const hull = new ExtrudeGeometry(hullShape, { depth: 0.75, bevelEnabled: false });
	// 모양의 +y(뱃머리)가 세계 −z로, 밀어낸 방향이 위(+y)로 가게 돌린다.
	hull.rotateX(-Math.PI / 2);

	const deckShape = new Shape()
		.moveTo(-0.7, -1.25)
		.lineTo(0.7, -1.25)
		.lineTo(0.78, 0.45)
		.lineTo(0, 1.6)
		.lineTo(-0.78, 0.45)
		.closePath();
	const deck = new ShapeGeometry(deckShape);
	deck.rotateX(-Math.PI / 2);

	const sailShape = new Shape().moveTo(0, 0).lineTo(0, 2.4).lineTo(1.5, 0.15).closePath();
	const sail = new ShapeGeometry(sailShape);
	// 돛은 돛대에서 배 뒤쪽(+z)으로 펼친다.
	sail.rotateY(-Math.PI / 2);

	let outer = $state<Group>();
	let inner = $state<Group>();

	useTask(() => {
		if (!outer || !inner) return;
		const { x, z, heading, turnVelocity, speed } = game.boat;
		const t = game.time;
		outer.position.set(x, waveHeight(x, z, t) * 0.8 - 0.15, z);
		outer.rotation.y = heading;
		// 파도에 흔들리고, 돌 때는 바깥쪽으로 살짝 기운다.
		inner.rotation.x = Math.sin(t * 1.3) * 0.035 + Math.min(speed, 16) * 0.004;
		inner.rotation.z = Math.sin(t * 1.05 + 1) * 0.045 + turnVelocity * 0.08;
	});
</script>

<T.Group bind:ref={outer}>
	<T.Group bind:ref={inner}>
		<T.Mesh geometry={hull} castShadow>
			<T.MeshStandardMaterial color="#b4563c" flatShading roughness={0.8} />
		</T.Mesh>
		<T.Mesh geometry={deck} position.y={0.76}>
			<T.MeshStandardMaterial color="#e6cf9f" flatShading roughness={0.9} />
		</T.Mesh>
		<!-- 선실 -->
		<T.Mesh position={[0, 1.1, 0.75]} castShadow>
			<T.BoxGeometry args={[1, 0.7, 0.9]} />
			<T.MeshStandardMaterial color="#f2ede2" flatShading />
		</T.Mesh>
		<T.Mesh position={[0, 1.52, 0.75]}>
			<T.BoxGeometry args={[1.15, 0.14, 1.05]} />
			<T.MeshStandardMaterial color="#2f5d73" flatShading />
		</T.Mesh>
		<!-- 돛대와 돛 -->
		<T.Mesh position={[0, 2.4, -0.2]} castShadow>
			<T.CylinderGeometry args={[0.06, 0.08, 3.4, 5]} />
			<T.MeshStandardMaterial color="#6b4a32" flatShading />
		</T.Mesh>
		<T.Mesh geometry={sail} position={[0, 1.65, -0.12]} castShadow>
			<T.MeshStandardMaterial color="#f6f1e4" flatShading side={DoubleSide} />
		</T.Mesh>
		<T.Mesh position={[0, 4.15, -0.2]}>
			<T.ConeGeometry args={[0.18, 0.4, 4]} />
			<T.MeshStandardMaterial color="#e2a93b" flatShading />
		</T.Mesh>
	</T.Group>
</T.Group>
