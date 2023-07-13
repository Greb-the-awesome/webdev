// proudly created by Major League Game Development (i.e myself)

var TEXH = 2048, TEXW = 2048;
var blocks = [];
var player = new Player();
var canvas;
var dirtPatches = [];
var dirtOffset = 10000;

function vec3_avg(a, b, c, d) {return [(a[0]+b[0]+c[0]+d[0])/2, (a[1]+b[1]+c[1]+d[1])/2, (a[2]+b[2]+c[2]+d[2])/2];}
function vec3_cross(a, b) { console.log("received:"); console.log(a, b);
	var out = [0,0,0]; glMatrix.vec3.cross(out, a, b);
	glMatrix.vec3.normalize(out, out); return out;}
function ns2(a, b) {return noise.simplex2(a/10, b/10)}; // for easier typing

class Block {
    constructor(x, z) {
        // x and y are the center of the block
        this.x = x; this.z = z;
        var y = z; // cuz me dumb when ctrl c ctrl v
        this.pos1 = [x-0.5, noise.simplex2((x-0.5)/10, (y-0.5)/10), y-0.5];
        this.pos2 = [x+0.5, noise.simplex2((x+0.5)/10, (y-0.5)/10), y-0.5];
        this.pos3 = [x-0.5, noise.simplex2((x-0.5)/10, (y+0.5)/10), y+0.5];
        this.pos4 = [x+0.5, noise.simplex2((x+0.5)/10, (y+0.5)/10), y+0.5];
		for (var i=1; i<=4; i++) {
			var pos = this["pos"+i.toString()];
			console.log(ns2(pos[0]-0.5, pos[2]));
			const ep = 2;
			const mulfac = 0.7;
			const offset = -1;
			this["n"+i.toString()] = //vec3_avg(
				vec3_cross([-ep-offset, ns2(pos[0]-ep-offset, pos[2]-offset), -offset],
				[-offset, ns2(pos[0]-offset, pos[2]+ep-offset), ep-offset])
				//vec3_cross([-ep, ns2(pos[0]-ep, pos[2]), 0], [0, ns2(pos[0], pos[2]-ep), -ep]),
				//vec3_cross([ep, ns2(pos[0]+ep, pos[2]), 0], [0, ns2(pos[0], pos[2]+ep), ep]),
				//vec3_cross([ep, ns2(pos[0]+ep, pos[2]), 0], [0, ns2(pos[0], pos[2]-ep), -ep]),
			//);
			var temp = this["n"+i.toString()];
			/*temp = vec3_cross(
				[1, ns2(pos[0]+0.5, pos[2])-ns2(pos[0]-0.5, pos[2]), 0],
				[0, ns2(pos[0], pos[2]+0.5)-ns2(pos[0], pos[2]-0.5), 1]
			);*/
			temp[0] *= mulfac; temp[1] *= mulfac; temp[2] *= mulfac;
		}/*
		var texCoord2 = mList([0, py, px, py, 0, 0, px, py, 0, 0, px, 0], 4);
		for (var d of dirtPatches) {
			var dist = Math.sqrt((x-d[0])**2 + [y-d[1]]**2);
			if (dist < d[2]) {
				var offset = [x-d[0], y-d[1]];
				offset[0] /= d[2]; offset[1] /= d[2];
				offset[0] *= 512/TEXW; offset[1] *= 512/TEXH;
				var tx = 1/d[0] * 512/TEXW; var ty = 1/d[0] * 512/TEXH;
				tx += offset[0]; ty += offset[1];
				texCoord2 = mList([0, ty, tx, ty, 0, 0, tx, ty, 0, 0, tx, 0], 4);
				break;
			}
		}*/
		var px = 256/TEXW; var py = 256/TEXH;
		var dx = 1536/TEXW; var dy = 1536/TEXH;
        shaderAddData({
            "aVertexPosition": this.pos1.concat(this.pos2.concat(this.pos3.concat(this.pos2.concat(this.pos3.concat(this.pos4))))),
            "aVertexNormal": this.n1.concat(this.n2.concat(this.n3.concat(this.n2.concat(this.n3.concat(this.n4))))),
			// "aVertexNormal": mList([1], 36),
            "aTexCoord1": mList([0, py, px, py, 0, 0, px, py, 0, 0, px, 0], 4),
			"aTexCoord2": mList([dx, 1, 1, 1, dx, dy, 1, 1, dx, dy, 1, dy], 4),
			"aTexCoord3": mList([dx, 1, 1, 1, dx, dy, 1, 1, dx, dy, 1, dy], 4),
			"aTexCoord4": mList([0, py, px, py, 0, 0, px, py, 0, 0, px, 0], 4),
			"aMixFactor": mList([1, ns2(x+dirtOffset, y+dirtOffset), 1, 1], 6)
        }, "shaderProgram");
    }
} // ns2(x, y)/2+0.5

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
	const dist = 25;
	for (var i=0; i<Math.random()*5; i++) {
		dirtPatches.push([Math.random()*2*dist-dist, Math.random()*2*dist-dist, Math.random()*7.5]);
	}
    for (var x=-dist; x<dist; x++) {
        for (var y=-dist; y<dist; y++) {
            blocks.push(new Block(x, y));
        }
    }
    bindTexture(loadTexture("/static/zombiegame4/gltf/grass.png"), 0);
    flushUniforms();
    flush("shaderProgram");
	gl.enable(gl.DEPTH_TEST);
}

function startGame() {
	oCtx.fillText("Generating Terrain (and doing important stuff)", 100, 100);
    requestAnimationFrame(gameLoop);
    document.getElementById("homeDiv").style.display = "none";
	canvas.requestPointerLock();
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

function gameLoop(_t) {
    var dt;
    if (lastTime == -1) {dt = 0; lastTime = _t;} else {dt = _t - lastTime; lastTime = _t;}
    dt *= 0.1;
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
    glMatrix.vec3.scale(player.cameraFront, player.cameraFront, 1/playerSpeed/dt);
    var posPlusFront = glMatrix.vec3.create();
    glMatrix.vec3.add(posPlusFront, player.pos, player.cameraFront);
    glMatrix.mat4.lookAt(modelViewMatrix,
        player.pos,
        posPlusFront,
        glMatrix.vec3.fromValues(0, 1, 0));
    flushUniforms();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	oCtx.clearRect(0, 0, overlay.width, overlay.height);

    useShader("shaderProgram");
    gl.drawArrays(gl.TRIANGLES, 0, buffers_d.shaderProgram.data.aVertexPosition.length/3);
    
    requestAnimationFrame(gameLoop);
}