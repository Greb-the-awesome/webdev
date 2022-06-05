var canvas, ctx;
var grids = []; // each array inside this array is a row
const WIDTH = 300;
const HEIGHT = 450;
const BLOCKWIDTH = 30;
var currentPentomonio = [];
var pID;
var debugDispNow = {};
var pentomonios = [
[[0,0],[0,1],[0,2],[0,3]],
[[0,0],[0,1],[1,0],[1,1]]
]; // y, x
var centers = [
[0, 1],
[0, 0]
];
// 10 wide, 15 high
for (let i=0; i<15; i++) {
	var toPush = [];
	for (let j=0; j<10; j++) {toPush.push(true);}
	grids.push(toPush);
}
function onKeyDown(e) {
	var key = e.key;
	if (key == "ArrowLeft") {
		for (el of currentPentomonio) {el[1] -= 1;}
	} else if (key == "ArrowRight") {
		for (el of currentPentomonio) {el[1] += 1;}
	} else if (key == " ") {genPentomonio();}
	else if (key == "ArrowUp") {
		for (el of currentPentomonio) {
			var relativePos = currentPentomonio.map(function(a) {
				return [a[0] - centers[pID][0], a[1] - centers[pID][1]];
			});
			relativePos = relativePos.map(function(a) { return [-a[1], a[0]];/*rotation*/ });
			
		}
	}
}
function debugRefresh() {
	document.getElementById("debugr").innerHTML = JSON.stringify(debugDispNow);
}
function onLoad() {
	canvas = document.getElementById("canv");
	ctx = canvas.getContext("2d");
	setInterval(loop, 20);
	setInterval(debugRefresh, 100);
	addEventListener("keydown", onKeyDown);
}

function mList(list, n) {
	// multiply an array
	var res = [];
	for (let i=0; i<n; i++) {res=res.concat(list);}
	return res;
}

function genPentomonio() {
	pID = Math.floor(Math.random() * pentomonios.length)
	var which = pentomonios[pID];
	currentPentomonio = which;
}
var frameNumber = 0;
function loop() {
	frameNumber += 1;
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	var filled = true;
	for (let y=0; y<grids.length; y++) { // we don't need .length but whatever bro
		var row = grids[y];
		for (let x=0; x<row.length; x++) {
			var block = row[x];
			if (block) {
				ctx.fillRect(x*BLOCKWIDTH, y*BLOCKWIDTH, BLOCKWIDTH, BLOCKWIDTH);
			} else {filled = false;
			}
		}
		if (filled) {
			grids.splice(y, 1);
			grids.unshift(mList([false], 10));
		}
		filled = true;
	}
	for (el of currentPentomonio) {
		ctx.fillRect(el[1]*BLOCKWIDTH, el[0]*BLOCKWIDTH, BLOCKWIDTH, BLOCKWIDTH);
	}
	if (frameNumber == 20) {
		frameNumber = 0;
		var gotToBottom = false;
		var obstructed = false;
		for (el of currentPentomonio) {
			if (el[0] > 13) {
				gotToBottom = true;
			}
			try {
				if (grids[el[0]+1][el[1]]) {
					obstructed = true;
				}
			} catch (TypeError) {}
		}
		if (!gotToBottom && !obstructed) {
			currentPentomonio = currentPentomonio.map( a=>{return [a[0]+1, a[1]];} );
		} else {
			for (el of currentPentomonio) {
				grids[el[0]][el[1]] = true;
			}
			genPentomonio();
		}
	}
}

window.onload = onLoad;