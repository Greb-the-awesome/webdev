var canvasWidth , canvasHeight ;
var widthInc;
var heightInc;
var ctx, canvas;
var chosenClass;
var playerHealth, playerSpeed, playerStrength;
var player;
var loadedImgs = {
	"background" : false,
	"bricks" : false
};
var allImgsLoaded = false;
var backgroundImg, bricksImg, bricksPattern;
var downKeys = {};
var wallPoints;


class Player {
	constructor(cls, health, speed, strength, size) {
		this.cls = cls;
		this.health = health;
		this.speed = speed;
		this.strength = strength;
		this.size = size;
		this.accesories = null;
		this.posX = widthInc * 750;
		this.posY = widthInc * 990;
	}

	draw() {

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
	ctx.font = (heightInc * 5) + "px Helvetica";

	// loading screen
	ctx.textAlign = "center";
	ctx.fillText("Loading...", widthInc * 50, heightInc * 25);

	// hide the buttons so they dont pop up on the loading screen
	$("button").hide();

	// get images
	backgroundImg = new Image();
	backgroundImg.src = "static/dungeon_crawler/flare.png";
	backgroundImg.onload = function() {
		loadedImgs["background"] = true;
	};

	bricksImg = new Image();
	bricksImg.src = "static/dungeon_crawler/a.png";
	bricksImg.onload = function() {
		loadedImgs["bricks"] = true;
	};

	// listen listen
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);

	// wall points
	wallPoints = [
		[widthInc * 730, widthInc * 900, widthInc * 45, widthInc * 10]
	];

	// wait until all imgs are loaded
	var waitLoadIntervalHandler = window.setInterval(function() {
		if (
			loadedImgs["background"] &&
			loadedImgs["bricks"]
			) {
			window.clearInterval(waitLoadIntervalHandler);
			showClassChooser();
		}
	}, 10);
}

function onKeyDown(key) {
	var keyCode = event.keyCode;
	downKeys[keyCode] = true;
}

function onKeyUp(key) {
	var keyCode = event.keyCode;
	downKeys[keyCode] = false;
}

function showBg() {
	ctx.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight);
	ctx.globalAlpha = 0.4;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	ctx.globalAlpha = 1;
}

function showClassChooser() {
	// background
	showBg();
	ctx.fillStyle = "#756a5f";
	ctx.fillRect(widthInc * 10, heightInc * 20, widthInc * 80, heightInc * 60);
	
	// making the gui
	ctx.fillStyle = "#000000";
	ctx.textAlign = "center";
	ctx.fillText("Choose Your Class", widthInc * 50, heightInc * 25);
	$("button.choose-class-button").show();

	// choose class buttons
	$("button#chooseClassStrongman").on("click", function(e) {
		player = new Player("strongman", 150, widthInc / 6, 8, 8);
		showBackStory();
	});
	$("button#chooseClassThinman").on("click", function(e) {
		player = new Player("strongman", 150, widthInc, 5, 5);
		showBackStory();
	});
	$("button#chooseClassThirdclass").on("click", function(e) {
		showBackStory();
	});
}

function showBackStory() {
	// clear
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	$(".choose-class-button").hide();

	// background
	showBg();

	// draw the text background
	ctx.fillStyle = "#7d766d";
	ctx.globalAlpha = 0.7;
	ctx.fillRect(widthInc * 5, heightInc * 20, widthInc * 90, heightInc * 15);

	// draw the backstory stuff
	ctx.fillStyle = "#ff1f1f";
	ctx.globalAlpha = 1;
	ctx.font = (heightInc * 3) + "px Helvetica";
	ctx.textAlign = "center";
	ctx.fillText(`
		You wake up in a dank, moldy dungeon. You have been captured by the great diablo whose name we do not speak of.
		`,  widthInc * 50, heightInc * 25);
	ctx.fillText(`You must now find your way out, using the supplies a mysterious helper has provided for you. Good luck! You'll need it.`,  widthInc * 50, heightInc * 32)

	// show the start game button
	$("button#startGame").show();

	// give start game button a command
	$("button#startGame").on("click", function(e) {
		// make all the patterns
		bricksPattern = ctx.createPattern(bricksImg, "repeat");

		// hide the button
		$("button#startGame").hide();

		window.setInterval(gameLoop, 30);
	});
}

// wall drawing function
/*
function drawWall(wallImg, x, y, width, height, imgWidth, imgHeight) {
	var numOfImgsWide = width / imgWidth;
	var numOfImgsHigh = height / imgHeight;
	var flooredImgsWide = Math.floor(numOfImgsWide);
	var flooredImgsHigh = Math.floor(numOfImgsHigh);

	// drawing most of the walls
	for (let i=0; i<flooredImgsWide; i++) {
		for (let j=0; j<flooredImgsHigh; j++) {
			ctx.drawImage(wallImg, x + i * imgWidth, y + j * imgHeight, imgWidth, imgHeight);
		}
	}

	// drawing the half walls
	if (flooredImgsWide != numOfImgsWide || flooredImgsHigh != numOfImgsHigh) {
		var halfWallWidth = (numOfImgsWide - flooredImgsWide) * imgWidth;
		var halfWallHeight = (numOfImgsHigh - flooredImgsHigh) * imgHeight;

		// drawing the half walls to the right
		for (let i=0; i<flooredImgsHigh; i++) {
			ctx.drawImage(wallImg, halfWallWidth, imgHeight, halfWallWidth, imgHeight,
				flooredImgsWide * imgWidth, y + i * imgHeight, imgWidth, imgHeight
			);
		}
	}
}
*/

function drawWall(wallImg, x, y, width, height, imgWidth, imgHeight) {
	var numOfImgsWide = width / imgWidth;
	var numOfImgsHigh = height / imgHeight;
	var flooredImgsWide = Math.floor(numOfImgsWide);
	var flooredImgsHigh = Math.floor(numOfImgsHigh);
	var leftOverflow = (numOfImgsWide - flooredImgsWide) * imgWidth;

	// drawing the full images
	for (let i = 0; i < flooredImgsWide; i++) {
		for (let j = 0; j < flooredImgsHigh; j++) {
			ctx.drawImage(wallImg, x + i * imgWidth + leftOverflow, y + j * imgHeight, imgWidth, imgHeight);
		}
	}

	// drawing the half images
	if (numOfImgsWide != flooredImgsWide || numOfImgsHigh != flooredImgsHigh) {
		// drawing the ones to the right
		for (let i = 0; i < flooredImgsHigh; i++) {
			ctx.save();
			ctx.beginPath();
			// ctx.lineWidth = "0";
			// ctx.moveTo(x, y + i * imgHeight); // top left
			// ctx.lineTo(x + leftOverflow, y + i * imgHeight); // top right
			// ctx.lineTo(x + leftOverflow, y + i * imgHeight + imgHeight + imgHeight); // bottom right
			// ctx.lineTo(x, y + i * imgHeight + imgHeight + imgHeight); // bottom left
			ctx.rect(x + flooredImgsWide * imgWidth, y + i * imgHeight, leftOverflow, imgHeight);
			ctx.clip();
			ctx.drawImage(wallImg, 0, 0, imgWidth, imgHeight, x + flooredImgsWide * imgWidth, y + i * imgHeight, imgWidth, imgHeight);
			ctx.restore();
			// ctx.drawImage(wallImg, imgWidth - leftOverflow, 0, leftOverflow, imgHeight,
			// 	x, y + i * imgHeight, leftOverflow, imgHeight);
		}
	}
}

// game loop yeaaaaaa
function gameLoop() {
	// clear canvas
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	// w
	if (downKeys[87]) {
		player.posY -= player.speed;
	}
	// s
	if (downKeys[83]) {
		player.posY += player.speed;
	}

	// a
	if (downKeys[65]) {
		player.posX -= player.speed;
	}

	// d
	if (downKeys[68]) {
		player.posX += player.speed;
	}

	// draw the walls
	ctx.fillStyle = bricksPattern;
	for (let i = 0; i < wallPoints.length; i++) {
		let wallPoint = wallPoints[i];
		/*
		// ctx.fillRect(wallPoint[0] - player.posX, wallPoint[1] - player.posY,
		// 	wallPoint[2], wallPoint[3]);
		ctx.save();
		ctx.rect(wallPoint[0] - player.posX, wallPoint[1] - player.posY,
			wallPoint[2], wallPoint[3]);
		// ctx.clip();
		ctx.drawImage(bricksImg, 0, 0);
		ctx.restore();
		*/
		drawWall(bricksImg, wallPoint[0] - player.posX, wallPoint[1] - player.posY,
			wallPoint[2], wallPoint[3], 59, 59);
	}
}


// Shorthand for $( document ).ready()
$(
	onLoad
);
// window.onload = onLoad;