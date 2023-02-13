const index = 1;
const names = [
    'origin',
    ...(new Array(3)).map((_, i) => [`vec3`, `direction_${i + 1}`]),
    ...(new Array(3)).map((_, i) => [`vec3`, `normal_${i + 1}`]),
    ...(new Array(8)).map((_, i) => [`vec3`, `point_${i + 1}`])
];

class Box {
    constructor(O, A, B, C) {
        this.origin = O;
        this.direction = [A, B, C];
    }
};
