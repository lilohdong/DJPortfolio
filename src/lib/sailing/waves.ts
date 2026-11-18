// 잔잔한 파도 높이. 수면 메시와 배의 흔들림이 같은 함수를 쓴다.
export function waveHeight(x: number, z: number, t: number): number {
	return (
		Math.sin(x * 0.18 + t * 0.9) * 0.22 +
		Math.cos(z * 0.21 + t * 0.7) * 0.18 +
		Math.sin((x + z) * 0.09 + t * 0.5) * 0.12
	);
}
