// the Division 3D Engine.
// VERSION 2.0!!!
// proudly made by Greb. (this time with almost no assistance from MDN's tutorials)
// btw MDN is awesome
// TODO: make this library object-oriented

var canvas, gl;
var buffers_d;
var modelViewMatrix = glMatrix.mat4.create();
glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5]);
var projectionMatrix = glMatrix.mat4.create();
glMatrix.mat4.perspective(projectionMatrix,
	60 * Math.PI / 180, // fov
	16/9, // aspect
	0.1, // zNear
	150.0 // zFar
);
var bModelViewMatrix = glMatrix.mat4.create();
var lightingInfo = [0, 1, 0, 1, 1, 1, 0.5, 0.5, 0.5];
var renderBuffers = {"shaderProgram":[], "objShader":[]};
var cube = [-1.0, -1.0, 1.0,  1.0, -1.0, 1.0,  1.0, 1.0, 1.0,  -1.0, -1.0, 1.0,  1.0, 1.0, 1.0,  -1.0,  1.0,  1.0,
			 -1.0, -1.0, -1.0,  -1.0, 1.0, -1.0,  1.0, 1.0, -1.0,  -1.0, -1.0, -1.0,  1.0, 1.0, -1.0,  1.0, -1.0, -1.0,
			 -1.0, 1.0, -1.0,  -1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  -1.0, 1.0, -1.0,  1.0, 1.0, 1.0,  1.0, 1.0, -1.0,
			 -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0, 1.0,  -1.0, -1.0, -1.0,  1.0, -1.0, 1.0,  -1.0, -1.0, 1.0,
			 1.0, -1.0, -1.0,  1.0, 1.0, -1.0,  1.0, 1.0, 1.0,  1.0, -1.0, -1.0,  1.0, 1.0, 1.0,  1.0, -1.0, 1.0,
			 -1.0, -1.0, -1.0,  -1.0, -1.0,  1.0,  -1.0, 1.0, 1.0,  -1.0, -1.0, -1.0,  -1.0, 1.0, 1.0,  -1.0,  1.0, -1.0,
];


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

function processShader(shader) {
	// process a shader.
	// accesses the global variable buffers_d's shader property.
	var info = buffers_d[shader];

	info.compiled = compileShaders(info.vSource, info.fSource);
	var requirements = parseShader(info.vSource);
	// because the fShaders only have uniforms
	requirements.uniform = requirements.uniform.concat(parseShader(info.fSource).uniform);
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

function initShadersAndBuffers() {
	for (var shader in buffers_d) {
		processShader(shader);
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
	var info = buffers_d[shaderName];
	for (var property in info.data) {
		setBufferData(info.buffer[property][0], new Float32Array(info.data[property]));
	}
}

function flushUniforms() { // WARNING: will switch programs so u gotta switch back
	var locs = buffers_d.shaderProgram.uniform;
	gl.useProgram(buffers_d.shaderProgram.compiled);
	gl.uniformMatrix4fv(locs.uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(locs.uProjectionMatrix, false, projectionMatrix);
	gl.uniformMatrix3fv(locs.uLightingInfo, false, lightingInfo);

	locs = buffers_d.objShader.uniform;
	gl.useProgram(buffers_d.objShader.compiled);
	gl.uniformMatrix4fv(locs.uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(locs.uProjectionMatrix, false, projectionMatrix);
	gl.uniformMatrix3fv(locs.uLightingInfo, false, lightingInfo);

	locs = buffers_d.overlayShader.uniform;
	gl.useProgram(buffers_d.overlayShader.compiled);
	gl.uniformMatrix4fv(locs.ubModelViewMatrix, false, bModelViewMatrix);
	gl.uniformMatrix4fv(locs.uProjectionMatrix, false, projectionMatrix);

	locs = buffers_d.transformShader.uniform;
	gl.useProgram(buffers_d.transformShader.compiled);
	gl.uniformMatrix4fv(locs.uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(locs.uProjectionMatrix, false, projectionMatrix);
	gl.uniformMatrix3fv(locs.uLightingInfo, false, lightingInfo);

	locs = buffers_d.billboardShader.uniform;
	gl.useProgram(buffers_d.billboardShader.compiled);
	gl.uniformMatrix4fv(locs.uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(locs.uProjectionMatrix, false, projectionMatrix);
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

function mList(list, n) {
	// multiply an array
	var res = [];
	for (let i=0; i<n; i++) {res=res.concat(list);}
	return res;
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
			data: { // TODO: autogenerate this
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
		},
		overlayShader: {
			vSource: textureBillboardVS,
			fSource: textureFS,
			compiled: false,
			buffer: {
				aBillboardPos: [],
				abTexCoord: [2, gl.FLOAT, false, 0, 0]
			},
			uniform: {},
			data: {
				aBillboardPos: [],
				abTexCoord: []
			}
		},
		transformShader: {
			vSource: lightColorTransfVS,
			fSource: fsSource,
			compiled: false,
			buffer: {
				aVertexPosition: [],
				aVertexNormal: [],
				aColor: [4, gl.FLOAT, false, 0, 0],
				aYRot: [1, gl.FLOAT, false, 0, 0],
				aTranslation: []
			},
			uniform: {},
			data: {
				aVertexPosition: [],
				aVertexNormal: [],
				aColor: [],
				aYRot: [],
				aTranslation: []
			}
		},
		billboardShader: {
			vSource: realBillboardVS,
			fSource: textureFS,
			compiled: false,
			buffer: {
				aCenterOffset: [],
				aCorner: [2, gl.FLOAT, false, 0, 0],
				aTexCoord: [2, gl.FLOAT, false, 0, 0]
			},
			uniform: {},
			data: {
				aCenterOffset: [],
				aCorner: [],
				aTexCoord: []
			}
		}
	};
	initShadersAndBuffers();
	try { // if you don't have a divisionOnLoad function or sth idk
		divisionOnLoad(gl);
	} catch (e) {}
}

function parseOBJ(text) { // credits to webglfundamentals.org for this code cuz im too small brain
						  // i should make my own sometime w/indexing tho
  // because indices are base 1 let's just fill in the 0th data
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];

  // same order as `f` indices
  const objVertexData = [
    objPositions,
    objTexcoords,
    objNormals,
  ];

  // same order as `f` indices
  let webglVertexData = [
    [],   // positions
    [],   // texcoords
    [],   // normals
  ];

  const materialLibs = [];
  const geometries = [];
  let geometry;
  let groups = ['default'];
  let material = 'default';
  let object = 'default';

  const noop = () => {};

  function newGeometry() {
    // If there is an existing geometry and it's
    // not empty then start a new one.
    if (geometry && geometry.data.position.length) {
      geometry = undefined;
    }
  }

  function setGeometry() {
    if (!geometry) {
      const position = [];
      const texcoord = [];
      const normal = [];
      webglVertexData = [
        position,
        texcoord,
        normal,
      ];
      geometry = {
        object,
        groups,
        material,
        data: {
          position,
          texcoord,
          normal,
        },
      };
      geometries.push(geometry);
    }
  }

  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }

  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat));
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      // should check for missing v and extra w?
      objTexcoords.push(parts.map(parseFloat));
    },
    f(parts) {
      setGeometry();
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
    s: noop,    // smoothing group
    mtllib(parts, unparsedArgs) {
      // the spec says there can be multiple filenames here
      // but many exist with spaces in a single filename
      materialLibs.push(unparsedArgs);
    },
    usemtl(parts, unparsedArgs) {
      material = unparsedArgs;
      newGeometry();
    },
    g(parts) {
      groups = parts;
      newGeometry();
    },
    o(parts, unparsedArgs) {
      object = unparsedArgs;
      newGeometry();
    },
  };

  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
      continue;
    }
    handler(parts, unparsedArgs);
  }

  // remove any arrays that have no entries.
  for (const geometry of geometries) {
    geometry.data = Object.fromEntries(
        Object.entries(geometry.data).filter(([, array]) => array.length > 0));
  }

  return {
    geometries,
    materialLibs,
  };
}

function request(url, callback) {
	var req = new XMLHttpRequest();
	req.open("GET", url);
	req.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {callback(this.responseText);}
	}
	req.send(null);
}

function parseMTL(text) { // I wrote this mtl parser myself but it kinda sux
	var ending = "\n"
	if (text.search("\r") != -1) { // for some reason i saved the mtls with CRLF?
																 // and the github and replit versions were LF?
		ending = "\r\n";
	}
	var splitd = text.split(ending);
	var materials = {};
	var currentMtl = null;
	var currentName = "cope";
	for (const line of splitd) { // I only load the diffuse and ambient color cuz COPE
		if (line.startsWith("Kd")) {
			var args = line.split(" ");
			currentMtl.diffuseColor = [parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3])];
		}
		else if (line.startsWith("Ka")) {
			var args = line.split(" ");
			currentMtl.ambientColor = [parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3])];
		}
		if (line.startsWith("newmtl")) {
			if (currentMtl) { // currentMtl is not null so push it into materials before resetting it
				materials[currentName] = currentMtl;
			}
			currentName = line.split(" ")[1];
			currentMtl = {};
		}
	}
	materials[currentName] = currentMtl; // for the last material
	return materials;
}
