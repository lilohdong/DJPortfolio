<script lang="ts">
	import { T } from '@threlte/core';
	import type { Island } from '../sailing/islands';

	let { island, night }: { island: Island; night: number } = $props();

	// 섬 하나: 모래 받침 + 풀밭 + 언덕 + 나무 + 선착장. 등대섬에는 등대를 세운다.
	// 장식 위치는 섬 id로 정해지는 의사 난수라 매번 같은 모양이 나온다.

	function seeded(seed: string) {
		let h = 2166136261;
		for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
		return () => {
			h = Math.imul(h ^ (h >>> 15), 2246822507);
			h = Math.imul(h ^ (h >>> 13), 3266489909);
			h ^= h >>> 16;
			return (h >>> 0) / 4294967296;
		};
	}

	const SAND_TOP = 1.2;
	const GRASS_TOP = 2.2;

	const r = $derived(island.size);
	const dockAngle = $derived(Math.atan2(island.dir.z, island.dir.x));
	/** 선착장 방향 (rotation.y) */
	const dockYaw = $derived(Math.atan2(island.dir.x, island.dir.z));

	const trees = $derived.by(() => {
		const rand = seeded(island.id);
		const count = Math.max(3, Math.round(r * 0.7));
		const list: { x: number; z: number; s: number }[] = [];
		for (let i = 0; i < count; i++) {
			const a = dockAngle + 0.9 + (i / count) * (Math.PI * 2 - 1.8) + (rand() - 0.5) * 0.3;
			const d = r * (0.45 + rand() * 0.2);
			list.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, s: 0.8 + rand() * 0.5 });
		}
		return list;
	});

	const rocks = $derived.by(() => {
		const rand = seeded(island.id + ':rock');
		return Array.from({ length: 3 }, (_, i) => {
			const a = dockAngle + 1.4 + i * 1.6 + rand() * 0.4;
			const d = r * (1.02 + rand() * 0.12);
			return { x: Math.cos(a) * d, z: Math.sin(a) * d, s: 0.5 + rand() * 0.6 };
		});
	});

	/** 언덕과 등대는 선착장 반대쪽에 */
	const back = $derived({ x: -island.dir.x * r * 0.28, z: -island.dir.z * r * 0.28 });
	// 선착장 끝(r + 2.2)이 정박한 배의 뱃머리(r + DOCK_GAP − 1.9) 바로 앞에 오게 한다.
	const pierCenter = $derived(r + 0.4);
</script>

<T.Group position={[island.x, 0, island.z]}>
	<!-- 모래 받침 -->
	<T.Mesh position.y={0} receiveShadow castShadow>
		<T.CylinderGeometry args={[r, r * 1.22, SAND_TOP * 2, 10]} />
		<T.MeshStandardMaterial color="#e3cf98" flatShading roughness={1} />
	</T.Mesh>
	<!-- 풀밭 -->
	<T.Mesh position.y={(SAND_TOP + GRASS_TOP) / 2} receiveShadow castShadow>
		<T.CylinderGeometry args={[r * 0.74, r * 0.84, GRASS_TOP - SAND_TOP, 9]} />
		<T.MeshStandardMaterial color="#6fae5a" flatShading roughness={1} />
	</T.Mesh>
	<!-- 언덕 -->
	<T.Mesh position={[back.x, GRASS_TOP + r * 0.18, back.z]} castShadow receiveShadow>
		<T.ConeGeometry args={[r * 0.5, r * 0.36, 7]} />
		<T.MeshStandardMaterial color="#5b9a4c" flatShading roughness={1} />
	</T.Mesh>

	{#each trees as tree, i (i)}
		<T.Group position={[tree.x, GRASS_TOP, tree.z]} scale={tree.s}>
			<T.Mesh position.y={0.5} castShadow>
				<T.CylinderGeometry args={[0.14, 0.2, 1, 5]} />
				<T.MeshStandardMaterial color="#7a5434" flatShading />
			</T.Mesh>
			<T.Mesh position.y={1.8} castShadow>
				<T.ConeGeometry args={[0.85, 2, 6]} />
				<T.MeshStandardMaterial color="#3f7f45" flatShading />
			</T.Mesh>
		</T.Group>
	{/each}

	{#each rocks as rock, i (i)}
		<T.Mesh position={[rock.x, 0.1, rock.z]} scale={rock.s} castShadow>
			<T.DodecahedronGeometry args={[1, 0]} />
			<T.MeshStandardMaterial color="#8d8c86" flatShading />
		</T.Mesh>
	{/each}

	<!-- 선착장 -->
	<T.Group rotation.y={dockYaw}>
		<T.Mesh position={[0, 0.75, pierCenter]} castShadow receiveShadow>
			<T.BoxGeometry args={[1.8, 0.2, 3.6]} />
			<T.MeshStandardMaterial color="#9b7048" flatShading />
		</T.Mesh>
		{#each [-0.8, 0.8] as px (px)}
			<T.Mesh position={[px, 0.3, pierCenter + 1.6]} castShadow>
				<T.CylinderGeometry args={[0.12, 0.12, 1.6, 5]} />
				<T.MeshStandardMaterial color="#6b4a32" flatShading />
			</T.Mesh>
		{/each}
	</T.Group>

	{#if island.kind === 'lighthouse'}
		<T.Group position={[back.x, GRASS_TOP + r * 0.2, back.z]}>
			<T.Mesh position.y={4} castShadow>
				<T.CylinderGeometry args={[1.05, 1.6, 8, 8]} />
				<T.MeshStandardMaterial color="#f4f1ea" flatShading />
			</T.Mesh>
			{#each [2.2, 5.4] as y (y)}
				<T.Mesh position.y={y}>
					<T.CylinderGeometry
						args={[1.6 - (y / 8) * 0.55 + 0.03, 1.6 - ((y - 1) / 8) * 0.55 + 0.03, 1, 8]}
					/>
					<T.MeshStandardMaterial color="#c8423a" flatShading />
				</T.Mesh>
			{/each}
			<!-- 전망대와 등불 -->
			<T.Mesh position.y={8.15}>
				<T.CylinderGeometry args={[1.45, 1.45, 0.3, 8]} />
				<T.MeshStandardMaterial color="#3d4650" flatShading />
			</T.Mesh>
			<T.Mesh position.y={8.9}>
				<T.CylinderGeometry args={[0.7, 0.7, 1.2, 8]} />
				<T.MeshStandardMaterial
					color="#fff2c4"
					emissive="#ffd36b"
					emissiveIntensity={0.3 + night * 2.2}
					flatShading
				/>
			</T.Mesh>
			<T.Mesh position.y={10}>
				<T.ConeGeometry args={[1.1, 1.1, 8]} />
				<T.MeshStandardMaterial color="#c8423a" flatShading />
			</T.Mesh>
			<T.PointLight
				position.y={8.9}
				color="#ffd88a"
				intensity={night * 60}
				distance={70}
				decay={1.2}
			/>
		</T.Group>
	{:else}
		<!-- 프로젝트 섬 표지: 깃대 (프로젝트별 상징물은 나중에) -->
		<T.Group position={[island.dir.x * r * 0.35, GRASS_TOP, island.dir.z * r * 0.35]}>
			<T.Mesh position.y={2}>
				<T.CylinderGeometry args={[0.08, 0.1, 4, 5]} />
				<T.MeshStandardMaterial color="#5a4632" flatShading />
			</T.Mesh>
			<T.Mesh position={[0.65, 3.5, 0]}>
				<T.BoxGeometry args={[1.3, 0.8, 0.06]} />
				<T.MeshStandardMaterial color="#e8873a" flatShading />
			</T.Mesh>
		</T.Group>
	{/if}
</T.Group>
