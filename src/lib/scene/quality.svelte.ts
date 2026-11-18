// 화면 품질 단계와 자동 조절 (T-029, T-029 수정).
//
// 방침: 사용자가 승인한 모습(픽셀 크기 4, 선명한 깃발)이 기본이고, 비용은 먼저 "그리는 횟수"로 줄인다.
// 자동 조절이 낮추는 순서: 프레임 상한(60 → 45 → 30) → 그림자 끄기 → 상한을 더 낮게.
// 픽셀 크기와 캔버스 해상도는 프레임당 작업 시간이 100ms를 넘는 기기에서만(마지막 단계) 건드린다.
// 그래픽 가속이 없는 환경도 화질은 그대로 두고 프레임 상한만 낮게 시작한다.

export interface FpsCaps {
	/** 항해 중 */
	sail: number;
	/** 배가 멈춰 있고 입력이 없을 때 */
	idle: number;
	/** 구경 화면에서 카메라가 자리를 잡은 뒤 */
	visit: number;
	/** 제목 화면이 바다를 덮고 있을 때 */
	title: number;
}

export interface QualitySettings {
	caps: FpsCaps;
	/** 해 그림자 */
	shadows: boolean;
	/** 픽셀 렌더의 픽셀 크기에 더할 값 (마지막 단계에서만) */
	extraPx: number;
	/** 캔버스 해상도 배율 상한 (마지막 단계에서만 1보다 작게) */
	dprMax: number;
}

export const QUALITY_LEVELS: readonly QualitySettings[] = [
	{ caps: { sail: 60, idle: 30, visit: 20, title: 15 }, shadows: true, extraPx: 0, dprMax: 2 },
	{ caps: { sail: 45, idle: 30, visit: 20, title: 15 }, shadows: true, extraPx: 0, dprMax: 2 },
	{ caps: { sail: 30, idle: 20, visit: 15, title: 10 }, shadows: false, extraPx: 0, dprMax: 2 },
	// 그래픽 가속이 없는 환경의 시작 단계: 화질은 그대로, 그리는 횟수만 적게
	{ caps: { sail: 20, idle: 10, visit: 8, title: 8 }, shadows: false, extraPx: 0, dprMax: 2 },
	// 정지 그림 직전: 여기서만 픽셀을 키우고 캔버스를 절반 해상도로 그린다
	{ caps: { sail: 20, idle: 10, visit: 8, title: 8 }, shadows: false, extraPx: 2, dprMax: 0.5 }
];
/** 가속이 없을 때 시작하는 단계 */
export const SOFTWARE_LEVEL = 3;
/** 화질을 깎는 마지막 단계 */
export const LOWEST_LEVEL = QUALITY_LEVELS.length - 1;

/** ?quality= 로 고정할 때의 단계 */
export const NAMED_LEVELS = { high: 0, mid: 2, low: SOFTWARE_LEVEL } as const;
export type QualityName = keyof typeof NAMED_LEVELS;

/** 캔버스 실제 픽셀 수 상한. 4K(약 830만) 화면까지는 화면 해상도 그대로 그린다 */
const MAX_CANVAS_PIXELS = 8_400_000;

/** 캔버스에 쓸 devicePixelRatio */
export function canvasDpr(level: number): number {
	if (typeof window === 'undefined') return 1;
	const cssPixels = Math.max(1, window.innerWidth * window.innerHeight);
	const byBudget = Math.sqrt(MAX_CANVAS_PIXELS / cssPixels);
	return Math.max(
		0.25,
		Math.min(window.devicePixelRatio || 1, QUALITY_LEVELS[level].dprMax, byBudget)
	);
}

export type RendererKind = 'hardware' | 'software' | 'unknown';

/**
 * 렌더러 종류. 렌더러 이름에 소프트웨어 렌더러 이름이 들어 있을 때만 software로 본다.
 * (예전에는 "software" 같은 넓은 말로도 판정했다)
 */
export function detectRenderer(): RendererKind {
	try {
		const gl = document.createElement('canvas').getContext('webgl2');
		if (!gl) return 'unknown';
		const info = gl.getExtension('WEBGL_debug_renderer_info');
		const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
		gl.getExtension('WEBGL_lose_context')?.loseContext();
		if (!name) return 'unknown';
		return /swiftshader|llvmpipe|softpipe|lavapipe|microsoft basic render/i.test(name)
			? 'software'
			: 'hardware';
	} catch {
		return 'unknown';
	}
}

/**
 * 현재 품질 단계. 자동이면 실제 작업 시간을 보고 한 단계씩 낮춘다.
 * 한 번 낮추면 그 세션에서는 다시 올리지 않는다 (들쭉날쭉 바뀌지 않게).
 */
export class Quality {
	level = $state(0);
	/** ?quality= 로 고정했으면 자동 조절을 하지 않는다 */
	readonly forced: boolean;
	readonly renderer: RendererKind;
	/** ?quality=debug: 화면 구석에 단계와 판정 근거를 띄운다 */
	readonly debug: boolean;
	/** 최근 측정 구간의 프레임당 평균 작업 시간 (ms). 디버그 표시용 */
	lastWorkMs = 0;

	constructor(forced: QualityName | null, renderer: RendererKind, debug: boolean) {
		this.forced = forced !== null;
		this.renderer = renderer;
		this.debug = debug;
		this.level =
			forced !== null ? NAMED_LEVELS[forced] : renderer === 'software' ? SOFTWARE_LEVEL : 0;
	}

	get settings(): QualitySettings {
		return QUALITY_LEVELS[this.level];
	}

	/** 한 단계 낮춘다. 화질을 깎는 마지막 단계로는 lower(true)로만 내려간다 */
	lower(allowImageCut = false): boolean {
		if (this.forced) return false;
		const limit = allowImageCut ? LOWEST_LEVEL : LOWEST_LEVEL - 1;
		if (this.level >= limit) return false;
		this.level += 1;
		return true;
	}
}
