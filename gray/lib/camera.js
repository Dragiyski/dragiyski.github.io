export class RectangleCamera {
    constructor() {
        this.position = [0, 0, 1];
        this.direction = [0, 0, -1];
        this.fov = 60;
    }

    update() {
        this.screenCenter = [0, 0, 0];
        for (let i = 0; i < 3; ++i) {
            this.screenCenter[i] = this.position[i] + this.direction[i];
        }
    }
};
