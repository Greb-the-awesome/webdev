var chunks, gl;
var debugDispNow = {"hi":"hi"};
var locations = {};

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
				this.blocks[[x, z]] = new Block("beans", // array is relative to world space
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

for (let x=0; x<5; x++) {
	for (let z=0; z<5; z++) {
		chunks[[x * 10, z * 10]] = new Chunk([x * 10, z * 10]);
	}
}

function startGame() {
	document.getElementById("homeDiv").style.display = "none";
	canvas.requestPointerLock();
	clearInterval(ambientHandle);
}
var alreadyHelped;
function gameHelp() {
	var h;
	if (!alreadyHelped) {
		h = document.getElementById('helpDiv');
		h.style.display = "block";
	}
	document.getElementById('homeDivInner').scroll({
		top: 1000,
		left: 0,
		behavior: "smooth"
	});
	alreadyHelped = true;
}

function pauseMenu() {

	if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
		var a = document.getElementById('pauseDiv');
		a.style.display = "none";
		console.log("lock on")
	} else {
		var a = document.getElementById('pauseDiv');
		a.style.display = "block";
		console.log("lock off")
	}
}

function divisionOnLoad(gl) {
	noise.seed(6969); // the funny number
	var values = Object.values(chunks);
	canvas.width = parseInt(
		document.defaultView.getComputedStyle(canvas, "wot do i put here").width.replace("px", ""), 10);
	canvas.height = parseInt(
		document.defaultView.getComputedStyle(canvas, "wot do i put here").height.replace("px", ""), 10);
	gl.viewport(0, 0, canvas.width, canvas.height);
	document.addEventListener("pointerlockchange", pauseMenu, false);

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
	locations["pointstart"] = positions.length/3;
	for (let x=-50; x<50; x++) {
		for (let z=-50; z<50; z++) {
			addPositions([x, noise.simplex2(x/15, z/15), z], [0.3, 0.3]);
		}
	}
	locations["pointlength"] = positions.length/3 - locations["pointstart"];
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
					   1.0, 0.0,]);
	// addPositions([-100, 0, -100,
	// 			  100, 0, -100,
	// 			  100, 0, 100,
	// 			  100, 0, 100,
	// 			  -100, 0, 100,
	// 			  -100, 0, -100],
	// 			  [0.99, 0.99,0.99, 0.99,0.99, 0.99,0.99, 0.99,0.99, 0.99,0.99, 0.99,])
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
	var disp = "";
	for (x in debugDispNow) {
		var toAdd = "" + x + ": " + debugDispNow[x] + "<br>";
		disp += toAdd;
	}
	document.getElementById("debugStuff").innerHTML = disp;
}


function onCameraTurn(e) {
	myPlayer.yaw   += e.movementX * 0.07;
	myPlayer.pitch -= e.movementY * 0.07;
	if (myPlayer.pitch > 89) { myPlayer.pitch = 89; }
	if (myPlayer.pitch < -89) { myPlayer.pitch = -89; }

	var front = glMatrix.vec3.create();
	front[0] = Math.cos(glMatrix.glMatrix.toRadian(myPlayer.yaw)) * Math.cos(glMatrix.glMatrix.toRadian(myPlayer.pitch));
	front[1] = Math.sin(glMatrix.glMatrix.toRadian(myPlayer.pitch));
	front[2] = Math.sin(glMatrix.glMatrix.toRadian(myPlayer.yaw)) * Math.cos(glMatrix.glMatrix.toRadian(myPlayer.pitch))
	glMatrix.vec3.normalize(myPlayer.cameraFront, front);
}

var ambientHandle;
function onLoad() {
	settings.useTexture = true;
	settings.textStart = [0.5, 0.46875];
	settings.charWidth = 0.03125;
	settings.numCharsPerBreak = 10;
	initGL("canvas");
	ambientHandle = setInterval(function() {
		onCameraTurn({"movementX": 1, "movementY": 0});
	}, 10);
}

window.onload = onLoad;

function perf(x) {
	var before = Date.now();
	for (let i=0; i<x; i++) {
		//myPlayer.updatePos(); // would-be next position
		debugDispNow["player pos"] = [myPlayer.hitPos[0].toFixed(2), myPlayer.hitPos[1].toFixed(2), myPlayer.hitPos[2].toFixed(2)];
		let chunkPos = [Math.floor((myPlayer.hitPos[0] - 0.5) / 10) * 10, Math.floor((myPlayer.hitPos[2] - 0.5) / 10) * 10]; // x, z
		debugDispNow["current chunk pos"] = chunkPos;
		let blockPos = [Math.floor(myPlayer.hitPos[0] - 0.5),
			Math.floor(myPlayer.hitPos[2] - 0.5)];
		debugDispNow["current block pos"] = blockPos;
		let currentBlock = chunks[chunkPos].blocks[blockPos];
		let offset = [myPlayer.cameraPos[0] - blockPos[0] - 0.5, myPlayer.cameraPos[2] - blockPos[1] - 0.5];
		debugDispNow["offset"] = [offset[0].toFixed(2), offset[1].toFixed(2)];
		var a;
		var distance2 = distance(offset[0], offset[1], 0, 1)/Math.SQRT2;
		var distance4 = distance(offset[0], offset[1], 1, 0)/Math.SQRT2;
		if (offset[0] + offset[1] > 1) {
			debugDispNow["current triangle"] = "upper";
			var distance3 = distance(offset[0], offset[1], 1, 1);
			debugDispNow["distances"] = [distance2, distance3, distance4];
			// myPlayer.hitPos[1] = (
			// 	currentBlock.pos2[1] * distance2 + currentBlock.pos3[1] * distance3 + currentBlock.pos4[1] * distance4);
		} else {
			debugDispNow["current triangle"] = "lower";
			var distance1 = distance(offset[0], offset[1], 0, 0);
			// myPlayer.hitPos[1] = (
			// 	currentBlock.pos2[1] * distance2 + currentBlock.pos1[1] * distance1 + currentBlock.pos4[1] * distance4);
		}
		glMatrix.vec3.add(myPlayer.cameraPos, myPlayer.hitPos, glMatrix.vec3.fromValues(0, 1.5, 0));
	}
	console.log(Date.now() - before);
	before = Date.now();
	for (let j=0; j<x; j++) {var a=noise.simplex2(x, 0);}
	console.log(Date.now() - before);
}
var pointTranslate = glMatrix.vec3.fromValues(0, 0, 0);
function loop() {
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
	if (divisDownKeys[16]) {
		myPlayer.userInputVelocity[0] *= 0.25;
		myPlayer.userInputVelocity[1] *= 0.25;
		myPlayer.userInputVelocity[2] *= 0.25;
	} else {
		myPlayer.userInputVelocity[0] *= 0.06;
		myPlayer.userInputVelocity[1] *= 0.06;
		myPlayer.userInputVelocity[2] *= 0.06;
	}
	if (divisDownKeys[38]) { pointTranslate[2] += 0.1; }
	if (divisDownKeys[40]) { pointTranslate[2] -= 0.1; }

	{ // collision detection :(
		// myPlayer.velocity[1] -= 0.005; // ONLY IF PLAYER IS IN AIR
		// get which chunk and block the playr is colliding with
		myPlayer.updatePos(); // would-be next position
		noise.seed(6969);
		//myPlayer.cameraPos[1] = -noise.simplex2((myPlayer.hitPos[0]+0.5)/15, (myPlayer.hitPos[2])/15+0.5) * 3;
		myPlayer.hitPos[1] = myPlayer.cameraPos[1] - 1.5;

		flush();
	}
	{ // yum yum render em up
		useShader(shaderProgram);
		gl.drawArrays(gl.TRIANGLES, 0, locations["pointstart"]);
		pushModelView();
		glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, pointTranslate);
		flushUniforms();
		gl.drawArrays(gl.POINTS, locations["pointstart"], locations["pointlength"]);
		popModelView();
		var posPlusFront = glMatrix.vec3.create();
		glMatrix.vec3.add(posPlusFront, myPlayer.cameraPos, myPlayer.cameraFront);
		glMatrix.mat4.lookAt(modelViewMatrix,
			myPlayer.cameraPos,
			posPlusFront,
			myPlayer.cameraUp);
		flushUniforms();
		// user-defined uniforms so flushUniforms() doesn't flush it
		gl.uniform3f(infoStuff.uniformLocations.cameraPos, myPlayer.cameraPos[0], myPlayer.cameraPos[1], myPlayer.cameraPos[2]);
		if (myPlayer.cameraPos[1] < 0) {
			gl.uniform4f(infoStuff.uniformLocations.fogColor, 0.0, 0.0, 1.0, 1.0);
		} else {
			gl.uniform4f(infoStuff.uniformLocations.fogColor, 0.529, 0.808, 0.921, 1.0);
		}
		useShader(particleShader);
		gl.drawArrays(gl.TRIANGLES, 0, particleCenterOffsets.length / 3);

		useShader(textShader);
		gl.uniform4f(infoStuff.uniformLocations.tFogColor, 0.529, 0.808, 0.921, 1.0);
		gl.drawArrays(gl.TRIANGLES, 0, textPositions.length / 2);

		useShader(billboardShader);
		gl.disable(gl.DEPTH_TEST);
		gl.drawArrays(gl.TRIANGLES, 0, billboardPositions.length / 3);
		gl.enable(gl.DEPTH_TEST);
	}
	debugDispNow["up"] = [myPlayer.cameraUp[0], myPlayer.cameraUp[1], myPlayer.cameraUp[2]];
}

window.setInterval(loop, 30);