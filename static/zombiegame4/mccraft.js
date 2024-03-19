// proudly created by Major League Game Development (i.e myself)

var TEXH = 2048, TEXW = 2048;
var blocks = [];
var player = new Player();
var canvas;
var dirtPatches = [];
var dirtOffset = 10000;
var normalRef = [null, ["pos3","pos2"], ["pos1","pos4"], ["pos4","pos1"], ["pos2","pos3"]];
var debugDispNow = {"hitboxes shown": false};
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
];

function vec3_avg(a, b, c, d) {return [(a[0]+b[0]+c[0]+d[0])/2, (a[1]+b[1]+c[1]+d[1])/2, (a[2]+b[2]+c[2]+d[2])/2];}
function vec3_cross(a, b) {
	var out = [0,0,0]; glMatrix.vec3.cross(out, a, b);
	glMatrix.vec3.normalize(out, out); return out;}
function ns2(a, b) {return noise.simplex2(a/10, b/10)}; // for easier typing

function debugUpdate() {
	document.getElementById("debugStuff").innerHTML = JSON.stringify(debugDispNow);
}
setInterval(debugUpdate, 20);
 // ns2(x, y)/2+0.5

window.onload = function() {
    noise.seed(6969);
    initGL("canvas");
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
	oCtx.fillStyle = "rgb(0, 0, 0)";
	oCtx.font = "190px Open Sans";

    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
	overlay.onclick = function() {canvas.requestPointerLock();};
	document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;
	canvas.addEventListener("mousemove", onCameraTurn);
	canvas.addEventListener("mousedown", ()=>{mouseDown = true;});
	canvas.addEventListener("mouseup", ()=>{mouseDown = false;});
	canvas.addEventListener("wheel", e=>{
		if (e.deltaY > 0) {
			if (player.selected == 3) {player.selected = 0;}
			else if (player.inv[player.selected + 1]) {player.selected += 1;}
		}
		if (e.deltaY < 0) {
			if (player.selected == 0) {player.selected = 3;}
			else if (player.inv[player.selected - 1]) {player.selected -= 1;}
		}
	});
	const dist = 10;
	for (var i=0; i<Math.random()*5; i++) {
		dirtPatches.push([Math.random()*2*dist-dist, Math.random()*2*dist-dist, Math.random()*7.5]);
	}
    for (var x=-dist; x<dist; x++) {
        for (var y=-dist; y<dist; y++) {
            blocks.push(new Block(x, y));
        }
    }
	new BlanketObject(ns2, -Infinity, Infinity, -Infinity, Infinity);
    bindTexture(loadTexture("/static/zombiegame4/gltf/grass.png"), 0);
    flushUniforms();
	flush("billboardShader");
    flush("shaderProgram");
	gl.enable(gl.DEPTH_TEST);
}

function startGame() {
	oCtx.fillText("Generating Terrain (and doing important stuff)", 100, 100);
    requestAnimationFrame(gameLoop);
    document.getElementById("homeDiv").style.display = "none";
	canvas.requestPointerLock();
}

function physicsUpdate(dt) {
	for (var blanket of blanketObjects) {
		for (var po of physicsObjects) {
			po.vel[1] -= PhysicsObject.GlobalGravity * dt;
			if (!po.kinematic) {
				po.pos[0] += po.vel[0] * dt; po.pos[1] += po.vel[1] * dt; po.pos[2] += po.vel[2] * dt;
			}
			var res = BlanketObject.checkCollideAABB(blanket, po);
			if (res.colliding) {
				if (!po.kinematic) {po.pos = res.suggestedPos};
				po.vel[1] = 0;
			}
		}
	}
	for (var i=0; i<physicsObjects.length; i++) {
		for (var j=i+1; j<physicsObjects.length; j++) {
			if (physicsObjects[i] && physicsObjects[j])
				PhysicsObject.checkCollideAABB(physicsObjects[i], physicsObjects[j]);
		}
	}
}

function onCameraTurn(e) {
	player.yaw   += e.movementX * 0.1;
	player.pitch -= e.movementY * 0.1;
	if (player.pitch > 89) { player.pitch = 89; }
	if (player.pitch < -89) { player.pitch = -89; }

	var front = glMatrix.vec3.create();
	front[0] = Math.cos(glMatrix.glMatrix.toRadian(player.yaw)) * Math.cos(glMatrix.glMatrix.toRadian(player.pitch));
	front[1] = Math.sin(glMatrix.glMatrix.toRadian(player.pitch));
	front[2] = Math.sin(glMatrix.glMatrix.toRadian(player.yaw)) * Math.cos(glMatrix.glMatrix.toRadian(player.pitch))
	glMatrix.vec3.normalize(player.cameraFront, front);
}
var lastTime = -1;
var DAYLENGTH = 30000;
var COLORLENGTH = DAYLENGTH/8;
function mix(a, b, amount) {
	return a * (1 - amount) + b * amount;
}

function gameLoop(_t) {
	// color calcs
	var m = _t % DAYLENGTH;
	var dayNum = Math.floor(_t / DAYLENGTH);
	var amount = (m % COLORLENGTH) / COLORLENGTH;
	var ind = Math.floor(m/COLORLENGTH);
	debugDispNow["day number"] = dayNum;
	var color1 = skyColors[ind];
	var color2 = skyColors[ind+1];
	c = [mix(color1[0], color2[0], amount), mix(color1[1], color2[1], amount), mix(color1[2], color2[2], amount)];
	gl.clearColor(c[0], c[1], c[2], 1.0);
	var adj = m - 1 * COLORLENGTH; // bc the sun position is a bit wank
	var sunPosition = [Math.sin(adj / DAYLENGTH * 2 * Math.PI) * 50, Math.cos(adj / DAYLENGTH * 2 * Math.PI) * 30, 0];
	lightingInfo[3] = c[0]; lightingInfo[4] = c[1]; lightingInfo[5] = c[2];
	var normalizedSunPosition = glMatrix.vec3.create();
	glMatrix.vec3.normalize(normalizedSunPosition, sunPosition);
	glMatrix.vec3.multiply(normalizedSunPosition, normalizedSunPosition, [1.3, 1.3, 1.3]);
	lightingInfo[0] = normalizedSunPosition[0]; lightingInfo[1] = normalizedSunPosition[1]; lightingInfo[2] = normalizedSunPosition[2];

	oCtx.clearRect(0, 0, overlay.width, overlay.height);
	// player.pos[1] = ns2(player.pos[0], player.pos[2])+2;
	debugDispNow["player pos"] = player.pos;
    var dt;
    if (lastTime == -1) {dt = 0; lastTime = _t;} else {dt = _t - lastTime; lastTime = _t;}
	dt = Math.min(dt, 70);
    dt *= 0.1;
	d_cameraPos[0] = player.pos[0]; d_cameraPos[1] = player.pos[1]; d_cameraPos[2] = player.pos[2];
	var playerSpeed = 0.1;
	if (divisDownKeys["Shift"]) {playerSpeed = 1000;}
    glMatrix.vec3.scale(player.cameraFront, player.cameraFront, playerSpeed * dt);
    if(divisDownKeys["KeyA"]) { // a or <
		var crossed = glMatrix.vec3.create();
		var normalized = glMatrix.vec3.create();
		glMatrix.vec3.cross(crossed, player.cameraFront, player.cameraUp);
		glMatrix.vec3.normalize(normalized, crossed);
        glMatrix.vec3.scale(normalized, normalized, playerSpeed * dt);
		glMatrix.vec3.subtract(player.pos,
			player.pos,
			normalized);
	}
	if(divisDownKeys["KeyD"]) { // d or >
		var crossed = glMatrix.vec3.create();
		var normalized = glMatrix.vec3.create();
		glMatrix.vec3.cross(crossed, player.cameraFront, player.cameraUp);
		glMatrix.vec3.normalize(normalized, crossed);
        glMatrix.vec3.scale(normalized, normalized, playerSpeed * dt);
		glMatrix.vec3.add(player.pos,
			player.pos,
			normalized);
	}
	if(divisDownKeys["KeyW"]) { // w or ^
		glMatrix.vec3.add(player.pos,
			player.cameraFront,
			player.pos);
	}
	if(divisDownKeys["KeyS"]) { // s or down
		glMatrix.vec3.subtract(player.pos,
			player.pos,
			player.cameraFront,);
	}
	if (divisDownKeys["Space"]) {
		player.vel[1] += dt * player.jumpPower;
	}
    glMatrix.vec3.scale(player.cameraFront, player.cameraFront, 1/playerSpeed/dt);
    var posPlusFront = glMatrix.vec3.create();
    glMatrix.vec3.add(posPlusFront, player.pos, player.cameraFront);
    glMatrix.mat4.lookAt(modelViewMatrix,
        player.pos,
        posPlusFront,
        glMatrix.vec3.fromValues(0, 1, 0));
	physicsUpdate(dt);
	
    flushUniforms();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    useShader("shaderProgram");
    gl.drawArrays(gl.TRIANGLES, 0, buffers_d.shaderProgram.data.aVertexPosition.length/3);

	useShader("billboardShader");
	gl.drawArrays(gl.TRIANGLES, 0, buffers_d.billboardShader.data.aCenterOffset.length/3);
	gl.uniform1f(buffers_d.billboardShader.uniform.uAlphaAdj, 0.999);

	if (debugDispNow["hitboxes shown"]) {
		for (var i=1; i<physicsObjects.length; i++) {
			physicsObjects[i].drawBox(!physicsObjects[i].kinematic?[0,1,0,1]:[1,0,0,1]);
		}
	}

    requestAnimationFrame(gameLoop);
}