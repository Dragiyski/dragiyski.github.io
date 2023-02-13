import { float32 } from '../../../lib/float.js';
import { assert, assertVectorLength } from '../../../lib/math-assert.js';
import { cross_vector_vector, dot_vector_vector, normalize_vector } from '../../../lib/math.js';
import { indent } from './scene.js';

export const properties = {
    state: Symbol('state'),
    compute: Symbol('compute')
};

export const methods = {
    compute: Symbol('compute')
};

const defaultOptions = {};

export default class Quad {
    constructor(options) {
        options = Object.assign(Object.create(null), { ...defaultOptions, ...options });
        assertVectorLength(options.origin, 3);
        assertVectorLength(options.direction_x, 3);
        assertVectorLength(options.direction_y, 3);
        assert(float32.isEqual(dot_vector_vector(options.direction_x, options.direction_y), 0.0));
        const state = this[properties.state] = Object.create(null);
        for (const name in options) {
            state[name] = options[name];
        }
        this[properties.compute] = true;
    }

    get size() {
        return 1;
    }

    compileUniformBlock(register) {
        register('vec3', 'origin');
        register('vec3', 'direction_x');
        register('vec3', 'direction_y');
        register('vec3', 'normal');
        register('float', 'dot_normal_origin');
    }

    [methods.compute]() {
        const state = this[properties.state];
        state.normal = normalize_vector(cross_vector_vector(state.direction_x, state.direction_y));
        state.dot_normal_origin = dot_vector_vector(state.normal, state.origin);
    }

    writeUniformData(names) {
        if (this[properties.compute]) {
            this[methods.compute]();
        }
        const state = this[properties.state];
        writeVector('origin', 3);
        writeVector('direction_x', 3);
        writeVector('direction_y', 3);
        writeVector('normal', 3);
        names.dot_normal_origin.buffer.setFloat32(names.dot_normal_origin.offset, state.dot_normal_origin);

        function writeVector(name, length) {
            for (let i = 0; i < length; ++i) {
                names[name].buffer.setFloat32(names[name].offset + i * 4, state[name][i]);
            }
        }
    }

    compile(baseId, uniform, {
        state_id = 'state_id',
        state_depth = 'state_depth',
        state_normal = 'state_normal',
        state_hit_point = 'state_hitpoint',
        ray_origin = 'ray_origin',
        ray_direction = 'ray_direction'
    } = {}) {
        return [
            'do {',
            `${indent}float dot_normal_ray_direction = dot(${uniform.normal}, ${ray_direction});`,
            `${indent}float raytrace_depth = (${uniform.dot_normal_origin} - dot(${uniform.normal}, ${ray_origin})) / dot_normal_ray_direction;`,
            `${indent}if (raytrace_depth > 0.0 && raytrace_depth < ${state_depth}) {`,
            `${indent}${indent}vec3 raytrace_hit_point = ${ray_origin} + raytrace_depth * ${ray_direction};`,
            `${indent}${indent}vec3 quad_vector = raytrace_hit_point - ${uniform.origin};`,
            `${indent}${indent}vec2 uv = vec2(dot(quad_vector, ${uniform.direction_x}) / dot(${uniform.direction_x}, ${uniform.direction_x}), dot(quad_vector, ${uniform.direction_y}) / dot(${uniform.direction_y}, ${uniform.direction_y}));`,
            `${indent}${indent}if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {`,
            `${indent}${indent}${indent}${state_id} = ${baseId}u;`,
            `${indent}${indent}${indent}${state_depth} = raytrace_depth;`,
            `${indent}${indent}${indent}${state_hit_point} = raytrace_hit_point;`,
            `${indent}${indent}${indent}${state_normal} = -(dot_normal_ray_direction / abs(dot_normal_ray_direction)) * ${uniform.normal};`,
            `${indent}${indent}}`,
            `${indent}}`,
            '} while (false);'
        ];
    }
}
