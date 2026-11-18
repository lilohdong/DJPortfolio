import { loadProjects } from '#lib/content/projects.server.ts';
import type { PageServerLoad } from './$types';

// T-006 항해 프로토타입은 프로젝트 섬 하나(calddy)만 띄운다.
// 이 목록을 지우면 content/projects/*.md 전부가 섬이 된다.
const PROTOTYPE_PROJECTS: readonly string[] = ['calddy'];

export const load: PageServerLoad = () => {
	const projects = loadProjects().filter((p) => PROTOTYPE_PROJECTS.includes(p.slug));
	return { projects };
};
