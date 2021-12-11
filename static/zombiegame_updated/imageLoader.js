var gunImg;

function loadImgs() {
	// gun
	window.gunImg = new Image();
	window.gunImg.src = "static/zombiegame/gun.png";
	window.gunImg.onload = function() {
		loadedImgs["gun"] = true;
	};
	console.log("gunImg=" + gunImg);
}

loadImgs();