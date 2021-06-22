class Player {
	constructor(cls, health, speed, strength, size) {
		this.cls = cls;
		this.health = health;
		this.speed = speed;
		this.strength = strength;
		this.size = size;
		this.accesories = null;
		this.posX = widthInc * 20;
		this.posY = this.posX;
		this.angle = 0; // R A D I A N S
		window.addEventListener("mousemove", onMouseMove)
	}

	draw() {
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0)
		ctx.translate(widthInc * 50, heightInc * 50);
		ctx.rotate(this.angle);
		/* does not follow DGS-1 standard but w a t e v e r */
		ctx.translate(widthInc * -50, heightInc * -50);
		ctx.drawImage(playerImg, widthInc * 47.5, heightInc * 47.5, widthInc * 5, widthInc * 5);
		ctx.restore();
	}
}

// idk if we rlly need this but ok...
class Item {
	constructor(what, posX, posY) {
		this.what = what;
		this.posX = posX;
		this.posY = posY;
		this.img = itemImgs[what];
	}

	draw() {
		ctx.drawImage(this.img, this.posX, this.posY, widthInc * 2, widthInc * 2);
	}
}

function onLoad() {
	// resize canvas
	var style = document.documentElement;
	canvasHeight = style.clientHeight;
	canvasWidth = style.clientWidth;
	heightInc = canvasHeight / 100;
	widthInc = canvasWidth / 100;

	// customary canvas stuff
	canvas = document.getElementById("canv");
	ctx = canvas.getContext("2d");
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	ctx.font = (heightInc * 5) + "px shadows into light";

	// loading screen
	ctx.textAlign = "center";
	ctx.fillText("Loading...", widthInc * 50, heightInc * 25);

	// hide the buttons so they dont pop up on the loading screen
	$("button").hide();

	// listen listen
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);

	// load the imgs
	loadImgs();

	// the big list of items
	itemImgs = {
		"wood_armor" : woodArmorImg,
	}

	// wait until all imgs are loaded
	var waitLoadIntervalHandler = window.setInterval(function() {
		if (
			loadedImgs["background"] &&
			loadedImgs["bricks"] &&
			loadedImgs["player"] &&
			loadedImgs["wood armor"]
			) {
			window.clearInterval(waitLoadIntervalHandler);
			showClassChooser();
		}
	}, 10);
}

// load imgs (the list of imgs was getting way too long to be in onLoad)
function loadImgs() {
	// background
	backgroundImg = new Image();
	backgroundImg.src = "static/dungeon_crawler/images/flare.png";
	backgroundImg.onload = function() {
		loadedImgs["background"] = true;
	};

	// sprites
	// walls
	bricksImg = new Image();
	bricksImg.src = "static/dungeon_crawler/images/bricks.png";
	bricksImg.onload = function() {
		loadedImgs["bricks"] = true;
	};

	// other
	playerImg = new Image();
	playerImg.src = "static/dungeon_crawler/images/ploir.png";
	playerImg.onload = function() {
		loadedImgs["player"] = true;
	};

	// items
	woodArmorImg = new Image();
	woodArmorImg.src = "static/dungeon_crawler/images/armorWooden.png";
	woodArmorImg.onload = function() {
		loadedImgs["wood armor"] = true;
	};
}

// game loop yeaaaaaa
function gameLoop() {
	// clear canvas
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.restore();

	// w
	if (downKeys[87] && canMove["w"]) {
		player.posY -= player.speed;
		ctx.translate(0, player.speed);
	}
	// s
	if (downKeys[83] && canMove["s"]) {
		player.posY += player.speed;
		ctx.translate(0, -player.speed);
	}

	// a
	if (downKeys[65] && canMove["a"]) {
		player.posX -= player.speed;
		ctx.translate(player.speed, 0);
	}

	// d
	if (downKeys[68] && canMove["d"]) {
		player.posX += player.speed;
		ctx.translate(-player.speed, 0);
	}

	// draw the walls + check wall collision
	for (let i = 0; i < wallPoints.length; i++) {
		let wallPoint = wallPoints[i];
		drawWall(bricksImg, wallPoint[0] + widthInc * 50, wallPoint[1] + heightInc * 50,
			wallPoint[2], wallPoint[3], 120, 120);
		// collision detection
		//canMove = checkCollision([wallPoint[0], wallPoint[1]], wallPoint[2], wallPoint[3],
		//	[player.posX, player.posY], widthInc * 5, widthInc * 5);
	}

	// draw the items
	for (let i = 0; i < itemList.length; i++) {
		itemList[i].draw();
	}

	player.draw();
}


// Shorthand for $( document ).ready()
$(
	onLoad
);
// window.onload = onLoad;