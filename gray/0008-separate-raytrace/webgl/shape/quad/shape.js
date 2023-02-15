import { float32 } from '../../../../lib/float.js';
import createProgram from '../../../../lib/gl-program.js';
import { assert, assertVectorLength } from '../../../../lib/math-assert.js';
import { add_vector_vector, cross_vector_vector, dot_vector_vector, normalize_vector } from '../../../../lib/math.js';
import { loadTextFile } from '../../../../lib/utils.js';
import { shader_source as scene_shader_source } from '../../scene.js';

const script_url = import.meta.url;

export const shader_source = {
    raytrace: 'raytrace.glsl'
};

{
    const jobs = [];
    for (const name in shader_source) {
        const path = shader_source[name];
        const url = new URL(path, script_url);
        jobs.push(loadTextFile(url).then(source => {
            if (typeof source !== 'string' || source.length <= 0) {
                throw new Error(`Unable to load shader at: ${url}`);
            }
            shader_source[name] = source;
        }));
    }
    await Promise.all(jobs);
}

export default class Quad {
    origin;
    direction;
    constructor({ origin, direction: [direction_x, direction_y] }) {
        assertVectorLength(origin, 3);
        assertVectorLength(direction_x, 3);
        assertVectorLength(direction_y, 3);
        assert(float32.isEqual(dot_vector_vector(direction_x, direction_y), 0.0));
        this.origin = origin;
        this.direction = [direction_x, direction_y];
        this.direction_square = [
            dot_vector_vector(direction_x, direction_x),
            dot_vector_vector(direction_y, direction_y)
        ];
        this.normal = normalize_vector(cross_vector_vector(direction_x, direction_y));
        this.points = [
            this.origin,
            add_vector_vector(this.origin, this.direction[0]),
            add_vector_vector(this.origin, this.direction[1]),
            add_vector_vector(add_vector_vector(this.origin, this.direction[0]), this.direction[1])
        ];
        this.dot_normal_origin = dot_vector_vector(this.normal, this.origin);
    }

    applyRaytraceProgram(program) {
        const uniform = program.uniform;
        uniform.origin?.setArray?.(this.origin);
        uniform.direction?.[0]?.setArray?.(this.direction[0]);
        uniform.direction?.[1]?.setArray?.(this.direction[1]);
        uniform.direction_square?.[0]?.setValue?.(this.direction_square[0]);
        uniform.direction_square?.[1]?.setValue?.(this.direction_square[1]);
        uniform.normal?.setArray?.(this.normal);
        uniform.dot_normal_origin?.setValue?.(this.dot_normal_origin);
    }
}
