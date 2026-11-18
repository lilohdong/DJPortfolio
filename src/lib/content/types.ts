// 콘텐츠 파일(content/projects/*.md)을 화면에서 쓰기 좋게 정리한 형태.
// "확인 필요" 값은 로더에서 null로 바꾸므로, 화면은 null이면 그리지 않으면 된다.

export interface IslandPlacement {
	x: number;
	z: number;
	/** 섬 반지름 (세계 단위) */
	size: number;
}

export interface ProjectLink {
	type: string;
	label: string;
	/** null이면 공개하지 않는 링크. 글자로만 보여 준다. */
	url: string | null;
}

export interface Project {
	slug: string;
	title: string;
	summary: string | null;
	period: { start: string | null; end: string | null; note: string | null };
	team: { size: number | null; type: string | null; note: string | null };
	role: string | null;
	stack: string[];
	highlights: string[];
	links: ProjectLink[];
	order: number;
	featured: boolean;
	island: IslandPlacement;
	/** 본문을 빈 줄 기준으로 나눈 문단 목록 (일반 글자로 표시) */
	paragraphs: string[];
}
