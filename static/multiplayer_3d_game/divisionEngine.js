// WebGL boilerplate code.
// or as I like to call it, a Semi-Abstract WebGL Interface.
// proudly made by Greb. (with some assistance from MDN's tutorials) :D

var canvas, gl, projectionMatrix, modelViewMatrix, infoStuff, buffers, positions, indexes, colors;

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
var divisDownKeys = {};

// #4a412a
function initShaders() {
	const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('shaders failed lmao bc ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

function loadShader(type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('shaders failed compiling lmao bc ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

function initBuffers() {
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	positions = [];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	const colorBuffer = gl.createBuffer();

	colors = [];

	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);


	return {
		position: positionBuffer,
		color: colorBuffer,
	}
}

function addPositions(pos, color) {
	positions = positions.concat(pos);

	colors = colors.concat(color);
}

function flush() {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
}

function setPositions(pos) {
	positions = pos;
}

function setColors(color) {
	colors = color;
}

function translateModelView(toTranslate) {
	glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, toTranslate);
}

function rotateModelView(angle, axis) {
	glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, angle, axis);	
}

function setModelView(modelView) {
	modelViewMatrix = modelView;
}

function flushUniforms() {
	gl.uniformMatrix4fv(infoStuff.uniformLocations.projectionMatrix,
		false,
		projectionMatrix);
	gl.uniformMatrix4fv(
		infoStuff.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix);
}

function finalInit() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	projectionMatrix = glMatrix.mat4.create();
	glMatrix.mat4.perspective(projectionMatrix,
		45 * Math.PI / 180, // fov
		gl.canvas.clientWidth / gl.canvas.clientHeight, // aspect
		0.1, // zNear
		150.0 // zFar
	);

	modelViewMatrix = glMatrix.mat4.create();


	// set the attribute locations
	{ // thanx mdn for this code cos i was too lazy to read up the docs
		const numComponents = 3;  // pull out 3 values per iteration
		const type = gl.FLOAT;    // the data in the buffer is 32bit floats
		const normalize = false;  // don't normalize
		const stride = 0;         // how many bytes to get from one set of values to the next
								  // 0 = use type and numComponents above
		const offset = 0;         // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(
			  infoStuff.attribLocations.vertexPosition,
			  numComponents,
			  type,
			  normalize,
			  stride,
			  offset);
		gl.enableVertexAttribArray(
			  infoStuff.attribLocations.vertexPosition);
	}

	{ // mdn code again
		const numComponents = 4;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
		gl.vertexAttribPointer(
			infoStuff.attribLocations.vertexColor,
			numComponents,
			type,
			normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(
			infoStuff.attribLocations.vertexColor);
	}

	gl.useProgram(infoStuff.program);

	// set the uniform things
	gl.uniformMatrix4fv(infoStuff.uniformLocations.projectionMatrix,
		false,
		projectionMatrix);
	gl.uniformMatrix4fv(
		infoStuff.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix);

	
	flush();
}



function onLoad() {
	canvas = document.getElementById("canvas");
	gl = canvas.getContext("webgl");
	if (gl === null || gl === undefined) { // no webgl for ye
		window.alert("webgl failed lmao");
		return;
	}

	shaderProgram = initShaders();

	infoStuff = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
			vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
		},
		uniformLocations: {
			modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
		}
	}

	buffers = initBuffers();
	finalInit(buffers);

	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);

	// complicated stoufvves
	// var cameraPos = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
	// var cameraTarget = glMatrix.vec3.fromValues(0.0, 0.0, 1.0);
	// var cameraDirection = glMatrix.vec3.create();
	// glMatrix.vec3.normalize(cameraDirection, cameraPos - cameraTarget);
	// var cameraUp = glMatrix.vec3.create();
	// glMatrix.vec3.cross(cameraUp, cameraDirection, cameraRight);
	// var lookAt = glMatrix.mat4.create();
	// glMatrix.mat4.lookAt(lookAt,
	// 	glMatrix.vec3.fromValues())


	divisionOnLoad(gl);
}


function onKeyDown(event) {
	var keyCode = event.keyCode;
	divisDownKeys[keyCode] = true;
}

function onKeyUp(event) {
	keyCode = event.keyCode;
	divisDownKeys[keyCode] = false;
}


window.onload = onLoad;