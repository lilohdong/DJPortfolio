import { BOAT_START, LIGHTHOUSE_ISLAND } from '../content/layout';
import type { Project } from '../content/types';
import { ko } from '../i18n/ko';

export interface DockPose {
	x: number;
	z: number;
	/** 배가 섬을 바라보는 방향 (rotation.y) */
	heading: number;
}

export interface Island {
	/** 주소 조각으로도 쓸 식별자: 'lighthouse', 'project-<slug>' */
	id: string;
	kind: 'lighthouse' | 'project';
	name: string;
	/** 지도에 함께 보이는 짧은 설명 */
	caption: string | null;
	x: number;
	z: number;
	size: number;
	/** 섬 중심에서 선착장 쪽을 가리키는 단위 벡터 */
	dir: { x: number; z: number };
	dock: DockPose;
	project: Project | null;
}

/** 선착장(배가 멈추는 자리)이 섬 가장자리에서 떨어진 거리 */
export const DOCK_GAP = 4;

function makeIsland(base: Omit<Island, 'dir' | 'dock'>, toward: { x: number; z: number }): Island {
	let dx = toward.x - base.x;
	let dz = toward.z - base.z;
	const len = Math.hypot(dx, dz) || 1;
	dx /= len;
	dz /= len;
	const r = base.size + DOCK_GAP;
	return {
		...base,
		dir: { x: dx, z: dz },
		// 배의 앞쪽은 (−sin θ, −cos θ). 섬 쪽(−dir)을 보게 θ = atan2(dx, dz).
		dock: { x: base.x + dx * r, z: base.z + dz * r, heading: Math.atan2(dx, dz) }
	};
}

/** 등대섬 + 프로젝트 섬 목록. 프로젝트 섬의 선착장은 등대섬 쪽을 향한다. */
export function buildIslands(projects: Project[]): Island[] {
	const lighthouse = makeIsland(
		{
			id: 'lighthouse',
			kind: 'lighthouse',
			name: ko.islands.lighthouse,
			caption: ko.islands.lighthouseRole,
			...LIGHTHOUSE_ISLAND,
			project: null
		},
		BOAT_START
	);
	return [
		lighthouse,
		...projects.map((p) =>
			makeIsland(
				{
					id: `project-${p.slug}`,
					kind: 'project',
					name: p.title,
					caption: p.summary,
					...p.island,
					project: p
				},
				{ x: LIGHTHOUSE_ISLAND.x, z: LIGHTHOUSE_ISLAND.z }
			)
		)
	];
}
