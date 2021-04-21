function gRC(min, max) {
    var R, G, B;
    R = Math.floor(Math.random() * (max - min + 1)) + min;
    G = Math.floor(Math.random() * (max - min + 1)) + min;
    B = Math.floor(Math.random() * (max - min + 1)) + min;
    return "#" + R.toString(16) + (B + 8).toString(16) + G.toString(16);
}

var g = {};
var img = new Image();

g.init = function() {
    var self = this;

    this.itemList = [];
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.name = "Graphics";

    this.render();

    this.canvas.addEventListener('mousemove', function(e) {
        var square = new self.Square(
            e.offsetX,
            e.offsetY,
            70,
            self.ctx
        );
        square.render();
        square.suicide();
    }, false);
};

g.render = function() {
    this.ctx.fillStyle = "#AED6F1";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.itemList.forEach(function(item, i, arr) {
        item.render();
    });
};

g.Square = function(x, y, size, ctx) {
    g.itemList.push(this);

    this.x = x;
    this.y = y;
    this.size = size;
    this.ctx = ctx;
    this.color = gRC(240, 245);
};

g.Square.prototype.render = function() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    this.ctx.clip();	// use the current arc path as the clipping area
    this.ctx.fillStyle = this.color;
    this.ctx.fill();	// fill the arc to act as an image background
    this.ctx.drawImage(	// draw the image
        img,						// source
        0,							// source x
        0,							// source y
        img.width,					// source width
        img.height,					// source height
        this.x - (img.width / 2),	// destination x
        this.y - (img.height / 2),	// destination y
        img.width,					// destination width
        img.height					// destination height
    );
    this.ctx.restore();
}

g.Square.prototype.suicide = function() {
    var i = 1;
    var smallDown = function() {
        this.y += Math.cos(this.x) * i;
        this.x += Math.cos(this.y) * i;
        i += 0.5;
        g.render();
        this.size -= 5;

        if (this.size > 0) {
            setTimeout(smallDown.bind(this), 25);
        } else {
            var position = g.itemList.indexOf(this);
            g.itemList.splice(position, 1);
            g.render();
            return
        }
    };

    smallDown.call(this);
};

// wait for the image to load before starting
img.onload = function() {
	g.init();
};
img.src = "../img/logo.png";