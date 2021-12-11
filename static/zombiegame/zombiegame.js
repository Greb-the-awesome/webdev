var canvas, ctx, log, intervalHandle, pauseIntervalHandle;
const canvasWidth = window.innerWidth - 20;
const canvasHeight = window.innerHeight - 20;
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
// asdfaposidjfopawefo


// bullet class
class Bullet {
	constructor(x, direction, damage) {
		this.pos = x;
		this.direction = direction;
		this.width = widthIncrement;
		this.damage = damage;
	}
	updatePos() {
		if(this.direction == "left") {
			this.pos -= 5
		}
		else {
			this.pos += 5
		}
	}
	draw() {
		ctx.fillStyle = "#EEEE00";
		ctx.fillRect(this.pos-widthIncrement*0.5, heightIncrement*96,
			widthIncrement, heightIncrement);
	}
}
// playr class
class Player {
	constructor() {
		this.pos = widthIncrement * 50;
		this.health = 100;
		this.direction = "left";
		this.width = widthIncrement * 4;
	}
	draw() {
		// player
		ctx.fillStyle = "#FF0000";
		ctx.fillRect(this.pos-widthIncrement*2, heightIncrement*95, widthIncrement*4, heightIncrement*5);
		ctx.fillStyle = "#444444";
		// gun
		if(this.direction == "left") {
			ctx.fillRect(this.pos-widthIncrement*5, heightIncrement*96, widthIncrement*5, heightIncrement);
		}
		else {
			ctx.fillRect(this.pos, heightIncrement*96, widthIncrement*5, heightIncrement);
		}
		// health bar
		ctx.strokeRect(this.pos-widthIncrement*2,heightIncrement*93, widthIncrement*4, heightIncrement/2);
		ctx.fillStyle = "#00EEEE";
		ctx.fillRect(this.pos-widthIncrement*2,heightIncrement*93,
			widthIncrement*this.health/25, heightIncrement/2);
	}
	shoot() {
		let bullet = new Bullet(this.pos, this.direction, 25);
		bullets.push(bullet);
	}
}
// zombie class
class Zombie {
	constructor(x, damage) {
		this.pos = x;
		this.health = 50;
		this.width = widthIncrement * 4;
		this.damage = damage;
	}
	draw() {
		if(this.takingDamage) {
			ctx.fillStyle = "#EB6134";            
		}
		else {
			ctx.fillStyle = "#289E45";
		}
		ctx.fillRect(this.pos-widthIncrement*2, heightIncrement*95, widthIncrement*4, heightIncrement*5);
		// health bar
		ctx.strokeRect(this.pos-widthIncrement*2,heightIncrement*93, widthIncrement*4, heightIncrement/2);
		ctx.fillStyle = "#00EEEE";
		ctx.fillRect(this.pos-widthIncrement*2,heightIncrement*93,
			widthIncrement*this.health/12.5, heightIncrement/2);
	}
}
let player = new Player();
function onLoad() {
	// canvas stuffs
	canvas = document.getElementById("canv");
	ctx = canvas.getContext("2d");
	canvas.setAttribute("width", canvasWidth);
	canvas.setAttribute("height", canvasHeight);

	// listen
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);

	// keys
	// for(let i=0; i<10; i++) {
	//     downKeys[i] = false;
	// }
	// canvas settings
	ctx.fillStyle = "#FF0000";
	ctx.font = "30px Helvetica";
}

function gameInit() {
	// listen
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);

	// l o o p o o l
	intervalHandle = window.setInterval(gameLoop, 10);

	initAlready = true;
}

function onKeyDown(event) {
	var keyCode = event.keyCode;
	downKeys[keyCode] = true;
	if (keyCode == 32) {
		player.shoot();
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
}
// collison detection function
function checkCollision(thing1, thing2) {
	// [...]
	if(Math.abs(thing1.pos-thing2.pos) < thing1.width/2 + thing2.width/2) {
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
	if(downKeys[65]) {
		player.pos -= widthIncrement/5;
		player.direction = "left";
		if (player.pos < 0) {
			player.pos = widthIncrement * 99;
		}
	}
	if(downKeys[68]) {
		player.pos += widthIncrement/5;
		player.direction = "right";
		if (player.pos > widthIncrement * 100) {
			player.pos = 1;
		}
	}
	// update the bullets and draw them
	for(let i=0; i<bullets.length; i++) {
		bullets[i].updatePos();
		bullets[i].draw();
		// despawn bullets
		if(bullets[i].pos > widthIncrement*102 || bullets[i] < widthIncrement*-2) {
			bullets.splice(i, 1);
		}
	}
	// spawn zombies
	if(Math.floor(Math.random() * 100) == 8) { // this means 1/100 chance per frame for zombie to spawn
		attemptedSpawnPoint = Math.floor(Math.random() * 100) * widthIncrement;
		if(attemptedSpawnPoint > player.pos + widthIncrement*23 ||
			attemptedSpawnPoint < player.pos - widthIncrement*23 ||
			attemptedSpawnPoint < widthIncrement * 20 ||
			attemptedSpawnPoint > widthIncrement * 80) { // must spawn 23 increments away OR edges
			let zombie = new Zombie(attemptedSpawnPoint, 25);
			zombies.push(zombie);
		}
	}
	// zombie pathfind + draw
	for(let i=0; i<zombies.length; i++) {
		var zombieInQuestion = zombies[i];
		if(zombieInQuestion.pos < player.pos) { // zombie to the left of the player
			zombieInQuestion.pos += widthIncrement/8;
		}
		if(zombieInQuestion.pos > player.pos) { // zombie to the right of the player
			zombieInQuestion.pos -= widthIncrement/8;
		}
		zombieInQuestion.draw();
		// check zombie collide with player
		if(checkCollision(zombieInQuestion, player)) {
			if(frameNumber > 100) {
				player.health -= zombieInQuestion.damage;
				frameNumber = 0;
			}
			if(player.health <= 0) { // o o f
				window.clearInterval(intervalHandle);
				ctx.fillStyle = "#000000";
				ctx.globalAlpha = 0.2;
				ctx.fillRect(0,0, canvasWidth, canvasHeight);
				ctx.globalAlpha = 1;
				ctx.fillText("You Died. Your score was " + score, canvasWidth/2-widthIncrement*9, canvasHeight/2);
			}
		}
	}
	checkZombieCollideBullet(bullets, zombies);

	// draw the ppl
	player.draw();
}