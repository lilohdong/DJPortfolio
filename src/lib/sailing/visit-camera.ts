import type { Island } from './islands';

// 정박 후 섬 구경 카메라 (ui-plan §3.5 안 1의 1단계).
// 섬 중심을 바라보며 선착장 쪽에서 비스듬히 내려다본다. 좌우 60도 안에서 돌려 볼 수 있다.
// 글 패널이 덮는 자리를 피하려고 카메라를 돌리지 않고 화면 중심만 옮긴다(view offset).
// 그래서 패널 때문에 거리나 각도가 바뀌지 않는다.

/** 좌우로 돌려 볼 수 있는 최대 각도 */
export const VISIT_ORBIT_LIMIT = Math.PI / 3;
/** 들어가고 나오는 데 걸리는 시간 (초) */
export const VISIT_TRANSITION = 0.8;

export interface VisitPose {
	x: number;
	y: number;
	z: number;
	lookX: number;
	lookY: number;
	lookZ: number;
}

/**
 * 구경 카메라 자리. orbit은 선착장 방향에서 돌린 각도(라디안).
 * compact(좁은 화면)에서는 섬이 위쪽 30%에 들어가야 하므로 더 멀리서 본다.
 */
export function visitPose(island: Island, orbit: number, compact: boolean): VisitPose {
	const cos = Math.cos(orbit);
	const sin = Math.sin(orbit);
	// 선착장 방향(dir)을 y축으로 orbit만큼 돌린 방향
	const dx = island.dir.x * cos + island.dir.z * sin;
	const dz = -island.dir.x * sin + island.dir.z * cos;
	const scale = compact ? 2.3 : 1;
	// 섬 반지름 6이면 거리 약 20, 높이 약 10. 내려다보는 각도는 약 18도로 항해 카메라(16도)와 비슷하다.
	const distance = (island.size * 1.9 + 9) * scale;
	const height = (island.size * 0.85 + 5) * scale;
	const lookY = 2 + island.size * 0.25;
	return {
		x: island.x + dx * distance,
		y: height,
		z: island.z + dz * distance,
		lookX: island.x,
		lookY,
		lookZ: island.z
	};
}

// 글 패널 자리. IslandPanel.svelte의 클래스와 맞춘다:
// md(768px) 이상은 오른쪽 서랍 md:w-[26rem], xl(1280px) 이상 xl:w-[30rem], 오른쪽 여백 right-4.
// 그보다 좁으면 아래 시트 max-h-[70dvh].
const MD = 768;
const XL = 1280;
const REM = 16;

export interface ViewShift {
	/** 화면 중심을 옮길 양 (CSS 픽셀). 양수면 장면이 왼쪽(x)·위쪽(y)으로 간다 */
	x: number;
	y: number;
	compact: boolean;
}

export function panelShift(width: number, height: number): ViewShift {
	if (width >= MD) {
		const panel = (width >= XL ? 30 : 26) * REM + REM;
		return { x: panel / 2, y: 0, compact: false };
	}
	// 아래 70%를 시트가 덮으면 남는 위쪽 30%의 가운데(15%)로 옮긴다
	return { x: 0, y: height * 0.35, compact: true };
}
