import { float32 } from '../../../lib/float.js';
import { assert, assertVectorLength } from '../../../lib/math-assert.js';
import { add_vector_vector, cross_vector_vector, dot_vector_vector, normalize_vector } from '../../../lib/math.js';
import SystemDataView from '../../../lib/system-data-view.js';
import { indent } from './scene.js';

export const properties = {
    state: Symbol('state'),
    compute: Symbol('compute')
};

export const methods = {
    compute: Symbol('compute'),
    compileQuad: Symbol('compileQuad')
};

const defaultOptions = {};

export default class Box {
    constructor(options) {
        options = Object.assign(Object.create(null), { ...defaultOptions, ...options });
        assertVectorLength(options.origin, 3);
        assertVectorLength(options.direction_x, 3);
        assertVectorLength(options.direction_y, 3);
        assertVectorLength(options.direction_z, 3);
        assert(float32.isEqual(dot_vector_vector(options.direction_x, options.direction_y), 0.0));
        assert(float32.isEqual(dot_vector_vector(options.direction_y, options.direction_z), 0.0));
        assert(float32.isEqual(dot_vector_vector(options.direction_z, options.direction_x), 0.0));
        const state = this[properties.state] = Object.create(null);
        state.origin = options.origin;
        state.direction = [
            options.direction_x,
            options.direction_y,
            options.direction_z
        ];
        this[properties.compute] = true;
    }

    get size() {
        return 6;
    }

    compileUniformBlock(register) {
        register('vec3', 'origin');
        for (let i = 0; i < 3; ++i) {
            register('vec3', `direction_${i}`);
        }
        for (let i = 0; i < 3; ++i) {
            register('vec3', `normal_${i}`);
        }
        for (let i = 0; i < 3; ++i) {
            register('vec3', `add_origin_direction_${i}`);
        }
        for (let i = 0; i < 3; ++i) {
            register('float', `dot_normal_${i}_origin`);
        }
        for (let i = 0; i < 3; ++i) {
            register('float', `dot_normal_${i}_add_origin_direction_${i}`);
        }
        for (let i = 0; i < 3; ++i) {
            register('float', `direction_${i}_square`);
        }
    }

    [methods.compute]() {
        const state = this[properties.state];
        state.add_origin_direction = new Array(3);
        state.normal = new Array(3);
        state.dot_normal_origin = new Array(3);
        state.dot_normal_add_origin_direction = new Array(3);
        state.direction_square = new Array(3);
        for (let i = 0; i < 3; ++i) {
            state.add_origin_direction[i] = add_vector_vector(state.origin, state.direction[i]);
            const direction_index = [0, 1, 2];
            direction_index.splice(i, 1);
            state.normal[i] = normalize_vector(cross_vector_vector(state.direction[direction_index[0]], state.direction[direction_index[1]]));
            state.dot_normal_origin[i] = dot_vector_vector(state.normal[i], state.origin);
            state.dot_normal_add_origin_direction[i] = dot_vector_vector(state.normal[i], state.add_origin_direction[i]);
            state.direction_square[i] = dot_vector_vector(state.direction[i], state.direction[i]);
        }
    }

    writeUniformData(uniform) {
        if (this[properties.compute]) {
            this[methods.compute]();
        }
        const state = this[properties.state];
        for (let d = 0; d < 3; ++d) {
            uniform.origin.buffer.setFloat32(uniform.origin.offset + d * 4, state.origin[d]);
            for (let i = 0; i < 3; ++i) {
                uniform[`direction_${i}`].buffer.setFloat32(uniform[`direction_${i}`].offset + d * 4, state.direction[i][d]);
                uniform[`normal_${i}`].buffer.setFloat32(uniform[`normal_${i}`].offset + d * 4, state.normal[i][d]);
                uniform[`add_origin_direction_${i}`].buffer.setFloat32(uniform[`add_origin_direction_${i}`].offset + d * 4, state.add_origin_direction[i][d]);
            }
        }
        for (let i = 0; i < 3; ++i) {
            uniform[`dot_normal_${i}_origin`].buffer.setFloat32(uniform[`dot_normal_${i}_origin`].offset, state.dot_normal_origin[i]);
            uniform[`dot_normal_${i}_add_origin_direction_${i}`].buffer.setFloat32(uniform[`dot_normal_${i}_add_origin_direction_${i}`].offset, state.dot_normal_add_origin_direction[i]);
            uniform[`direction_${i}_square`].buffer.setFloat32(uniform[`direction_${i}_square`].offset, state.direction_square[i]);
        }
    }

    [methods.compileQuad]({
        id,
        state_id = 'state_id',
        state_depth = null,
        state_normal = null,
        state_hit_point = null,
        state_uv = null,
        ray_origin = 'ray_origin',
        ray_direction = 'ray_direction',
        ray_limit = null,
        origin,
        direction_x,
        direction_x_square,
        direction_y,
        direction_y_square,
        normal,
        dot_normal_origin,
        dot_normal_ray_direction
    } = {}, options) {
        options = { ...options };
        const code = [
            'do {'
        ];
        if (options.skip_by_id) {
            code.push(...[
                `${indent}if (${state_id} == ${id}) {`,
                `${indent}${indent}break;`,
                `${indent}}`
            ]);
        }
        code.push(...[
            `${indent}float raytrace_depth = (${dot_normal_origin} - dot(${normal}, ${ray_origin})) / ${dot_normal_ray_direction};`
        ]);
        code.push(ray_limit == null
            ? `${indent}if (raytrace_depth > 0.0 && raytrace_depth < ${state_depth}) {`
            : `${indent}if (raytrace_depth > 0.0 && raytrace_depth < min(${ray_limit}, ${state_depth})) {`);
        code.push(...[
            `${indent}${indent}vec3 raytrace_hit_point = ${ray_origin} + raytrace_depth * ${ray_direction};`,
            `${indent}${indent}vec3 quad_vector = raytrace_hit_point - ${origin};`,
            `${indent}${indent}vec2 uv = vec2(dot(quad_vector, ${direction_x}) / ${direction_x_square}, dot(quad_vector, ${direction_y}) / ${direction_y_square});`,
            `${indent}${indent}if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {`,
            `${indent}${indent}${indent}${state_id} = ${id}u;`
        ]);
        if (state_depth != null) {
            code.push(`${indent}${indent}${indent}${state_depth} = raytrace_depth;`);
        }
        if (state_hit_point != null) {
            code.push(`${indent}${indent}${indent}${state_hit_point} = raytrace_hit_point;`);
        }
        if (state_normal != null) {
            code.push(`${indent}${indent}${indent}${state_normal} = -(${dot_normal_ray_direction} / abs(${dot_normal_ray_direction})) * ${normal};`);
        }
        if (state_uv != null) {
            code.push(`${indent}${indent}${indent}${state_uv} = uv;`);
        }
        code.push(...[
            `${indent}${indent}}`,
            `${indent}}`,
            '} while (false);'
        ]);
        return code;
    }

    compile(baseId, uniform, {
        state_id = 'state_id',
        state_depth = null,
        state_normal = null,
        state_hit_point = null,
        state_uv = null,
        ray_origin = 'ray_origin',
        ray_direction = 'ray_direction',
        ray_limit = null
    } = {}, options) {
        const code = [];
        code.push('do {');
        for (let i = 0; i < 3; ++i) {
            code.push(`${indent}float dot_normal_${i}_ray_direction = dot(${uniform[`normal_${i}`]}, ${ray_direction});`);
            const dir_index = [0, 1, 2];
            dir_index.splice(i, 1);
            for (let p = 0; p < 2; ++p) {
                code.push(...this[methods.compileQuad]({
                    id: baseId + i * 2 + p,
                    state_id,
                    state_depth,
                    state_normal,
                    state_hit_point,
                    state_uv,
                    ray_origin,
                    ray_direction,
                    ray_limit,
                    origin: p ? uniform[`add_origin_direction_${i}`] : uniform.origin,
                    dot_normal_origin: p ? uniform[`dot_normal_${i}_add_origin_direction_${i}`] : uniform[`dot_normal_${i}_origin`],
                    normal: uniform[`normal_${i}`],
                    direction_x: uniform[`direction_${dir_index[0]}`],
                    direction_x_square: uniform[`direction_${dir_index[0]}_square`],
                    direction_y: uniform[`direction_${dir_index[1]}`],
                    direction_y_square: uniform[`direction_${dir_index[1]}_square`],
                    dot_normal_ray_direction: `dot_normal_${i}_ray_direction`
                }, options).map(line => `${indent}${line}`));
            }
        }
        code.push('} while(false);');
        return code;
    }
}
