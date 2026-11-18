<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import {
		DepthTexture,
		Fog,
		HalfFloatType,
		NearestFilter,
		PerspectiveCamera,
		ShaderMaterial,
		Vector2,
		WebGLRenderTarget,
		type WebGLRenderer
	} from 'three';
	import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
	import { onDestroy } from 'svelte';
	import { SEA_MAX_FOG, SKY_DEPTH } from '../sailing/render-style';

	// 픽셀 렌더: 장면을 저해상도 타깃에 그린 뒤, 보간 없이(Nearest) 화면 크기로 늘린다.
	// 늘리는 셰이더에서 톤 매핑·sRGB 변환 → 색 단계 제한 → 깊이 외곽선을 적용한다.
	// Canvas의 autoRender를 끈 상태에서만 쓴다(SeaCanvas가 처리).
	let { pixelSize }: { pixelSize: number } = $props();

	const { renderer, scene, camera, size, renderStage } = useThrelte();
	const gl = renderer as WebGLRenderer;

	const target = new WebGLRenderTarget(1, 1, {
		type: HalfFloatType,
		minFilter: NearestFilter,
		magFilter: NearestFilter,
		generateMipmaps: false,
		depthTexture: new DepthTexture(1, 1)
	});

	const material = new ShaderMaterial({
		uniforms: {
			tColor: { value: target.texture },
			tDepth: { value: target.depthTexture },
			lowRes: { value: new Vector2(1, 1) },
			cameraNear: { value: 0.5 },
			cameraFar: { value: 1600 },
			fogNear: { value: 1e5 },
			seaMaxFog: { value: SEA_MAX_FOG },
			skyDepth: { value: SKY_DEPTH },
			fogFar: { value: 2e5 },
			/** 밝기 단계 수. 디더링은 수면·경계에서 체크 무늬가 지저분해 쓰지 않는다. */
			levels: { value: 9 },
			/** 외곽선 어둡게 하는 정도 */
			outline: { value: 0.45 }
		},
		vertexShader: /* glsl */ `
			varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: /* glsl */ `
			uniform sampler2D tColor;
			uniform sampler2D tDepth;
			uniform vec2 lowRes;
			uniform float cameraNear;
			uniform float cameraFar;
			uniform float fogNear;
			uniform float fogFar;
			uniform float seaMaxFog;
			uniform float skyDepth;
			uniform float levels;
			uniform float outline;
			varying vec2 vUv;

			float linearDepth(vec2 uv) {
				float z = texture2D(tDepth, uv).r;
				return cameraNear * cameraFar / (cameraFar - z * (cameraFar - cameraNear));
			}

			void main() {
				vec2 texel = 1.0 / lowRes;
				// 저해상도 픽셀의 중심을 읽어 경계에서 이웃 값이 섞이지 않게 한다.
				vec2 cell = floor(vUv * lowRes);
				vec2 uv = (cell + 0.5) * texel;

				float d = linearDepth(uv);

				// 기본 렌더에서는 안개와 하늘(toneMapped=false)이 톤 매핑 뒤에 섞인다.
				// 저해상도 타깃에는 톤 매핑 전 값이 들어 있으므로, 안개 비율만큼 톤 매핑을 빼서 같은 색을 낸다.
				// (하늘은 깊이를 쓰지 않아 d = far → 안개 비율 1 → 톤 매핑 안 함)
				vec3 lit = texture2D(tColor, uv).rgb;
				vec3 mapped = lit;
				#if defined( TONE_MAPPING )
					mapped = toneMapping(lit);
				#endif
				// 수면은 안개 상한(seaMaxFog)까지만 받으므로 같은 비율로 맞춘다. 하늘·해(skyDepth 너머)는 톤 매핑 없이.
				float fogFactor = d > skyDepth ? 1.0 : min(smoothstep(fogNear, fogFar, d), seaMaxFog);
				gl_FragColor = linearToOutputTexel(vec4(mix(mapped, lit, fogFactor), 1.0));

				// 색 단계 제한 (sRGB 공간에서)
				// 채널마다 따로 자르면 어두운 곳(노을·밤)에서 색상이 틀어지므로,
				// 밝기만 levels 단계로 자르고(어두운 쪽에 단계가 더 가도록 제곱근 기준) 색상 비율은 유지한다.
				// 그 뒤 채널을 32단계로 묶어 팔레트처럼 색 수를 줄인다.
				vec3 color = gl_FragColor.rgb;
				float steps = levels - 1.0;
				float luma = max(dot(color, vec3(0.299, 0.587, 0.114)), 1e-4);
				float q = floor(sqrt(luma) * steps + 0.5) / steps;
				color *= (q * q) / luma;
				color = floor(clamp(color, 0.0, 1.0) * 31.0 + 0.5) / 31.0;

				// 깊이 외곽선: 이웃이 훨씬 멀면(물체 가장자리) 어둡게. 먼 곳은 안개 속이라 끈다.
				float far = max(
					max(linearDepth(uv + vec2(texel.x, 0.0)), linearDepth(uv - vec2(texel.x, 0.0))),
					max(linearDepth(uv + vec2(0.0, texel.y)), linearDepth(uv - vec2(0.0, texel.y)))
				);
				float edge = step(max(0.8, d * 0.15), far - d) * (1.0 - smoothstep(55.0, 110.0, d));
				color *= 1.0 - edge * outline;

				gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
			}
		`,
		depthTest: false,
		depthWrite: false
	});

	const quad = new FullScreenQuad(material);

	$effect(() => {
		const { width, height } = size.current;
		const w = Math.max(1, Math.round(width / pixelSize));
		const h = Math.max(1, Math.round(height / pixelSize));
		target.setSize(w, h);
		material.uniforms.lowRes.value.set(w, h);
	});

	useTask(
		() => {
			const cam = camera.current;
			if (cam instanceof PerspectiveCamera) {
				material.uniforms.cameraNear.value = cam.near;
				material.uniforms.cameraFar.value = cam.far;
			}
			if (scene.fog instanceof Fog) {
				material.uniforms.fogNear.value = scene.fog.near;
				material.uniforms.fogFar.value = scene.fog.far;
			}
			gl.setRenderTarget(target);
			gl.render(scene, cam);
			gl.setRenderTarget(null);
			quad.render(gl);
		},
		{ stage: renderStage, autoInvalidate: false }
	);

	onDestroy(() => {
		target.depthTexture?.dispose();
		target.dispose();
		material.dispose();
		quad.dispose();
	});
</script>
