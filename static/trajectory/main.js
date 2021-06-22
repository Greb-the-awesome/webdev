var canvas, ctx, widthInc, heightInc, msgForMom;
var confPos = [];
var page = 0;
var pages = [drawFirstPage, drawTree]

function getRandNumb(max) {
	return Math.floor(Math.random() * max);
}

function onLoad() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	var style = document.documentElement;
	canvasWidth = style.clientWidth;
	canvasHeight = style.clientHeight;
	widthInc = canvasWidth / 100;
	heightInc = canvasHeight / 100;
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	for (let i = 0; i < 60; i++) {
		confPos.push([getRandNumb(canvasWidth), getRandNumb(canvasHeight), getRandNumb(Math.PI * 2),
			"rgb(" + getRandNumb(255).toString() + "," + getRandNumb(255).toString() + "," + getRandNumb(255).toString() + ")"]);
	}

	drawLace();
	drawConf();
	drawCover();
}

function drawConf() {
	confPos.forEach(function(element, index) {
		ctx.save();
		ctx.translate(element[0], element[1]);
		ctx.rotate(element[2]);
		ctx.fillStyle = element[3];
		ctx.fillRect(0, 0, 10, 10);
		ctx.restore();
	});
}

function drawCover() {
	ctx.font = (widthInc * 7).toString() + "px verdana";
	ctx.fillStyle = "#E99497";
	ctx.textAlign = "center";
	ctx.fillText("Happy Birthday Mom!", widthInc * 50, heightInc * 25);

	ctx.font = (widthInc * 5).toString() + "px tahoma";
	ctx.fillText("From, Jerry", widthInc * 50, heightInc * 50);

	ctx.font = (widthInc * 5).toString() + "px brush script mt";
	ctx.fillStyle = "#F3C583";
	ctx.globalAlpha = 0;
	window.setTimeout(function() {
		var ctr = 0;
		var fadeHandler = window.setInterval(function() {
			ctx.globalAlpha += 0.01;
			ctr += 0.01;
			ctx.fillText("Click to Continue...", widthInc * 50, heightInc * 70);
			if (ctr >= 1) {
				window.clearInterval(fadeHandler);
				window.addEventListener("click", drawNextPage);
			}
		}, 15);
	}, 1000);
}

function drawLace() {
	// left
	for (let i = 0; i < 25; i++) {
		ctx.fillStyle = "rgb(" + getRandNumb(255).toString() + "," + getRandNumb(255).toString() + "," + getRandNumb(255).toString() + ")";
		ctx.fillRect(0, heightInc * i * 4, widthInc * 2, heightInc * 4);
	}
	// top
	for (let i = 0; i < 25; i++) {
		ctx.fillStyle = "rgb(" + getRandNumb(255).toString() + "," + getRandNumb(255).toString() + "," + getRandNumb(255).toString() + ")";
		ctx.fillRect(widthInc * i * 4, 0, widthInc * 4, heightInc * 2);
	}
	// right
	for (let i = 0; i < 25; i++) {
		ctx.fillStyle = "rgb(" + getRandNumb(255).toString() + "," + getRandNumb(255).toString() + "," + getRandNumb(255).toString() + ")";
		ctx.fillRect(widthInc * 98, heightInc * i * 4, widthInc * 2, heightInc * 4);
	}
	// bottom
	for (let i = 0; i < 25; i++) {
		ctx.fillStyle = "rgb(" + getRandNumb(255).toString() + "," + getRandNumb(255).toString() + "," + getRandNumb(255).toString() + ")";
		ctx.fillRect(widthInc * i * 4, heightInc * 98, widthInc * 4, heightInc * 2);
	}
}

function drawNextPage() {
	pages[page]();
	page += 1;
}

function drawFirstPage(x, y) {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	drawLace();
	drawConf();

	msgForMom = document.getElementById("msgForMom");
	msgForMom.classList.remove("hidden");
	msgForMom.classList.add("msg-for-mom");
}

function drawTree() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	msgForMom.classList.add("hidden");
	msgForMom.classList.remove("msg-for-mom");
	drawLace();
	drawConf();
}

window.onload = onLoad;
