import { parse as parseYaml } from 'yaml';
import { projectIslandPlacement } from './layout';
import type { IslandPlacement, Project, ProjectLink } from './types';

// content/projects/*.md 를 빌드(사전 렌더링) 시점에 읽는다.
// 파일 하나 = 프로젝트 하나 = 섬 하나. 파일을 추가하면 목록에 자동으로 들어온다.
// 서버 전용 모듈(.server.ts)이라 YAML 파서는 브라우저 번들에 들어가지 않는다.
const files = import.meta.glob('/content/projects/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

/** 콘텐츠 파일에서 "아직 모름"을 뜻하는 값. 화면에서는 없는 값으로 취급한다. */
const UNKNOWN = '확인 필요';

const SLUG_PATTERN = /^[a-z0-9-]+$/;

type Raw = Record<string, unknown>;

function isRecord(value: unknown): value is Raw {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** 문자열이고 "확인 필요"가 아니면 그 값, 아니면 null */
function text(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed === '' || trimmed === UNKNOWN ? null : trimmed;
}

function num(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function textList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.map(text).filter((v): v is string => v !== null);
}

function splitFrontmatter(source: string): { data: Raw; body: string } {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
	if (!match) return { data: {}, body: source };
	const data = parseYaml(match[1]) as unknown;
	return { data: isRecord(data) ? data : {}, body: match[2] };
}

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

function parseProject(path: string, source: string, warn: (msg: string) => void): Project | null {
	const slug = path.split('/').pop()!.replace(/\.md$/, '');
	if (!SLUG_PATTERN.test(slug)) {
		warn(`${path}: slug 형식이 아님 (영문 소문자·숫자·-)`);
		return null;
	}
	const { data, body } = splitFrontmatter(source);

	const title = text(data.title);
	const order = num(data.order);
	if (!title || order === null) {
		warn(`${path}: 필수 필드(title, order) 누락 — 건너뜀`);
		return null;
	}
	const featured = data.featured === true;
	const period = isRecord(data.period) ? data.period : {};
	const team = isRecord(data.team) ? data.team : {};

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
		// unverified, images는 화면에 쓰지 않으므로 옮기지 않는다.
		paragraphs: body
			.split(/\r?\n\s*\r?\n/)
			.map((p) => p.replace(/\s*\r?\n\s*/g, ' ').trim())
			.filter((p) => p !== '')
	};
}

let cache: Project[] | null = null;

/** 모든 프로젝트를 order 순서로 돌려준다. */
export function loadProjects(): Project[] {
	if (cache) return cache;
	const warn = (msg: string) => console.warn(`[content] ${msg}`);
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
