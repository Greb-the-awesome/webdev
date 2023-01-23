var gameRoomName;
var otherPlayers = [myPlayer];

function hostGame_monkey() {
    {
      transmitItem = function(a) {
        sio.emit("s_itemcreate", a);
      };
        let A = class extends Zombie {
          constructor(a,b,c,d,id,target) {
            super(a,b,c,d);
            this.id = id;
            this.zombieType = "base";
            this.target = myPlayer;
            sio.emit("s_zombiespawn", {pos:a,model:"zombie",damage:c,health:d,targetId:PLAYERID,room:gameRoomName});
          }
          transmitDeath() {
            sio.emit("s_zombiedelete", {id: this.id, room: gameRoomName});
          }
          checkDestruction() {return false;}
          takeDamage() {}
        };
        Zombie = A;
        let B = class extends Zombie {
          constructor(a,b,c,d,id,target) {
            super(a,b,c,d,id,target);
            this.vaxes = [];
            this.zombieType = "enoker";
          }
          spawnVaxes() {}
        };
        Enoker = B;
        let C = class extends Vax {
          constructor(a,b,c,d, id, target) {
            super(a,b,c,d);
            this.id = id;
            this.zombieType = "vax";
            this.target = target;
          }
          update() {return this.updateAngle(...this.updatePos())}
        };
        Vax = C;
        myPlayer.sendData = function() {
          sio.emit("playerUpdate", {
            // idk why im sending both pos and hitPos, backwards compatibiility I guess
            pos: [...this.cameraPos],
            hPos: [...this.hitPos],
            health: this.health,
            yaw: this.yaw,
            pitch: this.pitch,
            invSelect: this.invSelect,
            takingDamage: this.takingDamage,
            id: PLAYERID,
            room: gameRoomName
          });
        };
        myPlayer.toJSON = function() {
          return {id: PLAYERID, cameraPos: [...this.cameraPos]};
        };
        myPlayer.sendShootEvent = function(b) {
          sio.emit("playerShoot", {
            pos: b.pos, vel: b.front, damage: b.damage, id: b.id, room: gameRoomName
          });
        };
        let E = class extends Bullet {
          constructor(a,b,c,d=true) {
            super(a,b,c,d);
            this.id = Date.now();
          }
          checkDestruction() {return false;}
        };
        Bullet = E;
        multiplayerUpdate = function() {
          var transformInfos = buffers_d.transformShader.data;
          for (var oth of otherPlayers) {
              transformInfos.aVertexPosition = transformInfos.aVertexPosition.concat(cube);
              transformInfos.aColor = transformInfos.aColor.concat(mList([1,1,1,1],cube.length*4/3));
              transformInfos.aVertexNormal = transformInfos.aVertexNormal.concat(mList([1,1,1],cube.length/3));
              transformInfos.aYRot = transformInfos.aYRot.concat(mList([oth.yaw],cube.length/3));
              transformInfos.aTranslation = transformInfos.aTranslation.concat(mList(oth.pos),cube.length/3);
          }
        };
        sio.on("s_playerjoin", function(data) {
          otherPlayers.push(new OtherPlayer([0,0,0], data.id));
        });
        sio.on("getOtherPlayers", function(data) {
          sio.emit("receiveOtherPlayers", {p: otherPlayers, room: gameRoomName});
          console.log("emit receiveotherplayers");
        });
      }
}