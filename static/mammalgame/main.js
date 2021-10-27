// var decls
var loadedImgs = {
	"background" : false,
	"bricks" : false,
	"player" : false
};
var downKeys = {};
var canvasWidth, canvasHeight, widthInc, heightInc, ctx, canvas, player, 
backgroundImg, bricksImg, playerImg, woodArmorImg;

Math.PIE = Math.PI;
var itemImgs = {};
var itemList = [];
var canMove = {
	"w" : true, "a" : true, "s" : true, "d" : true
}

function main() {
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
	ctx.font = (heightInc * 5) + "px calibri";

	// loading screen
	ctx.textAlign = "center";
	ctx.fillText("Loading...", widthInc * 50, heightInc * 25);

	// ecoutez bien
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);

	window.setInterval(function() {
		for (let i=0; i<loadedImgs.length(); i++) {
			if ()
		}
	}, 10);
}

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