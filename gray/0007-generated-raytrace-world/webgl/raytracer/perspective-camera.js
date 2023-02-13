import { add_vector_vector, cross_vector_vector, mul_number_vector, neg_vector, normalize_vector } from '../../../lib/math.js';
import SystemDataView from '../../../lib/system-data-view.js';
import { indent } from './scene.js';

export const properties = {
    id: Symbol('id'),
    compute: Symbol('compute'),
    state: Symbol('state'),
    center: Symbol('center'),
    right: Symbol('right'),
    up: Symbol('up')
};

export const methods = {
    compute: Symbol('compute')
};

const defaultOptions = { origin: [0, 0, 0], direction: [0, 1, 0], near_frame: 1.0, field_of_view: 60.0, world_up: [0, 0, 1], aspect_ratio: 1.0 };

export default class PerspectiveCamera {
    constructor(options = {}) {
        options = { ...defaultOptions, ...options };
        this[properties.compute] = true;
        const names = Object.keys(options);
        const state = this[properties.state] = Object.create(null);
        for (const name of names) {
            state[name] = options[name];
            Object.defineProperty(this, name, {
                configurable: true,
                get: () => this[properties.state][name],
                set: value => {
                    this[properties.state][name] = value;
                    this[properties.compute] = true;
                }
            });
        }
    }

    compileUniformBlock(register) {
        register('vec3', 'origin');
        register('vec3', 'center');
        register('vec3', 'right');
        register('vec3', 'up');
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

    compile(uniform, { position = 'position', ray_origin = 'ray_origin', ray_direction = 'ray_direction' }) {
        return [
            '{',
            `${indent}vec2 screen_position = ${position}.xy * 2.0 - 1.0;`,
            `${indent}vec3 screen_point = ${uniform.center} + screen_position.x * ${uniform.right} + screen_position.y * ${uniform.up};`,
            `${indent}${ray_direction} = normalize(screen_point - ${uniform.origin});`,
            `${indent}${ray_origin} = ${uniform.origin};`,
            '}'
        ];
    }

    writeUniformData(buffer, offset) {
        if (this[properties.compute]) {
            this[methods.compute]();
        }
        const state = this[properties.state];
        const view = new SystemDataView(buffer);
        for (let i = 0; i < 3; ++i) {
            view.setFloat32(offset.origin + i * 4, state.origin[i]);
        }
        for (let i = 0; i < 3; ++i) {
            view.setFloat32(offset.center + i * 4, state.center[i]);
        }
        for (let i = 0; i < 3; ++i) {
            view.setFloat32(offset.right + i * 4, state.right[i]);
        }
        for (let i = 0; i < 3; ++i) {
            view.setFloat32(offset.up + i * 4, state.up[i]);
        }
    }
};
