<script lang="ts">
	import { T } from '@threlte/core';
	import type { Landmark } from '../content/types';

	// 섬 위 조형물. 콘텐츠 파일의 island.landmark 값으로 고른다.
	// 장면의 다른 물체처럼 기본 도형으로만 만든다. 특정 게임·구단·제품의 캐릭터나 로고를 본뜨지 않는다.
	// 앞면은 +z(부모가 선착장 쪽으로 돌려 놓는다). 원점이 바닥 가운데다.
	let { kind, night }: { kind: Landmark; night: number } = $props();

	const glow = $derived(0.15 + night * 1.4);
</script>

{#if kind === 'calendar'}
	<!-- Calddy: 날짜 칸이 보이는 큰 달력 판 -->
	{#each [-0.9, 0.9] as lx (lx)}
		<T.Mesh position={[lx, 0.6, -0.05]} castShadow>
			<T.BoxGeometry args={[0.16, 1.2, 0.16]} />
			<T.MeshStandardMaterial color="#6b4a32" flatShading />
		</T.Mesh>
	{/each}
	<T.Mesh position={[0, 2.2, 0]} castShadow>
		<T.BoxGeometry args={[2.6, 2.2, 0.18]} />
		<T.MeshStandardMaterial color="#f4efe2" flatShading />
	</T.Mesh>
	<T.Mesh position={[0, 3.12, 0.1]}>
		<T.BoxGeometry args={[2.6, 0.42, 0.06]} />
		<T.MeshStandardMaterial color="#c8423a" flatShading />
	</T.Mesh>
	{#each [0, 1, 2] as row (row)}
		{#each [0, 1, 2, 3] as col (col)}
			<T.Mesh position={[-0.87 + col * 0.58, 2.55 - row * 0.5, 0.1]}>
				<T.BoxGeometry args={[0.46, 0.36, 0.05]} />
				<T.MeshStandardMaterial
					color={row === 1 && col === 2
						? '#e89a3c'
						: row === 2 && col === 0
							? '#7c8fd6'
							: '#d6d0c2'}
					flatShading
				/>
			</T.Mesh>
		{/each}
	{/each}
	<!-- 달력 고리 -->
	{#each [-0.7, 0.7] as rx (rx)}
		<T.Mesh position={[rx, 3.38, 0.1]}>
			<T.CylinderGeometry args={[0.07, 0.07, 0.3, 5]} />
			<T.MeshStandardMaterial color="#3d4650" flatShading />
		</T.Mesh>
	{/each}
{:else if kind === 'bell'}
	<!-- NudgeUp: 나무 틀에 매단 종 (독촉 알림) -->
	{#each [-0.85, 0.85] as px (px)}
		<T.Mesh position={[px, 1.4, 0]} castShadow>
			<T.BoxGeometry args={[0.2, 2.8, 0.2]} />
			<T.MeshStandardMaterial color="#7a5434" flatShading />
		</T.Mesh>
	{/each}
	<T.Mesh position={[0, 2.85, 0]} castShadow>
		<T.BoxGeometry args={[2.1, 0.22, 0.26]} />
		<T.MeshStandardMaterial color="#6b4a32" flatShading />
	</T.Mesh>
	<T.Mesh position={[0, 2.62, 0]}>
		<T.CylinderGeometry args={[0.06, 0.06, 0.3, 5]} />
		<T.MeshStandardMaterial color="#3d4650" flatShading />
	</T.Mesh>
	<T.Mesh position={[0, 2.0, 0]} castShadow>
		<T.CylinderGeometry args={[0.32, 0.72, 1.05, 8]} />
		<T.MeshStandardMaterial color="#e0b23a" metalness={0.3} roughness={0.5} flatShading />
	</T.Mesh>
	<T.Mesh position={[0, 1.42, 0]}>
		<T.TorusGeometry args={[0.72, 0.07, 4, 8]} />
		<T.MeshStandardMaterial color="#c9952a" flatShading />
	</T.Mesh>
	<T.Mesh position={[0, 1.3, 0]}>
		<T.IcosahedronGeometry args={[0.16, 0]} />
		<T.MeshStandardMaterial color="#8a6a20" flatShading />
	</T.Mesh>
{:else if kind === 'bar-chart'}
	<!-- 여론지: 찬반 막대그래프와 말풍선 -->
	<T.Mesh position={[0, 0.1, 0]} castShadow>
		<T.BoxGeometry args={[2.6, 0.2, 1.0]} />
		<T.MeshStandardMaterial color="#8d8c86" flatShading />
	</T.Mesh>
	{#each [[-0.95, 1.1, '#4f7fd1'], [-0.32, 1.9, '#d1564f'], [0.32, 1.4, '#4f7fd1'], [0.95, 2.5, '#d1564f']] as [bx, bh, color] (bx)}
		<T.Mesh position={[Number(bx), 0.2 + Number(bh) / 2, 0]} castShadow>
			<T.BoxGeometry args={[0.5, Number(bh), 0.5]} />
			<T.MeshStandardMaterial color={String(color)} flatShading />
		</T.Mesh>
	{/each}
	<T.Group position={[-0.6, 3.3, 0.1]}>
		<T.Mesh castShadow>
			<T.BoxGeometry args={[1.4, 0.8, 0.2]} />
			<T.MeshStandardMaterial color="#f4efe2" flatShading />
		</T.Mesh>
		<T.Mesh position={[0.3, -0.55, 0]} rotation.z={Math.PI}>
			<T.ConeGeometry args={[0.2, 0.35, 3]} />
			<T.MeshStandardMaterial color="#f4efe2" flatShading />
		</T.Mesh>
		{#each [-0.38, 0, 0.38] as dx (dx)}
			<T.Mesh position={[dx, 0, 0.12]}>
				<T.BoxGeometry args={[0.18, 0.18, 0.04]} />
				<T.MeshStandardMaterial color="#3d4650" flatShading />
			</T.Mesh>
		{/each}
	</T.Group>
{:else if kind === 'checklist'}
	<!-- 메이플 할일 알리미: 체크 표시가 있는 할 일 게시판 -->
	{#each [-0.75, 0.75] as lx (lx)}
		<T.Mesh position={[lx, 0.7, -0.05]} castShadow>
			<T.BoxGeometry args={[0.16, 1.4, 0.16]} />
			<T.MeshStandardMaterial color="#6b4a32" flatShading />
		</T.Mesh>
	{/each}
	<T.Mesh position={[0, 2.3, 0]} castShadow>
		<T.BoxGeometry args={[2.0, 2.3, 0.18]} />
		<T.MeshStandardMaterial color="#7a5434" flatShading />
	</T.Mesh>
	<T.Mesh position={[0, 2.3, 0.1]}>
		<T.BoxGeometry args={[1.75, 2.05, 0.04]} />
		<T.MeshStandardMaterial color="#efe6cf" flatShading />
	</T.Mesh>
	{#each [0, 1, 2] as row (row)}
		{@const y = 2.95 - row * 0.65}
		<T.Mesh position={[-0.55, y, 0.14]}>
			<T.BoxGeometry args={[0.36, 0.36, 0.04]} />
			<T.MeshStandardMaterial color="#ffffff" flatShading />
		</T.Mesh>
		<T.Mesh position={[0.25, y, 0.14]}>
			<T.BoxGeometry args={[0.9, 0.12, 0.03]} />
			<T.MeshStandardMaterial color="#9a9284" flatShading />
		</T.Mesh>
		{#if row < 2}
			<!-- 체크 표시: 짧은 막대와 긴 막대를 V자로 -->
			<T.Mesh position={[-0.63, y - 0.04, 0.18]} rotation.z={0.8}>
				<T.BoxGeometry args={[0.24, 0.08, 0.04]} />
				<T.MeshStandardMaterial color="#3f9a4c" flatShading />
			</T.Mesh>
			<T.Mesh position={[-0.47, y + 0.03, 0.18]} rotation.z={-0.95}>
				<T.BoxGeometry args={[0.4, 0.08, 0.04]} />
				<T.MeshStandardMaterial color="#3f9a4c" flatShading />
			</T.Mesh>
		{/if}
	{/each}
{:else if kind === 'monkey'}
	<!-- Mongscape: 바나나를 든 원숭이 (일반적인 모습) -->
	<T.Group position.y={0.05}>
		<!-- 다리 -->
		{#each [-0.35, 0.35] as lx (lx)}
			<T.Mesh position={[lx, 0.3, 0.25]} rotation.x={-1.2} castShadow>
				<T.CylinderGeometry args={[0.16, 0.18, 0.7, 6]} />
				<T.MeshStandardMaterial color="#7a4b2a" flatShading />
			</T.Mesh>
		{/each}
		<!-- 몸통 -->
		<T.Mesh position={[0, 1.0, 0]} scale={[0.75, 0.9, 0.65]} castShadow>
			<T.IcosahedronGeometry args={[0.8, 1]} />
			<T.MeshStandardMaterial color="#7a4b2a" flatShading />
		</T.Mesh>
		<T.Mesh position={[0, 0.95, 0.38]} scale={[0.45, 0.6, 0.25]}>
			<T.IcosahedronGeometry args={[0.8, 1]} />
			<T.MeshStandardMaterial color="#d9b48a" flatShading />
		</T.Mesh>
		<!-- 머리 -->
		<T.Group position.y={2.05}>
			<T.Mesh castShadow>
				<T.IcosahedronGeometry args={[0.55, 1]} />
				<T.MeshStandardMaterial color="#7a4b2a" flatShading />
			</T.Mesh>
			<T.Mesh position={[0, -0.08, 0.36]} scale={[0.8, 0.65, 0.45]}>
				<T.IcosahedronGeometry args={[0.45, 1]} />
				<T.MeshStandardMaterial color="#d9b48a" flatShading />
			</T.Mesh>
			{#each [-1, 1] as side (side)}
				<T.Mesh position={[side * 0.58, 0.05, 0]} scale={[0.5, 1, 1]}>
					<T.IcosahedronGeometry args={[0.24, 0]} />
					<T.MeshStandardMaterial color="#d9b48a" flatShading />
				</T.Mesh>
				<T.Mesh position={[side * 0.17, 0.08, 0.5]}>
					<T.IcosahedronGeometry args={[0.07, 0]} />
					<T.MeshStandardMaterial color="#1c1a18" flatShading />
				</T.Mesh>
			{/each}
		</T.Group>
		<!-- 팔과 바나나 -->
		<T.Mesh position={[-0.6, 1.15, 0.15]} rotation.z={-0.5} castShadow>
			<T.CylinderGeometry args={[0.12, 0.14, 0.9, 6]} />
			<T.MeshStandardMaterial color="#7a4b2a" flatShading />
		</T.Mesh>
		<T.Mesh position={[0.6, 1.45, 0.25]} rotation={[0.3, 0, 0.9]} castShadow>
			<T.CylinderGeometry args={[0.12, 0.14, 0.9, 6]} />
			<T.MeshStandardMaterial color="#7a4b2a" flatShading />
		</T.Mesh>
		<T.Mesh position={[0.95, 1.85, 0.35]} rotation={[0, 0, 0.6]}>
			<T.TorusGeometry args={[0.32, 0.1, 4, 8, Math.PI * 0.8]} />
			<T.MeshStandardMaterial color="#f0cf3a" flatShading />
		</T.Mesh>
		<!-- 꼬리 -->
		<T.Mesh position={[0.15, 0.7, -0.6]} rotation={[0, Math.PI / 2, 0]}>
			<T.TorusGeometry args={[0.45, 0.08, 4, 8, Math.PI * 1.3]} />
			<T.MeshStandardMaterial color="#7a4b2a" flatShading />
		</T.Mesh>
	</T.Group>
{:else if kind === 'pos-counter'}
	<!-- POS PLACE: 계산대와 모니터 -->
	<T.Mesh position={[0, 0.55, 0]} castShadow>
		<T.BoxGeometry args={[2.6, 1.1, 1.0]} />
		<T.MeshStandardMaterial color="#9b7048" flatShading />
	</T.Mesh>
	<T.Mesh position={[0, 1.13, 0]}>
		<T.BoxGeometry args={[2.7, 0.08, 1.1]} />
		<T.MeshStandardMaterial color="#3d4650" flatShading />
	</T.Mesh>
	<T.Mesh position={[-0.3, 1.4, -0.1]}>
		<T.BoxGeometry args={[0.12, 0.5, 0.12]} />
		<T.MeshStandardMaterial color="#2a2f36" flatShading />
	</T.Mesh>
	<T.Mesh position={[-0.3, 2.05, -0.05]} rotation.x={-0.15} castShadow>
		<T.BoxGeometry args={[1.5, 1.0, 0.12]} />
		<T.MeshStandardMaterial color="#2a2f36" flatShading />
	</T.Mesh>
	<T.Mesh position={[-0.3, 2.05, 0.02]} rotation.x={-0.15}>
		<T.BoxGeometry args={[1.32, 0.82, 0.02]} />
		<T.MeshStandardMaterial
			color="#9fd3f0"
			emissive="#6fc3f0"
			emissiveIntensity={glow}
			flatShading
		/>
	</T.Mesh>
	<!-- 화면 속 막대 몇 줄 -->
	{#each [0, 1, 2] as i (i)}
		<T.Mesh position={[-0.6 + i * 0.32, 1.92 + i * 0.07, 0.06]} rotation.x={-0.15}>
			<T.BoxGeometry args={[0.18, 0.2 + i * 0.14, 0.02]} />
			<T.MeshStandardMaterial color="#2f6f9a" flatShading />
		</T.Mesh>
	{/each}
	<!-- 카드 단말기와 영수증 -->
	<T.Mesh position={[0.8, 1.3, 0.2]} castShadow>
		<T.BoxGeometry args={[0.4, 0.26, 0.5]} />
		<T.MeshStandardMaterial color="#e6e2d8" flatShading />
	</T.Mesh>
	<T.Mesh position={[0.8, 1.55, 0.05]}>
		<T.BoxGeometry args={[0.24, 0.3, 0.02]} />
		<T.MeshStandardMaterial color="#ffffff" flatShading />
	</T.Mesh>
{:else if kind === 'batter'}
	<!-- CPBS: 배트를 어깨 위로 든 대기 자세의 타자 (일반적인 모습) -->
	<T.Mesh position={[0, 0.03, 0.6]} rotation.y={Math.PI / 5}>
		<T.CylinderGeometry args={[0.45, 0.45, 0.05, 5]} />
		<T.MeshStandardMaterial color="#f4f4f0" flatShading />
	</T.Mesh>
	<T.Group rotation.y={-0.5}>
		<!-- 다리: 어깨너비로 벌리고 무릎을 조금 굽힘 -->
		{#each [-1, 1] as side (side)}
			<T.Mesh position={[side * 0.32, 0.5, 0]} rotation.z={side * 0.15} castShadow>
				<T.BoxGeometry args={[0.26, 1.0, 0.3]} />
				<T.MeshStandardMaterial color="#9aa0a8" flatShading />
			</T.Mesh>
			<T.Mesh position={[side * 0.4, 0.06, 0.06]}>
				<T.BoxGeometry args={[0.28, 0.12, 0.42]} />
				<T.MeshStandardMaterial color="#2a2f36" flatShading />
			</T.Mesh>
		{/each}
		<!-- 몸통 -->
		<T.Mesh position={[0, 1.4, 0]} rotation.x={0.15} castShadow>
			<T.BoxGeometry args={[0.8, 0.95, 0.42]} />
			<T.MeshStandardMaterial color="#e9e6dc" flatShading />
		</T.Mesh>
		<T.Mesh position={[0, 0.98, 0]}>
			<T.BoxGeometry args={[0.82, 0.14, 0.44]} />
			<T.MeshStandardMaterial color="#3d4650" flatShading />
		</T.Mesh>
		<!-- 머리와 헬멧 -->
		<T.Mesh position={[0, 2.08, 0.05]} castShadow>
			<T.IcosahedronGeometry args={[0.28, 1]} />
			<T.MeshStandardMaterial color="#d9a77c" flatShading />
		</T.Mesh>
		<T.Mesh position={[0, 2.16, 0.02]}>
			<T.SphereGeometry args={[0.33, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
			<T.MeshStandardMaterial color="#2c4a7a" flatShading />
		</T.Mesh>
		<T.Mesh position={[0, 2.13, 0.3]}>
			<T.BoxGeometry args={[0.4, 0.05, 0.22]} />
			<T.MeshStandardMaterial color="#2c4a7a" flatShading />
		</T.Mesh>
		<!-- 팔: 두 손을 오른쪽 어깨 위에 모음 -->
		<T.Mesh position={[0.18, 1.65, 0.2]} rotation={[0.9, 0, 0.9]} castShadow>
			<T.BoxGeometry args={[0.18, 0.62, 0.18]} />
			<T.MeshStandardMaterial color="#e9e6dc" flatShading />
		</T.Mesh>
		<T.Mesh position={[0.45, 1.7, 0.05]} rotation={[0.4, 0, -0.5]} castShadow>
			<T.BoxGeometry args={[0.18, 0.6, 0.18]} />
			<T.MeshStandardMaterial color="#e9e6dc" flatShading />
		</T.Mesh>
		<!-- 배트: 손에서 머리 뒤 위쪽으로 -->
		<T.Mesh position={[0.62, 2.35, -0.25]} rotation={[-0.5, 0, -0.35]} castShadow>
			<T.CylinderGeometry args={[0.09, 0.04, 1.5, 6]} />
			<T.MeshStandardMaterial color="#b98a52" flatShading />
		</T.Mesh>
	</T.Group>
{/if}
