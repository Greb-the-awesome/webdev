console.log("classes.js loaded");

class Player {
    constructor() {
        this.x = w * 0.5; this.y = 0;
        this.width = w * 0.1; this.height = h * 0.1;
    }
}

class BackgroundShape {
    constructor(x, y, w, h, color1, color2) {
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.c1 = color1; this.c2 = color2;
        this.grad = ctx.createLinearGradient(x, y, x + w, y + w);
        this.grad.addColorStop(0, this.c1);
        this.grad.addColorStop(1, this.c2);
    }
    draw(offset) {
        ctx.fillStyle = this.grad;
        ctx.fillRect(this.x+offset, this.y, this.w, this.h);
    }
}

class Background {
    constructor(numShapes) {
        this.shapes = [];
        for (let i=0; i<numShapes; i++) {
            this.shapes.push(new BackgroundShape(
                Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h,
                "rgb(0, 255, 0)", "rgb(255, 0, 0)"
            ));
        }
    }
    draw() {
        ctx.save();
        ctx.resetTransform();
        const offset = (screenPos) % w;
        for (const shape of this.shapes) {
            shape.draw(offset);
        }
        ctx.restore();
    }
}