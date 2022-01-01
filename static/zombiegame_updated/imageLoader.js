var gunImg;
var loadedImgs = {};
function loadImgs() {
	// gun
	window.gunImg = new Image();
	window.gunImg.src = "static/zombiegame_updated/gun.png";
	window.gunImg.onload = function() {
		loadedImgs["gun"] = true;
	};
	console.log("gunImg=" + gunImg);

	// plane (or horse)
	window.horseImg = new Image();
	window.horseImg.src = "static/zombiegame_updated/horseUnridable.png";
	window.horseImg.onload = function() {
		loadedImgs["horseUnridable"] = true;
	};

	// nuke
	window.nukeImg = new Image();
	window.nukeImg.src = "static/zombiegame_updated/nuke.png";
	window.nukeImg.onload = function() {
		loadedImgs["nuke"] = true;
	};

	// opgun
	window.opGunImg = new Image();
	window.opGunImg.src = "static/zombiegame_updated/opgun.png";
	window.opGunImg.onload = function() {
		loadedImgs["opgun"] = true;
	};

	// horse egg
	window.eggImg = new Image();
	window.eggImg.src = "static/zombiegame_updated/egg.png";
	window.eggImg.onload = function() {
		loadedImgs["egg"] = true;
	};

	// kar98
	window.kar98Img = new Image();
	window.kar98Img.src = "static/zombiegame_updated/kar98.png";
	window.kar98Img.onload = function() {
		loadedImgs["kar98"] = true;
	};

	// ak
	window.akImg = new Image();
	window.akImg.src = "static/zombiegame_updated/ak.png";
	window.akImg.onload = function() {
		loadedImgs["ak"] = true;
	};

	// m1918
	window.m1918Img = new Image();
	window.m1918Img.src = "static/zombiegame_updated/m1918.png";
	window.m1918Img.onload = function() {
		loadedImgs["m1918"] = true;
	};

	// qcw05
	window.qcwImg = new Image();
	window.qcwImg.src = "static/zombiegame_updated/qcw05.png";
	window.qcwImg.onload = function() {
		loadedImgs["qcw"] = true;
	};

	// m1887
	window.m1887Img = new Image();
	window.m1887Img.src = "static/zombiegame_updated/m1887.png";
	window.m1887Img.onload = function() {
		loadedImgs["m1887"] = true;
	};

	// medkit
	window.medkitImg = new Image();
	window.medkitImg.src = "static/zombiegame_updated/medkit.png";
	window.medkitImg.onload = function() {
		loadedImgs["medkit"] = true;
	};

	// medicine
	window.medicineImg = new Image();
	window.medicineImg.src = "static/zombiegame_updated/medicine.png";
	window.medicineImg.onload = function() {
		loadedImgs["medicine"] = true;
	};

	// aa12
	window.aa12Img = new Image();
	window.aa12Img.src = "static/zombiegame_updated/aa12.png";
	window.aa12Img.onload = function() {
		loadedImgs["aa12"] = true;
	};

	// snowflake
	window.flakeImg = new Image();
	window.flakeImg.src = "static/zombiegame_updated/snowflake.png";
	window.flakeImg.onload = function() {
		loadedImgs["snowflake"] = true;
	};

	// snowball
	window.snowballImg = new Image();
	window.snowballImg.src = "static/zombiegame_updated/snowball.png";
	window.snowballImg.onload = function() {
		loadedImgs["snowball"] = true;
	};

}

loadImgs();