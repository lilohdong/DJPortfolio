// 플레이어 카드의 픽셀 초상화를 프로필 사진에서 한 번 만들어 static/에 둔다.
// 런타임에 캔버스로 줄이지 않고, 결과를 눈으로 골라 저장소에 넣는다.
//
// 사용법:
//   npm run portrait                        # 아래 기본 설정으로 static/content/profile/portrait.png
//   node scripts/make-portrait.js --grid 40 --colors 16 --bg "#8cb4d6" --out <파일>
//
// 처리 순서:
//   1. 얼굴과 어깨가 들어오는 정사각형으로 자른다 (CROP, 사진 크기 대비 비율)
//   2. 격자 크기(grid)로 줄인다
//   3. 가장자리에서 이어진 밝은 배경을 한 가지 색(bg)으로 칠한다
//   4. 디더링 없이 색 수(colors)를 줄여 면이 또렷하게 나뉘게 한다 (PNG 팔레트)

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'static/content/profile/photo.webp');

/** 고른 설정 (캡처를 비교해 정함, 보고서 참고). 바꾸면 src/lib/ui/PlayerCard.svelte의 PORTRAIT_GRID도 맞춘다 */
export const DEFAULTS = {
	grid: 40,
	colors: 16,
	bg: '#8cb4d6',
	out: path.join(ROOT, 'static/content/profile/portrait.png')
};

/** 사진 안에서 얼굴과 어깨가 들어오는 정사각형 (가로 전체, 머리 위 여백을 조금 남김). 지금 사진(480×640) 기준 */
const CROP = { x: 0, y: 0.125, size: 1 };
/** 배경으로 볼 밝기와 채도 기준 (줄인 뒤 픽셀) */
const BG_MIN_LUMA = 215;
const BG_MAX_CHROMA = 28;
/** 배경과 맞닿은 가장자리 픽셀은 이 밝기 이상이면 배경으로 정리한다 */
const FRINGE_MIN_LUMA = 150;

function parseArgs(argv) {
	const args = { ...DEFAULTS };
	for (let i = 0; i < argv.length; i += 2) {
		const [key, value] = [argv[i], argv[i + 1]];
		if (key === '--grid') args.grid = Number(value);
		else if (key === '--colors') args.colors = Number(value);
		else if (key === '--bg') args.bg = value;
		else if (key === '--out') args.out = path.resolve(value);
		else throw new Error(`알 수 없는 인자: ${key}`);
	}
	return args;
}

function hexToRgb(hex) {
	const n = parseInt(hex.replace('#', ''), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** 가장자리에서 시작해, 배경처럼 보이는(밝고 색이 옅은) 픽셀을 이어서 bg로 칠한다 */
function flattenBackground(data, size, bg) {
	const isBg = (i) => {
		const r = data[i * 3];
		const g = data[i * 3 + 1];
		const b = data[i * 3 + 2];
		const luma = 0.299 * r + 0.587 * g + 0.114 * b;
		const chroma = Math.max(r, g, b) - Math.min(r, g, b);
		return luma >= BG_MIN_LUMA && chroma <= BG_MAX_CHROMA;
	};
	const seen = new Uint8Array(size * size);
	const stack = [];
	for (let k = 0; k < size; k++) {
		stack.push(k, (size - 1) * size + k, k * size, k * size + size - 1);
	}
	while (stack.length) {
		const i = stack.pop();
		if (seen[i] || !isBg(i)) continue;
		seen[i] = 1;
		data[i * 3] = bg[0];
		data[i * 3 + 1] = bg[1];
		data[i * 3 + 2] = bg[2];
		const x = i % size;
		const y = (i - x) / size;
		if (x > 0) stack.push(i - 1);
		if (x < size - 1) stack.push(i + 1);
		if (y > 0) stack.push(i - size);
		if (y < size - 1) stack.push(i + size);
	}

	// 머리카락 가장자리에 남은 밝은 테두리(원래 흰 배경과 섞인 픽셀)도 배경 쪽으로 정리한다.
	// 배경과 맞닿아 있고, 조금 덜 밝아도 색이 옅으면 배경으로 칠한다. 한 번만 돈다.
	const fringe = [];
	for (let i = 0; i < size * size; i++) {
		if (seen[i]) continue;
		const x = i % size;
		const y = (i - x) / size;
		const touches =
			(x > 0 && seen[i - 1]) ||
			(x < size - 1 && seen[i + 1]) ||
			(y > 0 && seen[i - size]) ||
			(y < size - 1 && seen[i + size]);
		if (!touches) continue;
		const r = data[i * 3];
		const g = data[i * 3 + 1];
		const b = data[i * 3 + 2];
		const luma = 0.299 * r + 0.587 * g + 0.114 * b;
		const chroma = Math.max(r, g, b) - Math.min(r, g, b);
		if (luma >= FRINGE_MIN_LUMA && chroma <= BG_MAX_CHROMA + 12) fringe.push(i);
	}
	for (const i of fringe) {
		data[i * 3] = bg[0];
		data[i * 3 + 1] = bg[1];
		data[i * 3 + 2] = bg[2];
	}
}

export async function makePortrait({ grid, colors, bg, out }) {
	const meta = await sharp(SOURCE).metadata();
	const side = Math.round(Math.min(meta.width, meta.height) * CROP.size);
	const left = Math.round(meta.width * CROP.x);
	const top = Math.min(Math.round(meta.height * CROP.y), meta.height - side);

	const { data } = await sharp(SOURCE)
		.extract({ left, top, width: side, height: side })
		.resize(grid, grid, { kernel: 'lanczos3' })
		.removeAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	flattenBackground(data, grid, hexToRgb(bg));

	await mkdir(path.dirname(out), { recursive: true });
	await sharp(data, { raw: { width: grid, height: grid, channels: 3 } })
		.png({ palette: true, colors, dither: 0, compressionLevel: 9 })
		.toFile(out);
	return out;
}

if (import.meta.url === `file:///${process.argv[1].replaceAll('\\', '/').replace(/^\//, '')}`) {
	const args = parseArgs(process.argv.slice(2));
	const out = await makePortrait(args);
	console.log(
		`${path.relative(ROOT, out)} (${args.grid}×${args.grid}, ${args.colors}색, 배경 ${args.bg})`
	);
}
