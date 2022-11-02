// the Division 3D Engine.
// VERSION 2.0!!!
// proudly made by Greb. (this time with almost no assistance from MDN's tutorials)
// btw MDN is awesome
var canvas, gl;
var buffers_d;
var modelViewMatrix = glMatrix.mat4.create();
glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5]);
var projectionMatrix = glMatrix.mat4.create();
glMatrix.mat4.perspective(projectionMatrix,
	60 * Math.PI / 180, // fov
	400/300, // aspect
	0.1, // zNear
	150.0 // zFar
);
var lightingInfo = [0, 1, 0, 1, 1, 1, 0.5, 0.5, 0.5];
var renderBuffers = {"shaderProgram":[]};

function parseShader(s) {
	var attribRegEx = /attribute (vec[0-5]|float) .+?(?=;)/g;
	var uniformRegEx = /uniform (mat[0-5]|sampler2D|vec[0-5]|float) .+?(?=;)/g;
	var results = {
		attribute: [],
		uniform: []
	};
	var attribParsed = [...s.matchAll(attribRegEx)];
	var uniParsed = [...s.matchAll(uniformRegEx)];
	for (var x of attribParsed) {
		results.attribute.push(x[0].split(" ")[2]); // push the name of the attribute
	}
	for (var x of uniParsed) {
		results.uniform.push(x[0].split(" ")[2]); // push the name of the uniform
	}
	return results;
}

function loadShader(type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('shaders failed compiling lmao bc ' + gl.getShaderInfoLog(shader) +
			"\nthe source code was logged in console.");
		console.log(source);
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

function compileShaders(vertex, frag) {
	var vertexShader = loadShader(gl.VERTEX_SHADER, vertex);
	var fragmentShader = loadShader(gl.FRAGMENT_SHADER, frag);
	var prog = gl.createProgram();
	gl.attachShader(prog, vertexShader);
	gl.attachShader(prog, fragmentShader);
	gl.linkProgram(prog);
	return prog;
}

function setBufferData(buf, data) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

function initShadersAndBuffers() {
	for (var shader in buffers_d) {
		var info = buffers_d[shader];

		info.compiled = compileShaders(info.vSource, info.fSource);
		var requirements = parseShader(info.vSource);
		// because the fShaders only have uniforms
		requirements.uniform = requirements.uniform.concat(parseShader(info.fSource).uniform);
		console.log(requirements.attribute);
		for (var attrib of requirements.attribute) {
			info.buffer[attrib].unshift(gl.getAttribLocation(info.compiled, attrib)); // add the attribute location

			var buffer = gl.createBuffer();
			setBufferData(buffer, new Float32Array([]));
			info.buffer[attrib].unshift(buffer); // add the buffer
		}

		for (var uniform of requirements.uniform) {
			info.uniform[uniform] = gl.getUniformLocation(info.compiled, uniform);
		}
	}
}

function bindVertexAttribute(buffer, location, numComponents = 3, type = gl.FLOAT, normalize = false, stride = 0, offset = 0) {
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

function useShader(name) {
	var info = buffers_d[name];
	gl.useProgram(info.compiled);
	for (var buf in info.buffer) {
		bindVertexAttribute(...info.buffer[buf]);
	}
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

function bindTexture(tex, unit = 0) {
	gl.activeTexture(gl["TEXTURE"+unit]);
	gl.bindTexture(gl.TEXTURE_2D, tex);
}

function addPositions(pos, tex, index = [], normal = []) { // backwards compatible with Division 1.0
	if (pos.length != normal.length) {
		console.warn("addPositions: recieved less normals than positions");
	}
	shaderAddData({aVertexPosition: pos, aVertexNormal: normal, aTexCoord: tex}, "shaderProgram");
}

function shaderAddData(datas, shader) { // add data to any shader
	// this way i dont have to write the same thing for every shader
	var d = buffers_d[shader].data;
	for (var prop in d) {
		d[prop] = d[prop].concat(datas[prop]);
	}
}

function flush(shaderName) {
	console.log("flush: shaderName: " + shaderName);
	var info = buffers_d[shaderName];
	for (var property in info.data) {
		setBufferData(info.buffer[property][0], new Float32Array(info.data[property]));
	}
}

function flushUniforms() {
	var locs = buffers_d.shaderProgram.uniform;
	gl.uniformMatrix4fv(locs.uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(locs.uProjectionMatrix, false, projectionMatrix);
	gl.uniformMatrix3fv(locs.uLightingInfo, false, lightingInfo);
	locs = buffers_d.objShader.uniform;
	gl.useProgram(buffers_d.objShader.compiled);
	gl.uniformMatrix4fv(locs.uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(locs.uProjectionMatrix, false, projectionMatrix);
	gl.uniformMatrix3fv(locs.uLightingInfo, false, lightingInfo);
}

function createRenderBuffer(prog) {
	var loc = renderBuffers[prog].length;
	var toPush = {buffers: {}, data: {}};
	for (var attrib in buffers_d[prog].buffer) {
		var buf = gl.createBuffer();
		setBufferData(buf, new Float32Array([]));
		toPush.buffers[attrib] = buf;
		toPush.data[attrib] = [];
	}
	renderBuffers[prog].push(toPush);
	return loc;
}

function useRenderBuffer(loc, program) {
	var toUse = renderBuffers[program][loc];
	var info = buffers_d[program].buffer;
	for (var attrib in info) {
		bindVertexAttribute(toUse.buffers[attrib], ...info[attrib].slice(1));
	}
}

function flushRB(loc, program) {
	var toUse = renderBuffers[program][loc];
	for (attrib in toUse.buffers) {
		setBufferData(toUse.buffers[attrib], new Float32Array(toUse.data[attrib]));
	}
}

function getRBdata(loc, program) {
	return renderBuffers[program][loc].data;
}

function initGL(canvName) {
	canvas = document.getElementById(canvName);
	gl = canvas.getContext("webgl");
	if (gl === null || gl === undefined) { // no webgl for ye
		window.alert("webgl failed lmao");
		return;
	}
	buffers_d = {
		shaderProgram: {
			vSource: lightVS,
			fSource: textureFS,
			compiled: false,
			buffer: {
				aVertexPosition: [],
				aVertexNormal: [],
				aTexCoord: [2, gl.FLOAT, false, 0, 0]
			},
			uniform: {},
			data: {
				aVertexPosition: [],
				aVertexNormal: [],
				aTexCoord: []
			}
		},
		objShader: {
			vSource: lightColorVS,
			fSource: fsSource,
			compiled: false,
			buffer: {
				aVertexPosition: [],
				aVertexNormal: [],
				aColor: [4, gl.FLOAT, false, 0, 0]
			},
			uniform: {},
			data: {
				aVertexPosition: [],
				aVertexNormal: [],
				aColor: []
			}
		}
	};
	initShadersAndBuffers();
	try { // if you don't have a divisionOnLoad function or sth idk
		divisionOnLoad(gl);
	} catch (e) {}
}
