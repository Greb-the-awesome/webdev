var physicsObjects = [];
var blanketObjects = [];
// aint no way its a wild physics engine
class PhysicsObject {
    constructor(x, y, z, dx, dy, dz, kin, add = true) {
        // very simple physics engine, assumes AABB with x, y, z are the MIDDLE
        // when doing non-AABB collision we assume that the point is at the bottom middle
        this.pos = [x, y, z];
        this.vel = [0, 0, 0];
        this.dx = dx; this.dy = dy; this.dz = dz;
        this.kinematic = kin;
        if (add) {physicsObjects.push(this);}
    }
    drawBox(c = [1,0,0,1]) {
        var tp = this.pos;
        var p = [
            [tp[0]-this.dx, tp[1]-this.dy, tp[2]-this.dz], // ---
            [tp[0]-this.dx, tp[1]+this.dy, tp[2]-this.dz], // -+-
            [tp[0]+this.dx, tp[1]-this.dy, tp[2]-this.dz], // +--
            [tp[0]+this.dx, tp[1]+this.dy, tp[2]-this.dz], // ++-
            [tp[0]+this.dx, tp[1]-this.dy, tp[2]+this.dz], // +-+
            [tp[0]+this.dx, tp[1]+this.dy, tp[2]+this.dz], // +++
            [tp[0]-this.dx, tp[1]-this.dy, tp[2]+this.dz], // --+
            [tp[0]-this.dx, tp[1]+this.dy, tp[2]+this.dz]  // -++
        ]
        debugLine(p[0], p[1], c); debugLine(p[2], p[3], c); debugLine(p[4], p[5], c); debugLine(p[6], p[7], c);
        debugLine(p[1], p[3], c); debugLine(p[3], p[5], c); debugLine(p[5], p[7], c); debugLine(p[7], p[1], c);
        debugLine(p[1-1], p[3-1], c); debugLine(p[3-1], p[5-1], c); debugLine(p[5-1], p[7-1], c); debugLine(p[7-1], p[1-1], c);
    }
    static GlobalGravity = 0.005;
    static checkCollideAABB(a1, a2) {
        if (a1.kinematic && a2.kinematic) {return;}
        // returns bool and assigns a1 and a2's positions and velocities automatically.
        if (a1.kinematic && !a2.kinematic) {
            [a1, a2] = [a2, a1]; // if one of them is kinematic, it will always be a2.
        }
        var ret = {colliding: false, suggestedPos: [NaN, NaN, NaN]};
        var xdist = Math.abs(a1.pos[0] - a2.pos[0]) - (a1.dx + a2.dx);
        var ydist = Math.abs(a1.pos[1] - a2.pos[1]) - (a1.dy + a2.dy);
        var zdist = Math.abs(a1.pos[2] - a2.pos[2]) - (a1.dz + a2.dz);
        if (
            xdist < 0 && ydist < 0 && zdist < 0
        ) {
            ret.colliding = true;
            // oCtx.font = "30px Calibri";
            // oCtx.fillText("collision info:\n" + xdist + " " + ydist + " " + zdist, 100, 100);
            var m = Math.max(xdist, ydist, zdist);
            if (a2.kinematic) {
                if (m == xdist) {
                    a1.pos[0] += -Math.abs(a1.pos[0] - a2.pos[0]) / (a1.pos[0] - a2.pos[0]) * xdist;
                    a1.vel[0] = 0;
                }
                else if (m == ydist) {
                    a1.pos[1] += -Math.abs(a1.pos[1] - a2.pos[1]) / (a1.pos[1] - a2.pos[1]) * ydist;
                    a1.vel[1] = 0;
                }
               else if (m == zdist) {
                    a1.pos[2] += -Math.abs(a1.pos[2] - a2.pos[2]) / (a1.pos[2] - a2.pos[2]) * zdist;
                    a1.vel[2] = 0;
                }
            } else {
                if (m == xdist) {
                    a1.pos[0] += -Math.abs(a1.pos[0] - a2.pos[0]) / (a1.pos[0] - a2.pos[0]) * xdist/2;
                    a2.pos[0] += Math.abs(a1.pos[0] - a2.pos[0]) / (a1.pos[0] - a2.pos[0]) * xdist/2;
                    a1.vel[0] = 0; a2.vel[0] = 0;
                }
                else if (m == ydist) {
                    a1.pos[1] += -Math.abs(a1.pos[1] - a2.pos[1]) / (a1.pos[1] - a2.pos[1]) * ydist/2;
                    a2.pos[1] += Math.abs(a1.pos[1] - a2.pos[1]) / (a1.pos[1] - a2.pos[1]) * ydist/2;
                    a1.vel[1] = 0; a2.vel[1] = 0;
                }
               else if (m == zdist) {
                    a1.pos[2] += -Math.abs(a1.pos[2] - a2.pos[2]) / (a1.pos[2] - a2.pos[2]) * zdist/2;
                    a2.pos[2] += Math.abs(a1.pos[2] - a2.pos[2]) / (a1.pos[2] - a2.pos[2]) * zdist/2;
                    a1.vel[2] = 0; a2.vel[2] = 0;
                }
            }
            return true;
        }
        return false;
    }
}

class BlanketObject {
    constructor(genFunc, xstart, xend, ystart, yend, add = true) {
        // a blanket like thing that can collide
        // make sure genFunc is a fast function or else performance go down into yo mom's a__
        this.genFunc = genFunc;
        this.xstart = xstart;
        this.xend = xend;
        this.zstart = ystart;
        this.zend = yend;
        if (add) {blanketObjects.push(this);}
    }
    static checkCollideAABB(blanket, aabb) {
        // returns an Object
        // {colliding: bool, suggestedPos: Array(3)}
        var ret = {colliding: false, suggestedPos: [NaN, NaN, NaN]};
        var height = blanket.genFunc(aabb.pos[0], aabb.pos[2]);
        if (aabb.pos[0] > blanket.xstart && aabb.pos[0] < blanket.xend &&
            aabb.pos[2] > blanket.zstart && aabb.pos[2] < blanket.zend &&
            aabb.pos[1] - aabb.dy/2 < height && aabb.pos[1] + aabb.dy/2 > height) {
            ret.colliding = true;
            ret.suggestedPos = aabb.pos;
            if (aabb.pos[1] - height > 0) {
                ret.suggestedPos[1] = height + aabb.dy/2;
            } else {
                ret.suggestedPos[1] = height - aabb.dy/2;
            }
        }
        return ret;
    }
}

class Player extends PhysicsObject {
    constructor() {
        super(0, 10, 0, 2, 2, 2);
        this.yaw = 0.0; this.pitch = 0.0;
        this.cameraFront = glMatrix.vec3.create();
        this.cameraUp = glMatrix.vec3.fromValues(0, 1, 0);
        this.jumpPower = 0.01;
    }
}

class Block {
    constructor(x, z) {
        // x and y are the center of the block
        this.x = x; this.z = z;
        var y = z; // cuz me dumb when ctrl c ctrl v
        this.pos1 = [x-0.51, ns2((x-0.5), (y-0.5)), y-0.51];
        this.pos2 = [x+0.51, ns2((x+0.5), (y-0.5)), y-0.51];
        this.pos3 = [x-0.51, ns2((x-0.5), (y+0.5)), y+0.51];
        this.pos4 = [x+0.51, ns2((x+0.5), (y+0.5)), y+0.51];
		for (var i=1; i<=4; i++) {
			var pos = this["pos"+i.toString()];
			const ep = 2;
			const mulfac = 0.7;
			const offset = -1;
			this["n"+i.toString()] = //vec3_avg(
				vec3_cross([-ep-offset, ns2(pos[0]-ep-offset, pos[2]-offset), -offset],
				[-offset, ns2(pos[0]-offset, pos[2]+ep-offset), ep-offset]);
			var temp = this["n"+i.toString()];
			temp[0] *= mulfac; temp[1] *= mulfac; temp[2] *= mulfac;
		}
		for (let i=1; i<5; i++) { // start from 1 because this.pos[1,2,3,4] starts from 1
			var ref = normalRef[i];
			var vec1 = glMatrix.vec3.create();
			var vec2 = glMatrix.vec3.create();
			glMatrix.vec3.subtract(vec1, this[ref[0]], this["pos"+i]);
			glMatrix.vec3.subtract(vec2, this[ref[1]], this["pos"+i]);
			var n = glMatrix.vec3.create();
			glMatrix.vec3.cross(n, vec1, vec2);
			this["n"+i] = [n[0], n[1], n[2]];
		}
		var px = 256/TEXW; var py = 256/TEXH;
		var dx = 1536/TEXW; var dy = 1536/TEXH;
        shaderAddData({
            "aVertexPosition": this.pos1.concat(this.pos2.concat(this.pos3.concat(this.pos2.concat(this.pos3.concat(this.pos4))))),
            "aVertexNormal": this.n1.concat(this.n2.concat(this.n3.concat(this.n2.concat(this.n3.concat(this.n4))))),
			// "aVertexNormal": mList([1], 36),
            "aTexCoord1": mList([0, py, px, py, 0, 0, px, py, 0, 0, px, 0], 4),
			"aTexCoord2": mList([dx, 1, 1, 1, dx, dy, 1, 1, dx, dy, 1, dy], 4),
			"aTexCoord3": mList([dx, 1, 1, 1, dx, dy, 1, 1, dx, dy, 1, dy], 4),
			"aTexCoord4": mList([0, py, px, py, 0, 0, px, py, 0, 0, px, 0], 4),
			"aMixFactor": mList([1, ns2(x+dirtOffset, y+dirtOffset), 0.25, 0.25], 6)
        }, "shaderProgram");
    }
}


class TallGrass {
    constructor(x, z, size, drift = 0.015, add = true) {
        this.positions = [];
        this.data = {
            "aCenterOffset": [], "aCorner": [], "aTexCoord": []
        };
        for (var i=0; i<size; i++) {
            var hyp = 1-Math.random()**2;
            var theta = Math.random()*Math.PI*2;
            var posx = Math.cos(theta)*size*drift*hyp+x;
            var posy = Math.sin(theta)*size*drift*hyp+z;
            var pos = [posx, ns2(posx, posy)+Math.random()*0.3-0.1, posy];
            if (Math.sqrt((posx-x)**2 + (posy-y)**2) < size * drift * 0.3 && Math.random() < 0.3) {
                continue;
            }
            this.positions.push(pos);
            this.data.aCenterOffset = this.data.aCenterOffset.concat(mList(pos, 6));
            var y = z; // cuz me dumb when ctrl c ctrl v
            var maxSize = 1;
            var tSize = Math.min(Math.max(0.1, 3*(maxSize - Math.sqrt((posx-x)**2 + (posy-y)**2)/size/drift*2)), 0.4);
            var pos1 = [-tSize, +tSize];
            var pos2 = [+tSize, -tSize];
            var pos3 = [-tSize, -tSize];
            var pos4 = [+tSize, +tSize];
            
            this.data.aCorner = this.data.aCorner.concat(
                pos1.concat(pos2.concat(pos3.concat(pos1.concat(pos2.concat(pos4)))))
            );
            var ustart, uend, vstart, vend;
            if (Math.random() < 0.2) {
                ustart = 512/TEXW, uend = 768/TEXW, vstart = 0, vend = 256/TEXW;
            } else if (Math.random() < 0.9) {
                ustart = 768/TEXW, uend = 1024/TEXW, vstart = 0, vend = 256/TEXW;
            } else {
                ustart = 1024/TEXW, uend = 1280/TEXW, vstart = 0, vend = 256/TEXW;
            }
            this.data.aTexCoord = this.data.aTexCoord.concat([
                ustart, vstart, uend, vend, ustart, vend, ustart, vstart, uend, vend, uend, vstart
            ]);
            if (add) {
                shaderAddData(this.data, "billboardShader");
            }
        }
    }
}