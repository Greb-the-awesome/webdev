console.log("funcs.js loaded.");

function physicsUpdate() {
	myPlayer.updatePos(); // would-be next position
	var x = myPlayer.cameraPos[0];
	var z = myPlayer.cameraPos[2];
	var height = getTerrain(x, z) + 2;

	if (height == -Infinity) {myPlayer.inAir = true;}

	if (myPlayer.inAir) {myPlayer.velocity[1] -= 0.008;} else {
		var speedMultiplier = (myPlayer.hitPos[1] - height + 2 - 0.1) * 2;
		if (speedMultiplier < -0.21) {
			myPlayer.stamina += speedMultiplier;
		} else if (myPlayer.stamina < 100) {
			if (speedMultiplier < -0.030) {myPlayer.stamina += 0.25;} else {myPlayer.stamina += 0.15;}
		}
		if (!creative) {
			myPlayer.cameraPos[1] = height;
		}
		debugDispNow["speed multiplier"] = speedMultiplier;
	}
	if (myPlayer.hitPos[1] < height - 1 && myPlayer.hitPos[1] > height - 2) {
		myPlayer.inAir = false;
		myPlayer.velocity[1] = 0;
	}
	myPlayer.hitPos[1] = myPlayer.cameraPos[1] - 2;
	if (myPlayer.hitPos[1] < -50) {ded(playerName + " didn't know the world was flat in Zombie Wars. skill issue!");}

	// myPlayer.userInputVelocity[0] *= speedMultiplier;
	// myPlayer.userInputVelocity[2] *= speedMultiplier;
}

function bulletsUpdate(buffer, dayN) {
	var finalBullet = [];
	// check zombies colliding bullets + update bullets
	var bulletNum = 0;
	for (bullet of bullets) {
		var zombNum = 0;
		for (zomb of zombies) {
			if (checkCollision([zomb.pos[0],zomb.pos[1]+3,zomb.pos[2]], bullet.pos, [2,4,2], [1,1,1])) {
				zomb.health -= bullet.damage;
				if (zomb.health <= 0) {
					if (Math.random() > 0.6) {
						var toDrop = dropItems(dayN < 2);
						items.push(new Item([zomb.pos[0], zomb.pos[1]+1, zomb.pos[2]], toDrop.name, toDrop.texCoordStart, toDrop.specs, 1));
					}
					zombies.splice(zombNum, 1);
					playerStats.zombiesKilled++;
					if (playerStats.zombiesKilled == 1) {
						airdrop();
					}
				}
			}
			zombNum++;
		}
		if (bullet.pos[0] > 50 || bullet.pos[0] < -50 || bullet.pos[2] > 50 || bullet.pos[2] < -50 ||
			bullet.pos[1] < getTerrain(bullet.pos[0], bullet.pos[2]) || bullet.pos[1] > 50) {
			bullets.splice(bulletNum, 1);
		} else {
			finalBullet = finalBullet.concat(bullet.updatePos());
		}
		bulletNum += 1;
	}
	buffer.vertexPosition[1] = finalBullet;
	buffer.vertexTexCoord[1] = mList([71/texW,161/texH], buffer.vertexPosition[1].length*2/3);
	buffer.vertexNormal[1] = mList([0, 1, 0], buffer.vertexPosition[1].length+1); // +1 because the sun needs normals too
}

function itemsUpdate() {
	// update items
	var itemNum = 0;
	var pickUp = false;
	for (var item of items) {
		item.timer--;
		if (item.timer <= 0) {items.splice(itemNum, 1);continue;} // despawn
		if (checkCollision(item.pos, myPlayer.hitPos, [2,2,2], [2,2,2])) {
			if (item.type == 0) {
				for (var i=0; i<myPlayer.inv.length; i++) {
					if (!myPlayer.inv[i]) {myPlayer.inv[i] = item; items.splice(itemNum, 1); break;} // pick it up
				}
				if (i == 4) { // no empty space
					pickUp = true;
					if (divisDownKeys["KeyQ"]) {myPlayer.inv[myPlayer.selected] = item; items.splice(itemNum, 1);}
				}
			} else if (item.type == 1) {
				myPlayer.upgradeInv.addUpgrade(item); items.splice(itemNum, 1);
			}
		}
		itemNum++;
	}

	// update buffers
	realBillboardData.offset = []; realBillboardData.texCoord = []; realBillboardData.corner = [];
	for (var item of items) {
		realBillboardData.texCoord = realBillboardData.texCoord.concat(item.texCoordsCycle);
		for (let i=0; i<6; i++) {realBillboardData.offset = realBillboardData.offset.concat(item.pos);}
		realBillboardData.corner = realBillboardData.corner.concat(item.cycle);
	}
	return pickUp;
}

function zombiesUpdate() {
	// update zombies
	transformInfos.position = [];
	transformInfos.color = [];
	transformInfos.normal = [];
	transformInfos.rot = [];
	transformInfos.translate = [];
	for (zombie of zombies) {
		transformInfos.position = transformInfos.position.concat(zombie.model.position);
		transformInfos.color = transformInfos.color.concat(zombie.model.color);
		transformInfos.normal = transformInfos.normal.concat(zombie.model.normal);
		transformInfos.rot = transformInfos.rot.concat(mList([zombie.updatePos()], zombie.model.position.length/3));
		transformInfos.translate = transformInfos.translate.concat(mList(zombie.pos, zombie.model.position.length/3));
		// bar outline
		realBillboardData.texCoord = realBillboardData.texCoord.concat(zombieBarTexCoord);
		realBillboardData.corner = realBillboardData.corner.concat(zombieBarPos);
		for (let x=0; x<12; x++) {realBillboardData.offset = realBillboardData.offset.concat([
			zombie.pos[0], zombie.pos[1] + 3, zombie.pos[2]]);}
		// bar fill
		for (let a=0; a<zombieBarRemaining.length; a+=2) {
			realBillboardData.corner.push(zombieBarRemaining[a]*zombie.health/100);
			realBillboardData.corner.push(zombieBarRemaining[a+1]);
		}
		realBillboardData.texCoord = realBillboardData.texCoord.concat(mList([71/texW,161/texH], 6)); // change order

		if (checkCollision(myPlayer.cameraPos, [zombie.pos[0],zombie.pos[1]+3,zombie.pos[2]], [1, 1.6, 1], [1.5,2,1.5])) {
			myPlayer.health -= zombie.damage;
			myPlayer.takingDamage = true;
		}
	}
}

function randomAroundPlayer(range) { // helper for spawning upgrades
	return [Math.random() * range + myPlayer.cameraPos[0], 2, Math.random() * range + myPlayer.cameraPos[2]];
}

function spawnStuff(t) {
	if (Math.floor(Math.random() * 60 * getDifficulty(gameTime / DAYLENGTH)) == 2) {
		var attemptedPos = [Math.random() * worldwidth - WORLDEND * 10, 0, Math.random() * worldwidth - WORLDEND * 10];
		var range = Math.min(Math.max(3000 / 4 / gameTime, 3), 15);
		if (!Math.abs(attemptedPos[0] - myPlayer.hitPos[0]) < range &&
			!Math.abs(attemptedPos[2] - myPlayer.hitPos[2] < range)) {
			new Zombie(attemptedPos, models.zombie, 1, 100);
		}
	}
	if (t == 3000) { // dun dun dun da boss comin'
		new Zombie([0,0,0], models.boss, 10, 250);
	}
	if (Math.floor(Math.random() * 170) == 2 && t < 1500) {
		items.push(new Item(randomAroundPlayer(20),
			...upgrades[Math.floor(Math.random() * upgrades.length)], 0.3, 1, true, true));
	}
}

function flushBuffers() {
	flushTransformedPositions();
	flushRB(0, shaderProgram);
	flushRealBillb();
	flushObj();
	refreshBillbs();
}

function renderGUI(pickUp, dayN) {
	if (myPlayer.takingDamage) {oCtx.fillStyle = "rgb("+(Math.sin(Date.now())*100+100)+", 0, 0)"}
	else {oCtx.fillStyle = "rgb(0, 255, 255)"}
	oCtx.fillRect(overlay.width * 0.3, overlay.height * 0.94, overlay.width * 0.4*myPlayer.health/100, overlay.height * 0.05);
	oCtx.strokeRect(overlay.width * 0.3, overlay.height * 0.94, overlay.width * 0.4, overlay.height * 0.05);
	oCtx.strokeRect(overlay.width * 0.3, overlay.height * 0.75, overlay.width * 0.4, overlay.height * 0.03);
	// inv: one square is 0.1 wide and high, and 0.02 space between squares
	oCtx.strokeRect(overlay.width * 0.36, overlay.height * 0.79, overlay.width * 0.28, overlay.height * 0.14);
	var selectNum = 0;
	for (let i=0.38; i<0.62; i+=0.06) {
		if (myPlayer.selected == selectNum) {oCtx.lineWidth = 5;} else {oCtx.lineWidth = 1;}
		if (myPlayer.inv[selectNum] && myPlayer.inv[selectNum].type == 0) {
			var theItem = myPlayer.inv[selectNum];
			oCtx.drawImage(oTex, theItem.texCoordStart[0]*texW, theItem.texCoordStart[1]*texH,
				texCoordDimension * texW, texCoordDimension * texW,
				overlay.width * i, overlay.height * 0.81, overlay.width * 0.05, overlay.width * 0.05);
		}
		oCtx.strokeRect(overlay.width * i, overlay.height * 0.81, overlay.width * 0.05, overlay.width * 0.05);
		selectNum += 1;
	}
	oCtx.lineWidth = 1;
	if (myPlayer.reloading) {oCtx.fillText("Reloading", overlay.width * 0.4, overlay.height * 0.6);}
	oCtx.fillText("Current Item: "+myPlayer.inv[myPlayer.selected].name, overlay.width * 0.4, overlay.height * 0.7);
	oCtx.fillText(""+myPlayer.invSelect.roundsRemaining+"/"+myPlayer.invSelect.specs.capacity, overlay.width * 0.45, overlay.height * 0.74);
	if (pickUp) {oCtx.fillText("q to pick up", overlay.width * 0.4, overlay.height * 0.5)}
	oCtx.fillStyle = "rgb(200, 150, 0)";
	oCtx.fillRect(overlay.width * 0.3, overlay.height * 0.75, overlay.width * 0.4 * myPlayer.stamina/100, overlay.height * 0.03);
	oCtx.fillText("Day #: " + dayN, overlay.width * 0.85, overlay.height * 0.1);
	oCtx.fillText("Zombies Killed: "+playerStats.zombiesKilled, overlay.width * 0.8, overlay.height * 0.2);
}

function serializeChunks() {
	var values = Object.values(chunks);
	var regularTex = [0.0, 128/texH,
			    0.0, 0.0,
			    128/texW, 0.0,
			    128/texW, 0.0,
			    128/texW, 128/texH,
			    0.0, 128/texH];
	var specialTex = [256/texW, 128/texH,
			    256/texW, 0.0,
			    384/texW, 0.0,
			    384/texW, 0.0,
			    384/texW, 128/texH,
			    256/texW, 128/texH]
	for (let c=0; c<values.length; c++) {
		var chunk = values[c];
		var chunkBlocks = chunk.blocks;
		console.log(chunkBlocks);
		for (const blockPos in chunkBlocks) {
			var block = chunkBlocks[blockPos];
			var triang1 = block.pos1.concat(block.pos2.concat(block.pos3));
			var n1 = block.normals[0].concat(block.normals[1].concat(block.normals[2]));
			var triang2 = block.pos3.concat(block.pos4.concat(block.pos1));
			var n2 = block.normals[2].concat(block.normals[3].concat(block.normals[0]));
			var tex;
			tex = regularTex;
			addPositions(triang1.concat(triang2),
			   tex, [], n1.concat(n2));
		}
	}
}

function genClouds() {
	for (let i=0; i<30; i++) {
		var offsets = [Math.random() * worldwidth * 1.5 - WORLDEND * 12.5, Math.random() * 10 + 10, Math.random() * worldwidth * 1.5 - WORLDEND * 12.5];
		var scale = [Math.random() * 10, Math.random(), Math.random() * 10];
		var toAdd = [];
		var cloud = cube;
		for (let j=0; j<cloud.length; j+=3) {
			toAdd.push(cloud[j] * scale[0] + offsets[0]);
			toAdd.push(cloud[j+1] * scale[1] + offsets[1]);
			toAdd.push(cloud[j+2] * scale[2] + offsets[2]);
		}
		addPositions(toAdd, mList([239/texW, 249/texH], toAdd.length/3*2), [], mList([0,1,0], toAdd.length/3));
	}
}

function loadModels() {
	loadObj("/static/multiplayer_3d_game/zombie.obj", "/static/multiplayer_3d_game/zombie.mtl", function(res) {
		models.zombie = res;
	});
	loadObj("/static/multiplayer_3d_game/zombieboss.obj", "/static/multiplayer_3d_game/zombieboss.mtl", function(res) {
		models.boss = res;
	});
	loadObj("/static/multiplayer_3d_game/airdrop.obj", "/static/multiplayer_3d_game/airdrop.mtl", function(res) {
		models.airdrop = res;
	});
}
var airdropHandle;
function airdrop() {
	// new Audio("static/zombiegame_updated_3d/sfx/airdrop.mp3").play(); // the most cringe soundtrack ik
	airdropHandle = setInterval(function() {

	}, 50);
	setTimeout(function() {
		clearInterval(airdropHandle);

	})
}

function refreshBillbs() {
	billboardPositions = [];
	billboardTexCoords = [];
	var pos = [1,-1,-1, 1,-1,1, 1,1,1, 1,-1,-1, 1,1,1, 1,1,-1];
	for (let i=0; i<pos.length; i+=3) {
		pos[i] += billbOffsets[0];
		pos[i+1] += billbOffsets[1];
		pos[i+2] += billbOffsets[2];
	}
	var tex = myPlayer.inv[myPlayer.selected].texCoordsCycle;
	addBillbPositions(pos, tex);
	// crosshair
	addBillbPositions([-0.1, 0.1, -4,
					   0.1, -0.1, -4,
					   0.1, 0.1, -4,
					   -0.1, -0.1, -4,
					   -0.1, 0.1, -4,
					   0.1, -0.1, -4,],
					   [128/texW, 128/texH,
					    256/texW, 0.0,
					   256/texW, 128/texH,
					   128/texW, 0.0,
					   128/texW, 128/texW,
					   256/texW, 0.0,]);
	flushBillb();
}