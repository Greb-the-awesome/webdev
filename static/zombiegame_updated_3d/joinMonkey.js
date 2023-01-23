var gameRoomName;
var otherPlayers = [myPlayer];
// NOTE: there is inconsistent indentation. whatever

function findInOtherPlayers(id) {
	for (var o of otherPlayers) {if (o.id == id) {return o;}}
}

function joinGame_monkey() {
  spawnStuff = function() {};
  {
	let A = class extends Zombie {
	  constructor(a,b,c,d,id,target) {
		super(a,b,c,d);
		this.id = id;
		this.zombieType = "base";
		this.target = target;
	  }
	  // zombies are not killed by the client
	  dead(a) {
		particles.push(new ParticleSystem(
				this.pos, D_ONE_POINT(), 7, 1, [0, 0], 0.1, 0.1, 1000, 1
			));
	  }
	  checkDestruction() {return false;}
	  takeDamage() {}
	};
	Zombie = A;
	let B = class extends Zombie {
	  constructor(a,b,c,d,id,target) {
		super(a,b,c,d,id,target);
		this.vaxes = [];
		this.zombieType = "enoker";
	  }
	  spawnVaxes() {}
	};
	Enoker = B;
	let C = class extends Vax {
	  constructor(a,b,c,d, id, target) {
		super(a,b,c,d);
		this.id = id;
		this.zombieType = "vax";
		this.target = target;
	  }
	  update() {return this.updateAngle(...this.updatePos())}
	};
	Vax = C;
	myPlayer.sendData = function() {
	  sio.emit("playerUpdate", {
		// idk why im sending both pos and hitPos, backwards compatibiility I guess
		pos: [...this.cameraPos],
		hPos: [...this.hitPos],
		health: this.health,
		yaw: this.yaw,
		pitch: this.pitch,
		invSelect: this.invSelect,
		takingDamage: this.takingDamage,
		id: PLAYERID,
		room: gameRoomName
	  });
	};
	myPlayer.sendShootEvent = function(b) {
	  sio.emit("playerShoot", {
		pos: b.pos, vel: b.front, damage: b.damage, id: b.id, room: gameRoomName
	  });
	};
	let E = class extends Bullet {
	  constructor(a,b,c,d=true) {
		super(a,b,c,d);
		this.id = Date.now();
	  }
	  checkDestruction() {return false;}
	};
	Bullet = E;
	multiplayerUpdate = function() {
		var transformInfos = buffers_d.transformShader.data;
		for (var oth of otherPlayers) {
			transformInfos.aVertexPosition = transformInfos.aVertexPosition.concat(cube);
			transformInfos.aColor = transformInfos.aColor.concat(mList([1,1,1,1],cube.length*4/3));
			transformInfos.aVertexNormal = transformInfos.aVertexNormal.concat(mList([1,1,1],cube.length/3));
			transformInfos.aYRot = transformInfos.aYRot.concat(mList([oth.yaw],cube.length/3));
			transformInfos.aTranslation = transformInfos.aTranslation.concat(mList(oth.pos),cube.length/3);
		}
	};
  }
  sio.on("s_sync", function(data) {
	for (let i=0; i<zombies.length; i++) { // zombie-type mobs
	  var z = zombies[i];
	  var d = data.zombies[z.id];
	  if (!d) {zombies.splice(i, 1); continue;}
	  z.pos = d.pos; z.health = d.health;
	  if (d.zombieType == "enoker") { // vex sync
		z.vaxes = [];
		for (var v of d.vaxes) {
			var toPush = new Vax(d.pos, models.vax, 1, 50);
			z.vaxes.push(toPush);
			toPush.timeOffset = d.timeOffset;
			toPush.heightOffset = d.heightOffset;
		}
	  }
	  if (d.target == PLAYERID) {z.target = myPlayer;}
	  else {z.target = otherPlayers[d.target];}
	}
	for (let i=0; i<bullets.length; i++) {
		var b = bullets[i];
		var d = data.bullets[b.id];
		if (!d) {bullets.splice(i, 1); continue;}
		b.pos = d.pos; b.vel = d.vel; b.damage = d.damage;
	}
	for (let i=0; i<otherPlayers.length; i++) {
		var o = otherPlayers[i];
		var d = data.otherPlayers[o.id];
		if (!o) {otherPlayers.splice(i, 1); continue;}
		o.cameraPos = d.pos; o.health = d.health; o.yaw = d.yaw; o.pitch = d.pitch;
	}
  });
  sio.on("s_zombiespawn", function(data) {
	new Zombie(data.pos, models[data.model], data.damage, data.health, data.id,
		findInOtherPlayers(data.targetId));
  });
  sio.on("s_enokerspawn", function(data) {
	new Enoker(data.pos, models[data.model], data.damage, data.health, data.id,
		findInOtherPlayers(data.targetId));
  });
  sio.on("s_vaxspawn", function(data) {
	for (var en of zombies) {
		if (en.id == data.enokerId) {
			en.vaxes.push(new Vax(data.pos, models[data.model], data.damage, data.health, data.id,
				findInOtherPlayers(data.targetId)));
		}
	}
  });
  sio.on("s_bulletcreate", function(data) {
	new Bullet(data.pos, data.front, data.damage);
  });
  sio.on("s_vaxshoot", function(data) {
	for (var en of zombies) {
		if (en.id == data.enokerId) {
			for (var v of en.vaxes) {
				if (v.id == data.vaxId) {
					vaxBullets.push(new Bullet(data.pos, data.front, 5, false));
				}
			}
		}
	}
  });
  sio.on("s_zombiedamage", function(data) {
	for (var z of zombies) {
		if (z.id == data.id) {
			z.health -= data.damage;
		}
	}
  });
  sio.on("s_bulletdelete", function(data) {
	for (let i=0; i<bullets.length; i++) {
		if (bullets[i].id == data.id) {bullets.splice(i, 1);}
	}
  });
  sio.on("s_zombiedelete", function(data) {
	for (let i=0; i<zombies.length; i++) {
		if (zombies[i].id == data.id) {zombies.splice(i, 1);}
	}
  });
  sio.on("s_itemcreate", function(data) {
	items.push(new Item(data.pos, data.name, data.texCoordStart, data.specs, data.size, data.type));
	items[items.length-1].id = data.id;
	items[items.length-1].velocity = data.velocity;
  });
  sio.on("s_itemdelete", function(data) {
	for (let i=0; i<items.length; i++) {
		if (items[i].id == data.id) {items.splice(i, 1);}
	}
  });
  sio.on("s_playerjoin", function(data) {
	otherPlayers.push(new OtherPlayer([0,0,0], data.id));
  });
  sio.emit("getOtherPlayers", {room:gameRoomName});
  sio.on("receiveOtherPlayers", function(data) {
	otherPlayers = [myPlayer];
	console.log("p: ", data.p);
	for (var p of data.p) {
		otherPlayers.push(new OtherPlayer(p.cameraPos, p.id));
	}
  });
  setInterval(function() { // send player updates
	myPlayer.sendData();
  }, 75);
}
