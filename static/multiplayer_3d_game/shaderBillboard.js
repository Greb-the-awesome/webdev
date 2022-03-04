const billboardVS = `
attribute vec4 aBillboardPos;
uniform mat4 uProjectionMatrix;
varying lowp vec4 vColor;

void main() {
	gl_Position = aBillboardPos * uProjectionMatrix;
	vColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`


var billboardShader;
function iHateVariableScopes(a)
{
	window.gl = a;
	const vertexShader = loadShader(gl.VERTEX_SHADER, billboardVS);
	const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
	billboardShader = gl.createProgram();
	console.log(gl)
	gl.attachShader(billboardShader, vertexShader);
	gl.attachShader(billboardShader, fragmentShader);
	gl.linkProgram(billboardShader);
	if (!gl.getProgramParameter(billboardShader, gl.LINK_STATUS)) {
		alert('billboard shaders failed lmao bc ' + gl.getProgramInfoLog(billboardShader));
	}


	infoStuff.attribLocations.billboardPosition = gl.getAttribLocation(billboardShader, "aBillboardPos");
	buffers.billboardPositions = gl.createBuffer();
	const numComponents = 4;
	const type = window.gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.billboardPositions);
	gl.vertexAttribPointer(
		gl.getAttribLocation(billboardShader, "aBillboardPos"),
		numComponents,
		type,
		normalize,
		stride,
		offset);
	// gl.enableVertexAttribArray(
	// 	infoStuff.attribLocations.billboardPosition);

	// var billboardPositions = [0.0, 0.0, 1.0,
	// 						  1.0, 0.0, 1.0,
	// 						  0.0, 1.0, 1.0,];
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(billboardPositions), gl.STATIC_DRAW);
}