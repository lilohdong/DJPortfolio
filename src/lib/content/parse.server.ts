import { parse as parseYaml } from 'yaml';
import type { ContentImage } from './types';

// 콘텐츠 파일(content/*.md)을 읽는 로더들이 함께 쓰는 도구.

/** 콘텐츠 파일에서 "아직 모름"을 뜻하는 값. 화면에서는 없는 값으로 취급한다. */
export const UNKNOWN = '확인 필요';

/** 가져오기 스크립트(npm run images:import)가 변환해 static/content/에 둔 이미지만 화면에 쓴다. */
const CONVERTED_SRC = /^content\/\S+\.(webp|png|jpe?g|gif|avif)$/;

export type Raw = Record<string, unknown>;
export type Warn = (msg: string) => void;

/** 콘텐츠 형식이 잘못돼 빌드를 멈춰야 하는 오류 */
export class ContentError extends Error {
	constructor(path: string, message: string) {
		super(`[content] ${path}: ${message}`);
		this.name = 'ContentError';
	}
}

export function isRecord(value: unknown): value is Raw {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** 문자열이고 "확인 필요"가 아니면 그 값, 아니면 null */
export function text(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed === '' || trimmed === UNKNOWN ? null : trimmed;
}

export function num(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function textList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.map(text).filter((v): v is string => v !== null);
}

export function splitFrontmatter(source: string): { data: Raw; body: string } {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
	if (!match) return { data: {}, body: source };
	const data = parseYaml(match[1]) as unknown;
	return { data: isRecord(data) ? data : {}, body: match[2] };
}

/** "content/projects/calddy/calddy-diary.webp" → "calddy-diary" */
export function imageKey(src: string): string {
	return src
		.split('/')
		.pop()!
		.replace(/\.[^.]+$/, '');
}

/**
 * 이미지 항목 하나. 아직 변환하지 않은 항목(원본 경로, PDF, "확인 필요")은 null.
 * 원본 위치(source)와 용도 메모(use)는 화면으로 넘기지 않는다.
 */
export function parseImage(value: unknown, where: string, warn: Warn): ContentImage | null {
	if (!isRecord(value)) return null;
	const src = text(value.src);
	const width = num(value.width);
	const height = num(value.height);
	if (!src || !CONVERTED_SRC.test(src) || width === null || height === null) {
		if (src && /\.(png|jpe?g|webp|gif)$/i.test(src)) {
			warn(
				`${where}: 변환하지 않은 이미지라 화면에 쓰지 않음 (${src}). npm run images:import 필요`
			);
		}
		return null;
	}
	const alt = text(value.alt);
	if (!alt) warn(`${where}: alt(대체 글)가 없음 (${src})`);
	return { key: imageKey(src), src, alt: alt ?? '', caption: text(value.caption), width, height };
}
