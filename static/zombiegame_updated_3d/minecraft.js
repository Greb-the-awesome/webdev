// yes, I know the name of this file is minecraft.js.
// I was going to make minecraft but then I had another idea
// and I was too lazy to rename :/

var chunks, gl;
var debugDispNow = {"hi":"hi"};
var locations = {};
var bullets = [];
var zombies = [];
var oTex;
var useSound = true;
var skyColors = [ // each one lasts for around 1/8 of a day
[0.529, 0.807, 0.921], // sky blue: morning
[0.784, 0.976, 0.98], // a bit lighter: noon
[0.529, 0.807, 0.921], // sky blue: afternoon
[0.98, 0.513, 0.078], // orange: sunset
[0.337, 0.482, 0.749], // dusk
[0.086, 0.211, 0.439], // midnight
[0.337, 0.482, 0.749], // dawn
[0.968, 0.105, 0.278], // sunrise
[0.529, 0.807, 0.921] // morning again
]
var gameTime = 0;
var playerStats = {zombiesKilled: 0,};
console.log("main script loaded.");
var models = {};
function fakePerlin(x, y) {
	return [Math.sin((x + y) / 2)]
}
var normalRef = [null, ["pos2","pos4"], ["pos3","pos1"], ["pos4","pos2"], ["pos1","pos3"]];
class Block {
	constructor(what, pos1, pos2, pos3, pos4) {
		this.pos1 = pos1;
		this.pos2 = pos2;
		this.pos3 = pos3;
		this.pos4 = pos4;
		this.normals = [];
		for (let i=1; i<5; i++) { // start from 1 because this.pos[1,2,3,4] starts from 1
			var ref = normalRef[i];
			var vec1 = glMatrix.vec3.create();
			var vec2 = glMatrix.vec3.create();
			glMatrix.vec3.subtract(vec1, this[ref[0]], this["pos"+i]);
			glMatrix.vec3.subtract(vec2, this[ref[1]], this["pos"+i]);
			var n = glMatrix.vec3.create();
			glMatrix.vec3.cross(n, vec1, vec2);
			this.normals[i-1] = [n[0], n[1], n[2]];
		}
		this.what = what;
	}
}

class Chunk {
	constructor(coords) {
		this.blocks = {};
		this.depthMap = {};
		this.normals = [];
		for (let x=coords[0] - 0.5; x<coords[0] + 11.5; x++) {
			for (let z=coords[1] - 0.5; z<coords[1] + 11.5; z++) {
				this.depthMap[[x, z]] = getTerrain(x, z);
			}
		}
		var toAdd = [];
		for (let x=coords[0]; x<coords[0] + 10; x++) {
			for (let z=coords[1]; z<coords[1] + 10; z++) {
				this.blocks[[x, z]] = new Block("beanz",
					[x - 0.5, this.depthMap[[(x - 0.5), (z - 0.5)]], z - 0.5],
					[x - 0.5, this.depthMap[[(x - 0.5), (z + 0.5)]], z + 0.5],
					[x + 0.5, this.depthMap[[(x + 0.5), (z + 0.5)]], z + 0.5],
					[x + 0.5, this.depthMap[[(x + 0.5), (z - 0.5)]], z - 0.5]
				);
				this.normals = this.normals.concat([])
			}
		}
	}
}

class OtherPlayer {

}

let myPlayer = new MyPlayer();

chunks = {};
var gamestart = false;

function _aList(lst, x, y, z) {
	var res = JSON.parse(JSON.stringify(lst)); // copy it
	for (let i=0; i<lst.length; i+=3) {
		res[i] += x;
		res[i+1] += y;
		res[i+2] += z;
	}
	return res;
}

var a = new Audio("/static/radio.mp3");
var playerName;
function startGame() {
	document.getElementById("homeDiv").style.display = "none";
	canvas.requestPointerLock();
	clearInterval(ambientHandle);
	var n = document.getElementById("nameBox").value;
	playerName = n == ""?"Player":n; // if they didn't enter anything, just put "you"
	if (n == "jerry is hot") {
		creative = true; // enable flying
	}
}
var alreadyHelped;
var dead = false;
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
		console.log("lock on");
		if (gamestart) {mainHandle = setInterval(loop, 25);}
		gamestart = true;
	} else if (!dead) {
		var a = document.getElementById('pauseDiv');
		a.style.display = "block";
		console.log("lock off");
		if (gamestart) {clearInterval(mainHandle);}
	}
}

function toggleVolume() {
	useSound = !useSound;
	if (useSound) {document.getElementById('volumeButton').src = "/static/zombiegame_updated_3d/volume on.png";}
	else {document.getElementById('volumeButton').src = "/static/zombiegame_updated_3d/volume off.jpg";}
}

function getTerrain(x, z) {
	if (x > WORLDEND * 10 || x < WORLDSTART * 10 || z > WORLDEND * 10 || z < WORLDSTART * 10) { // out of bounds
		return -Infinity;
	}
	function clamp(val, low, high) {return Math.min(Math.max(val, low), high);}
	var multiplier = clamp((x/6)**2 + (z/6) **2, 0, 4);
	return (noise.simplex2(x/15, z/15)) * (noise.simplex2(x/40,z/40)) * multiplier + multiplier - 3;
}

function loadObj(url, mtlUrl, callback) {
	var res = {"position":[], "normal":[], "color": []};
	request(url, function(txt) { // jimmy rigged but it works
		var data = parseOBJ(txt);
		request(mtlUrl, function(mats) {
			var materials = parseMTL(mats);
			for (const geom of data.geometries) {
				res.position = res.position.concat(geom.data.position);
				res.normal = res.normal.concat(geom.data.normal);
				console.log(geom);
				console.log(materials);
				res.color = res.color.concat(
					mList(materials[geom.material].diffuseColor.concat([1.0]),geom.data.position.length/3))
				// we don't use any of the mtl specs except for the diffuse color cuz yeah
			}
			callback(res);
		});
	});
}

var assdfd;
var WORLDEND = 3;
var WORLDSTART = -3;
var worldwidth = (WORLDEND - WORLDSTART) * 10;
var overlay, oCtx;
var mouseDown = false;
function divisionOnLoad(gl) {
	noise.seed(6969); // the funny number
	// size the canvas
	canvas.width = parseInt(
		document.defaultView.getComputedStyle(canvas, "wot do i put here").width.replace("px", ""), 10);
	canvas.height = parseInt(
		document.defaultView.getComputedStyle(canvas, "wot do i put here").height.replace("px", ""), 10);
	gl.viewport(0, 0, canvas.width, canvas.height);

	overlay = document.getElementById("overlay");
	overlay.width = canvas.width;
	overlay.height = canvas.height;
	oCtx = overlay.getContext("2d");
	oCtx.fillStyle = "rgb(0, 255, 255)";
	oCtx.font = "30px Open Sans";

	document.addEventListener("pointerlockchange", pauseMenu, false);

	// terrain gen
	for (let x=WORLDSTART; x<WORLDEND; x++) {
		for (let z=WORLDSTART; z<WORLDEND; z++) {
			chunks[[x * 10, z * 10]] = new Chunk([x * 10, z * 10]);
		}
	}
	serializeChunks();
	genClouds();
	refreshBillbs();
	flush();
	loadModels();
	flushRealBillb();

	bindTexture(loadTexture("/static/zombiegame_updated_3d/grass.png"), 0);
	oTex = new Image();
	oTex.src = "/static/zombiegame_updated_3d/grass.png";

	// addPositions([-100, 0, -100,
	// 			  100, 0, -100,
	// 			  100, 0, 100,
	// 			  100, 0, 100,
	// 			  -100, 0, 100,
	// 			  -100, 0, -100],
	// 			  [0.99, 0.99,0.99, 0.99,0.99, 0.99,0.99, 0.99,0.99, 0.99,0.99, 0.99,]) // remember to include normals
	refreshBillbs(0);
	flush();
	window.gl = gl;
	//assdfd = new ParticleSystem([2.47-2.5, 1.23, 6.96-2.5], D_SQUARE_PLANE, 0, 0, [0.73, 0.746], 0.218);
	assdfd = new ParticleSystem([1.01-2.5, 1.75, -9.82-2.5], D_SQUARE_PLANE, 0, 0, [142/texW, 166/texH], 32/texW);
	canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
	overlay.onclick = function() {canvas.requestPointerLock();};
	document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;
	canvas.addEventListener("mousemove", onCameraTurn);
	canvas.addEventListener("mousedown", ()=>{mouseDown = true;});
	canvas.addEventListener("mouseup", ()=>{mouseDown = false;});
	canvas.addEventListener("wheel", e=>{
		if (e.deltaY > 0) {
			if (myPlayer.selected == 3) {myPlayer.selected = 0;} else {myPlayer.selected += 1;}
		}
		if (e.deltaY < 0) {
			if (myPlayer.selected == 0) {myPlayer.selected = 3;} else {myPlayer.selected -= 1;}
		}
	});
	createRenderBuffer(shaderProgram);
	setInterval(debugRefresh, 20);
	addTransformedPositions(cube, mList([1,1,1,1],cube.length/3), mList([0,1,0],cube.length/3), mList([10],cube.length/3), mList([0,10,0],cube.length/3));
	flushTransformedPositions();
}
var billbOffsets = [-2,-0.7,-2];


function debugRefresh() {
	var disp = "";
	for (x in debugDispNow) {
		var toAdd = "" + x + ": " + debugDispNow[x] + "<br>";
		disp += toAdd;
	}
	document.getElementById("debugStuff").innerHTML = disp;
}

function ded(reason) {
	window.clearInterval(mainHandle);
	oCtx.font = "40px Open Sans";
	oCtx.fillText("you died lmao", overlay.width * 0.3, overlay.height * 0.4);
	a.currentTime = 18;
	a.play();
	document.getElementById("deadDiv").style.display = "block";
	document.getElementById("deadReason").innerHTML = reason;
	dead = true;
}

function onCameraTurn(e) {
	myPlayer.yaw   += e.movementX * 0.1;
	myPlayer.pitch -= e.movementY * 0.1;
	if (myPlayer.pitch > 89) { myPlayer.pitch = 89; }
	if (myPlayer.pitch < -89) { myPlayer.pitch = -89; }

	var front = glMatrix.vec3.create();
	front[0] = Math.cos(glMatrix.glMatrix.toRadian(myPlayer.yaw)) * Math.cos(glMatrix.glMatrix.toRadian(myPlayer.pitch));
	front[1] = Math.sin(glMatrix.glMatrix.toRadian(myPlayer.pitch));
	front[2] = Math.sin(glMatrix.glMatrix.toRadian(myPlayer.yaw)) * Math.cos(glMatrix.glMatrix.toRadian(myPlayer.pitch))
	glMatrix.vec3.normalize(myPlayer.cameraFront, front);
}

function checkCollision(pos1, pos2, w1, w2) { // pos1 and pos2 are the CENTER of the objects
	var colliding = 0;
	for (let i=0; i<3; i++) {
		if (Math.abs(pos1[i] - pos2[i]) < (w1[i] + w2[i])/2) {colliding += 1;}
	}
	return colliding == 3;
}

var ambientHandle;
function onLoad() { // division 1.0 moments
	settings.useTexture = true;
	settings.textStart = [0.5, 0.46875];
	settings.charWidth = 0.03125;
	settings.numCharsPerBreak = 10;
	settings.useLighting = true; // useLighting true is not compatible with useTexture true just saying (cuz reasons)
	settings.lightDir = glMatrix.vec3.fromValues(0.85, 0.8, 0.75);
	settings.lightCol = glMatrix.vec3.fromValues(1, 1, 0.8);
	settings.ambientLight = glMatrix.vec3.fromValues(0.4, 0.4, 0.4);
	initGL("canvas");
	ambientHandle = setInterval(function() {
		onCameraTurn({"movementX": 1, "movementY": 0});
	}, 10);
}

window.onload = onLoad;
var buffer;
var frameSum = 0;
var numFrames = 0;
function dropItems(goodWeapon) {
	var eligible = []; // rarer weapons will be in this array less
	for (var weapon of weapons) {
		if (goodWeapon && weapon[1] > 4 && Math.floor(Math.random() * 3) == 0) { // goodWeapon gives rare weapons an advantage
			eligible.push(weapon[0]);
		}
		if (Math.floor(Math.random() * weapon[1]) == 0) {eligible.push(weapon[0]);}
	}
	return eligible[Math.floor(Math.random() * eligible.length)];
}
function getDifficulty(t) {
	return 0.5 / (2 * Math.abs(t - Math.floor(t + 0.5)) * Math.sqrt(t * 2));
}
function mix(a, b, amount) {
	return a * (1 - amount) + b * amount;
}
var DAYLENGTH = 3000; // divided by 40 = seconds
var COLORLENGTH = DAYLENGTH / 8; // the time each color lasts for
function loop() {
	var before = Date.now();
	gameTime += 1;
	var askPickUp = false;
	myPlayer.takingDamage = false;

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	oCtx.clearRect(0, 0, overlay.width, overlay.height);

	// color calcs
	var m = gameTime % DAYLENGTH;
	var dayNum = Math.floor(gameTime / DAYLENGTH);
	var amount = (m % COLORLENGTH) / COLORLENGTH;
	var ind = Math.floor(m/COLORLENGTH);
	debugDispNow["day number"] = dayNum;
	var color1 = skyColors[ind];
	var color2 = skyColors[ind+1];
	var c = [mix(color1[0], color2[0], amount), mix(color1[1], color2[1], amount), mix(color1[2], color2[2], amount)];
	gl.clearColor(c[0], c[1], c[2], 1.0);
	var adj = m - 1 * COLORLENGTH; // bc the sun position is a bit wank
	var sunPosition = [Math.sin(adj / DAYLENGTH * 2 * Math.PI) * 50, Math.cos(adj / DAYLENGTH * 2 * Math.PI) * 30, 0];


	if (mouseDown || divisDownKeys["KeyE"]) {myPlayer.shoot();}
	if(divisDownKeys["KeyA"]) { // a or <
		var crossed = glMatrix.vec3.create();
		var normalized = glMatrix.vec3.create();
		glMatrix.vec3.cross(crossed, myPlayer.cameraFront, myPlayer.cameraUp);
		glMatrix.vec3.normalize(normalized, crossed);
		glMatrix.vec3.subtract(myPlayer.userInputVelocity,
			myPlayer.userInputVelocity,
			normalized);
	}
	if(divisDownKeys["KeyD"]) { // d or >
		var crossed = glMatrix.vec3.create();
		var normalized = glMatrix.vec3.create();
		glMatrix.vec3.cross(crossed, myPlayer.cameraFront, myPlayer.cameraUp);
		glMatrix.vec3.normalize(normalized, crossed);
		glMatrix.vec3.add(myPlayer.userInputVelocity,
			myPlayer.userInputVelocity,
			normalized);
	}
	if(divisDownKeys["KeyW"]) { // w or ^
		glMatrix.vec3.add(myPlayer.userInputVelocity,
			myPlayer.cameraFront,
			myPlayer.userInputVelocity);
	}
	if(divisDownKeys["KeyS"]) { // s or down
		glMatrix.vec3.subtract(myPlayer.userInputVelocity,
			myPlayer.userInputVelocity,
			myPlayer.cameraFront,);
	}
	if (divisDownKeys["Space"] && !myPlayer.inAir) {
		myPlayer.velocity[1] = 0.25;
		myPlayer.inAir = true;
	}
	if (divisDownKeys["ShiftLeft"] && myPlayer.stamina > 60) {
		myPlayer.userInputVelocity[0] *= 0.25;
		myPlayer.userInputVelocity[2] *= 0.25;
	} else if (myPlayer.stamina > 40) {
		myPlayer.userInputVelocity[0] *= 0.15;
		myPlayer.userInputVelocity[2] *= 0.15;
	} else { // stamina rlly low
		myPlayer.userInputVelocity[0] *= 0.08;
		myPlayer.userInputVelocity[2] *= 0.08;
	}
	myPlayer.velocity[0] *= 0.9;
	myPlayer.velocity[2] *= 0.9;
	myPlayer.userInputVelocity[1] = 0;
	processArrowKeys();

	physicsUpdate();
	var buffer = getRBdata(0, shaderProgram);
	{ // game thingies
		bulletsUpdate(buffer, dayNum);
		askPickUp = itemsUpdate();
		zombiesUpdate();
		// sun
		buffer.vertexPosition[1] = buffer.vertexPosition[1].concat(sunPosition);
		buffer.vertexTexCoord[1] = buffer.vertexTexCoord[1].concat([231/texW, 250/texH]);
		spawnStuff(m);
		if (myPlayer.health < 0) { // oof
			if (zombies.length > 5) {
				ded(playerName + " was swarmed by a bunch of zombies. rip " + playerName + ".");
			} else if (myPlayer.reloading) {
				ded(playerName + " was assasinated by a zombie while reloading.");
			} else {
				ded(playerName + " was slain by zombies. LLLL");
			}
		}
		debugDispNow["health"] = myPlayer.health;

		// flush
		flushBuffers();
	}
	{ // yum yum render em up
		var posPlusFront = glMatrix.vec3.create();
		glMatrix.vec3.add(posPlusFront, myPlayer.cameraPos, myPlayer.cameraFront);
		glMatrix.mat4.lookAt(modelViewMatrix,
			myPlayer.cameraPos,
			posPlusFront,
			myPlayer.cameraUp);
		settings.lightCol = glMatrix.vec3.fromValues(...c);
		flushUniforms();

		useShader(realBillboardShader);
		gl.drawArrays(gl.TRIANGLES, 0, realBillboardData.corner.length/2);

		gl.useProgram(shaderProgram);
		useRenderBuffer(0, shaderProgram);
		gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexPosition[1].length/3 - 1);
		gl.uniform4f(infoStuff.uniformLocations.fogColor, 1.0, 1.0, 0.0, 1.0);
		gl.drawArrays(gl.POINTS, buffer.vertexPosition[1].length/3 - 1, 1);
		gl.uniform4f(infoStuff.uniformLocations.fogColor, c[0], c[1], c[2], 1.0);

		useShader(shaderProgram); // switch to the main renderbuffer
		gl.drawArrays(gl.TRIANGLES, 0, positions.length/3);
		// user-defined uniforms so flushUniforms() doesn't flush it
		gl.uniform3f(infoStuff.uniformLocations.cameraPos, myPlayer.cameraPos[0], myPlayer.cameraPos[1], myPlayer.cameraPos[2]);


		useShader(textShader);
		gl.uniform4f(infoStuff.uniformLocations.tFogColor, 0.529, 0.808, 0.921, 1.0);
		gl.drawArrays(gl.TRIANGLES, 0, textPositions.length / 2);

		useShader(objShader);
		gl.drawArrays(gl.TRIANGLES, 0, objInfos.position.length/3);
		settings.ambientLight = glMatrix.vec3.fromValues(0.4, 0.4, 0.4);
		debugDispNow["player pos"] = [...myPlayer.cameraPos];

		useShader(particleShader);
		assdfd.render();
		//assdfd2.render();

		useShader(transformShader);
		gl.drawArrays(gl.TRIANGLES, 0, transformInfos.position.length / 3);

		gl.disable(gl.DEPTH_TEST);
		useShader(billboardShader);
		gl.drawArrays(gl.TRIANGLES, 0, billboardPositions.length / 3);
		gl.enable(gl.DEPTH_TEST);

		renderGUI(askPickUp, dayNum);
	}
	frameSum += Date.now() - before;
	numFrames += 1;
}

window.setInterval(function() {
	debugDispNow["avg frame time"] = frameSum / numFrames;
	frameSum = 0;
	numFrames = 0;
}, 500);

mainHandle = window.setInterval(loop, 25);
