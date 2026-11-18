import { loadProfile } from '#lib/content/profile.server.ts';
import type { LayoutServerLoad } from './$types';

// 프로필은 제목 화면, 등대섬 패널, 목록 페이지가 함께 쓴다.
export const load: LayoutServerLoad = () => ({ profile: loadProfile() });
