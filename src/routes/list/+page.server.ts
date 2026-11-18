import { loadProjects } from '#lib/content/projects.server.ts';
import type { PageServerLoad } from './$types';

// 목록 페이지는 항해 화면에 떠 있는 섬과 상관없이 모든 프로젝트를 보여 준다.
export const load: PageServerLoad = () => ({ projects: loadProjects() });
