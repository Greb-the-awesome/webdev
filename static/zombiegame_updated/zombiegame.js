var canvas, ctx, log, intervalHandle, nameBox, shareBtn, sTickHandle, lTickHandle, player, mouseDown;
const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight - 50;
var downKeys = {};
const widthIncrement = canvasWidth/100;
const heightIncrement = canvasHeight/100;
var bullets = [];
var zombies = [];
var frameNumber = 0;
var score = 0;
var difficulty = 0;
var paused = false;
var initAlready = false;
var snowflakes = [];
var horses = [];
var items = [];
var shootHandles = [];
var askPickUp = [false, false];
// hi

console.log("main script loaded.");


function onMouseMove(e) {
	var relPosX = e.offsetX - player.posX;
	var relPosY = e.offsetY - player.posY;

	if (relPosX >= 0 && relPosY >= 0) { // bottom right
		player.angle = Math.atan(relPosY / relPosX);
	}
	else if (relPosX <= 0 && relPosY >= 0) { // bottom left
		player.angle = Math.PI * 0.5 + Math.atan(Math.abs(relPosX) / relPosY);
	}
	else if (relPosX <= 0 && relPosY <= 0) { // top left
		player.angle = Math.PI + Math.atan(Math.abs(relPosY) / Math.abs(relPosX));
	}
	else { // top right
		player.angle = Math.atan(relPosX / Math.abs(relPosY)) - Math.PI * 0.5;
	}
}


function onLoad() {
	// canvas stuffs
	canvas = document.getElementById("canv");
	ctx = canvas.getContext("2d");
	canvas.setAttribute("width", canvasWidth);
	canvas.setAttribute("height", canvasHeight);

	// keys
	// for(let i=0; i<10; i++) {
	//     downKeys[i] = false;
	// }

	// canvas settings
	ctx.fillStyle = "#FF0000";
	ctx.font = "30px Helvetica";
	

	var i = window.setInterval(function() {
		if (
			loadedImgs["gun"] &&
			loadedImgs["horseUnridable"] &&
			loadedImgs["nuke"] &&
			loadedImgs["opgun"] &&
			loadedImgs["egg"] &&
			loadedImgs["m1887"] &&
			loadedImgs["medkit"] &&
			loadedImgs["medicine"] &&
			loadedImgs["aa12"] &&
			loadedImgs["snowflake"] &&
			loadedImgs["snowball"]
			) {
			document.getElementById("loadingMsg").classList.add("invisible");
			console.log("all images loaded. gameInit()");
			gameInit();
			window.clearInterval(i);
		}
	}, 10);
}

function stop() {
	window.clearInterval(intervalHandle);
	window.clearInterval(sTickHandle);
	window.clearInterval(lTickHandle);
}

function sTick() {
	if (Math.floor(Math.random() * 50) == 3) {
		horses.push(new Horse(Math.floor(Math.random() * 4), Math.floor(Math.random() * 100)));
	}
	for (let i=0; i<items.length; i++) {
		items[i].timer += 1;
		if (items[i].timer > 150) {
			items.splice(i, 1);
		}
	}
}

function lTick() {
	for(let i=0; i<zombies.length; i++) {
		var zombieInQuestion = zombies[i];
		// check zombie collide with player
		if(checkCollision(zombieInQuestion, player)) {
			player.health -= zombieInQuestion.damage;
			frameNumber = 0;
			if(player.health <= 0) { // o o f
				stop();

				ctx.fillStyle = "#000000";
				ctx.globalAlpha = 0.2;
				ctx.fillRect(0,0, canvasWidth, canvasHeight);
				ctx.globalAlpha = 1;
				ctx.fillText("You Died. Your score was " + score, canvasWidth/2-widthIncrement*9, canvasHeight/2);

				nameBox.classList.remove("invisible");
				shareBtn.classList.remove("invisible");
				shareBtn.onClick = (e) => postScores();
			}
		}
	}
}

function onScroll(event) {
	if (!player.usingMed) {
		if (event.deltaY > 0) {
			if (player.invSelect > 2) {player.invSelect = 0;} else {player.invSelect += 1;}
		} else {
			if (player.invSelect < 1) {player.invSelect = 3;} else {player.invSelect -= 1;}
		}
	}
}
	

function onMouseDown() {
	mouseDown = true;
}

function onMouseUp() {
	mouseDown = false;
}

function gameInit() {
	// listen
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
	window.addEventListener("mousemove", onMouseMove);
	window.addEventListener("mousedown", onMouseDown);
	window.addEventListener("mouseup", onMouseUp);
	document.body.onwheel = onScroll;

	player = new Player();

	// l o o p o o l
	intervalHandle = window.setInterval(gameLoop, 10);
	sTickHandle = window.setInterval(sTick, 100);
	lTickHandle = window.setInterval(lTick, 500);

	initAlready = true;

	nameBox = document.getElementById("nameBox");
	shareBtn = document.getElementById("share");
	console.log("game init (gameInit())");
}

function onKeyDown(event) {
	if (event.repeat) {return};
	var keyCode = event.keyCode;
	downKeys[keyCode] = true;
	if (keyCode == 80) { // p
		if (!paused) {
			window.clearInterval(intervalHandle);
			paused = true;
		}
		else {
			intervalHandle = window.setInterval(gameLoop, 10);
			paused = false;
		}
	} else if (keyCode == 49) { // 1
		player.invSelect = 0;
	} else if (keyCode == 50) { // 2
		player.invSelect = 1;
	} else if (keyCode == 51) { // 3
		player.invSelect = 2;
	} else if (keyCode == 52) { // 4
		player.invSelect = 3;
	} else if (keyCode == 16) { // shift
		player.speed = widthIncrement / 5;
		player.width = widthIncrement * 4;
	}
}

function onKeyUp(event) {
	var keyCode = event.keyCode;
	downKeys[keyCode] = false;
	if (keyCode == 32) {
		for (let i=0; i<shootHandles.length; i++) {
			window.clearInterval(shootHandles[i]);
		}
	}
}


// collison detection function
function checkCollision(thing1, thing2) {
	x1bc = thing1.posX + thing1.width/2;
	y1bc = thing1.posY + thing1.height/2;
	x2bc = thing2.posX + thing2.width/2;
	y2bc = thing2.posY + thing2.height/2;
	if(Math.abs(x1bc-x2bc) < thing1.width/2 + thing2.width/2 &&
		Math.abs(y1bc-y2bc) < thing1.height/2 + thing2.height/2) {
		return true;
	}
	else {
		return false;
	}
}

function checkZombieCollideBullet(b,z) {
	for(let i=0; i < b.length; i++) {
		for(let j=0; j < z.length; j++) {
			if(checkCollision(b[i], z[j])) {
				z[j].health -= b[i].damage;
				b.splice(i, 1);
				
				if(z[j].health <= 0) { // da zombie ded
					
					if (Math.floor(Math.random() * 7) == 3) {
						switch (Math.floor(Math.random() * 11)) {
							case 1:
								items.push(new Item(z[j].posX, z[j].posY, "egg", eggImg, "other.consumable", {"onclick":
								(x, y)=>{
									player.speed = widthIncrement / 2;
									player.width = widthIncrement * 8;
								}}));
							case 2:
								items.push(new Item(z[j].posX, z[j].posY, "M249", opGunImg, "gun",
									{"damage":50,"color":"#00FFFF","capacity":100,"reloadTime":3000,"delay":50,"shotgun":false}));
								break;
							case 3:
								items.push(new Item(z[j].posX, z[j].posY, "kar98k", kar98Img, "gun",
									{"damage":50,"color":"#99DDDD","capacity":10,"reloadTime":2450,"delay":500,"shotgun":false}));
								break;
							case 4:
								items.push(new Item(z[j].posX, z[j].posY, "AK-47", akImg, "gun",
									{"damage":50,"color":"#FFFF00","capacity":30,"reloadTime":1800,"delay":80,"shotgun":false}));
								break;
							case 5:
								items.push(new Item(z[j].posX, z[j].posY, "M1918 BAR", m1918Img, "gun",
									{"damage":40,"color":"#a88f32","capacity":20,"reloadTime":2000,"delay":100,"shotgun":false}));
								break;
							case 6:
								items.push(new Item(z[j].posX, z[j].posY, "QCW-05", qcwImg, "gun",
									{"damage":100,"color":"#00DD00","capacity":50,"reloadTime":2000,"delay":25,"shotgun":false}));
								break;
							case 7:
								items.push(new Item(z[j].posX, z[j].posY, "M1887", m1887Img, "gun",
									{"damage":25,"color":"#FF0000","capacity":5,"reloadTime":2000,"delay":700,"shotgun":true,"spread":0.35,"rpc":5}));
								break;
							case 8:
								items.push(new Item(z[j].posX, z[j].posY, "medkit", medkitImg, "heal",
									{"time":2000,"healthRestore":100}));
							case 9:
								items.push(new Item(z[j].posX, z[j].posY, "medicine", medicineImg, "heal",
									{"time":1000,"healthRestore":50}));
							case 10:
								items.push(new Item(z[j].posX, z[j].posY, "AA-12", aa12Img, "gun",
									{"damage":25,"color":"#FF0000","capacity":20,"reloadTime":2000,"delay":200,"shotgun":true,"spread":0.4,"rpc":7}));
						}
						if (Math.floor(Math.random() * 5) == 3) {
							items.push(new Item(z[j].posX + 20, z[j].posY + 20, "snowball", snowballImg, "gun",
									{"damage":100,"color":"#94aeb0","capacity":1,"reloadTime":200,"delay":200,"shotgun":false}));
						}
					}
					z.splice(j, 1);
					
					score += 20;	
				}
			}
		}
	}
}


function postScores() {
	var req = new XMLHttpRequest();
	var name = nameBox.value;
	req.open("GET", "/postScores?score="+score.toString()+"&name="+name, true);
	req.send(null);
}

// start game loop
function gameLoop() {
	// clear
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	// frame number (tick happens every 100 frames)
	frameNumber += 1;

	// score
	score += 0.5;
	ctx.fillStyle = "#000000";
	ctx.fillText("SCORE: " + score, canvasWidth-widthIncrement*20, heightIncrement*30);

	// keyboard
	if(downKeys[65] || downKeys[37]) { // a or <
		player.posX -= player.speed;
		if (player.posX < 0) {
			player.posX = widthIncrement * 99;
		}
	}
	if(downKeys[68] || downKeys[39]) { // d or >
		player.posX += player.speed;
		if (player.posX > canvasWidth) {
			player.posX = 1;
		}
	}
	if(downKeys[87] || downKeys[38]) { // w or ^
		player.posY -= player.speed;
		if (player.posY < 0) {
			player.posY = canvasHeight - 1;
		}
	}
	if(downKeys[83] || downKeys[40]) { // s or down
		player.posY += player.speed;
		if (player.posY > canvasHeight) {
			player.posY = 1;
		}
	}
	if (downKeys[32] || mouseDown) {
		if (!player.firingDelay && !player.usingMed) {
			player.shoot();
		}
	}

	// do stuff to the items
	for(let i=0; i<items.length; i++) {
		itemInQuestion = items[i];
		itemInQuestion.draw();
		if (checkCollision(itemInQuestion, player)) {
			if (!player.inv[0]) {
				player.inv[0] = itemInQuestion; items.splice(i, 1);
			} else if (!player.inv[1]) {
				player.inv[1] = itemInQuestion; items.splice(i, 1);
			} else if (!player.inv[2]) {
				player.inv[2] = itemInQuestion; items.splice(i, 1);
			} else if (!player.inv[3]) {
				player.inv[3] = itemInQuestion; items.splice(i, 1);
			} else {
				ctx.fillText("q to pick up", player.posX - widthIncrement, player.posY + widthIncrement * 6);
				if (downKeys[81]) {
					player.inv[player.invSelect] = itemInQuestion;
					items.splice(i, 1);
				}
			}
		}
	}

	// update the bullets and draw them
	for(let i=0; i<bullets.length; i++) {
		var bulletInQuestion = bullets[i];
		bulletInQuestion.updatePos();
		bulletInQuestion.draw();
		// despawn bullets
		if(bulletInQuestion.posX > widthIncrement*102 || bulletInQuestion.posX < widthIncrement*-2 ||
			bulletInQuestion.posY > heightIncrement * 102 || bulletInQuestion.posY < heightIncrement*-2) {
			bullets.splice(i, 1);
		}
	}

	// spawn zombies
	if(Math.floor(Math.random() * 100) == 8) { // this means 1/100 chance per frame for zombie to spawn
		var attemptedSpawnPoint = Math.floor(Math.random() * 100);
		var attemptedSpawnEdge = Math.floor(Math.random() * 3);

		var x, y;
		if (attemptedSpawnEdge == 0) { // ^
			y = 0;
			x = attemptedSpawnPoint * widthIncrement;
		} else if (attemptedSpawnEdge == 1) { // >
			y = attemptedSpawnPoint * heightIncrement;
			x = canvasWidth;
		} else if (attemptedSpawnEdge == 2) { // v
			y = canvasHeight;
			x = attemptedSpawnPoint * widthIncrement;
		} else if (attemptedSpawnEdge == 3) { // <
			y = attemptedSpawnPoint * heightIncrement;
			x = 0;
		}
		let zombie = new Zombie(x, y, 20);
		zombies.push(zombie);
	}

	for(let i=0; i<horses.length; i++) {
		var h = horses[i];
		h.draw();
		h.updatePos();
		h.checkDrop();
		if (h.x < -3 || h.x > canvasWidth + 1 || h.y < -3 || h.y > canvasHeight + 1) {
			horses.splice(i, 1);
		}
	}

	// zombie pathfind + draw
	
	for(let i=0; i<zombies.length; i++) {
		var zombieInQuestion = zombies[i];
		if(zombieInQuestion.posX < player.posX) { // zombie to the left of the player
			zombieInQuestion.posX += widthIncrement/8;
		} else if(zombieInQuestion.posX > player.posX) { // zombie to the right of the player
			zombieInQuestion.posX -= widthIncrement/8;
		}

		if (zombieInQuestion.posY < player.posY) { // zombie to the top of the player
			zombieInQuestion.posY += heightIncrement/8;
		} else if (zombieInQuestion.posY > player.posY) { // zombie to the bottom of the player
			zombieInQuestion.posY -= heightIncrement/8;
		}

		zombieInQuestion.draw();

		
	}
	checkZombieCollideBullet(bullets, zombies);

	// ammo
	ctx.fillStyle = "#333333";
	if (player.selected) {
		if (player.selected.type == "gun") {
			ctx.fillText(player.selected.roundsRemaining.toString() + "/" + player.selected.specs.capacity.toString(), widthIncrement * 40, heightIncrement * 75);
		}
		ctx.fillText("current item: "+player.selected.what, widthIncrement * 40, heightIncrement * 30);
	}

	if (player.usingMed) {
		ctx.fillText("healing up...", widthIncrement * 40, heightIncrement * 25);
	}

	if (Math.floor(Math.random() * 20) == 8) {
		snowflakes.push([Math.floor(Math.random() * 100) * widthIncrement, 0, Math.random() * 50, (Math.random()/10 + 0.1) * widthIncrement]);
	}
	for (let i=0;i<snowflakes.length;i++) {
		flakeInQuestion = snowflakes[i];
		flakeInQuestion[1] += flakeInQuestion[3];
		ctx.drawImage(flakeImg, flakeInQuestion[0], flakeInQuestion[1], flakeInQuestion[2], flakeInQuestion[2]);
		if (flakeInQuestion[1] >= canvasHeight) {
			snowflakes.splice(i, 1);
		}
	}

	// draw the ppl
	player.draw();
}

