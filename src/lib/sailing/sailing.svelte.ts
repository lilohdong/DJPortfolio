import { BOAT_START, seaBounds, type SeaBounds } from '../content/layout';
import type { Island } from './islands';

// 항해 상태와 배 물리. three.js에 의존하지 않으므로 3D가 실패해도 지도·패널은 이 상태로 동작한다.

/** 배 충돌 반지름 */
const BOAT_RADIUS = 1.4;
const ACCEL = 9;
const REVERSE_ACCEL = 5;
const MAX_FORWARD = 16;
const MAX_REVERSE = 5;
/** 항상 걸리는 물 저항 (초당 감쇠 계수) */
const DRAG = 0.5;
/** 조작을 놓았을 때 추가로 걸리는 감속 */
const COAST_DRAG = 0.9;
const TURN_RATE = 1.4;
/** 선착장 끝 충돌 원: 섬 가장자리에서 PIER_TIP만큼 나간 곳, 반지름 PIER_RADIUS.
 *  정박 위치(가장자리 + DOCK_GAP)는 이 원 바깥이다. Island.svelte의 선착장 모양과 맞춘다. */
const PIER_TIP = 1.3;
const PIER_RADIUS = 0.9;
/** 정박 안내가 뜨는 거리 (선착장 기준) */
const DOCK_RANGE = 9;
/** 키로 정박할 때 배가 선착장으로 미끄러져 들어가는 시간 (초) */
const DOCK_DURATION = 0.9;

export interface BoatState {
	x: number;
	z: number;
	/** rotation.y. 앞쪽은 (−sin, −cos) */
	heading: number;
	/** 앞쪽 방향 속도 (음수면 후진) */
	speed: number;
	turnVelocity: number;
}

interface DockTween {
	from: { x: number; z: number; heading: number };
	to: { x: number; z: number; heading: number };
	elapsed: number;
}

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export class Sailing {
	readonly islands: Island[];
	readonly bounds: SeaBounds;

	/** 매 프레임 바뀌는 값은 반응형으로 두지 않는다. */
	readonly boat: BoatState = {
		x: BOAT_START.x,
		z: BOAT_START.z,
		heading: 0,
		speed: 0,
		turnVelocity: 0
	};

	/** 키보드 입력 (−1, 0, 1) */
	readonly keys = { forward: 0, turn: 0 };
	/** 조이스틱 입력 (−1 ~ 1) */
	readonly joystick = { forward: 0, turn: 0 };

	/** 카메라가 다음 프레임에 보간 없이 바로 따라붙어야 하면 true. 장면이 읽고 되돌린다. */
	cameraSnap = true;
	/** 파도·흔들림용 경과 시간 (초) */
	time = 0;

	nearIslandId = $state<string | null>(null);
	openIslandId = $state<string | null>(null);
	mapOpen = $state(false);
	hasMoved = $state(false);
	reducedMotion = $state(false);
	/** 텔레포트할 때마다 1씩 늘어난다. 화면 전환 효과의 키로 쓴다. */
	teleportCount = $state(0);

	private dockTween: DockTween | null = null;

	constructor(islands: Island[]) {
		this.islands = islands;
		this.bounds = seaBounds(islands);
	}

	get controlsActive(): boolean {
		return this.openIslandId === null && !this.mapOpen;
	}

	get nearIsland(): Island | null {
		return this.islands.find((i) => i.id === this.nearIslandId) ?? null;
	}

	get openIsland(): Island | null {
		return this.islands.find((i) => i.id === this.openIslandId) ?? null;
	}

	/** 3D 장면이 매 프레임 부른다. */
	step(dt: number): void {
		dt = Math.min(dt, 0.1);
		this.time += dt;
		const boat = this.boat;

		if (this.dockTween) {
			this.advanceDockTween(dt);
			return;
		}

		const active = this.controlsActive;
		const forward = active ? clamp(this.keys.forward + this.joystick.forward, -1, 1) : 0;
		const turn = active ? clamp(this.keys.turn + this.joystick.turn, -1, 1) : 0;
		if (!this.hasMoved && (forward !== 0 || turn !== 0)) this.hasMoved = true;

		// 추진과 감속
		if (forward > 0) boat.speed += forward * ACCEL * dt;
		else if (forward < 0) boat.speed += forward * REVERSE_ACCEL * dt;
		boat.speed *= Math.exp(-(DRAG + (forward === 0 ? COAST_DRAG : 0)) * dt);
		boat.speed = clamp(boat.speed, -MAX_REVERSE, MAX_FORWARD);
		if (forward === 0 && Math.abs(boat.speed) < 0.02) boat.speed = 0;

		// 회전: 속도가 붙을수록 잘 돌고, 회전 자체에도 관성이 있다.
		const grip = 0.35 + 0.65 * Math.min(1, Math.abs(boat.speed) / 8);
		const targetTurn = turn * TURN_RATE * grip;
		boat.turnVelocity += (targetTurn - boat.turnVelocity) * Math.min(1, 4 * dt);
		boat.heading = wrapAngle(boat.heading + boat.turnVelocity * dt);

		boat.x += -Math.sin(boat.heading) * boat.speed * dt;
		boat.z += -Math.cos(boat.heading) * boat.speed * dt;

		this.resolveCollisions();
		this.updateNearIsland();
	}

	/** 섬과 선착장 끝을 원으로 보고 밀어낸다. 바다 경계도 막는다. */
	private resolveCollisions(): void {
		const boat = this.boat;
		for (const island of this.islands) {
			this.pushOut(island.x, island.z, island.size);
			const tip = island.size + PIER_TIP;
			this.pushOut(island.x + island.dir.x * tip, island.z + island.dir.z * tip, PIER_RADIUS);
		}
		const b = this.bounds;
		const x = clamp(boat.x, b.minX, b.maxX);
		const z = clamp(boat.z, b.minZ, b.maxZ);
		if (x !== boat.x || z !== boat.z) {
			boat.x = x;
			boat.z = z;
			boat.speed *= 0.9;
		}
	}

	private pushOut(cx: number, cz: number, radius: number): void {
		const boat = this.boat;
		const min = radius + BOAT_RADIUS;
		const dx = boat.x - cx;
		const dz = boat.z - cz;
		const dist = Math.hypot(dx, dz);
		if (dist >= min) return;
		const nx = dist > 1e-6 ? dx / dist : 0;
		const nz = dist > 1e-6 ? dz / dist : 1;
		boat.x = cx + nx * min;
		boat.z = cz + nz * min;
		// 부딪히는 방향의 속도 성분만큼 줄인다 (정면이면 거의 멈추고, 스치면 미끄러진다).
		const fx = -Math.sin(boat.heading);
		const fz = -Math.cos(boat.heading);
		const into = -(fx * nx + fz * nz) * Math.sign(boat.speed);
		if (into > 0) boat.speed *= 1 - 0.85 * into;
	}

	private updateNearIsland(): void {
		const boat = this.boat;
		let best: Island | null = null;
		let bestDist = DOCK_RANGE;
		for (const island of this.islands) {
			const d = Math.hypot(boat.x - island.dock.x, boat.z - island.dock.z);
			if (d < bestDist) {
				best = island;
				bestDist = d;
			}
		}
		const id = best?.id ?? null;
		if (id !== this.nearIslandId) this.nearIslandId = id;
	}

	private advanceDockTween(dt: number): void {
		const tween = this.dockTween!;
		tween.elapsed += dt;
		const t = Math.min(1, tween.elapsed / DOCK_DURATION);
		const e = t * t * (3 - 2 * t);
		const { from, to } = tween;
		this.boat.x = from.x + (to.x - from.x) * e;
		this.boat.z = from.z + (to.z - from.z) * e;
		this.boat.heading = from.heading + wrapAngle(to.heading - from.heading) * e;
		if (t >= 1) this.dockTween = null;
	}

	private placeAtDock(island: Island): void {
		this.dockTween = null;
		Object.assign(this.boat, {
			x: island.dock.x,
			z: island.dock.z,
			heading: island.dock.heading,
			speed: 0,
			turnVelocity: 0
		});
		this.cameraSnap = true;
	}

	/** 가까운 섬에 정박하고 패널을 연다 (E / Enter / 정박 버튼). */
	dock(): void {
		const island = this.nearIsland;
		if (!island || !this.controlsActive) return;
		this.boat.speed = 0;
		this.boat.turnVelocity = 0;
		if (this.reducedMotion) {
			this.placeAtDock(island);
		} else {
			this.dockTween = {
				from: { x: this.boat.x, z: this.boat.z, heading: this.boat.heading },
				to: { ...island.dock },
				elapsed: 0
			};
		}
		this.openIslandId = island.id;
	}

	/** 지도에서 섬을 고르면 선착장으로 순간 이동하고 패널을 바로 연다. */
	teleport(islandId: string): void {
		const island = this.islands.find((i) => i.id === islandId);
		if (!island) return;
		this.placeAtDock(island);
		this.nearIslandId = island.id;
		this.mapOpen = false;
		this.openIslandId = island.id;
		this.teleportCount += 1;
	}

	closePanel(): void {
		this.openIslandId = null;
	}

	toggleMap(): void {
		this.mapOpen = !this.mapOpen;
	}
}
