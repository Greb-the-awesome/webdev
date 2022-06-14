console.log("classes.js loaded.");
var bullets = [];

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
	shoot() {
		var distanceFromPlayer = 2;
		var bulletPos = glMatrix.vec3.create();
		var multipliedFront = glMatrix.vec3.fromValues(
			this.cameraFront[0]*distanceFromPlayer, this.cameraFront[1]*distanceFromPlayer, this.cameraFront[2]*distanceFromPlayer);
		glMatrix.vec3.add(bulletPos, this.cameraPos, multipliedFront);
		new Bullet(bulletPos, this.cameraFront);
	}
}
function _aList(lst, x, y, z) {
	var res = JSON.parse(JSON.stringify(lst)); // copy it
	for (let i=0; i<lst.length; i+=3) {
		res[i] += x;
		res[i+1] += y;
		res[i+2] += z;
	}
	return res;
}
class Bullet {
	constructor(pos, front) {
		this.front = glMatrix.vec3.fromValues(front[0], front[1], front[2]);
		this.pos = glMatrix.vec3.fromValues(pos[0], pos[1], pos[2]);
		this.location = positions.length;
		var buffer = getRBdata(0, shaderProgram);
		buffer.vertexPosition[1] = buffer.vertexPosition[1].concat(_aList(cube, pos[0], pos[1], pos[2]));
		buffer.vertexTexCoord[1] = buffer.vertexTexCoord[1].concat(mList([0,0], 72));
		buffer.vertexNormal[1] = buffer.vertexNormal[1].concat(mList([0, 1, 0], 108));
		flushRB(0, shaderProgram);
		bullets.push(this);
	}
	updatePos() {
		glMatrix.vec3.add(this.pos, this.pos, this.front);
		return _aList(cube, this.pos[0], this.pos[1], this.pos[2]);
	}
}

class Zombie {
	constructor(pos) {
		this.pos = pos;
		zombies.push(this);
	}
	updatePos() {
		// player speed (walking) is 0.136/frame so zombie is 0.14 (so u can only run to escape zombie)
		if (myPlayer.cameraPos[0] > this.pos[0]) { this.pos[0] += 0.14; } else { this.pos[0] -= 0.14; }
		if (myPlayer.cameraPos[2] > this.pos[2]) { this.pos[2] += 0.14; } else { this.pos[2] -= 0.14; }
		this.pos[1] = getTerrain(this.pos[0], this.pos[2]);
		return _aList(zombiePos.position, this.pos[0], this.pos[1], this.pos[2]);
	}
}