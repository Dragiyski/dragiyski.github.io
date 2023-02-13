import { assert, assertVectorLength } from '../../../lib/math-assert.js';
import { add_vector_vector, cross_vector_vector, mul_number_vector, neg_vector, normalize_vector } from '../../../lib/math.js';
import SystemDataView from '../../../lib/system-data-view.js';
import { indent } from './scene.js';

export const properties = {
    id: Symbol('id'),
    compute: Symbol('compute'),
    state: Symbol('state')
};

export const methods = {
    compute: Symbol('compute')
};

const defaultOptions = { origin: [0, 0, 0], direction: [0, 1, 0], near_frame: 1.0, field_of_view: 60.0, world_up: [0, 0, 1], aspect_ratio: 1.0 };

export default class PerspectiveCamera {
    constructor(options = {}) {
        options = { ...defaultOptions, ...options };
        assertVectorLength(options.origin, 3);
        assertVectorLength(options.direction, 3);
        assert(isFinite(options.near_frame));
        assert(isFinite(options.field_of_view));
        assertVectorLength(options.world_up, 3);
        assert(isFinite(options.aspect_ratio) && options.aspect_ratio >= 0.0);
        this[properties.compute] = true;
        const names = Object.keys(options);
        const state = this[properties.state] = Object.create(null);
        for (const name of names) {
            state[name] = options[name];
        }
    }

    compileUniform() {
        return [
            `uniform vec3 camera_origin;`,
            `uniform vec3 screen_center;`,
            `uniform vec3 screen_right;`,
            `uniform vec3 screen_up;`,
            ''
        ];
    }

    [methods.compute]() {
        const state = this[properties.state];
        const screen_right = normalize_vector(cross_vector_vector(state.direction, state.world_up));
        const screen_up = normalize_vector(neg_vector(cross_vector_vector(state.direction, screen_right)));
        const field_of_view = (state.field_of_view * 0.5) / 180 * Math.PI;
        const aspect_ratio = state.aspect_ratio;
        const diagonal_size = Math.tan(field_of_view) * state.near_frame;
        state.center = add_vector_vector(state.origin, mul_number_vector(state.near_frame, state.direction));
        const height = diagonal_size / Math.sqrt(1 + aspect_ratio * aspect_ratio);
        const width = aspect_ratio * height;
        state.up = mul_number_vector(height, screen_up);
        state.right = mul_number_vector(width, screen_right);
        this[properties.compute] = false;
    }

    compile({ position = 'position', ray_origin = 'ray_origin', ray_direction = 'ray_direction' }) {
        return [
            '{',
            `${indent}vec2 screen_position = ${position}.xy * 2.0 - 1.0;`,
            `${indent}vec3 screen_point = screen_center + screen_position.x * screen_right + screen_position.y * screen_up;`,
            `${indent}${ray_direction} = normalize(screen_point - camera_origin);`,
            `${indent}${ray_origin} = camera_origin;`,
            '}'
        ];
    }

    get origin() {
        return this[properties.state].origin;
    }

    set origin(value) {
        assertVectorLength(value, 3);
        this[properties.state].origin = [...value];
        this[properties.compute] = true;
    }

    get direction() {
        return this[properties.state].direction;
    }

    set direction(value) {
        assertVectorLength(value, 3);
        this[properties.state].direction = normalize_vector(value);
        this[properties.compute] = true;
    }

    get aspect_ratio() {
        return this[properties.state].aspect_ratio;
    }

    set aspect_ratio(value) {
        assert(isFinite(value) && value > 0);
        this[properties.state].aspect_ratio = value;
        this[properties.compute] = true;
    }

    get forward() {
        return normalize_vector(this[properties.state].direction);
    }

    get backward() {
        return neg_vector(normalize_vector(this[properties.state].direction));
    }

    get right() {
        return normalize_vector(this[properties.state].right);
    }

    get left() {
        return neg_vector(normalize_vector(this[properties.state].right));
    }

    get up() {
        return normalize_vector(this[properties.state].up);
    }

    get down() {
        return neg_vector(normalize_vector(this[properties.state].up));
    }

    writeUniform(gl, program) {
        if (this[properties.compute]) {
            this[methods.compute]();
        }
        const state = this[properties.state];
        program.uniform.camera_origin.setArray(state.origin);
        program.uniform.screen_center.setArray(state.center);
        program.uniform.screen_right.setArray(state.right);
        program.uniform.screen_up.setArray(state.up);
    }
};
