class Player {
    constructor() {
        this.pos = glMatrix.vec3.create();
        this.yaw = 0.0; this.pitch = 0.0;
        this.cameraFront = glMatrix.vec3.create();
        this.cameraUp = glMatrix.vec3.fromValues(0, 1, 0);
    }
}