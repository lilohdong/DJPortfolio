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

/** 화면에 쓰는 이미지 한 장. 원본 위치(source)와 용도 메모(use)는 넘기지 않는다. */
export interface ContentImage {
	/** 본문 표기 ![](키)의 키. src 파일 이름에서 확장자를 뺀 것 */
	key: string;
	/** static/ 기준 경로. 화면에서는 asset(src)로 감싼다 */
	src: string;
	alt: string;
	caption: string | null;
	width: number;
	height: number;
}

/** 본문 한 덩어리: 글 문단 또는 사진 */
export type BodyBlock = { type: 'text'; text: string } | { type: 'image'; image: ContentImage };

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
	/** 로고. 패널 머리, 지도, 3D 깃발에 쓴다 */
	logo: ContentImage | null;
	/** 대표 이미지(use: "대표 이미지"). 본문에 적혀 있어도 본문에서는 빼고 여기에만 둔다 */
	cover: ContentImage | null;
	/** 본문 중 처음부터 보이는 부분 (<!-- more --> 앞) */
	body: BodyBlock[];
	/** 접힌 부분 (<!-- more --> 뒤). 표기가 없으면 빈 배열 */
	more: BodyBlock[];
	/** 대표 이미지도 아니고 본문에도 쓰지 않은 나머지 사진 ("사진 더 보기") */
	extraImages: ContentImage[];
}

// content/profile.md (등대섬 패널, 제목 화면, 목록 페이지 머리)

export interface SkillItem {
	name: string;
	/** 이 기술을 쓴 프로젝트 slug. 로더가 실제로 있는 프로젝트만 남긴다 */
	projects: string[];
}

export interface Profile {
	name: string;
	nameEn: string | null;
	headline: string | null;
	photo: ContentImage | null;
	status: string | null;
	location: string | null;
	/** 소개 문장. 줄바꿈 단위로 나눈 목록 */
	intro: string[];
	introPoints: string[];
	skills: { group: string; items: SkillItem[] }[];
	education: {
		school: string;
		major: string | null;
		degree: string | null;
		graduation: string | null;
		status: string | null;
	}[];
	activities: {
		title: string;
		detail: string | null;
		date: string | null;
		project: string | null;
	}[];
	certifications: string[];
	contact: { email: string | null; github: string | null; links: ProjectLink[] };
}
