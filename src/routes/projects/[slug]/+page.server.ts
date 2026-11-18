import { error } from '@sveltejs/kit';
import { loadProjects } from '#lib/content/projects.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// 프로젝트 개별 페이지. 빌드 때 모든 프로젝트의 페이지를 만든다.
export const entries: EntryGenerator = () => loadProjects().map((p) => ({ slug: p.slug }));

export const load: PageServerLoad = ({ params }) => {
	const projects = loadProjects();
	const i = projects.findIndex((p) => p.slug === params.slug);
	if (i < 0) error(404);
	const brief = (p: (typeof projects)[number] | undefined) =>
		p ? { slug: p.slug, title: p.title } : null;
	return { project: projects[i], prev: brief(projects[i - 1]), next: brief(projects[i + 1]) };
};
