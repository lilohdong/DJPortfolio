import { Color, DataTexture, MeshBasicMaterial, Vector2, type Mesh, type Texture } from 'three';

// 깃발 천을 픽셀 렌더의 4px 덩어리보다 촘촘하게(화면 해상도로) 그리는 장치.
//
// 1) 장면 전체는 지금처럼 저해상도로 그린다. 깃발 천도 여기에 들어가 깊이와 외곽선을 남긴다.
// 2) 저해상도 화면을 늘려 그린 뒤, 깃발 천만(SHARP_LAYER) 화면 해상도로 한 번 더 그린다.
//    이때 천의 각 픽셀은 저해상도 깊이와 비교해, 더 가까운 물체(나무, 섬, 배)가 있으면 버린다.
//    그래서 가려지는 모양은 장면과 같은 4px 단위가 되고, 깃발 그림만 선명해진다.
// 3) 색 단계 제한도 PixelRender와 같은 식으로 적용해 주변과 색이 따로 놀지 않게 한다.

/** 화면 해상도로 다시 그릴 물체의 레이어 */
export const SHARP_LAYER = 1;

/** 다시 그릴 깃발 천 목록. 화면 안에 하나도 없으면 다시 그리기 패스를 건너뛴다 */
export const sharpMeshes = new Set<Mesh>();
/** PixelRender의 밝기 단계 수. 두 곳이 같은 값을 쓴다 */
export const POSTERIZE_LEVELS = 9;

/**
 * 저해상도 패스에서 깊이 텍스처를 그대로 묶어 두면 그 텍스처에 그리는 중에 읽게 되어(feedback loop)
 * WebGL 오류가 난다. 다시 그리기 패스가 아닐 때는 이 1×1 자리 표시 텍스처를 묶는다.
 */
export const placeholderDepth = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
placeholderDepth.needsUpdate = true;

export const sharpUniforms = {
	tSceneDepth: { value: placeholderDepth as Texture },
	uSharp: { value: 0 },
	uResolution: { value: new Vector2(1, 1) },
	uNear: { value: 0.5 },
	uFar: { value: 1600 }
};

/** 깃발 천 재질. 조명을 받지 않고 밝기(brightness)로 낮·밤을 맞춘다 */
export function makeClothMaterial(map: Texture): MeshBasicMaterial {
	const material = new MeshBasicMaterial({ map, color: new Color(1, 1, 1) });
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, sharpUniforms);
		shader.fragmentShader = shader.fragmentShader
			.replace(
				'void main() {',
				/* glsl */ `
				uniform sampler2D tSceneDepth;
				uniform float uSharp;
				uniform vec2 uResolution;
				uniform float uNear;
				uniform float uFar;
				float sharpLinearDepth(float z) {
					return uNear * uFar / (uFar - z * (uFar - uNear));
				}
				void main() {
					if (uSharp > 0.5) {
						float scene = sharpLinearDepth(texture2D(tSceneDepth, gl_FragCoord.xy / uResolution).r);
						float own = sharpLinearDepth(gl_FragCoord.z);
						// 저해상도 깊이가 이 천보다 확실히 가까우면 다른 물체가 가린 자리다
						if (own > scene + max(0.5, own * 0.02)) discard;
					}
				`
			)
			.replace(
				'#include <fog_fragment>',
				/* glsl */ `
				#include <fog_fragment>
				if (uSharp > 0.5) {
					// PixelRender와 같은 색 단계 제한 (밝기만 자르고 색상 비율 유지, 채널 32단계)
					vec3 c = gl_FragColor.rgb;
					float steps = ${(POSTERIZE_LEVELS - 1).toFixed(1)};
					float luma = max(dot(c, vec3(0.299, 0.587, 0.114)), 1e-4);
					float q = floor(sqrt(luma) * steps + 0.5) / steps;
					c *= (q * q) / luma;
					gl_FragColor.rgb = floor(clamp(c, 0.0, 1.0) * 31.0 + 0.5) / 31.0;
				}
				`
			);
	};
	return material;
}
