console.log("classes.js loaded.");
var bullets = [];
var texW = 512;
var texH = 512;
var items = [];
var zombieBarTexCoord = [1, 1,
0, 1,
0, 0,
1, 1,
0, 0,
1, 0];
for (let a=0; a<zombieBarTexCoord.length; a+=2) {
	zombieBarTexCoord[a] *= (71/texW);
	zombieBarTexCoord[a+1] *= (13/texW);
	zombieBarTexCoord[a+1] += (256/texH);
}
var zombieBarPos = [-1.0, -1.0,
1.0, -1.0,
1.0, 1.0,
-1.0, -1.0,
1.0, 1.0,
-1.0, 1.0];
for (let a=0; a<zombieBarPos.length; a+=2) {
	zombieBarPos[a] *= 1.625;
	zombieBarPos[a+1] *= 0.35;
	zombieBarPos[a+1] += 3;
}
var zombieBarRemaining = JSON.parse(JSON.stringify(zombieBarPos));
for (let a=0; a<zombieBarRemaining.length; a+=2) {
	zombieBarRemaining[a] *= 1;
	zombieBarRemaining[a+1] *= 1;
}

var texCoordDimension = 100/texW; // if at any point I don't use a square texture then it will fail soooooooo

class Item {
	constructor(pos, name, texCoordStart, specs, add = true) {
		this.name = name;
		this.pos = pos;
		this.texCoordsCycle = [1, 1,
		 0, 1,
		 0, 0,
		 1, 1,
		 0, 0,
		 1, 0];
		for (let a=0; a<this.texCoordsCycle.length; a+=2) {
			this.texCoordsCycle[a] *= texCoordDimension;
			this.texCoordsCycle[a+1] *= texCoordDimension;
			this.texCoordsCycle[a] += texCoordStart[0];
			this.texCoordsCycle[a+1]+=  texCoordStart[1];
		}
		this.cycle = [-1.0, -1.0,
		1.0, -1.0,
		1.0, 1.0,
		-1.0, -1.0,
		1.0, 1.0,
		-1.0, 1.0];
		if (add) {
			for (let i=0; i<6; i++) {realBillboardData.offset = realBillboardData.offset.concat(pos);}
			realBillboardData.corner = realBillboardData.corner.concat(this.cycle);
			realBillboardData.texCoord = realBillboardData.texCoord.concat(this.texCoordsCycle);
		}
		this.specs = specs;
		this.texCoordStart = texCoordStart;
	}
}
items.push(new Item([0,10,0], "oda", [266/texW, 0], {damage:100}));
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

		this.health = 100;
		this.takingDamage = false;
		this.inv = [new Item([0,10,0], "AA-12", [266/texW, 0], {damage:20}, false), false, false, false];
		this.selected = 0;
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
		new Bullet(bulletPos, this.cameraFront, this.inv[this.selected].specs.damage);
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
	constructor(pos, front, damage) {
		this.front = glMatrix.vec3.fromValues(front[0], front[1], front[2]);
		this.pos = glMatrix.vec3.fromValues(pos[0], pos[1], pos[2]);
		this.location = positions.length;
		this.damage = damage;
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
var epsilon = 1;
function closeTo(a, b) {
	return Math.abs(a - b) < epsilon;
}
class Zombie {
	constructor(pos) {
		this.pos = pos;
		this.health = 100;
		zombies.push(this);
	}
	updatePos() {
		// player speed (walking) is 0.136/frame so zombie is 0.14 (so u can only run to escape zombie)
		if (!closeTo(myPlayer.cameraPos[0], this.pos[0])) {
			if (myPlayer.cameraPos[0] > this.pos[0]) { this.pos[0] += 0.14; } else { this.pos[0] -= 0.14; }
		}

		if (!closeTo(myPlayer.cameraPos[2], this.pos[2])) {
			if (myPlayer.cameraPos[2] > this.pos[2]) { this.pos[2] += 0.14; } else { this.pos[2] -= 0.14; }
		}

		this.pos[1] = getTerrain(this.pos[0], this.pos[2]);
		return _aList(zombiePos.position, this.pos[0], this.pos[1], this.pos[2]);
	}
}