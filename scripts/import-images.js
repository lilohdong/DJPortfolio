// 콘텐츠 파일(content/profile.md, content/projects/*.md)에 적힌 이미지를
// 원본 포트폴리오 볼트에서 읽어 웹용 WebP로 변환하고 static/content/ 아래에 저장한다.
// 변환 후 콘텐츠 파일의 src를 저장소 경로로 바꾸고 width/height를 기록한다.
// 원본 위치는 source 필드에 남겨 다시 실행할 수 있게 한다.
//
// 사용법:
//   npm run images:import -- --vault "<볼트 경로>"
//   PORTFOLIO_VAULT="<볼트 경로>" npm run images:import
// 옵션:
//   --dry-run   파일을 쓰지 않고 할 일만 출력한다
//   --force     이미 변환된 파일이 있어도 다시 변환한다
//
// 볼트는 읽기만 한다. 콘텐츠 파일에 적힌 이미지 외의 파일은 열지 않는다.
// 콘텐츠 파일은 다시 직렬화하지 않고 바뀌는 값만 고쳐, 주석과 서식을 그대로 둔다.

import { readFile, writeFile, readdir, mkdir, stat, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parseDocument, isMap, isSeq, isScalar } from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const STATIC_DIR = path.join(ROOT, 'static');

/** 긴 변 최대 길이(px) */
const MAX_EDGE = { project: 1600, profile: 640 };
const WEBP_QUALITY = 80;
const UNVERIFIED = '확인 필요';
const RASTER_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.tif', '.tiff', '.avif']);

function parseArgs(argv) {
	const args = { vault: process.env.PORTFOLIO_VAULT ?? '', dryRun: false, force: false };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--vault') args.vault = argv[++i] ?? '';
		else if (a.startsWith('--vault=')) args.vault = a.slice('--vault='.length);
		else if (a === '--dry-run') args.dryRun = true;
		else if (a === '--force') args.force = true;
		else throw new Error(`알 수 없는 인자: ${a}`);
	}
	return args;
}

/** 원본 파일 이름을 ASCII 파일 이름(확장자 제외)으로 바꾼다. 한글 등만 남으면 빈 문자열. */
function asciiName(sourcePath) {
	return path
		.basename(sourcePath, path.extname(sourcePath))
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

async function exists(p) {
	try {
		await access(p);
		return true;
	} catch {
		return false;
	}
}

/** frontmatter의 YAML 부분과 파일 안에서의 시작 위치를 돌려준다. */
function splitFrontmatter(text) {
	const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
	if (!m) throw new Error('frontmatter(---)를 찾지 못했습니다');
	return { yaml: m[1], offset: m[0].indexOf(m[1]) };
}

/** YAML 값 표기. 문자열은 기존 콘텐츠 파일처럼 큰따옴표로 쓴다. */
function yamlLiteral(value) {
	return typeof value === 'number' ? String(value) : JSON.stringify(value);
}

/**
 * 이미지 항목(YAML 맵) 하나의 필드를 고치는 편집 목록을 만든다.
 * 있는 키는 값만 바꾸고, 없는 키는 항목 끝에 줄을 덧붙인다.
 * 위치(start, end)는 frontmatter YAML 텍스트 기준이다.
 */
function mapEdits(yamlText, node, fields, eol) {
	const edits = [];
	const pairs = node.items;
	const first = pairs[0].key.range[0];
	const indent = ' '.repeat(first - (yamlText.lastIndexOf('\n', first - 1) + 1));
	const added = [];
	for (const [key, value] of Object.entries(fields)) {
		const pair = pairs.find((p) => isScalar(p.key) && p.key.value === key);
		if (pair?.value?.range) {
			const [start, end] = pair.value.range;
			edits.push({ start, end, text: yamlLiteral(value) });
		} else {
			added.push(`${eol}${indent}${key}: ${yamlLiteral(value)}`);
		}
	}
	if (added.length) {
		const last = pairs[pairs.length - 1];
		const end = (last.value ?? last.key).range[1];
		edits.push({ start: end, end, text: added.join('') });
	}
	return edits;
}

/**
 * 이미지 항목 하나(YAML 맵 노드)를 변환한다. 콘텐츠 파일은 고치지 않고 새 필드 값만 돌려준다.
 * @returns {Promise<{status: 'done'|'skipped', reason?: string, before?: number, after?: number, file?: string, fields?: Record<string, string|number>}>}
 */
async function processImage(
	node,
	{ vault, outDir, outUrlDir, maxEdge, fixedName, usedNames, args }
) {
	const source = node.get('source') ?? node.get('src');

	if (typeof source !== 'string' || source.trim() === '' || source === UNVERIFIED) {
		return { status: 'skipped', reason: `src가 "${UNVERIFIED}"이거나 비어 있음` };
	}
	if (!RASTER_EXT.has(path.extname(source).toLowerCase())) {
		return { status: 'skipped', reason: `이미지 파일이 아님 (${path.extname(source)})` };
	}

	const inputPath = path.resolve(vault, source);
	if (!(await exists(inputPath))) {
		return { status: 'skipped', reason: '볼트에 파일 없음' };
	}

	let base = fixedName ?? asciiName(source);
	if (!base) base = 'image';
	let name = base;
	for (let n = 2; usedNames.has(name); n++) name = `${base}-${n}`;
	usedNames.add(name);

	const fileName = `${name}.webp`;
	const outPath = path.join(outDir, fileName);
	const before = (await stat(inputPath)).size;

	let info;
	if (!args.force && (await exists(outPath))) {
		const meta = await sharp(outPath).metadata();
		info = { width: meta.width, height: meta.height, size: (await stat(outPath)).size };
	} else if (args.dryRun) {
		const meta = await sharp(inputPath).metadata();
		const scale = Math.min(1, maxEdge / Math.max(meta.width, meta.height));
		info = {
			width: Math.round(meta.width * scale),
			height: Math.round(meta.height * scale),
			size: 0
		};
	} else {
		await mkdir(outDir, { recursive: true });
		info = await sharp(inputPath)
			.rotate()
			.resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: WEBP_QUALITY })
			.toFile(outPath);
	}

	return {
		status: 'done',
		before,
		after: info.size,
		file: `static/${outUrlDir}/${fileName}`,
		fields: { src: `${outUrlDir}/${fileName}`, width: info.width, height: info.height, source }
	};
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (!args.vault) {
		console.error('볼트 경로가 필요합니다: --vault "<경로>" 또는 PORTFOLIO_VAULT 환경 변수');
		process.exit(1);
	}
	const vault = path.resolve(args.vault);
	if (!(await exists(vault))) {
		console.error(`볼트 경로가 없습니다: ${vault}`);
		process.exit(1);
	}

	const targets = [
		{ file: path.join(CONTENT_DIR, 'profile.md'), kind: 'profile' },
		...(await readdir(path.join(CONTENT_DIR, 'projects')))
			.filter((f) => f.endsWith('.md'))
			.sort()
			.map((f) => ({ file: path.join(CONTENT_DIR, 'projects', f), kind: 'project' }))
	];

	const done = [];
	const skipped = [];
	let totalBefore = 0;
	let totalAfter = 0;

	for (const { file, kind } of targets) {
		const rel = path.relative(ROOT, file).replaceAll('\\', '/');
		const text = await readFile(file, 'utf8');
		const { yaml, offset } = splitFrontmatter(text);
		const eol = text.includes('\r\n') ? '\r\n' : '\n';
		const doc = parseDocument(yaml);
		if (doc.errors.length) throw new Error(`${rel}: YAML 오류 ${doc.errors[0].message}`);

		/** @type {{node: any, label: string, fixedName?: string}[]} */
		const items = [];
		let outUrlDir;
		if (kind === 'profile') {
			outUrlDir = 'content/profile';
			const photo = doc.get('photo', true);
			if (isMap(photo)) items.push({ node: photo, label: 'photo', fixedName: 'photo' });
		} else {
			const slug = path.basename(file, '.md');
			outUrlDir = `content/projects/${slug}`;
			const images = doc.get('images', true);
			if (isSeq(images)) {
				images.items.forEach((node, i) => {
					if (isMap(node)) items.push({ node, label: `images[${i}]` });
				});
			}
		}

		const usedNames = new Set();
		const edits = [];
		for (const item of items) {
			const res = await processImage(item.node, {
				vault,
				outDir: path.join(STATIC_DIR, ...outUrlDir.split('/')),
				outUrlDir,
				maxEdge: MAX_EDGE[kind],
				fixedName: item.fixedName,
				usedNames,
				args
			});
			const where = `${rel} ${item.label}`;
			if (res.status === 'skipped') {
				const source = item.node.get('source') ?? item.node.get('src');
				skipped.push({ where, source, reason: res.reason });
			} else {
				totalBefore += res.before;
				totalAfter += res.after;
				done.push({ where, file: res.file, before: res.before, after: res.after });
				edits.push(...mapEdits(yaml, item.node, res.fields, eol));
			}
		}

		if (edits.length && !args.dryRun) {
			let out = text;
			for (const e of edits.sort((a, b) => b.start - a.start)) {
				out = out.slice(0, offset + e.start) + e.text + out.slice(offset + e.end);
			}
			if (out !== text) await writeFile(file, out, 'utf8');
		}
	}

	const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
	const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
	console.log(`\n변환 ${done.length}개${args.dryRun ? ' (dry run, 파일 안 씀)' : ''}`);
	for (const d of done) console.log(`  ${d.where} → ${d.file}  ${kb(d.before)} → ${kb(d.after)}`);
	console.log(`\n건너뜀 ${skipped.length}개`);
	for (const s of skipped) console.log(`  ${s.where}: ${s.reason} (${s.source})`);
	console.log(`\n총 용량: 원본 ${mb(totalBefore)} → 변환 ${mb(totalAfter)}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
