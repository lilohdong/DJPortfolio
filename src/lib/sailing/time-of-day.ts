// 대한민국 표준시(KST, UTC+9) 시각에 따라 하늘·조명 색을 정한다.
// 새벽·낮·노을·밤 기준점 사이를 부드럽게 보간한다.

/** 현재 KST 시각을 0 이상 24 미만의 소수 시간으로 */
export function kstHour(now: Date = new Date()): number {
	const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
	return (utcHours + 9) % 24;
}

/** `?t=18.5` 같은 검수용 시각 고정 값. 올바르지 않으면 null */
export function parseHourOverride(search: string): number | null {
	const raw = new URLSearchParams(search).get('t');
	if (raw === null || raw.trim() === '') return null;
	const value = Number(raw);
	if (!Number.isFinite(value) || value < 0 || value > 24) return null;
	return value % 24;
}

export type RGB = [number, number, number];

/** [0~1, 0~1, 0~1] sRGB → '#rrggbb' */
export function toHex(rgb: RGB): string {
	return (
		'#' +
		rgb
			.map((c) =>
				Math.round(Math.min(1, Math.max(0, c)) * 255)
					.toString(16)
					.padStart(2, '0')
			)
			.join('')
	);
}

export interface Palette {
	skyTop: RGB;
	skyHorizon: RGB;
	/** 안개 = 수평선 색과 맞춘다 */
	fog: RGB;
	water: RGB;
	sunColor: RGB;
	sunIntensity: number;
	ambientColor: RGB;
	ambientIntensity: number;
	/** 해(또는 달) 고도, 라디안. 음수면 수평선 아래 */
	sunElevation: number;
	/** 0(낮) ~ 1(밤). 등대 불빛, 별 */
	night: number;
}

const hex = (value: string): RGB => {
	const n = parseInt(value.slice(1), 16);
	return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

interface Key extends Omit<Palette, 'fog'> {
	hour: number;
}

const deg = Math.PI / 180;

// 기준점 (시각 오름차순). 0시와 24시는 같은 밤.
const night: Omit<Key, 'hour'> = {
	skyTop: hex('#0b1530'),
	skyHorizon: hex('#1e2d52'),
	water: hex('#13284a'),
	sunColor: hex('#9fb4e6'),
	sunIntensity: 0.45,
	ambientColor: hex('#4a5d8f'),
	ambientIntensity: 0.55,
	sunElevation: 40 * deg,
	night: 1
};

const KEYS: Key[] = [
	{ hour: 0, ...night },
	{ hour: 4.5, ...night },
	{
		// 새벽
		hour: 6,
		skyTop: hex('#4a5f9c'),
		skyHorizon: hex('#f2a98a'),
		water: hex('#5a7fa6'),
		sunColor: hex('#ffb489'),
		sunIntensity: 1.2,
		ambientColor: hex('#b3a5c4'),
		ambientIntensity: 1.1,
		sunElevation: 6 * deg,
		night: 0.25
	},
	{
		// 낮
		hour: 9,
		skyTop: hex('#3f8fd8'),
		skyHorizon: hex('#bfe3f5'),
		water: hex('#2a86b8'),
		sunColor: hex('#fff3dc'),
		sunIntensity: 2.4,
		ambientColor: hex('#cfe6f5'),
		ambientIntensity: 1.0,
		sunElevation: 50 * deg,
		night: 0
	},
	{
		hour: 16,
		skyTop: hex('#4a92d6'),
		skyHorizon: hex('#cde6f2'),
		water: hex('#2f84b0'),
		sunColor: hex('#fff0d2'),
		sunIntensity: 2.2,
		ambientColor: hex('#cfe2ee'),
		ambientIntensity: 0.95,
		sunElevation: 35 * deg,
		night: 0
	},
	{
		// 노을
		hour: 18.5,
		skyTop: hex('#5a5aa0'),
		skyHorizon: hex('#ff9a5c'),
		water: hex('#5f6f9a'),
		sunColor: hex('#ff8a4c'),
		sunIntensity: 1.7,
		ambientColor: hex('#d9a196'),
		ambientIntensity: 1.15,
		sunElevation: 5 * deg,
		night: 0.2
	},
	{
		// 해 진 직후
		hour: 20,
		skyTop: hex('#1f2350'),
		skyHorizon: hex('#6b4a7a'),
		water: hex('#1f3558'),
		sunColor: hex('#a9a6d8'),
		sunIntensity: 0.6,
		ambientColor: hex('#5b5a8f'),
		ambientIntensity: 0.6,
		sunElevation: 20 * deg,
		night: 0.8
	},
	{ hour: 21.5, ...night },
	{ hour: 24, ...night }
];

const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixRGB = (a: RGB, b: RGB, t: number): RGB => [
	mix(a[0], b[0], t),
	mix(a[1], b[1], t),
	mix(a[2], b[2], t)
];

export function paletteAt(hour: number): Palette {
	const h = ((hour % 24) + 24) % 24;
	let i = 0;
	while (i < KEYS.length - 2 && KEYS[i + 1].hour <= h) i++;
	const a = KEYS[i];
	const b = KEYS[i + 1];
	const t = smooth(b.hour === a.hour ? 0 : (h - a.hour) / (b.hour - a.hour));
	const skyHorizon = mixRGB(a.skyHorizon, b.skyHorizon, t);
	return {
		skyTop: mixRGB(a.skyTop, b.skyTop, t),
		skyHorizon,
		fog: skyHorizon,
		water: mixRGB(a.water, b.water, t),
		sunColor: mixRGB(a.sunColor, b.sunColor, t),
		sunIntensity: mix(a.sunIntensity, b.sunIntensity, t),
		ambientColor: mixRGB(a.ambientColor, b.ambientColor, t),
		ambientIntensity: mix(a.ambientIntensity, b.ambientIntensity, t),
		sunElevation: mix(a.sunElevation, b.sunElevation, t),
		night: mix(a.night, b.night, t)
	};
}

/**
 * 해(밤에는 달)의 방위각. 아침엔 동쪽(+x), 저녁엔 서쪽(−x)에서 비춘다.
 * 장면에서 빛 방향을 정할 때 쓴다.
 */
export function sunAzimuth(hour: number): number {
	const h = ((hour % 24) + 24) % 24;
	// 6시 → 0(동), 12시 → π/2(남), 18시 → π(서)
	return ((h - 6) / 12) * Math.PI;
}
