console.log("classes.js loaded.");

// bullet class
class Bullet {
	constructor(x, y, angle, damage, color, speed) {
		this.posX = x - widthIncrement * 0.5; // because it needs to be in the center
		this.posY = y - widthIncrement * 0.5;
		this.width = widthIncrement
		this.angle = -angle; // lmao radians
		this.height = heightIncrement;
		this.damage = damage;
		this.color = color;
		this.speed = speed;
		this.angleSin = Math.sin(this.angle);
		this.angleCos = Math.cos(this.angle);

		this.moveX = this.angleCos * this.speed;
		this.moveY = -this.angleSin * this.speed;
	}
	updatePos() {
		this.posX += this.moveX;
		this.posY += this.moveY;
	}
	draw() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.posX, this.posY,
			widthIncrement, heightIncrement);
	}
}

class Item {
	constructor(x, y, what, img, type, specs) {
		this.posX = x;
		this.posY = y;
		this.width = 100;
		this.height = 100;
		this.what = what;
		this.img = img;
		this.cycle = -1 + Math.random() * 2; // from -1 to 1
		this.cycleUpDown = true; // true = up, false = down
		this.type = type; // gun|heal|put
		this.specs = specs;
		this.timer = 0; // once every short tick (100ms)
		if (this.type == "gun") {this.roundsRemaining = specs.capacity;}
	}
	draw() {
		if (this.cycleUpDown) {
			this.cycle += 0.05;
			if (this.cycle > 1) { this.cycleUpDown = false; }
		} else {
			this.cycle -= 0.05;
			if (this.cycle < -1) { this.cycleUpDown = true; }
		}
		ctx.drawImage(this.img, this.posX, this.posY + this.cycle * widthIncrement);
	}
}

// playr class
class Player {
	constructor() {
		this.posX = 100;
		this.posY = 100;
		this.health = 100;
		this.angle = 0; // why does everyone use radians i am sad
		this.width = widthIncrement * 4;
		this.height = this.width;
		this.speed = widthIncrement/5;
		this.inv = [new Item(0, 0, "macaroni gun", gunImg, "gun", {"damage":25,"color":"#DDDD00","capacity":30,"reloadTime":2450,"delay":150}),
			false, false, false];
		this.invSelect = 0;
		this.reloading = false;
		this.firingDelay = false;
	}
	checkSelect(slot) {
		if (this.invSelect == slot) {
			ctx.lineWidth = 5;
		} else {ctx.lineWidth = 1;}
	}
	draw() {
		ctx.save();
		ctx.translate(this.posX + widthIncrement * 2, this.posY + widthIncrement * 2);
		ctx.rotate(this.angle);
		ctx.translate(-this.posX - widthIncrement * 2, - this.posY - widthIncrement * 2)
		// player
		ctx.fillStyle = "#FF0000";
		ctx.fillRect(this.posX, this.posY,
			this.width, this.height);
		ctx.fillStyle = "#444444";
		// gun
		ctx.drawImage(window.gunImg, this.posX + widthIncrement * 2, this.posY + widthIncrement * 2,
			widthIncrement * 4, widthIncrement);
		ctx.restore();

		// health bar
		ctx.strokeRect(this.posX, this.posY - widthIncrement * 4,
			widthIncrement*4, heightIncrement/2);
		ctx.fillStyle = "#00EEEE";
		ctx.fillRect(this.posX, this.posY - widthIncrement * 4,
			widthIncrement*this.health/25, heightIncrement/2);

		// inv
		ctx.fillStyle = "#000000";
		ctx.strokeRect(widthIncrement * 40, heightIncrement * 85, widthIncrement * 24, widthIncrement * 5);

		this.checkSelect(0);
		ctx.strokeRect(widthIncrement * 41, heightIncrement * 86, widthIncrement * 4, widthIncrement * 4);
		if (player.inv[0]) {
			ctx.drawImage(player.inv[0].img, widthIncrement * 41, heightIncrement * 86, widthIncrement * 4, widthIncrement * 4);
		}
		this.checkSelect(1);
		ctx.strokeRect(widthIncrement * 47, heightIncrement * 86, widthIncrement * 4, widthIncrement * 4);
		if (player.inv[1]) {
			ctx.drawImage(player.inv[1].img, widthIncrement * 47, heightIncrement * 86, widthIncrement * 4, widthIncrement * 4);
		}
		this.checkSelect(2);
		ctx.strokeRect(widthIncrement * 53, heightIncrement * 86, widthIncrement * 4, widthIncrement * 4);
		if (player.inv[2]) {
			ctx.drawImage(player.inv[2].img, widthIncrement * 53, heightIncrement * 86, widthIncrement * 4, widthIncrement * 4);
		}
		this.checkSelect(3);
		ctx.strokeRect(widthIncrement * 59, heightIncrement * 86, widthIncrement * 4, widthIncrement * 4);
		if (player.inv[3]) {
			ctx.drawImage(player.inv[3].img, widthIncrement * 59, heightIncrement * 86, widthIncrement * 4, widthIncrement * 4);
		}
		ctx.lineWidth = 1;

		// since draw() is called every frame were doing some housekeeping here
		this.selected = this.inv[this.invSelect];
		this.selectSpecs = this.selected.specs;

		ctx.fillStyle = "#000000";
		if (this.reloading) {ctx.fillText("reloading", widthIncrement * 40, heightIncrement * 25)}
	}
	shoot() {
		if (this.selected.type == "gun" && !this.reloading) {
			if (this.selectSpecs.shotgun) { // a shotgun
				for (let i=0; i<this.selectSpecs.rpc; i++) {
					bullets.push(new Bullet(this.posX + widthIncrement * 2, this.posY + widthIncrement * 2,
						this.angle - this.selectSpecs.spread/2 + Math.random() * this.selectSpecs.spread,
						this.selectSpecs.damage, this.selectSpecs.color, widthIncrement));
				}
			} else { // not a shotgun
				bullets.push(new Bullet(this.posX + widthIncrement * 2, this.posY + widthIncrement * 2,
					this.angle, this.selectSpecs.damage, this.selectSpecs.color, widthIncrement));
				
			}
			this.selected.roundsRemaining -= 1;
			if (this.selected.roundsRemaining <= 0) {
				this.reloading = true;
				setTimeout(()=>{this.reloading = false;this.selected.roundsRemaining = this.selectSpecs.capacity;}, this.selectSpecs.reloadTime);
			}

			this.firingDelay = true;
			setTimeout(()=>{this.firingDelay = false;}, this.selectSpecs.delay);
		}

		if (this.selected.type == "other.consumable") {
			this.selectSpecs.onclick(this.posX, this.posY);
			this.inv[this.invSelect] = false;
		}
	}
}

// zombie class
class Zombie {
	constructor(x, y, damage) {
		this.posX = x;
		this.posY = y;
		this.health = 50;
		this.damage = damage;
		this.width = widthIncrement * 4;
		this.height = this.width;
	}
	draw() {
		ctx.fillStyle = "#289E45";
		ctx.fillRect(this.posX, this.posY, widthIncrement*4, widthIncrement * 4);

		// health bar
		ctx.strokeRect(this.posX, this.posY - widthIncrement * 3,
			widthIncrement*4, heightIncrement/2);
		ctx.fillStyle = "#EE0000";
		ctx.fillRect(this.posX, this.posY - widthIncrement * 3,
			widthIncrement*this.health/12.5, heightIncrement/2);
	}
}

class Horse {
	constructor(side, pos) {
		if (side == 0) { // ^
			this.y = 0;
			this.x = pos * widthIncrement;
			this.updatePos = ()=>{this.y += widthIncrement/10;};
		} else if (side == 1) { // >
			this.y = pos * widthIncrement;
			this.x = canvasWidth;
			this.updatePos = ()=>{this.x -= widthIncrement/10;};
		} else if (side == 2) { // v
			this.y = canvasHeight;
			this.x = pos * widthIncrement;
			this.updatePos = ()=>{this.y -= widthIncrement/10;};
		} else if (side == 3) { // <
			this.y = pos * heightIncrement;
			this.x = 0;
			this.updatePos = ()=>{this.x += widthIncrement/10;};
		}
		this.alreadyDrop = false;
	}
	checkDrop() {
		if (Math.floor(Math.random() * 100) == 8 && !this.alreadyDrop) {
			zombies.push(new Zombie(this.x + 30, this.y, 40));zombies.push(new Zombie(this.x -10, this.y + 20, 40));zombies.push(new Zombie(this.x, this.y, 40));
			this.alreadyDrop = true;
		}
	}
	draw() {
		ctx.drawImage(horseImg, this.x, this.y, widthIncrement * 10, widthIncrement * 5.7);
	}
}