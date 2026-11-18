// 화면 스타일 시안 비교용 쿼리. 기본값은 지금 모습(default)이다.
//   ?style=pixel        픽셀 렌더 켜기
//   ?style=pixel&px=6   픽셀 크기(CSS 픽셀 기준, 2~12)

export interface RenderStyle {
	kind: 'default' | 'pixel';
	/** 픽셀 렌더에서 저해상도 픽셀 하나가 차지하는 CSS 픽셀 수 */
	pixelSize: number;
}

export const DEFAULT_PIXEL_SIZE = 4;
const MIN_PIXEL_SIZE = 2;
const MAX_PIXEL_SIZE = 12;

export const DEFAULT_RENDER_STYLE: RenderStyle = { kind: 'default', pixelSize: DEFAULT_PIXEL_SIZE };

export function parseRenderStyle(search: string): RenderStyle {
	const params = new URLSearchParams(search);
	if (params.get('style') !== 'pixel') return DEFAULT_RENDER_STYLE;
	const raw = Number(params.get('px'));
	const pixelSize =
		params.has('px') && Number.isFinite(raw)
			? Math.min(MAX_PIXEL_SIZE, Math.max(MIN_PIXEL_SIZE, Math.round(raw)))
			: DEFAULT_PIXEL_SIZE;
	return { kind: 'pixel', pixelSize };
}
