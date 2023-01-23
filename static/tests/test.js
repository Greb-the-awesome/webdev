function myFunction() {
  window.open("https://www.w3schools.com");
}
changed=false;
function func2() {
	if(changed==false){
		document.getElementById('btn1').innerHTML='aha ye change me';
		changed=true;
	}
	else{
		document.getElementById('btn1').innerHTML='click me';
		changed=false;
	}
}
function changeColor(){
	var rand1=Math.floor(Math.random()*10).toString();
	var rand2=Math.floor(Math.random()*10).toString();
	var rand3=Math.floor(Math.random()*10).toString();
	document.getElementById('BODY').style='background-color:#'+rand1+rand2+rand3;
}
var gameRoomName = socket.id;
function sockt(txt) {
	socket.emit("msg", {body: txt, room: gameRoomName});
}

function joinRoom(txt) {
	socket.emit("join_game", {playerName: "e", id: 69, room: txt}, (data) => {
		if (data.status != "ok") {
			socket.emit("create_game", txt);
			// socket.emit("join_game", {playerName: "e", id: 69, room: txt});
		}
		gameRoomName = txt;
	});
}

