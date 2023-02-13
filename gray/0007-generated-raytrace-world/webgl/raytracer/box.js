import { assert, assertVector, assertVectorLength } from '../../../lib/math-assert.js';
import { add_vector_vector, cross_vector_vector, dot_vector_vector, normalize_vector } from '../../../lib/math.js';
import SystemDataView from '../../../lib/system-data-view.js';
import { indent } from './uniform.js';

let class_index = 0;

export const properties = {
    index: Symbol('index'),
    context: Symbol('context'),
    origin: Symbol('origin'),
    direction: Symbol('direction'),
    normal: Symbol('normal'),
    add_origin_direction: Symbol('add_origin_direction'),
    direction_length_square: Symbol('direction_length_square'),
    recompute: Symbol('recompute')
};

export const methods = {
    getRaytraceQuadCode: Symbol('getRaytraceQuadCode'),
    recompute: Symbol('recompute')
};

export default class Box {
    constructor(origin, ...direction) {
        assertVectorLength(origin, 3);
        assert(direction.length === 3);
        [0, 1, 2].forEach(i => { assertVectorLength(direction[i], 3); });
        this[properties.index] = ++class_index;
        this[properties.context] = Symbol('context');
        this[properties.origin] = origin;
        this[properties.direction] = direction;
        this[properties.recompute] = true;
    }

    register(program) {
        const context = program[this[properties.context]] = program[this[properties.context]] ?? Object.create(null);
        context.id = program.allocId(6);
        const index = this[properties.index];
        program.registerUniform('vec3', `box_${index}_origin`);
        for (let i = 1; i <= 3; ++i) {
            program.registerUniform('vec3', `box_${index}_direction_${i}`);
            program.registerUniform('vec3', `box_${index}_add_origin_direction_${i}`);
            program.registerUniform('vec3', `box_${index}_normal_${i}`);
            program.registerUniform('float', `box_${index}_direction_${i}_length_square`);
        }
    }

    getRaytraceCode(program, {
        state_id = 'state_id',
        state_depth = 'state_depth',
        state_normal = 'state_normal',
        state_hit_point = 'state_hit_point',
        ray_origin = 'ray_origin',
        ray_direction = 'ray_direction'
    }) {
        const index = this[properties.index];
        const context = program[this[properties.context]];
        const baseId = context.id;
        const code = [];
        for (let i = 0; i < 3; ++i) {
            const directions = [1, 2, 3];
            directions.splice(i, 1);
            code.push(...this[methods.getRaytraceQuadCode]({
                id: baseId + i * 2,
                state_id,
                state_depth,
                state_normal,
                state_hit_point,
                ray_origin,
                ray_direction,
                box_origin: `box_${index}_origin`,
                box_direction_x: `box_${index}_direction_${directions[0]}`,
                box_direction_x_length_square: `box_${index}_direction_${directions[0]}_length_square`,
                box_direction_y: `box_${index}_direction_${directions[1]}`,
                box_direction_y_length_square: `box_${index}_direction_${directions[1]}_length_square`,
                box_normal: `box_${index}_normal_${i + 1}`
            }));
            code.push(...this[methods.getRaytraceQuadCode]({
                id: baseId + i * 2 + 1,
                state_id,
                state_depth,
                state_normal,
                state_hit_point,
                ray_origin,
                ray_direction,
                box_origin: `box_${index}_add_origin_direction_${i + 1}`,
                box_direction_x: `box_${index}_direction_${directions[0]}`,
                box_direction_x_length_square: `box_${index}_direction_${directions[0]}_length_square`,
                box_direction_y: `box_${index}_direction_${directions[1]}`,
                box_direction_y_length_square: `box_${index}_direction_${directions[1]}_length_square`,
                box_normal: `box_${index}_normal_${i + 1}`
            }));
        }
        return code;
    }

    writeUniform(program, buffer) {
        const view = new SystemDataView(buffer);
    }

    [methods.recompute]() {
        this[properties.normal] = [
            normalize_vector(cross_vector_vector(this[properties.direction][1], this[properties.direction][2])),
            normalize_vector(cross_vector_vector(this[properties.direction][0], this[properties.direction][2])),
            normalize_vector(cross_vector_vector(this[properties.direction][0], this[properties.direction][1]))
        ];
        this[properties.add_origin_direction] = [
            add_vector_vector(this[properties.origin], this[properties.direction[0]]),
            add_vector_vector(this[properties.origin], this[properties.direction[1]]),
            add_vector_vector(this[properties.origin], this[properties.direction[2]])
        ];
        this[properties.direction_length_square] = [
            dot_vector_vector(this[properties.direction][0], this[properties.direction][0]),
            dot_vector_vector(this[properties.direction][1], this[properties.direction][1]),
            dot_vector_vector(this[properties.direction][2], this[properties.direction][2])
        ];
        this[properties.recompute] = false;
    }

    [methods.getRaytraceQuadCode]({
        id,
        state_id = 'state_id',
        state_depth = 'state_depth',
        state_normal = 'state_normal',
        state_hit_point = 'state_hitpoint',
        ray_origin = 'ray_origin',
        ray_direction = 'ray_direction',
        box_origin,
        box_direction_x,
        box_direction_x_length_square,
        box_direction_y,
        box_direction_y_length_square,
        box_normal
    }) {
        const index = this[properties.index];
        const raytrace_depth = `box_${index}_depth`;
        const raytrace_hit_point = `box_${index}_hit_point`;
        const quad_uv = `box_${index}_quad_uv`;
        const raytrace_uv = `box_${index}_uv`;
        const quad_normal_ray_direction = `box_${index}_dot_normal_ray_direction`;
        return [
            'do {',
            `${indent}float ${quad_normal_ray_direction} = dot(${box_normal}, ${ray_direction});`,
            `${indent}float ${raytrace_depth} = (dot(${box_normal}, ${box_origin}) - dot(${box_normal}, ${ray_origin})) / ${quad_normal_ray_direction};`,
            `${indent}if (${raytrace_depth} > 0.0 && ${raytrace_depth} < ${state_depth}) {`,
            `${indent}${indent}vec3 ${raytrace_hit_point} = ${ray_origin} + ${raytrace_depth} * ${ray_direction};`,
            `${indent}${indent}vec3 ${quad_uv} = ${raytrace_hit_point} - ${box_origin};`,
            `${indent}${indent}vec2 ${raytrace_uv} = vec2(dot(${quad_uv}, ${box_direction_x}) / ${box_direction_x_length_square}, dot(${quad_uv}, ${box_direction_y}) / ${box_direction_y_length_square});`,
            `${indent}${indent}if (${raytrace_uv}.x >= 0.0 && ${raytrace_uv}.x <= 1.0 && ${raytrace_uv}.y >= 0.0 && ${raytrace_uv}.y <= 1.0) {`,
            `${indent}${indent}${indent}${state_id} = ${id}u;`,
            `${indent}${indent}${indent}${state_depth} = ${raytrace_depth};`,
            `${indent}${indent}${indent}${state_hit_point} = ${raytrace_hit_point};`,
            `${indent}${indent}${indent}${state_normal} = -(${quad_normal_ray_direction} / abs(${quad_normal_ray_direction})) * ${box_normal};`,
            `${indent}${indent}}`,
            `${indent}}`,
            '} while (false);'
        ];
    }
}
