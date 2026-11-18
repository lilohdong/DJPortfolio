import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// 하위 경로 배포(예: GitHub Pages 프로젝트 페이지)용. 루트 배포(Vercel 등)에서는 비워 둔다.
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			paths: { base },
			prerender: {
				// "/#project-<slug>"는 요소 id가 아니라 항해 화면이 스크립트로 읽는 주소다
				// (그 섬에 정박한 상태로 시작). 이런 주소만 빠진 id 검사에서 뺀다.
				handleMissingId: ({ id, message }) => {
					if (!id.startsWith('project-')) throw new Error(message);
				}
			}
		})
	]
});
