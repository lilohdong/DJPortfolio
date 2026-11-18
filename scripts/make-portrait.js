// 플레이어 카드의 초상화를 프로필 사진에서 한 번 만들어 static/에 둔다.
// 화면에서는 이 이미지를 부드럽게 줄여 보여 준다(데스크톱 80px, 모바일 40px).
// 원본은 가장 큰 표시 크기의 3배(240px)라 화면 배율 1~3에서 선명하다.
// 배경은 사진의 원래 배경(흰색)을 그대로 둔다. 다른 색으로 바꾸면 흰 셔츠와 볼의 밝은 부분까지
// 배경으로 잘못 칠해져 가장자리가 지저분해졌다.
//
// 사용법:
//   npm run portrait                                  # static/content/profile/portrait.webp
//   node scripts/make-portrait.js --size 240 --out <파일>

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'static/content/profile/photo.webp');

/** 바꾸면 src/lib/ui/PlayerCard.svelte의 PORTRAIT도 맞춘다 */
export const DEFAULTS = {
	size: 240,
	out: path.join(ROOT, 'static/content/profile/portrait.webp')
};

/** 사진 안에서 얼굴과 어깨가 들어오는 정사각형 (가로 전체, 머리 위 여백을 조금 남김). 지금 사진(480×640) 기준 */
const CROP = { x: 0, y: 0.125, size: 1 };

function parseArgs(argv) {
	const args = { ...DEFAULTS };
	for (let i = 0; i < argv.length; i += 2) {
		const [key, value] = [argv[i], argv[i + 1]];
		if (key === '--size') args.size = Number(value);
		else if (key === '--out') args.out = path.resolve(value);
		else throw new Error(`알 수 없는 인자: ${key}`);
	}
	return args;
}

export async function makePortrait({ size, out }) {
	const meta = await sharp(SOURCE).metadata();
	const side = Math.round(Math.min(meta.width, meta.height) * CROP.size);
	const left = Math.round(meta.width * CROP.x);
	const top = Math.min(Math.round(meta.height * CROP.y), meta.height - side);

	await mkdir(path.dirname(out), { recursive: true });
	await sharp(SOURCE)
		.extract({ left, top, width: side, height: side })
		.resize(size, size, { kernel: 'lanczos3' })
		.webp({ quality: 85 })
		.toFile(out);
	return out;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const args = parseArgs(process.argv.slice(2));
	const out = await makePortrait(args);
	console.log(`${path.relative(ROOT, out)} (${args.size}×${args.size})`);
}
