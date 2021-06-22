function getItemsAfterPoint(list, point) {
	for (let i = 0; i < list.length - point; i++) {
		list.shift();
	}
	return list;
}
// event handlers

function onKeyDown(key) {
	var keyCode = event.keyCode;
	downKeys[keyCode] = true;

	if (keyCode == 13) {
		key.preventDefault();
		processCmd( document.getElementById("frm1").elements[0].value );
	}
}

function onKeyUp(key) {
	var keyCode = event.keyCode;
	downKeys[keyCode] = false;
}

function onMouseMove(e) {
	var relPosX = e.offsetX - widthInc * 50;
	var relPosY = e.offsetY - heightInc * 50;

	if (relPosX >= 0 && relPosY >= 0) { // bottom right
		player.angle = Math.PI / 2 + Math.atan(relPosY / relPosX);
	}
	else if (relPosX <= 0 && relPosY >= 0) { // bottom left
		player.angle = Math.PI + Math.atan(Math.abs(relPosX) / relPosY);
	}
	else if (relPosX <= 0 && relPosY <= 0) { // top left
		player.angle = Math.PI * 1.5 + Math.atan(Math.abs(relPosY) / Math.abs(relPosX));
	}
	else { // top right
		player.angle = Math.atan(relPosX / Math.abs(relPosY));
	}
}

// other funcs
function processCmd(rawCmd) {
	/* a cmd parser ig */
	cmdList = rawCmd.split(" ");
	cmd = cmdList[0];
	cmdArgs = getItemsAfterPoint(cmdList, 1);
	cmdFlags = [];

	cmdArgs.forEach(function(element, index) {
		if (element.startsWith("--")) {
			cmdFlags.push(element.replace("--", ""));
			cmdArgs.splice(index);
		}
	});

	// see wot command
	if (cmd == "setspeed") {
		player.speed = parseFloat(cmdArgs[0]) * widthInc;
	}
	else if (cmd == "placeitem") {
		itemList.push(new Item("wood_armor", 100, 100))
	}
	else if (cmd == "hitboxes") {
		if (cmdArgs[0] == "off") {
			canMove["w"] = true; canMove["a"] = true;
			canMove["s"] = true; canMove["d"] = true;
		}
	}
	else if (cmd == "java") {
		if (cmdFlags.includes("a")) {
			console.log("aaaaaaaa");
		}
		console.log("*sniff sniff* is that java I smell?");
	}
}

function checkCollision(thing1Pos, thing1Width, thing1Height, thing2Pos, thing2Width, thing2Height) {
	var correctedPos1 = [thing1Pos[0] + thing1Width, thing1Pos[1] + thing1Height];
	var correctedPos2 = [thing2Pos[0] + thing2Width, thing2Pos[1] + thing2Height];

	var distanceX = correctedPos1[0] - correctedPos2[0];
	var distanceY = correctedPos1[1] - correctedPos2[1];

	var combinedWidth = thing1Width + thing2Width;
	var combinedHeight = thing1Height + thing2Height;

	var collisions = {"w" : false, "a" : false, "s" : false, "d" : false};

	if (distanceX < 0 && Math.abs(distanceX) < combinedWidth) { // thing1 left of thing2
		collisions["d"] = true;
	} else {collisions["d"] = false;}
	if (distanceX > 0 && combinedWidth < distanceX) { // thing1 right of thing2
		collisions["a"] = true;
	} else {collisions["a"] = false;}
	if (distanceY < 0 && Math.abs(distanceY) < combinedHeight) { // thing1 on top of thing2
		collisions["s"] = true;
	} else {collisions["s"] = false;}
	if (distanceY > 0 && distanceY < combinedHeight) { // thing1 down from thing2
		collisions["w"] = true;
	} else {collisions["w"] = false;}

	ctx.fillStyle = "#00FFFF"
	ctx.fillRect(thing1Pos[0], thing1Pos[1], thing1Width, thing1Height);
	ctx.fillRect(thing2Pos[0], thing2Pos[1], thing2Width, thing2Height);

	return collisions;
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
		// hide the button
		$("button#startGame").hide();

		window.setInterval(gameLoop, 30);
	});
}

// wall drawing function
function drawWall(wallImg, x, y, width, height, imgWidth, imgHeight) {
	var numOfImgsWide = width / imgWidth;
	var numOfImgsHigh = height / imgHeight;

	var flooredImgsWide = Math.floor(numOfImgsWide);
	var flooredImgsHigh = Math.floor(numOfImgsHigh);

	var leftOverflow = (numOfImgsWide - flooredImgsWide) * imgWidth;
	var leftOverflowOriginalPic = (numOfImgsWide - flooredImgsWide) * wallImg.width;

	var topOverflow = (numOfImgsHigh - flooredImgsHigh) * imgHeight;
	var topOverflowOriginalPic = (numOfImgsHigh - flooredImgsHigh) * wallImg.height;

	// drawing the full images
	for (let i = 0; i < flooredImgsWide; i++) {
		for (let j = 0; j < flooredImgsHigh; j++) {
			ctx.drawImage(wallImg, x + i * imgWidth + leftOverflow, y + j * imgHeight + topOverflow, imgWidth, imgHeight);
		}
	}

	// drawing the half images
	if (numOfImgsWide != flooredImgsWide || numOfImgsHigh != flooredImgsHigh) {
		// drawing the ones to the right
		for (let i = 0; i < flooredImgsHigh; i++) {
			ctx.drawImage(wallImg, wallImg.width - leftOverflowOriginalPic, 0, leftOverflowOriginalPic, wallImg.height,
			 	x, y + i * imgHeight + topOverflow, leftOverflow, imgHeight);
		}
		// drawing the ones to the top
		for (let i = 0; i < flooredImgsWide; i++) {
			ctx.drawImage(wallImg, 0, wallImg.height - topOverflowOriginalPic, wallImg.width, topOverflowOriginalPic,
				x + i * imgWidth + leftOverflow, y, imgWidth, topOverflow);
		}
		// drawing the top left corner
		ctx.drawImage(wallImg, wallImg.width - leftOverflowOriginalPic, wallImg.height - topOverflowOriginalPic,
			leftOverflowOriginalPic, topOverflowOriginalPic, x, y, leftOverflow, topOverflow);
	}
}