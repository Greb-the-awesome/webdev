var chunks, gl;
var debugDispNow = {"hi":"hi"};

function fakePerlin(x, y) {
	return [Math.sin((x + y) / 2)]
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}

class Block {
	constructor(what, pos1, pos2, pos3, pos4) {
		this.what = what;
		this.pos1 = pos1;
		this.pos2 = pos2;
		this.pos3 = pos3;
		this.pos4 = pos4; /*
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
		*/
	}
}

class Chunk {
	constructor(coords) {
		this.blocks = {};
		this.depthMap = {};
		this.coords = coords;
		// create a depth map
		for (var x=coords[0] - 0.5; x<11 + coords[0] + 0.5; x++) {
			for (var z=coords[1] - 0.5; z<11 + coords[1] + 0.5; z++) {
				this.depthMap[[x, z]] = noise.simplex2(x / 15, z / 15) * 3;
			}
		}
		for (var x=coords[0]; x<10 + coords[0]; x++) {
			for (var z=coords[1]; z<10 + coords[1]; z++) {
				this.blocks[[x, z]] = new Block("a", // array is relative to world space
					[x - 0.5, this.depthMap[[(x - 0.5), (z - 0.5)]], z - 0.5],
					[x - 0.5, this.depthMap[[(x - 0.5), (z + 0.5)]], z + 0.5],
					[x + 0.5, this.depthMap[[(x + 0.5), (z + 0.5)]], z + 0.5],
					[x + 0.5, this.depthMap[[(x + 0.5), (z - 0.5)]], z - 0.5]
				);
			}
		}
	}
}

class OtherPlayer {

}
class MyPlayer {
	constructor() {
		// thanks to learnOpenGL.com for these values cos dumb at linear algebra :D
		this.cameraPos = glMatrix.vec3.fromValues(0.0, 1.6, 0.0);
		this.hitPos = glMatrix.vec3.fromValues(0.0, 0.1, 0.0);
		this.cameraPointTo = glMatrix.vec3.fromValues(0.0, 1.6, 1.0);
		this.cameraFront = glMatrix.vec3.fromValues(0.0, 0.0, -1.0);
		this.cameraUp = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
		this.yaw = -90.0;
		this.pitch = 0.0;

		this.velocity = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
		this.userInputVelocity = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);

		this.acceleration = 0.000000002; // + 0.02 per frame
	}
	updatePos() {
		glMatrix.vec3.add(this.cameraPos, this.cameraPos, this.velocity);
		glMatrix.vec3.add(this.cameraPos, this.cameraPos, this.userInputVelocity);
		glMatrix.vec3.add(this.hitPos, this.hitPos, this.velocity);
		glMatrix.vec3.add(this.hitPos, this.hitPos, this.userInputVelocity);
	}
}

let myPlayer = new MyPlayer();

chunks = {};

for (let x=-3; x<3; x++) {
	for (let z=-3; z<3; z++) {
		chunks[[x * 10, z * 10]] = new Chunk([x * 10, z * 10]);
	}
}

function divisionOnLoad(gl) {
	noise.seed(6969); // the funny number
	var values = Object.values(chunks);

	for (let c=0; c<values.length; c++) {
		var chunk = values[c];
		var chunkBlocks = chunk.blocks;
		for (const blockPos in chunkBlocks) {
			var block = chunkBlocks[blockPos];
			var triang1 = block.pos1.concat(block.pos2.concat(block.pos3));
			var triang2 = block.pos3.concat(block.pos4.concat(block.pos1));
			addPositions(triang1.concat(triang2),
			   [0.0, 0.5,
			    0.0, 0.0,
			    0.5, 0.0,
			    0.5, 0.0,
			    0.5, 0.5,
			    0.0, 0.5]);
		}
	}
	translateModelView(0.0, 0.0, -3.0);
	addBillbPositions([-0.1, 0.1, -6.0,
					   0.1, -0.1, -6.0,
					   0.1, 0.1, -6.0,
					   -0.1, -0.1, -6.0,
					   -0.1, 0.1, -6.0,
					   0.1, -0.1, -6.0,],
					   [0.5, 0.5,
					    1.0, 0.0,
					   1.0, 0.5,
					   0.5, 0.0,
					   0.5, 0.5,
					   1.0, 0.0,])
	flush();
	window.gl = gl;
	canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
	canvas.onclick = function() {canvas.requestPointerLock();};
	document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;
	canvas.addEventListener("mousemove", onCameraTurn);
	//window.addEventListener("keyup", brake);
	setInterval(debugRefresh, 10);
}

function debugRefresh() {
	document.getElementById("debugStuff").innerHTML = JSON.stringify(debugDispNow, null, 2);
}


function onCameraTurn(e) {
	myPlayer.yaw   += e.movementX * 0.07;
	myPlayer.pitch -= e.movementY * 0.07;

	var front = glMatrix.vec3.create();
	front[0] = Math.cos(glMatrix.glMatrix.toRadian(myPlayer.yaw)) * Math.cos(glMatrix.glMatrix.toRadian(myPlayer.pitch));
	front[1] = Math.sin(glMatrix.glMatrix.toRadian(myPlayer.pitch));
	front[2] = Math.sin(glMatrix.glMatrix.toRadian(myPlayer.yaw)) * Math.cos(glMatrix.glMatrix.toRadian(myPlayer.pitch))
	glMatrix.vec3.normalize(myPlayer.cameraFront, front);
}

function loop() {
	gl.useProgram(shaderProgram);
	// wasd
	// var playerVelXZ = Math.sqrt(myPlayer.userInputVelocity[0]**2 + myPlayer.userInputVelocity[2]**2);
	// var tooFast = playerVelXZ > 0.02;
	if(divisDownKeys[65]) { // a or <
		var crossed = glMatrix.vec3.create();
		var normalized = glMatrix.vec3.create();
		glMatrix.vec3.cross(crossed, myPlayer.cameraFront, myPlayer.cameraUp);
		glMatrix.vec3.normalize(normalized, crossed);
		glMatrix.vec3.subtract(myPlayer.userInputVelocity,
			myPlayer.userInputVelocity,
			normalized);
	}
	if(divisDownKeys[68]) { // d or >
		var crossed = glMatrix.vec3.create();
		var normalized = glMatrix.vec3.create();
		glMatrix.vec3.cross(crossed, myPlayer.cameraFront, myPlayer.cameraUp);
		glMatrix.vec3.normalize(normalized, crossed);
		glMatrix.vec3.add(myPlayer.userInputVelocity,
			myPlayer.userInputVelocity,
			normalized);
	}
	if(divisDownKeys[87]) { // w or ^
		glMatrix.vec3.add(myPlayer.userInputVelocity,
			myPlayer.cameraFront,
			myPlayer.userInputVelocity);
	}
	if(divisDownKeys[83]) { // s or down
		glMatrix.vec3.subtract(myPlayer.userInputVelocity,
			myPlayer.userInputVelocity,
			myPlayer.cameraFront,);
	}
	myPlayer.userInputVelocity[0] *= 0.1;
	myPlayer.userInputVelocity[1] *= 0.1;
	myPlayer.userInputVelocity[2] *= 0.1;

	{ // collision detection :(
		// myPlayer.velocity[1] -= 0.005; // ONLY IF PLAYER IS IN AIR
		// get which chunk and block the playr is colliding with
		myPlayer.updatePos(); // would-be next position
		let chunkPos = [Math.floor(myPlayer.hitPos[0] / 10) * 10, Math.floor(myPlayer.hitPos[2] / 10) * 10]; // x, z
		debugDispNow["current chunk pos"] = chunkPos;
		let blockPos = [Math.floor(myPlayer.hitPos[0]),
			Math.floor(myPlayer.hitPos[2])];
		debugDispNow["current block pos"] = blockPos;
		let currentBlock = chunks[chunkPos].blocks[blockPos];
		let offset = [myPlayer.cameraPos[0] - blockPos[0], myPlayer.cameraPos[2] - blockPos[1]];
		var a;
		if (offset[0] + offset[1] > 1) {
			debugDispNow["current triangle"] = "upper";
		} else {debugDispNow["current triangle"] = "lower";}
		// positions[64800] = myPlayer.cameraPos[0];positions[64801] = 0.0;positions[64802] = myPlayer.cameraPos[2];
		// colors[86400] = 1.0;colors[86401] = 0.0;colors[86402] = 0.0;colors[86403] = 1.0;

		// positions[64803] = myPlayer.cameraPos[0]+0.1;positions[64804] = 0.0;positions[64805] = myPlayer.cameraPos[2]+0.1;
		// colors[86404] = 0.0;colors[86405] = 0.0;colors[86406] = 0.0;colors[86407] = 1.0;

		// positions[64806] = myPlayer.cameraPos[0];positions[64807] = 0.0;positions[64808] = myPlayer.cameraPos[2]+0.1;
		// colors[86408] = 0.0;colors[86409] = 0.0;colors[86410] = 0.0;colors[86411] = 1.0;

		// let distance1 = distance()
		flush();
	}
	gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);
	var posPlusFront = glMatrix.vec3.create();
	glMatrix.vec3.add(posPlusFront, myPlayer.cameraPos, myPlayer.cameraFront);
	glMatrix.mat4.lookAt(modelViewMatrix,
		myPlayer.cameraPos,
		posPlusFront,
		myPlayer.cameraUp);
	flushUniforms();

	gl.useProgram(billboardShader);
	gl.disable(gl.DEPTH_TEST);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	gl.enable(gl.DEPTH_TEST)
}

window.setInterval(loop, 25);