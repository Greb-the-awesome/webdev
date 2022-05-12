// WebGL boilerplate code.
// or as I like to call it, a Semi-Abstract WebGL Interface.
// proudly made by Greb. (with some assistance from MDN's tutorials) :D
// also, this code really needs to be cleaned up a bit

var canvas, gl, projectionMatrix, modelViewMatrix, infoStuff, buffers, positions, indexes, colors, texCoords, billboardShader, billboardPositions, billboardTexCoords, particleCorners, normals;
var settings = {};
var pushed = [];
var attributeInfo, particleShader;
var divisDownKeys = {};
var textShader;
var particleTexCoords, particleCenterOffsets, textTexCoords, textPositions, textColors;

// #4a412a

function compileShaders(vertex, frag, name) {
	var vertexShader = loadShader(gl.VERTEX_SHADER, vertex);
	var fragmentShader = loadShader(gl.FRAGMENT_SHADER, frag);
	var prog = gl.createProgram();
	gl.attachShader(prog, vertexShader);
	gl.attachShader(prog, fragmentShader);
	gl.linkProgram(prog);
	prog.name = name;
	return prog;
}

function initShaders() {
	var mainSource = vsSource;
	if (settings.useTexture) {mainSource = textureVS;}
	if (settings.useLighting) {mainSource = lightVS;}
	const shaderProgram = compileShaders(mainSource, settings.useTexture?textureFS:fsSource, "shaderProgram");

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('shaders failed lmao bc ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	// ---------billboards--------
	billboardShader = compileShaders(settings.useTexture?textureBillboardVS:billboardVS, settings.useTexture?textureFS:fsSource, "billboardShader");
	if (!gl.getProgramParameter(billboardShader, gl.LINK_STATUS)) {
		alert('billboard shaders failed lmao bc ' + gl.getProgramInfoLog(billboardShader));
	}

	// ---------particles---------
	if (settings.useTexture) {
		particleShader = compileShaders(particleVS, textureFS, "particleShader");
		if (!gl.getProgramParameter(particleShader, gl.LINK_STATUS)) { alert("particle shaders failed lmao bc" + gl.getProgramInfoLog(particleShader)); }
		textShader = compileShaders(textVS, textFS, "textShader");
		if (!gl.getProgramParameter(textShader, gl.LINK_STATUS)) { alert("text shaders failed lmao bc" + gl.getProgramInfoLog(textShader)) }
	}
	return shaderProgram;
}

function useShader(shdr) {
	var locations = infoStuff["attribLocations"][shdr.name];
	var otherData = attributeInfo[shdr.name];
	for (const attrib in locations) {
		createVertexAttribute(locations[attrib], ...otherData[attrib] /*me be using da big brain array destructuring*/);
	}
	gl.useProgram(shdr)
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

function setBufferData(buffer, data, type = Float32Array, mode = gl.STATIC_DRAW, target = gl.ARRAY_BUFFER) {
	gl.bindBuffer(target, buffer);
	gl.bufferData(target, new type(data), mode);
}

function initBuffers() {
	const positionBuffer = gl.createBuffer();
	positions = [];
	setBufferData(positionBuffer, positions);

	var colorOrTextureBuffer = gl.createBuffer();
	colors = [];
	texCoords = [];
	setBufferData(colorOrTextureBuffer, colors);

	billboardPositions = [];
	const billboardPosBuffer = gl.createBuffer();
	setBufferData(billboardPosBuffer, billboardPositions);

	billboardTexCoords = [];
	var billboardTexCoordBuffer;
	if (settings.useTexture) {
		billboardTexCoordBuffer = gl.createBuffer();
		setBufferData(billboardTexCoordBuffer, billboardTexCoords);
	}
	
	const particleCornerBuffer = gl.createBuffer();
	particleCorners = [];
	const particleTexCoordBuffer = gl.createBuffer();
	particleTexCoords = [];
	const particleOffsetBuffer = gl.createBuffer();
	particleCenterOffsets = [];
	{
		let cycle = [-1.0, -1.0,
					 1.0, -1.0,
					 1.0, 1.0,
					 -1.0, -1.0,
					 1.0, 1.0,
					 -1.0, 1.0];
		let texCoordsCycle = [0.5, 1,
							  0, 1,
							  0, 0.5,
							  0.5, 1,
							  0, 0.5,
							  0.5, 0.5];
		for (let j=0; j<10; j++) {
			var offsets = [Math.random() * 5,Math.random() * 5,Math.random() * 5];
			for (let i=0; i<6; i++) {
				particleCorners.push(cycle[i * 2]);
				particleCorners.push(cycle[i * 2 + 1]);
				particleTexCoords.push(texCoordsCycle[i * 2]);
				particleTexCoords.push(texCoordsCycle[i * 2 + 1]);
				particleCenterOffsets = particleCenterOffsets.concat(offsets);
			}
		}
	}
	setBufferData(particleCornerBuffer, particleCorners);
	setBufferData(particleTexCoordBuffer, particleTexCoords);
	setBufferData(particleOffsetBuffer, particleCenterOffsets);

	const textPositionBuffer = gl.createBuffer();
	textPositions = [];
	setBufferData(textPositionBuffer, textPositions);
	const textTexCoordBuffer = gl.createBuffer();
	textTexCoords = [];
	setBufferData(textTexCoordBuffer, textTexCoords);
	const textColorBuffer = gl.createBuffer();
	textColors = [];
	setBufferData(textColorBuffer, textColors);

	const normalBuffer = gl.createBuffer();
	normals = [];
	setBufferData(normalBuffer, normals);

	const indexBuffer = gl.createBuffer();
	indexes = [];
	setBufferData(indexBuffer, indexes, Uint32Array, gl.STATIC_DRAW, gl.ELEMENT_ARRAY_BUFFER);
	
	return {
		"position": positionBuffer,
		"color": colorOrTextureBuffer,
		"texCoord": colorOrTextureBuffer,
		"billboardPosition": billboardPosBuffer,
		"billboardTexCoord": billboardTexCoordBuffer,
		"particleOffset": particleOffsetBuffer,
		"particleCorner": particleCornerBuffer,
		"particleTexCoord": particleTexCoordBuffer,
		"textPosition": textPositionBuffer,
		"textTexCoord": textTexCoordBuffer,
		"textColor": textColorBuffer,
		"normal": normalBuffer,
		"index": indexBuffer,
	}
}

function addPositions(pos, color, index = [], normal = []) {
	positions = positions.concat(pos);
	if (settings.useTexture) {
		texCoords = texCoords.concat(color)
	} else {
		colors = colors.concat(color);
	}
	indexes = indexes.concat(index);
	normals = normals.concat(normal);
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

	setBufferData(buffers.normal, normals);

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indexes), gl.STATIC_DRAW);
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
	modelViewMatrix = pushed.pop();
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
	glMatrix.mat4.invert(normalMatrix, modelViewMatrix);
	glMatrix.mat4.transpose(normalMatrix, normalMatrix);
	gl.uniformMatrix4fv(infoStuff.uniformLocations.normalMatrix, false, normalMatrix);
	gl.uniformMatrix3fv(infoStuff.uniformLocations.lightingInfo, false,
		glMatrix.mat3.fromValues(settings.lightDir[0], settings.lightDir[1], settings.lightDir[2],
		settings.lightCol[0], settings.lightCol[1], settings.lightCol[2],
		settings.ambientLight[0], settings.ambientLight[1], settings.ambientLight[2]));

	gl.useProgram(billboardShader)
	gl.uniformMatrix4fv(infoStuff.uniformLocations.bProjectionMatrix,
		false,
		projectionMatrix);
	gl.uniformMatrix4fv(
		infoStuff.uniformLocations.bModelViewMatrix,
		false,
		billboardMVM);

	gl.useProgram(particleShader);
	gl.uniform3f(infoStuff.uniformLocations.particleEmitter, 0.0, 1.0, 0.0);
	gl.uniformMatrix4fv(infoStuff.uniformLocations.pProjectionMatrix,
		false,
		projectionMatrix);
	gl.uniformMatrix4fv(
		infoStuff.uniformLocations.pModelViewMatrix,
		false,
		modelViewMatrix);
	var right = glMatrix.vec3.create();
	glMatrix.vec3.cross(right, glMatrix.vec3.fromValues(0.0, 1.0, 0.0), myPlayer.cameraFront,);
	glMatrix.vec3.normalize(right, right);
	gl.uniform3f(infoStuff.uniformLocations.pCameraRight, right[0], right[1], right[2]);
	gl.useProgram(textShader);
	gl.uniformMatrix4fv(infoStuff.uniformLocations.tProjectionMatrix,
		false,
		projectionMatrix);
	gl.uniformMatrix4fv(
		infoStuff.uniformLocations.tModelViewMatrix,
		false,
		modelViewMatrix);
	gl.useProgram(current);
}
var supporteds = [];
{
	let supportedString = "abcdefghijklmnopqrstuvwxyz";
	for (let i=0; i<supportedString.length; i++) {
		supporteds.push(supportedString[i]);
	}
}
function addText(text, vertices, color) {
	var unsupporteds = [];
	for (let i=0; i<text.length; i++) {
		var char = text[i];
		if (!supporteds.includes(char)) { unsupporteds.push(char); }
		else {
			var position = supporteds.indexOf(char) * settings.charWidth + settings.textStart[0];
			var head = i * 8;
			textPositions = textPositions.concat([
					-1.0 + head, -1.0,
					 1.0 + head, -1.0,
					 1.0 + head,  1.0,
					-1.0 + head, -1.0,
					 1.0 + head,  1.0,
					-1.0 + head,  1.0]);
			textTexCoords = textTexCoords.concat([
					position, settings.textStart[1],
					position + settings.charWidth, settings.textStart[1],
					position + settings.charWidth, settings.textStart[1] + settings.charWidth,
					position, settings.textStart[1],
					position + settings.charWidth, settings.textStart[1] + settings.charWidth,
					position, settings.textStart[1] + settings.charWidth]);
			for (let j=0; j<6; j++) { textColors = textColors.concat(color); }
			console.log("debug info: position = "+position+"\nadded textTexCoords = "+[
					position, settings.textStart[1],
					position + settings.charWidth, settings.textStart[1],
					position + settings.charWidth, settings.textStart[1] + settings.charWidth,
					position, settings.textStart[1],
					position + settings.charWidth, settings.textStart[1] + settings.charWidth,
					position, settings.textStart[1] + settings.charWidth]);
		}
	}
	if (0 in unsupporteds) { console.warn("addText: unsupported characters: " + unsupporteds); }
	setBufferData(buffers.textPosition, textPositions);
	setBufferData(buffers.textColor, textColors);
	setBufferData(buffers.textTexCoord, textTexCoords);
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
	gl.clearColor(0.529, 0.808, 0.921, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	projectionMatrix = glMatrix.mat4.create();
	glMatrix.mat4.perspective(projectionMatrix,
		45 * Math.PI / 180, // fov
		gl.canvas.clientWidth / gl.canvas.clientHeight, // aspect
		0.1, // zNear
		150.0 // zFar
	);

	modelViewMatrix = glMatrix.mat4.create();
	normalMatrix = glMatrix.mat4.create();

	billboardMVM = glMatrix.mat4.create();

	// set the attribute locations
	// createVertexAttribute(infoStuff.attribLocations.billboardPosition, buffers.billboardPosition);

	// createVertexAttribute(infoStuff.attribLocations.vertexPosition, buffers.position);

	// if (settings.useTexture) {
	// 	createVertexAttribute(infoStuff.attribLocations.vertexTexCoord, buffers.texCoord,
	// 		2, gl.FLOAT, false, 0, 0);
	// 	createVertexAttribute(infoStuff.attribLocations.billboardTexCoord, buffers.billboardTexCoord,
	// 		2, gl.FLOAT, false, 0, 0);
	// } else {
	// createVertexAttribute(infoStuff.attribLocations.vertexColor, buffers.color,
	// 	4, gl.FLOAT, false, 0, 0);}

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
	addText("aad", 0, [0, 1, 0, 1]);
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

const D_ONE_POINT = function() { return glMatrix.vec3.fromValues(0,0,0); };
const D_SQUARE_PLANE = function() {
	return glMatrix.vec3.fromValues(Math.random(), Math.random(), Math.random());
};

class ParticleSystem {
	constructor(position, emitter, startVelocity, lifetime) {
		this.position = position;
		this.emitFunc = emitter;
		this.startVelocity = startVelocity;
		this.particleLifetime = lifetime;
		for (let i=0; i<1000/*change later*/; i++) {

		}
	}
}

function loadObj(text, offset=0) {
	var lst = text.split("\n");
	var verts = [];
	var tex = [];
	var idx = [];
	for (let i=0; i<lst.length; i++) {
		var line = lst[i];
		if (line.startsWith("v " )) {
			var a = line.split(" ");
			verts = verts.concat([parseFloat(a[1]), parseFloat(a[2]), parseFloat(a[3])]);
		}
		else if (line.startsWith("vt ")) {
			var a = line.split(" ");
			tex = tex.concat([parseFloat(a[1]), parseFloat(a[2])]);
		} else if (line.startsWith("f")) {
			var a = line.slice(2, line.length).split(" "); // ["x/y/z", "a/b/c", "p/q/r"]
			var b = a.map(x=>{
				var splitd = x.split("/");
				return splitd.map(y=>{return parseInt(y)+offset;});
			}); // [[x, y, z], [a, b, c], [p, q, r]]
			b.forEach(el => {
				if (idx.includes(el)) {
					idx.push(el);
				} else {
					var vertHead = idx.length * 3 + 1;
					var texHead = idx.length * 2 + 1;
					verts = verts.concat([verts[vertHead], verts[vertHead + 1], verts[vertHead + 2]]);
					tex = tex.concat([tex[texHead], tex[texHead + 1]]);
					idx = idx.concat([verts.length/3+1, verts.length/3+2, verts.length/3+3])
				}
			})

			// if (a.length == 3) {
			// 	idx = idx.concat(b);
			// } else {
			// 	idx = idx.concat([b[0], b[1], b[3], b[1], b[2], b[3]]);
			// }
		}
	}
	return {"index": idx, "position": verts};
}

var shaderProgram;


function initGL(canvName) {
	canvas = document.getElementById(canvName);
	gl = canvas.getContext("webgl");
	if (gl === null || gl === undefined) { // no webgl for ye
		window.alert("webgl failed lmao");
		return;
	}
	if (gl.getExtension("OES_element_index_uint") == null) {
		window.alert("your browser doesn't support this game. cope harder.");
		return;
	}

	shaderProgram = initShaders();

	infoStuff = { // i really should dynamically generate this as it is getting cluttered but w h a t e v e r
		program: shaderProgram,
		attribLocations: {
			shaderProgram: {
				vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
				vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
				vertexTexCoord: gl.getAttribLocation(shaderProgram, "aTexCoord"),
				vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
			},
			billboardShader: {
				billboardPosition: gl.getAttribLocation(billboardShader, "aBillboardPos"),
				billboardTexCoord: gl.getAttribLocation(billboardShader, "abTexCoord"),
			},
			particleShader: {
				particleCenterOffset: gl.getAttribLocation(particleShader, "aParticleCenterOffset"),
				particleCorner: gl.getAttribLocation(particleShader, "aParticleCorner"),
				particleTexCoords: gl.getAttribLocation(particleShader, "aParticleTexCoords"),
			},
			textShader: {
				vertexPosition: gl.getAttribLocation(textShader, "aVertexPosition"),
				vertexColor: gl.getAttribLocation(textShader, "aTextColor"),
				vertexTexCoord: gl.getAttribLocation(textShader, "aTexCoord"),
			}
		},
		uniformLocations: {
			modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
			lightingInfo: gl.getUniformLocation(shaderProgram, "uLightingInfo"),
			bProjectionMatrix: gl.getUniformLocation(billboardShader, 'uProjectionMatrix'),
			bModelViewMatrix: gl.getUniformLocation(billboardShader, 'ubModelViewMatrix'),
			texSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
			cameraPos: gl.getUniformLocation(shaderProgram, "uCameraPos"),
			fogColor: gl.getUniformLocation(shaderProgram, "uFogColor"),
			particleEmitter: gl.getUniformLocation(particleShader, "uParticleEmitter"),
			pModelViewMatrix: gl.getUniformLocation(particleShader, "uModelViewMatrix"),
			pProjectionMatrix: gl.getUniformLocation(particleShader, "uProjectionMatrix"),
			pCameraRight: gl.getUniformLocation(particleShader, "uCameraRight"),
			tModelViewMatrix: gl.getUniformLocation(textShader, "uModelViewMatrix"),
			tProjectionMatrix: gl.getUniformLocation(textShader, "uProjectionMatrix"),
			tCameraPos: gl.getUniformLocation(textShader, "uCameraPos"),
			tFogColor: gl.getUniformLocation(textShader, "uFogColor"),
		}
	};

	buffers = initBuffers();
	finalInit();
	// some info for the vertex attributes
	attributeInfo = {};
	attributeInfo["shaderProgram"] = {
		vertexPosition: [buffers.position],
		vertexColor: [buffers.color, 4, gl.FLOAT, false, 0, 0],
		vertexTexCoord: [buffers.texCoord, 2, gl.FLOAT, false, 0, 0],
		vertexNormal: [buffers.normal]
	};
	attributeInfo["billboardShader"] = {
		billboardPosition: [buffers.billboardPosition],
		billboardTexCoord: [buffers.billboardTexCoord, 2, gl.FLOAT, false, 0, 0],
	};
	attributeInfo["particleShader"] = {
		particleCenterOffset: [buffers.particleOffset],
		particleCorner: [buffers.particleCorner, 2, gl.FLOAT, false, 0, 0],
		particleTexCoords: [buffers.particleTexCoord, 2, gl.FLOAT, false, 0, 0],
	};
	attributeInfo["textShader"] = {
		vertexPosition: [buffers.textPosition, 2, gl.FLOAT, false, 0, 0],
		vertexColor: [buffers.textColor, 4, gl.FLOAT, false, 0, 0],
		vertexTexCoord: [buffers.textTexCoord, 2, gl.FLOAT, false, 0, 0],
	}

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


