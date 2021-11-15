var navbarLists;
function onLoad() {
	window.addEventListener("contextmenu", function(event) {
		// event.preventDefault();
		// alert("dont right click aight");
	});
	navbarLists = document.querySelector(".navbar-list-top");
}

function addVisibleClasses(item, index) {
	item.classList.add("visible");
	item.classList.remove("unvisible");
	// console.log("added visible class");
	// console.log(item.classList[0]);
	// console.log(item.classList[1]);
}

function removeVisibleClasses(item, index) {
	item.classList.remove("visible");
	item.classList.add("unvisible");
	// console.log("removed visible class");
	// console.log("aaaaaaaaaaaaaaaaaaaaaaaa");
	// console.log(item.classList[0]);
	// console.log(item.classList[1]);
}

function toggleMenu() {
	if ( navbarLists.classList.contains("visible") ) {
		// console.log("using forEach");
		document.querySelectorAll(".navbar-list-top").forEach(removeVisibleClasses);
		// console.log("foreach done");
	}
	else {
		document.querySelectorAll(".navbar-list-top").forEach(addVisibleClasses);
		// console.log("foreaching the list and adding visible class");
		// console.log("foreach (hopefully) calling addVisibleClasses")
	}
}

document.querySelector("#dropdown-button").addEventListener("click", toggleMenu);

window.onload = onLoad;