var canvas, ctx, log, intervalHandle, nameBox, shareBtn, sTickHandle, lTickHandle, shootHandle, player;
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
var loadedImgs = {};
// hi

console.log("main script loaded.");

// bullet class
class Bullet {
	constructor(x, y, angle, damage, color, speed) {
		this.posX = x - widthIncrement * 0.5; // because it needs to be in the center
		this.posY = y - widthIncrement * 0.5;
		this.width = widthIncrement
		this.angle = -angle; // lmao radians
		this.height = heightIncrement;
		this.damage = damage;
		this.color = color;
		this.speed = speed;
		this.angleSin = Math.sin(this.angle);
		this.angleCos = Math.cos(this.angle);

		this.moveX = this.angleCos * this.speed;
		this.moveY = -this.angleSin * this.speed;
		
	}
	updatePos() {
		this.posX += this.moveX;
		this.posY += this.moveY;
	}
	draw() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.posX, this.posY,
			widthIncrement, heightIncrement);
	}
}

// playr class
class Player {
	constructor() {
		this.posX = 100;
		this.posY = 100;
		this.health = 100;
		this.angle = 0; // why does everyone use radians i am sad
		this.width = widthIncrement * 4;
		this.height = this.width;
		this.speed = widthIncrement/5;
	}
	draw() {
		ctx.save();
		ctx.translate(this.posX + widthIncrement * 2, this.posY + widthIncrement * 2);
		ctx.rotate(this.angle);
		ctx.translate(-this.posX - widthIncrement * 2, - this.posY - widthIncrement * 2)
		// player
		ctx.fillStyle = "#FF0000";
		ctx.fillRect(this.posX, this.posY,
			widthIncrement*4, widthIncrement * 4);
		ctx.fillStyle = "#444444";
		// gun
		ctx.drawImage(window.gunImg, this.posX + widthIncrement * 2, this.posY + widthIncrement * 2,
			widthIncrement * 4, widthIncrement);
		ctx.restore();

		// health bar
		ctx.strokeRect(this.posX, this.posY - widthIncrement * 4,
			widthIncrement*4, heightIncrement/2);
		ctx.fillStyle = "#00EEEE";
		ctx.fillRect(this.posX, this.posY - widthIncrement * 4,
			widthIncrement*this.health/25, heightIncrement/2);
	}
	shoot() {
		bullets.push(new Bullet(this.posX + widthIncrement * 2, this.posY + widthIncrement * 2, this.angle, 25, "#DDDD00", widthIncrement));
	}
}

// zombie class
class Zombie {
	constructor(x, y, damage) {
		this.posX = x;
		this.posY = y;
		this.health = 50;
		this.damage = damage;
		this.width = widthIncrement * 4;
		this.height = this.width;
	}
	draw() {
		ctx.fillStyle = "#289E45";
		ctx.fillRect(this.posX, this.posY, widthIncrement*4, widthIncrement * 4);

		// health bar
		ctx.strokeRect(this.posX, this.posY - widthIncrement * 3,
			widthIncrement*4, heightIncrement/2);
		ctx.fillStyle = "#EE0000";
		ctx.fillRect(this.posX, this.posY - widthIncrement * 3,
			widthIncrement*this.health/12.5, heightIncrement/2);
	}
}

class Horse {
	constructor(pos, side) {
		if (side == 0) { // ^
			this.y = 0;
			this.x = pos * widthIncrement;
			this.whenDrop = Math.floor(Math.random() * 100) * widthIncrement;
			this.updatePos = ()=>{this.y += widthIncrement;}
		} else if (side == 1) { // >
			this.y = pos * widthIncrement;
			this.x = canvasWidth;
			this.whenDrop = Math.floor(Math.random() * 100) * heightIncrement;
			this.updatePos = ()=>{this.x -= widthIncrement;}
		} else if (side == 2) { // v
			this.y = canvasHeight;
			this.x = pos;
			this.whenDrop = Math.floor(Math.random() * 100) * widthIncrement;
			this.updatePos = ()=>{this.y -= widthIncrement;}
		} else if (side == 3) { // <
			this.y = pos;
			this.x = 0;
			this.whenDrop = Math.floor(Math.random() * 100) * heightIncrement;
			this.updatePos = ()=>{this.x += widthIncrement;}
		}
	}
}


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
			loadedImgs["gun"]
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
	if (Math.floor(Math.random(150)) == 8) {

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

function gameInit() {
	// listen
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
	window.addEventListener("mousemove", onMouseMove);

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
	if (keyCode == 32) {
		player.shoot();
		shootHandle = window.setInterval(()=>{player.shoot();}, 200);
	} else if (keyCode == 80) {
		if (!paused) {
			window.clearInterval(intervalHandle);
			paused = true;
		}
		else {
			intervalHandle = window.setInterval(gameLoop, 10);
			paused = false;
		}
	}
}

function onKeyUp(event) {
	var keyCode = event.keyCode;
	downKeys[keyCode] = false;
	if (keyCode == 32) {
		window.clearInterval(shootHandle);
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
				if(z[j].health <= 0) {
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
	if(downKeys[65]) { // a
		player.posX -= player.speed;
		if (player.posX < 0) {
			player.posX = widthIncrement * 99;
		}
	}
	if(downKeys[68]) { // d
		player.posX += player.speed;
		if (player.posX > canvasWidth) {
			player.posX = 1;
		}
	}
	if(downKeys[87]) { // w
		player.posY -= player.speed;
		if (player.posY < 0) {
			player.posY = canvasHeight - 1;
		}
	}
	if(downKeys[83]) { // s
		player.posY += player.speed;
		if (player.posY > canvasHeight) {
			player.posY = 1;
		}
	}


	// update the bullets and draw them
	for(let i=0; i<bullets.length; i++) {
		bullets[i].updatePos();
		bullets[i].draw();
		// despawn bullets
		if(bullets[i].posX > widthIncrement*102 || bullets[i].posX < widthIncrement*-2 ||
			bullets[i].posY > heightIncrement * 102 || bullets[i].posY < heightIncrement*-2) {
			bullets.splice(i, 1);
		}
	}

	// spawn zombies
	if(Math.floor(Math.random() * 100) == 8) { // this means 1/100 chance per frame for zombie to spawn
		attemptedSpawnPoint = Math.floor(Math.random() * 100);
		attemptedSpawnEdge = Math.floor(Math.random() * 3);

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
		let zombie = new Zombie(x, y, 25);
		zombies.push(zombie);
	}

	// zombie pathfind + draw
	for(let i=0; i<zombies.length; i++) {
		var zombieInQuestion = zombies[i];
		/*if(zombieInQuestion.posX < player.posX) { // zombie to the left of the player
			zombieInQuestion.posX += widthIncrement/8;
		} else if(zombieInQuestion.posX > player.posX) { // zombie to the right of the player
			zombieInQuestion.posX -= widthIncrement/8;
		}

		if (zombieInQuestion.posY < player.posY) { // zombie to the top of the player
			zombieInQuestion.posY += heightIncrement/8;
		} else if (zombieInQuestion.posY > player.posY) { // zombie to the bottom of the player
			zombieInQuestion.posY -= heightIncrement/8;
		}*/

		zombieInQuestion.draw();

		
	}
	checkZombieCollideBullet(bullets, zombies);

	// draw the ppl
	player.draw();
}

