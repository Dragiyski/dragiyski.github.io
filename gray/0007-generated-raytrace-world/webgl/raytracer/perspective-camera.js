import { assertVectorLength } from '../../../lib/math-assert.js';
import { normalize_vector } from '../../../lib/math.js';

let class_index = 0;

export const properties = {
    index: Symbol('index')
};

export default class PerspectiveCamera {
    constructor() {
        this[properties.index] = ++class_index;
    }

    register(program) {
        const index = this[properties.index];
        program.registerUniform('vec3', `perspective_camera_${index}_origin`);
        program.registerUniform('vec3', `perspective_camera_${index}_screen_center`);
        program.registerUniform('vec3', `perspective_camera_${index}_world_screen_center`);
        program.registerUniform('vec3', `perspective_camera_${index}_world_screen_right`);
        program.registerUniform('vec3', `perspective_camera_${index}_world_screen_up`);
    }

    getCode({ position = 'position' }) {
        const index = this[properties.index];
        return [
            `vec2 perspective_camera_${index}_position = ${position}.xy * 2.0 - 1.0;`,
            `vec3 perspective_camera_${index}_screen_point = perspective_camera_${index}_screen_center + perspective_camera_${index}_position.x * perspective_camera_${index}_world_screen_right + perspective_camera_${index}_position.y * perspective_camera_${index}_world_screen_up;`,
            `vec3 perspective_camera_${index}_ray_direction = normalize(perspective_camera_${index}_screen_point - perspective_camera_${index}_origin);`
        ];
    }

    get name_ray_origin() {
        return `perspective_camera_${this[properties.index]}_origin`;
    }

    get name_ray_direction() {
        return `perspective_camera_${this[properties.index]}_ray_direction`;
    }
};
