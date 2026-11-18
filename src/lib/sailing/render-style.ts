// 화면 스타일 쿼리. 기본값은 픽셀 렌더다.
//   (쿼리 없음)          픽셀 렌더, 픽셀 크기 4, 품질 자동
//   ?px=6               픽셀 크기(CSS 픽셀 기준, 2~12)
//   ?style=lowpoly      이전 로우폴리 화면 (비교용)
//   ?style=pixel        기본값과 같음 (예전 링크 호환)
//   ?quality=low|mid|high  품질 단계 고정 (검수용, 자동 조절 끔)
//   ?quality=debug      자동 조절은 그대로, 화면 구석에 단계와 판정 근거 표시

export type QualityParam = 'low' | 'mid' | 'high';

export interface RenderStyle {
	kind: 'lowpoly' | 'pixel';
	/** 픽셀 렌더에서 저해상도 픽셀 하나가 차지하는 CSS 픽셀 수 */
	pixelSize: number;
	/** 품질 단계 고정 값. null이면 자동 */
	quality: QualityParam | null;
	/** ?quality=debug */
	qualityDebug: boolean;
}

export const DEFAULT_PIXEL_SIZE = 4;

/** 픽셀 렌더에서 수면이 받는 안개 상한. 1이면 먼 바다가 하늘색에 녹아 수평선이 사라진다. */
export const SEA_MAX_FOG = 0.5;
/** 이보다 먼 깊이는 하늘·해로 본다 (수면 판 대각선 절반 ≈ 640 < 이 값 < 해 거리 700) */
export const SKY_DEPTH = 680;
const MIN_PIXEL_SIZE = 2;
const MAX_PIXEL_SIZE = 12;

export const DEFAULT_RENDER_STYLE: RenderStyle = {
	kind: 'pixel',
	pixelSize: DEFAULT_PIXEL_SIZE,
	quality: null,
	qualityDebug: false
};

function parseQuality(params: URLSearchParams): QualityParam | null {
	const value = params.get('quality');
	return value === 'low' || value === 'mid' || value === 'high' ? value : null;
}

export function parseRenderStyle(search: string): RenderStyle {
	const params = new URLSearchParams(search);
	const quality = parseQuality(params);
	const qualityDebug = params.get('quality') === 'debug';
	if (params.get('style') === 'lowpoly')
		return { kind: 'lowpoly', pixelSize: DEFAULT_PIXEL_SIZE, quality, qualityDebug };
	const raw = Number(params.get('px'));
	const pixelSize =
		params.has('px') && Number.isFinite(raw)
			? Math.min(MAX_PIXEL_SIZE, Math.max(MIN_PIXEL_SIZE, Math.round(raw)))
			: DEFAULT_PIXEL_SIZE;
	return { kind: 'pixel', pixelSize, quality, qualityDebug };
}
