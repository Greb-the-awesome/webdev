var chunks, gl;
var cameraPos = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
var cameraPointTo = glMatrix.vec3.fromValues(0.0, 0.0, 1.0);
var cameraAngle = [1.5, 1.5];

function fakePerlin(x, y) {
	return [Math.sin((x + y) / 2)]
}



class Block {
	constructor(what, pos1, pos2, pos3, pos4) {
		this.what = what;
		this.pos1 = pos1;
		this.pos2 = pos2;
		this.pos3 = pos3;
		this.pos4 = pos4;
		this.differences = [
			this.pos1[1] - this.pos2[1],
			this.pos1[1] - this.pos3[1],
			this.pos1[1] - this.pos4[1],
			this.pos2[1] - this.pos3[1],
			this.pos2[1] - this.pos4[1],
			this.pos3[1] - this.pos4[1]
		];
		this.diffSum = 0;
		for (let i=0; i<this.differences.length; i++) {
			this.diffSum += Math.abs(this.differences[i]);
		}
		this.lightness = this.diffSum / 6;
		this.differences = false; // save on memory
	}
}

class Chunk {
	constructor(coords) {
		this.blocks = [];
		this.depthMap = {};
		// create a depth map
		for (var x=coords[0] - 0.5; x<11 + coords[0] + 0.5; x++) {
			for (var z=coords[1] - 0.5; z<11 + coords[1] + 0.5; z++) {
				this.depthMap[[x, z]] = noise.simplex2(x / 5, z / 5);
			}
		}
		for (var x=coords[0]; x<10 + coords[0]; x++) {
			for (var z=coords[1]; z<10 + coords[1]; z++) {
				this.blocks.push(new Block("a",
					[x - 0.5, this.depthMap[[(x - 0.5), (z - 0.5)]], z - 0.5],
					[x - 0.5, this.depthMap[[(x - 0.5), (z + 0.5)]], z + 0.5],
					[x + 0.5, this.depthMap[[(x + 0.5), (z + 0.5)]], z + 0.5],
					[x + 0.5, this.depthMap[[(x + 0.5), (z - 0.5)]], z - 0.5]
				));
			}
		}
	}
}

chunks = [];

for (let x=0; x<5; x++) {
	for (let z=0; z<5; z++) {
		chunks.push(new Chunk([x, z]));
	}
}

function divisionOnLoad(gl) {
	noise.seed(6969); // the funny number

	for (let c=0; c<chunks.length; c++) {
		var chunk = chunks[c];
		var chunkBlocks = chunk.blocks;
		for (let b=0; b<chunkBlocks.length; b++) {
			var block = chunkBlocks[b];
			var triang1 = block.pos1.concat(block.pos2.concat(block.pos3));
			var triang2 = block.pos3.concat(block.pos4.concat(block.pos1));
			addPositions(triang1.concat(triang2),
			   [0.0, 1 - block.lightness, 0.0, 1.0,
				0.0, 1 - block.lightness, 0.0, 1.0,
				0.0, 1 - block.lightness, 0.0, 1.0,
				0.0, 1 - block.lightness, 0.0, 1.0,
				0.0, 1 - block.lightness, 0.0, 1.0,
				0.0, 1 - block.lightness, 0.0, 1.0,]);
		}
	}
	window.addEventListener("mousemove", onMouseMove);
	flush();
	window.gl = gl;window.gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);
	document.divisRequestPointerLock();
}

function onMouseMove(e) {
	var x = e.offsetX * 0.00002;
	var y = e.offsetY * 0.00002;
	cameraAngle[0] += x;
	cameraAngle[1] += y;

}

function loop() {
	// wasd
	if(divisDownKeys[65] || divisDownKeys[37]) { // a or <
		cameraPos[2] += 0.1;
	}
	if(divisDownKeys[68] || divisDownKeys[39]) { // d or >
		cameraPos[2] -= 0.1;
	}
	if(divisDownKeys[87] || divisDownKeys[38]) { // w or ^
		cameraPos[0] -= 0.1;
	}
	if(divisDownKeys[83] || divisDownKeys[40]) { // s or down
		cameraPos[0] += 0.1;
	}


	window.gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);
	glMatrix.mat4.lookAt(modelViewMatrix,
		cameraPos,
		cameraPointTo,
		glMatrix.vec3.fromValues(0.0, 1.0, 0.0));
	flushUniforms();
}

window.setInterval(loop, 10);