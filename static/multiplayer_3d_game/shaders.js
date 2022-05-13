// we all love shaders eh?

const vsSource = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	vColor = aVertexColor;
}
`;
const fsSource = `
varying lowp vec4 vColor;

void main() {
	gl_FragColor = vColor;
}
`
const billboardVS = `
attribute vec4 aBillboardPos;

uniform mat4 uProjectionMatrix;
uniform mat4 ubModelViewMatrix;

varying lowp vec4 vColor;

void main() {
	gl_Position = uProjectionMatrix * ubModelViewMatrix * aBillboardPos;
	vColor = vec4(1.0, clamp(aBillboardPos.y * 10.0, 0.0, 1.0), 1.0, 1.0);
}
`
const textureVS = `
attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPos;

varying highp vec2 texCoord;
varying mediump float fogAmount;
varying highp vec3 vLighting;

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	texCoord = aTexCoord;/*
	if (uCameraPos.y < 0.0) {
		fogAmount = -(uModelViewMatrix * aVertexPosition).z * 0.08;
	} else {
		fogAmount = -(uModelViewMatrix * aVertexPosition).z * 0.05 - 1.0;
	}*/
	fogAmount = -(uModelViewMatrix * aVertexPosition).z * 0.05 - 1.0;
	vLighting = vec3(1.0, 1.0, 1.0);
}
`
const lightVS = `
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uCameraPos;
uniform mat3 uLightingInfo; // 1st row is light direction, 2nd is color, 3rd is ambient light

varying highp vec2 texCoord;
varying mediump float fogAmount;
varying highp vec3 vLighting;

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	texCoord = aTexCoord;/*
	if (uCameraPos.y < 0.0) {
		fogAmount = -(uModelViewMatrix * aVertexPosition).z * 0.08;
	} else {
		fogAmount = -(uModelViewMatrix * aVertexPosition).z * 0.05 - 1.0;
	}*/
	fogAmount = -(uModelViewMatrix * aVertexPosition).z * 0.05 - 1.0;
	highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
	highp float directional = max(dot(transformedNormal.xyz, uLightingInfo[0]), 0.0);
	vLighting = uLightingInfo[2] + (uLightingInfo[1] * directional * 0.65);
}
`
const textureFS = `
precision mediump float;
varying highp vec2 texCoord;
varying highp vec3 vLighting;
uniform sampler2D uSampler;
uniform vec4 uFogColor;
varying mediump float fogAmount;

void main() {
	lowp vec4 col = texture2D(uSampler, texCoord);
	col = vec4(col.rgb * vLighting, col.a);
	col = mix(col, vec4(0.529, 0.808, 0.921, 1.0), clamp(fogAmount, 0.0, 1.0)); // use uFogColor later when water physics actually make sense
	if (col.a == 0.0) {
		discard;
	} else {
		gl_FragColor = col;
	}
}
`
// 0.529, 0.808, 0.921, 1.0
const textureBillboardVS = `
attribute vec4 aBillboardPos;
attribute vec2 abTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 ubModelViewMatrix;

varying highp vec2 texCoord;
varying mediump float fogAmount;
varying lowp vec4 fogColor;
varying highp vec3 vLighting;

void main() {
	gl_Position = uProjectionMatrix * ubModelViewMatrix * aBillboardPos;
	texCoord = abTexCoord;
	fogAmount = 0.0;
	fogColor = vec4(0.0, 0.0, 0.0, 0.0);
	vLighting = vec3(1.0, 1.0, 1.0);
}
`;

const particleVS = `
// attribute float aParticleLifetime;
attribute vec3 aParticleCenterOffset;
attribute vec2 aParticleCorner;
attribute vec2 aParticleTexCoords;

uniform vec3 uParticleEmitter;
// uniform float uParticleSize;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraRight;

varying highp vec2 texCoord;
varying mediump float fogAmount;
varying highp vec3 vLighting;

void main() {
	vec4 position = vec4(
		uParticleEmitter + aParticleCenterOffset, 1.0
	);

	vec3 rightVec = uCameraRight;
	vec3 upVec = vec3(uModelViewMatrix[0].y, uModelViewMatrix[1].y, uModelViewMatrix[2].y);
	position.xyz += (rightVec * aParticleCorner.x) + 
					(upVec * aParticleCorner.y);
	gl_Position = uProjectionMatrix * uModelViewMatrix * position;
	texCoord = aParticleTexCoords;
	vLighting = vec3(1.0, 1.0, 1.0);
}
`;//uModelViewMatrix[0].y, uModelViewMatrix[1].y, uModelViewMatrix[2].y
const textVS = `
attribute vec4 aVertexPosition;
attribute vec2 aTexCoord;
attribute vec4 aTextColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPos;

varying highp vec2 texCoord;
varying mediump float fogAmount;
varying lowp vec4 vColor;

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	texCoord = aTexCoord;
	vColor = aTextColor;
	if (uCameraPos.y < 0.0) {
		fogAmount = -(uModelViewMatrix * aVertexPosition).z * 0.08;
	} else {
		fogAmount = -(uModelViewMatrix * aVertexPosition).z * 0.05 - 1.0;
	}
}
`;
const textFS = `
precision mediump float;
varying highp vec2 texCoord;
uniform sampler2D uSampler;
uniform vec4 uFogColor;
varying mediump float fogAmount;
varying lowp vec4 vColor;

void main() {
	lowp vec4 texel = texture2D(uSampler, texCoord);
	if (texel.a == 0.0) {
		discard;
	} else {
		lowp vec4 col = vec4(vColor.rgb, mix(vColor.a, texel.a, 0.5));
		gl_FragColor = mix(col, uFogColor, clamp(fogAmount, 0.0, 1.0));
	}
}
`;