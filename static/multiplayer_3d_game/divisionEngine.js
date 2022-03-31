// WebGL boilerplate code.
// or as I like to call it, a Semi-Abstract WebGL Interface.
// proudly made by Greb. (with some assistance from MDN's tutorials) :D

var canvas, gl, projectionMatrix, modelViewMatrix, infoStuff, buffers, positions, indexes, colors, texCoords, billboardShader, billboardPositions, billboardTexCoords;
var settings = {};
var pushed = [];

var divisDownKeys = {};

// #4a412a
function initShaders() {
	var vertexShader = loadShader(gl.VERTEX_SHADER, settings.useTexture?textureVS:vsSource);
	var fragmentShader = loadShader(gl.FRAGMENT_SHADER, settings.useTexture?textureFS:fsSource);

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('shaders failed lmao bc ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	// ---------billboards--------
	vertexShader = loadShader(gl.VERTEX_SHADER, settings.useTexture?textureBillboardVS:billboardVS);
	fragmentShader = loadShader(gl.FRAGMENT_SHADER, settings.useTexture?textureFS:fsSource);
	billboardShader = gl.createProgram();
	gl.attachShader(billboardShader, vertexShader);
	gl.attachShader(billboardShader, fragmentShader);
	gl.bindAttribLocation(billboardShader, 6, "aBillboardPos");
	gl.bindAttribLocation(billboardShader, 7, "abTexCoord");
	gl.linkProgram(billboardShader);
	if (!gl.getProgramParameter(billboardShader, gl.LINK_STATUS)) {
		alert('billboard shaders failed lmao bc ' + gl.getProgramInfoLog(billboardShader));
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
	var colorOrTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorOrTextureBuffer);

	colors = [];
	texCoords = [];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);

	billboardPositions = [];
	const billboardPosBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, billboardPosBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(billboardPositions), gl.DYNAMIC_DRAW);

	billboardTexCoords = [];
	var billboardTexCoordBuffer;
	if (settings.useTexture) {
		billboardTexCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, billboardTexCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(billboardTexCoords), gl.DYNAMIC_DRAW);
	}
	return {
		"position": positionBuffer,
		"color": colorOrTextureBuffer,
		"texCoord": colorOrTextureBuffer,
		"billboardPosition": billboardPosBuffer,
		"billboardTexCoord": billboardTexCoordBuffer,
	}
}

function addPositions(pos, color) {
	positions = positions.concat(pos);
	if (settings.useTexture) {
		texCoords = texCoords.concat(color)
	} else {
		colors = colors.concat(color);
	}
}

function addBillbPositions(pos, texCoords = false) {
	billboardPositions = billboardPositions.concat(pos);
	if (settings.useTexture) {
		billboardTexCoords = billboardTexCoords.concat(texCoords);	
	}
}

function flush() {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	if (settings.useTexture) {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.billboardTexCoord);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(billboardTexCoords), gl.STATIC_DRAW);
	} else {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.billboardPosition);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(billboardPositions), gl.STATIC_DRAW);
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

function pushModelView() {
	pushed.push(modelViewMatrix);
}

function popModelView() {
	return pushed.pop();
}

function flushUniforms() {
	var current = gl.getParameter(gl.CURRENT_PROGRAM);
	gl.useProgram(shaderProgram);
	gl.uniformMatrix4fv(infoStuff.uniformLocations.projectionMatrix,
		false,
		projectionMatrix);
	gl.uniformMatrix4fv(
		infoStuff.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix);

	gl.useProgram(billboardShader)
	gl.uniformMatrix4fv(infoStuff.uniformLocations.bProjectionMatrix,
		false,
		projectionMatrix);
	gl.uniformMatrix4fv(
		infoStuff.uniformLocations.bModelViewMatrix,
		false,
		billboardMVM);
	gl.useProgram(current);
}

function loadTexture(url) { // MUST BE POWER OF 2 IMAGE
	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	// thanx mdn for this code cos i was too lazy to type it up
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
		width, height, border, srcFormat, srcType,
		pixel);

	const texImage = new Image();
	texImage.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, texImage);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	}
	texImage.src = url;
	return tex;
}

function createVertexAttribute(location, buffer, numComponents = 3, type = gl.FLOAT, normalize = false, stride = 0, offset = 0) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(
			  location,
			  numComponents,
			  type,
			  normalize,
			  stride,
			  offset);
	gl.enableVertexAttribArray(location);
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

	billboardMVM = glMatrix.mat4.create();

	// set the attribute locations
	createVertexAttribute(infoStuff.attribLocations.billboardPosition, buffers.billboardPosition);

	createVertexAttribute(infoStuff.attribLocations.vertexPosition, buffers.position);

	if (settings.useTexture) {
		createVertexAttribute(infoStuff.attribLocations.vertexTexCoord, buffers.texCoord,
			2, gl.FLOAT, false, 0, 0);
		createVertexAttribute(infoStuff.attribLocations.billboardTexCoord, buffers.billboardTexCoord,
			2, gl.FLOAT, false, 0, 0);
	} else {
	createVertexAttribute(infoStuff.attribLocations.vertexColor, buffers.color,
		4, gl.FLOAT, false, 0, 0);}

	// set the uniform things
	gl.useProgram(shaderProgram)
	gl.uniformMatrix4fv(infoStuff.uniformLocations.projectionMatrix,
		false,
		projectionMatrix);
	gl.uniformMatrix4fv(
		infoStuff.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix);
	gl.activeTexture(gl.TEXTURE0);
	var texture = loadTexture("/static/multiplayer_3d_game/grass.png");
	console.log(texture)
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.uniform1i(infoStuff.uniformLocations.texSampler, 0);
	flush();
}

class Camera {
	constructor(mat) {
		this.mat = mat;
		// thanks to learnOpenGL.com for these values cos dumb at linear algebra :D
		this.pos = glMatrix.vec3.fromValues(0.0, 1.6, 0.0);
		this.pointTo = glMatrix.vec3.fromValues(0.0, 1.6, 1.0);
		this.front = glMatrix.vec3.fromValues(0.0, 0.0, -1.0);
		this.up = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
		this.yaw = -90.0;
		this.pitch = 0.0;
	}
	turn(angleX, angleY) {
		this.yaw += angleX;
		this.pitch -= angleY;
		var _front = glMatrix.vec3.create();
		_front[0] = Math.cos(glMatrix.glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.glMatrix.toRadian(myPlayer.pitch));
		_front[1] = Math.sin(glMatrix.glMatrix.toRadian(this.pitch));
		_front[2] = Math.sin(glMatrix.glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.glMatrix.toRadian(myPlayer.pitch))
		glMatrix.vec3.normalize(this.front, _front);

	}
	// to move camera, just set this.pos manually
	updateMat() {
		var posPlusFront = glMatrix.vec3.create();
		glMatrix.vec3.add(posPlusFront, this.pos, this.front);
		glMatrix.mat4.lookAt(this.mat,
			this.pos,
			posPlusFront,
			this.up);
	}
}

var shaderProgram;

function onLoad() {
	settings.useTexture = true;
	initGL();
}

function initGL() {
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
			vertexTexCoord: gl.getAttribLocation(shaderProgram, "aTexCoord"),
			billboardPosition: 6,
			billboardTexCoord: 7,
		},
		uniformLocations: {
			modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			bProjectionMatrix: gl.getUniformLocation(billboardShader, 'uProjectionMatrix'),
			bModelViewMatrix: gl.getUniformLocation(billboardShader, 'ubModelViewMatrix'),
			texSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
		}
	}

	buffers = initBuffers();
	finalInit();

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