import type { IslandPlacement } from './types';

// docs/planning.md §1.3 바다 위 배치 규칙.

/** 등대섬 (고정 섬) */
export const LIGHTHOUSE_ISLAND: IslandPlacement = { x: 0, z: 0, size: 12 };

/** 배 시작 지점 */
export const BOAT_START = { x: 0, z: 30 } as const;

/** 경계 사각형에 더하는 여백 */
export const SEA_MARGIN = 40;

/**
 * 프로젝트 군도 배치 규칙: order 순서로 3행 격자를 위→아래, 왼쪽→오른쪽으로 채운다.
 * x = 50 + 28 × 열, z = −28 + 28 × 행, 크기는 featured면 6, 아니면 4.5
 */
export function projectIslandPlacement(order: number, featured: boolean): IslandPlacement {
	const i = order - 1;
	const col = Math.floor(i / 3);
	const row = ((i % 3) + 3) % 3;
	return { x: 50 + 28 * col, z: -28 + 28 * row, size: featured ? 6 : 4.5 };
}

export interface SeaBounds {
	minX: number;
	maxX: number;
	minZ: number;
	maxZ: number;
}

/** 모든 섬을 감싸는 사각형 + 여백. 지도도 같은 경계로 축척을 맞춘다. */
export function seaBounds(islands: IslandPlacement[]): SeaBounds {
	const all = [...islands, { x: BOAT_START.x, z: BOAT_START.z, size: 0 }];
	return {
		minX: Math.min(...all.map((i) => i.x - i.size)) - SEA_MARGIN,
		maxX: Math.max(...all.map((i) => i.x + i.size)) + SEA_MARGIN,
		minZ: Math.min(...all.map((i) => i.z - i.size)) - SEA_MARGIN,
		maxZ: Math.max(...all.map((i) => i.z + i.size)) + SEA_MARGIN
	};
}
