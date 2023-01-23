var canvas, ctx;
var screenPos = 0;
var w = 0, h = 0;
var backgrounds = [];

window.onload = function() {
    canvas = document.getElementById("canv");
    ctx = canvas.getContext("2d");
    canvas.width = parseInt(
		document.defaultView.getComputedStyle(canvas, "wot do i put here").width.replace("px", ""), 10);
	canvas.height = parseInt(
		document.defaultView.getComputedStyle(canvas, "wot do i put here").height.replace("px", ""), 10);
    ctx.fillStyle = "#00FF00";
    w = canvas.width; h = canvas.height;
    backgrounds.push(new Background(10));
}

function startGame() {
    document.getElementById("startDiv").style.display = "none";
    requestAnimationFrame(loop);
}