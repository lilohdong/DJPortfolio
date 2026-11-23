import profileSource from '/content/profile.md?raw';
import {
	isRecord,
	parseImage,
	splitFrontmatter,
	text,
	textList,
	ContentError,
	type Warn
} from './parse.server';
import { loadProjects } from './projects.server';
import type { IntroPoint, Profile, ProjectLink } from './types';

// content/profile.md 를 빌드(사전 렌더링) 시점에 읽는다.
// "확인 필요" 값은 null이나 빈 목록으로 바꾸고, unverified(확인 필요 메모)는 넘기지 않는다.

const PATH = '/content/profile.md';

function records(value: unknown): Record<string, unknown>[] {
	return Array.isArray(value) ? value.filter(isRecord) : [];
}

function parseContactLinks(value: unknown): ProjectLink[] {
	const links: ProjectLink[] = [];
	for (const item of records(value)) {
		const label = text(item.label);
		const url = text(item.url);
		if (label && url && /^https?:\/\//.test(url))
			links.push({ type: text(item.type) ?? 'doc', label, url });
	}
	return links;
}

// intro_points 항목은 { title, body } 객체이거나 문자열(소제목 없는 요점)이다.
function parseIntroPoints(value: unknown, warn: Warn): IntroPoint[] {
	if (!Array.isArray(value)) return [];
	const points: IntroPoint[] = [];
	for (const item of value) {
		if (isRecord(item)) {
			const body = text(item.body);
			if (body) points.push({ title: text(item.title), body });
			else warn(`${PATH}: intro_points 항목 "${text(item.title) ?? ''}"에 body 없음`);
		} else {
			const body = text(item);
			if (body) points.push({ title: null, body });
		}
	}
	return points;
}

let cache: Profile | null = null;

export function loadProfile(): Profile {
	if (cache) return cache;
	const warn: Warn = (msg) => console.warn(`[content] ${msg}`);
	const { data } = splitFrontmatter(profileSource);

	const name = text(data.name);
	if (!name) throw new ContentError(PATH, '필수 필드 name 누락');

	// 기술과 활동이 가리키는 프로젝트는 실제로 있는 slug만 남긴다.
	const slugs = new Set(loadProjects().map((p) => p.slug));
	const knownSlug = (slug: string, where: string) => {
		if (slugs.has(slug)) return true;
		warn(`${PATH}: ${where}의 프로젝트 "${slug}"가 content/projects에 없음`);
		return false;
	};

	const contact = isRecord(data.contact) ? data.contact : {};
	const github = text(contact.github);

	cache = {
		name,
		nameEn: text(data.name_en),
		headline: text(data.headline),
		photo: parseImage(data.photo, `${PATH} photo`, warn),
		status: text(data.status),
		location: text(data.location),
		intro: (text(data.intro) ?? '')
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line !== ''),
		introPoints: parseIntroPoints(data.intro_points, warn),
		skills: records(data.skills)
			.map((group) => ({
				group: text(group.group) ?? '',
				items: records(group.items)
					.map((item) => ({
						name: text(item.name) ?? '',
						projects: textList(item.projects).filter((slug) =>
							knownSlug(slug, `skills ${text(item.name)}`)
						)
					}))
					.filter((item) => item.name !== '')
			}))
			.filter((group) => group.group !== '' && group.items.length > 0),
		education: records(data.education)
			.map((item) => ({
				school: text(item.school) ?? '',
				major: text(item.major),
				degree: text(item.degree),
				graduation: text(item.graduation),
				status: text(item.status)
			}))
			.filter((item) => item.school !== ''),
		activities: records(data.activities)
			.map((item) => {
				const project = text(item.project);
				return {
					title: text(item.title) ?? '',
					detail: text(item.detail),
					date: text(item.date),
					project: project && knownSlug(project, `activities ${text(item.title)}`) ? project : null
				};
			})
			.filter((item) => item.title !== ''),
		certifications: textList(data.certifications),
		contact: {
			email: text(contact.email),
			github: github && /^https?:\/\//.test(github) ? github : null,
			links: parseContactLinks(contact.links)
		}
	};
	return cache;
}
