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
var e;
var beforeFloating
for (let i = 0; i < 1000; i++) {
	e = i * 0.04 / 2.5;
}

function sockt(txt) {
	console.log(txt);
	socket.emit("message", txt);
}

