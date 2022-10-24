console.log("weapons.js loaded.");
function genNoise(path) {
	return "/static/zombiegame_updated_3d/sfx/"+path+".mp3";
}
var weapons = [
	[{name: "AA-12", texCoordStart: [266/texW, 0], specs: {damage: 100, delay: 40, reloadTime: 1800, capacity: 20}}, 4],
	[{name: "AK-47", texCoordStart: [366/texW, 0], specs: {damage: 150, delay: 75, reloadTime: 2000, capacity: 30}}, 3],
	[{name: "Kar98K", texCoordStart: [266/texW, 100/texH], specs: {damage: 40, delay: 500, reloadTime: 2000, capacity: 12, fire:genNoise("kar_fire"),rel:genNoise("kar_reload")}}, 1],
	[{name: "Macaroni Gun Mk II", texCoordStart: [366/texW, 100/texH], specs: {damage: 40, delay: 50, reloadTime: 6000, capacity: 690}}, 69],
	[{name: "QCW-05", texCoordStart: [366/texW, 200/texH], specs: {damage: 40, delay: 30, reloadTime: 1100, capacity: 50}}, 5],
	[{name: "M249", texCoordStart: [266/texW, 200/texH], specs: {damage: 40, delay: 80, reloadTime: 4000, capacity: 100, fire: genNoise("m249_fire"), rel: genNoise("m249_reload")}}, 1],
	[{name: "Vector", texCoordStart: [266/texW, 400/texH], specs: {damage: 30, delay: 30, reloadTime: 1000, capacity: 33, fire: genNoise("vector_fire"), rel: genNoise("gl_reload")},}, 2],
];

var upgrades = [
["Extra Ammo", [0, 0.5], {action:()=>myPlayer.invSelect.specs.capacity = 100,
	desc:"do you really not know what extra ammo means?"}],
["ClUtCh!!!", [0, 0.69], {action:()=>myPlayer.invSelect.clutcher = true,
	desc: "When you are low on health, this weapon does not need to reload!"}],
["Sus Juice", [0.195, 0.5], {action:()=>myPlayer.health = Math.max(myPlayer.health + 75, 100),
	desc: "Heal 75 health on application. (this doesn't affect your weapon)"}]
];