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

varying highp vec2 texCoord;

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	texCoord = aTexCoord;
}
`
const textureFS = `
varying highp vec2 texCoord;
uniform sampler2D uSampler;

void main() {
	lowp vec4 col = texture2D(uSampler, texCoord);
	if (col.a == 0.0) {
		discard;
	} else {gl_FragColor = col;}
}
`
const textureBillboardVS = `
attribute vec4 aBillboardPos;
attribute vec2 abTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 ubModelViewMatrix;

varying highp vec2 texCoord;

void main() {
	gl_Position = uProjectionMatrix * ubModelViewMatrix * aBillboardPos;
	texCoord = abTexCoord;
}
`;

const particleVS = `
attribute float aParticleLifetime;
attribute vec4 aParticleCenterOffset;
uniform vec4 uParticleEmitter;
uniform float uParticleSize;

void main() {
	vec4 position = aParticleCenterOffset + uParticleEmitter;

	vec3 rightVec = vec3(uModelViewMatrix[0].y, uModelViewMatrix[1].y, uModelViewMatrix[2].y);
	vec3 upVec = vec3(uModelViewMatrix[0].y, uModelViewMatrix[1].y, uModelViewMatrix[2].y);
	position +=
}
`;