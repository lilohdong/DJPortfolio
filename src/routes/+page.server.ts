import { loadProjects } from '#lib/content/projects.server.ts';
import type { PageServerLoad } from './$types';

// content/projects/*.md 하나가 섬 하나가 된다.
export const load: PageServerLoad = () => {
	return { projects: loadProjects() };
};
