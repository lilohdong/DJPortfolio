import type { IslandPlacement } from './types';

// docs/planning.md §1.3 바다 위 배치 규칙.

/** 등대섬 (고정 섬) */
export const LIGHTHOUSE_ISLAND: IslandPlacement = { x: 0, z: 0, size: 12 };

/** 배 시작 지점 */
export const BOAT_START = { x: 0, z: 30 } as const;

/** 경계 사각형에 더하는 여백 */
export const SEA_MARGIN = 40;

/**
 * 콘텐츠 파일에 island 좌표가 없을 때 쓰는 임시 자리.
 * 섬 자리는 사람이 planning.md §1.3 기준으로 골라 island에 적는 것이 원칙이고,
 * 이 함수는 빠뜨렸을 때 기존 섬과 겹치지 않는 바깥 고리(등대섬에서 110 이상)에 놓을 뿐이다.
 * 방향은 order마다 황금각(137.5도)씩 돌려 서로 떨어지게 한다.
 */
export function projectIslandPlacement(order: number, featured: boolean): IslandPlacement {
	const angle = (order * 137.5 * Math.PI) / 180;
	const radius = 110 + 4 * order;
	return {
		x: Math.round(Math.sin(angle) * radius),
		z: Math.round(-Math.cos(angle) * radius),
		size: featured ? 6 : 4.5
	};
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
