// 화면 품질 단계와 자동 조절 (T-029).
// 방문자 환경(내장 그래픽, 가속 꺼진 브라우저, 고해상도 화면)에 기대지 않고 알아서 가볍게 돌게 한다.
// 낮추는 순서는 눈에 덜 띄는 것부터: 그림자 → 깃발 선명 패스를 구경 화면에서만 → 픽셀 한 단계 더 크게
// → 픽셀 두 단계 더 크게와 프레임 상한 30.

export interface QualitySettings {
	/** 해 그림자 */
	shadows: boolean;
	/** 깃발 선명 패스: 항상 / 구경 화면에서만 */
	sharpFlags: 'always' | 'visit';
	/** 픽셀 렌더의 픽셀 크기에 더할 값 */
	extraPx: number;
	/** 항해 중 프레임 상한 */
	fpsCap: number;
	/** 화면 해상도 배율(devicePixelRatio) 상한 */
	dprMax: number;
}

export const QUALITY_LEVELS: readonly QualitySettings[] = [
	{ shadows: true, sharpFlags: 'always', extraPx: 0, fpsCap: 60, dprMax: 2 },
	{ shadows: false, sharpFlags: 'always', extraPx: 0, fpsCap: 60, dprMax: 2 },
	{ shadows: false, sharpFlags: 'visit', extraPx: 0, fpsCap: 60, dprMax: 1.5 },
	{ shadows: false, sharpFlags: 'visit', extraPx: 1, fpsCap: 45, dprMax: 1.25 },
	// 가장 낮은 단계: 최종 화면도 CSS 크기의 절반으로 그리고 브라우저가 계단 모양 그대로 늘린다.
	// 픽셀 렌더라 모습은 거의 같고, 소프트웨어 렌더에서 화면 전체 셰이더 비용이 1/4이 된다.
	{ shadows: false, sharpFlags: 'visit', extraPx: 2, fpsCap: 30, dprMax: 0.5 }
];
export const LOWEST_LEVEL = QUALITY_LEVELS.length - 1;

/** ?quality= 로 고정할 때의 단계 */
export const NAMED_LEVELS = { high: 0, mid: 2, low: LOWEST_LEVEL } as const;
export type QualityName = keyof typeof NAMED_LEVELS;

/** 화면 전체(캔버스) 실제 픽셀 수 상한. 4K·고배율 화면에서도 이 이상은 그리지 않는다 */
const MAX_CANVAS_PIXELS = 3_700_000;

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

/** 소프트웨어 렌더러(그래픽 가속 없음)인지. 알 수 없으면 false */
export function isSoftwareRenderer(): boolean {
	try {
		const gl = document.createElement('canvas').getContext('webgl2');
		if (!gl) return false;
		const info = gl.getExtension('WEBGL_debug_renderer_info');
		const name = String(
			info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
		);
		gl.getExtension('WEBGL_lose_context')?.loseContext();
		return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
	} catch {
		return false;
	}
}

/**
 * 현재 품질 단계. 자동이면 프레임 시간을 보고 한 단계씩 낮춘다.
 * 한 번 낮추면 그 세션에서는 다시 올리지 않는다 (들쭉날쭉 바뀌지 않게).
 */
export class Quality {
	level = $state(0);
	/** ?quality= 로 고정했으면 자동 조절을 하지 않는다 */
	readonly forced: boolean;

	constructor(forced: QualityName | null, software: boolean) {
		this.forced = forced !== null;
		this.level = forced !== null ? NAMED_LEVELS[forced] : software ? LOWEST_LEVEL : 0;
	}

	get settings(): QualitySettings {
		return QUALITY_LEVELS[this.level];
	}

	lower(): boolean {
		if (this.forced || this.level >= LOWEST_LEVEL) return false;
		this.level += 1;
		return true;
	}
}
