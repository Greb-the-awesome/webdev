console.log("classes.js loaded.");
var bullets = [];
var texW = 512;
var texH = 512;
var items = [];
// generate the zombie stuffs
var zombieBarTexCoord = [1, 1,
0, 1,
0, 0,
1, 1,
0, 0,
1, 0];
for (let a=0; a<zombieBarTexCoord.length; a+=2) {
	zombieBarTexCoord[a] *= (71/texW);
	zombieBarTexCoord[a+1] *= (13/texW);
	zombieBarTexCoord[a+1] += (241/texH);
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
	constructor(pos, name, texCoordStart, specs, size, type = 0, add = true, despawn = true) {
		console.log(texCoordStart);
		this.name = name;
		this.pos = pos;
		this.type = type; // 0 = weapon, 1 = upgrade
		this.texCoordsCycle = [1, 1,
		 0, 1,
		 0, 0,
		 1, 1,
		 0, 0,
		 1, 0];
		this.cycle = [-1.0, -1.0,
		1.0, -1.0,
		1.0, 1.0,
		-1.0, -1.0,
		1.0, 1.0,
		-1.0, 1.0];
		for (let a=0; a<this.texCoordsCycle.length; a+=2) {
			this.texCoordsCycle[a] *= texCoordDimension;
			this.texCoordsCycle[a+1] *= texCoordDimension;
			this.texCoordsCycle[a] += texCoordStart[0];
			this.texCoordsCycle[a+1]+=  texCoordStart[1];
			this.cycle[a] *= size;
			this.cycle[a+1] *= size;
		}
		if (add) {
			for (let i=0; i<6; i++) {realBillboardData.offset = realBillboardData.offset.concat(pos);}
			realBillboardData.corner = realBillboardData.corner.concat(this.cycle);
			realBillboardData.texCoord = realBillboardData.texCoord.concat(this.texCoordsCycle);
		}
		this.specs = specs;
		this.texCoordStart = texCoordStart;
		this.timer = despawn?1000:Infinity;
		this.roundsRemaining = this.specs.capacity;
		if (!type) { // type == 0
			this.clutcher = false; // weapons can have the "clutcher" upgrade
		}
	}
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

		this.health = 100;
		this.stamina = 100;
		this.takingDamage = false;
		this.firingDelay = false;
		this.reloading = false;
		this.inAir = false;
		this.inv = [new Item([0,10,0], "GL Gun", [266/texW, 300/texH], {damage:20,delay:100,reloadTime:1000,capacity:20,fire:genNoise("gl_fire"),rel:genNoise("gl_reload")}, 0, 0, false), false, false, false];
		this.upgradeInv = [];
		this.selected = 0;

		this.upgradeInv.addUpgrade = function(u) {
			//myPlayer.upgradeInv.push(u);
			var div = document.getElementById("upgradeItem");
			var clone = div.cloneNode(true);
			clone.style.display = "block";
			clone.id = "upgradeItem-" + myPlayer.upgradeInv.length;
			clone.querySelector("#upHeading").innerHTML = u.name; // they all have identical ids
			clone.querySelector("#upDesc").innerHTML = u.specs.desc;
			clone.querySelector("#upButton").onclick = ()=>{u.specs.action();clone.remove();};
			div.after(clone);
		}
	}
	updatePos() {
		glMatrix.vec3.add(this.cameraPos, this.cameraPos, this.velocity);
		glMatrix.vec3.add(this.cameraPos, this.cameraPos, this.userInputVelocity);
		glMatrix.vec3.add(this.hitPos, this.hitPos, this.velocity);
		glMatrix.vec3.add(this.hitPos, this.hitPos, this.userInputVelocity);
		// some other housekeeping
		this.invSelect = this.inv[this.selected];
	}
	shoot() {
		if (!this.firingDelay && !this.reloading && myPlayer.invSelect) {
			if (this.invSelect.specs.fire && useSound) {new Audio(this.invSelect.specs.fire).play();}

			this.invSelect.roundsRemaining--;

			var distanceFromPlayer = 2;
			var bulletPos = glMatrix.vec3.create();
			var multipliedFront = glMatrix.vec3.fromValues(
				this.cameraFront[0]*distanceFromPlayer, this.cameraFront[1]*distanceFromPlayer, this.cameraFront[2]*distanceFromPlayer);
			glMatrix.vec3.add(bulletPos, this.cameraPos, multipliedFront);

			new Bullet(bulletPos, this.cameraFront, this.invSelect.specs.damage);

			this.firingDelay = true;

			billbOffsets[2] += 0.3;
			setTimeout(()=>billbOffsets[2]-=0.3, this.invSelect.specs.delay/2)
			setTimeout(()=>{myPlayer.firingDelay = false;}, this.invSelect.specs.delay);

			if (this.invSelect.roundsRemaining == 0) {
				if (this.invSelect.clutcher && this.health < 25) {
					this.invSelect.roundsRemaining = this.invSelect.specs.capacity;
				} else {
					this.reloading = true; setTimeout(()=>{
						myPlayer.reloading = false;myPlayer.invSelect.roundsRemaining = myPlayer.invSelect.specs.capacity;
					}, this.invSelect.specs.reloadTime);
					if (this.invSelect.specs.rel && useSound) {new Audio(this.invSelect.specs.rel).play();}
				}
			}
		}
	}
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
var rads = {
	45: Math.PI/4,
	90: Math.PI/2,
	135: Math.PI*0.75,
	180: Math.PI,
	225: Math.PI*1.25,
	270: Math.PI*1.5,
	315: Math.PI*1.75
};
class Zombie {
	constructor(pos, model, damage, health) {
		this.pos = pos;
		this.health = health;
		this.angle = 0;
		this.model = model;
		this.damage = damage;
		zombies.push(this);
	}
	updatePos() {
		// player speed (walking) is 0.136/frame so zombie is 0.14 (so u can only run to escape zombie)
		var moveForward = 0; var moveSideways = 0;
		if (!closeTo(myPlayer.cameraPos[0], this.pos[0])) {
			if (myPlayer.cameraPos[0] > this.pos[0]) { this.pos[0] += 0.14; moveForward = 1; }
			else { this.pos[0] -= 0.14; moveForward = 2; }
		}

		if (!closeTo(myPlayer.cameraPos[2], this.pos[2])) {
			if (myPlayer.cameraPos[2] > this.pos[2]) { this.pos[2] += 0.14; moveSideways = 1; }
			else { this.pos[2] -= 0.14; moveSideways = 2; }
		}

		this.pos[1] = getTerrain(this.pos[0], this.pos[2]);
		if (moveForward == 1) {
			if (!moveSideways) {this.angle = rads[180];}
			else if (moveSideways == 1) {this.angle = rads[135];}
			else if (moveSideways == 2) {this.angle = rads[225];}
		} else if (moveForward == 2) {
			if (!moveSideways) {this.angle = 0;}
			else if (moveSideways == 1) {this.angle = rads[45];}
			else if (moveSideways == 2) {this.angle = rads[315];}
		} else if (moveForward == 0) {
			if (moveSideways == 1) {this.angle = rads[90];}
			else if (moveSideways == 2) {this.angle = rads[270];}
		}
		return this.angle;
	}
}