var divisDownKeys = {};

var arrowKeySensitivity = 20;
function onKeyDown(event) {
	var keyCode = event.code;
	if (true) {
		divisDownKeys[keyCode] = true;
		if (keyCode == "KeyU") {
			var el = document.getElementById("upgradeMenu");
			if (el.style.display == "block") {
				el.style.display = "none";
				canvas.requestPointerLock();
			} else {
				el.style.display = "block";
				document.exitPointerLock();
			}
		}
		if (keyCode == "KeyB") {
			debugDispNow["hitboxes shown"] = !debugDispNow["hitboxes shown"];
		}
		if (keyCode.startsWith("Digit")) {
			if (keyCode == "Digit5") {  
				return;
			}
			var d = parseInt(keyCode[5], 10) - 1;
			if (myPlayer.inv[d]) {myPlayer.selected = d;}
		}
	}
}
function onKeyUp(event) {
	keyCode = event.code;
	divisDownKeys[keyCode] = false;
}
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
function processArrowKeys() {
	if (divisDownKeys["ArrowUp"]) {onCameraTurn({movementX: 0, movementY: -arrowKeySensitivity});}
	if (divisDownKeys["ArrowDown"]) {onCameraTurn({movementX: 0, movementY: arrowKeySensitivity});}
	if (divisDownKeys["ArrowLeft"]) {onCameraTurn({movementX: -arrowKeySensitivity, movementY: 0});}
	if (divisDownKeys["ArrowRight"]) {onCameraTurn({movementX: arrowKeySensitivity, movementY: 0});}
}
