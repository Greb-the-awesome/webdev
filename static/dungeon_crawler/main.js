const canvasHeight, canvasWidth;
var ctx, canvas;


function onLoad() {
	// resize canvas
	var body = document.getElementById("body");
	canvasWidth = body.innerWidth;
	canvasHeight = body.innerHeight;

	// setup canvas stuffs
	canvas = document.getElementById("canv");
	ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FF0000";
	ctx.font = "30px Helvetica";
}