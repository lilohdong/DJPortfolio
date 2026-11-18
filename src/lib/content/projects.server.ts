import { projectIslandPlacement } from './layout';
import {
	ContentError,
	isRecord,
	num,
	parseImage,
	splitFrontmatter,
	text,
	textList,
	type Warn
} from './parse.server';
import {
	LANDMARKS,
	type BodyBlock,
	type ContentImage,
	type IslandPlacement,
	type Landmark,
	type Project,
	type ProjectLink
} from './types';

// content/projects/*.md 를 빌드(사전 렌더링) 시점에 읽는다.
// 파일 하나 = 프로젝트 하나 = 섬 하나. 파일을 추가하면 목록에 자동으로 들어온다.
// 서버 전용 모듈(.server.ts)이라 YAML 파서는 브라우저 번들에 들어가지 않는다.
const files = import.meta.glob('/content/projects/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const SLUG_PATTERN = /^[a-z0-9-]+$/;

/** use가 이 말로 시작하면 대표 이미지 (예: "대표 이미지. 실제 앱 화면이 아니라 디자인 시안") */
const COVER_USE = '대표 이미지';
const MORE_MARKER = /^<!--\s*more\s*-->$/;
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const INLINE_IMAGE = /!\[[^\]]*\]\([^)]*\)/;
const COMMENT = /^<!--[\s\S]*-->$/;

function parseLinks(value: unknown): ProjectLink[] {
	if (!Array.isArray(value)) return [];
	const links: ProjectLink[] = [];
	for (const item of value) {
		if (!isRecord(item)) continue;
		const label = text(item.label);
		if (!label) continue;
		const url = text(item.url);
		links.push({
			type: text(item.type) ?? 'doc',
			label,
			url: url && /^https?:\/\//.test(url) ? url : null
		});
	}
	return links;
}

function parseIsland(value: unknown): IslandPlacement | null {
	if (!isRecord(value)) return null;
	const x = num(value.x);
	const z = num(value.z);
	const size = num(value.size);
	return x === null || z === null || size === null ? null : { x, z, size };
}

function parseLandmark(value: unknown, path: string, warn: Warn): Landmark | null {
	if (!isRecord(value) || value.landmark === undefined || value.landmark === null) return null;
	const name = value.landmark;
	if (typeof name === 'string' && (LANDMARKS as readonly string[]).includes(name)) {
		return name as Landmark;
	}
	warn(
		`${path}: island.landmark 값 "${String(name)}"을 모름 (${LANDMARKS.join(', ')}), 조형물 없이 둠`
	);
	return null;
}

/**
 * 본문을 글 문단과 사진으로 나눈다 (docs/ui-plan.md §3.9).
 * - 빈 줄로 나뉜 덩어리 하나가 문단 하나다.
 * - "![](키)" 한 줄은 images의 그 사진이다. 키가 없거나 두 번 쓰이면 빌드를 멈춘다.
 * - "<!-- more -->" 한 줄 뒤는 접히는 부분이다.
 * - 대표 이미지는 본문에 적혀 있어도 본문에서 빼고 cover로만 보여 준다.
 */
function parseBody(
	path: string,
	source: string,
	images: Map<string, ContentImage>,
	cover: ContentImage | null,
	logoKey: string | null,
	warn: Warn
): { body: BodyBlock[]; more: BodyBlock[]; used: Set<string> } {
	const body: BodyBlock[] = [];
	const more: BodyBlock[] = [];
	const used = new Set<string>();
	let target = body;
	let sawMore = false;

	for (const chunk of source.split(/\r?\n\s*\r?\n/)) {
		const block = chunk.trim();
		if (block === '') continue;

		if (MORE_MARKER.test(block)) {
			if (sawMore) throw new ContentError(path, '<!-- more -->가 두 번 있음');
			sawMore = true;
			target = more;
			continue;
		}
		if (COMMENT.test(block)) continue;

		const line = IMAGE_LINE.exec(block);
		if (line) {
			const [, altText, key] = line;
			if (key === logoKey) throw new ContentError(path, `로고(${key})는 본문에 넣을 수 없음`);
			const image = images.get(key);
			if (!image) {
				throw new ContentError(
					path,
					`본문의 사진 키 "${key}"가 images에 없음 (변환된 이미지 파일 이름에서 확장자를 뺀 것이어야 함)`
				);
			}
			if (used.has(key)) throw new ContentError(path, `본문에 같은 사진(${key})을 두 번 씀`);
			used.add(key);
			if (altText.trim() !== '') {
				warn(`${path}: ![${altText}](${key})의 괄호 안 글은 쓰지 않음. 대체 글은 앞머리 alt를 씀`);
			}
			if (image === cover) continue;
			if (!image.caption) warn(`${path}: 본문 사진 ${key}에 caption이 없음`);
			target.push({ type: 'image', image });
			continue;
		}

		if (INLINE_IMAGE.test(block)) {
			warn(`${path}: 문단 안에 사진 표기가 섞여 있음. ![](키)는 앞뒤에 빈 줄을 둔 한 줄로 씀`);
		}
		target.push({ type: 'text', text: block.replace(/\s*\r?\n\s*/g, ' ') });
	}
	return { body, more, used };
}

function parseProject(path: string, source: string, warn: Warn): Project | null {
	const slug = path.split('/').pop()!.replace(/\.md$/, '');
	if (!SLUG_PATTERN.test(slug)) {
		warn(`${path}: slug 형식이 아님 (영문 소문자, 숫자, -)`);
		return null;
	}
	const { data, body } = splitFrontmatter(source);

	const title = text(data.title);
	const order = num(data.order);
	if (!title || order === null) {
		warn(`${path}: 필수 필드(title, order) 누락, 건너뜀`);
		return null;
	}
	const featured = data.featured === true;
	const period = isRecord(data.period) ? data.period : {};
	const team = isRecord(data.team) ? data.team : {};

	const logo = parseImage(data.logo, `${path} logo`, warn);
	const rawImages = Array.isArray(data.images) ? data.images : [];
	const images: ContentImage[] = [];
	let cover: ContentImage | null = null;
	rawImages.forEach((item, i) => {
		const image = parseImage(item, `${path} images[${i}]`, warn);
		if (!image) return;
		if (images.some((other) => other.key === image.key)) {
			throw new ContentError(path, `images에 같은 파일 이름(${image.key})이 두 번 있음`);
		}
		images.push(image);
		if (!cover && isRecord(item) && text(item.use)?.startsWith(COVER_USE)) cover = image;
	});
	const byKey = new Map(images.map((image) => [image.key, image]));
	const parsed = parseBody(path, body, byKey, cover, logo?.key ?? null, warn);

	return {
		slug,
		title,
		summary: text(data.summary),
		period: { start: text(period.start), end: text(period.end), note: text(period.note) },
		team: { size: num(team.size), type: text(team.type), note: text(team.note) },
		role: text(data.role),
		stack: textList(data.stack),
		highlights: textList(data.highlights),
		links: parseLinks(data.links),
		order,
		featured,
		// island 값이 있으면 수동 배치, 없으면 §1.3 규칙으로 계산
		island: parseIsland(data.island) ?? projectIslandPlacement(order, featured),
		landmark: parseLandmark(data.island, path, warn),
		// unverified와 이미지의 source, use는 화면에 쓰지 않으므로 옮기지 않는다.
		logo,
		cover,
		body: parsed.body,
		more: parsed.more,
		extraImages: images.filter((image) => image !== cover && !parsed.used.has(image.key))
	};
}

let cache: Project[] | null = null;

/**
 * 모든 프로젝트를 order 순서로 돌려준다.
 * 화면에 띄우는 섬이 일부여도 모든 파일을 읽으므로, 형식 오류는 빌드에서 바로 드러난다.
 */
export function loadProjects(): Project[] {
	if (cache) return cache;
	const warn: Warn = (msg) => console.warn(`[content] ${msg}`);
	const projects = Object.entries(files)
		.map(([path, source]) => parseProject(path, source, warn))
		.filter((p): p is Project => p !== null)
		.sort((a, b) => a.order - b.order);

	const seen = new Map<number, string>();
	for (const p of projects) {
		const other = seen.get(p.order);
		if (other) warn(`order ${p.order} 중복: ${other}, ${p.slug}`);
		seen.set(p.order, p.slug);
	}
	cache = projects;
	return projects;
}
