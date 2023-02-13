import createProgram from "../../../lib/gl-program.js";

export const indent = '    ';

const compute_vertex_normal_source = `#version 300 es

precision highp float;
precision highp int;

layout (location = 0) in vec2 position_in;

out vec2 position;

void main() {
    position = position_in * 0.5 + 0.5;
    gl_Position = vec4(position_in, 0.0, 1.0);
}
`;

export default class Program {
    constructor() {
        this.id = 1;
        this.uniform_buffer_offset = 0;
        this.uniform_buffer_variables = [];
        this.uniform_buffer_variables_by_name = Object.create(null);
        this.camera = null;
        this.shapes = new Set();
    }

    setCamera(camera) {
        this.camera = camera;
        camera.register(this);
    }

    addShape(shape) {
        this.shapes.add(shape);
        shape.register(this);
    }

    allocId(count = 1) {
        const baseId = this.id;
        this.id += count;
        return baseId;
    }

    getCode() {
        const lines = [
            `#version 300 es`,
            ``,
            `precision highp float;`,
            `precision highp int;`,
            ``,
            `const float positive_infinity = uintBitsToFloat(0x7F800000u);`,
            `const float negative_infinity = uintBitsToFloat(0xFF800000u);`,
            `const float not_a_number = uintBitsToFloat(0x7fc00000u);`,
            ``,
            `in vec2 position;`,
            `out vec4 color;`,
            ``
        ];
        if (this.uniform_buffer_variables.length > 0) {
            lines.push(`layout(std140) uniform ShapeData {`);
            for (const variable of this.uniform_buffer_variables) {
                const name = variable.name;
                const type = variable.type;
                lines.push(`${indent}${type} ${name};`);
            }
            lines.push('};', '');
        }
        lines.push(`void main() {`);
        lines.push(...this.camera.getCode({ position: 'position' }).map(line => `${indent}${line}`));
        lines.push(...[
            ``,
            `${indent}uint screen_state_id = 0u;`,
            `${indent}float screen_state_depth = positive_infinity;`,
            `${indent}vec3 screen_state_normal = vec3(0.0, 0.0, 0.0);`,
            `${indent}vec3 screen_state_hit_point = vec3(not_a_number, not_a_number, not_a_number);`
        ]);
        for (const shape of this.shapes) {
            lines.push(...shape.getRaytraceCode(this, {
                state_id: 'screen_state_id',
                state_depth: 'screen_state_depth',
                state_normal: 'screen_state_normal',
                state_hit_point: 'screen_state_hit_point',
                ray_origin: this.camera.name_ray_origin,
                ray_direction: this.camera.name_ray_direction
            }).map(line => `${indent}${line}`));
        }
        lines.push(...[
            `${indent}if (screen_state_id == 0u) {`,
            `${indent}${indent}discard;`,
            `${indent}${indent}return;`,
            `${indent}}`,
            `${indent}color = vec4(screen_state_normal, 1.0);`
        ]);
        lines.push('}', '');
        return lines;
    }

    build(gl) {
        const fragment_code = this.getCode().join('\n');
        return createProgram(gl, compute_vertex_normal_source, fragment_code);
    }

    registerUniform(type, name) {
        const size = getSize(type);
        const alignment = getAlignment(type);
        const offset_alignment = this.uniform_buffer_offset % alignment;
        if (offset_alignment !== 0) {
            this.uniform_buffer_offset += alignment - offset_alignment;
        }
        this.uniform_buffer_variables.push({
            name,
            size,
            alignment,
            type,
            offset: this.uniform_buffer_offset
        });
        this.uniform_buffer_offset += size;
    }
}

export function getSize(type) {
    if (['float', 'int', 'uint'].indexOf(type) >= 0) {
        return 4;
    }
    const is_vector = /^([ui])?vec([2-4])$/.exec(type);
    if (is_vector != null) {
        const size = parseInt(is_vector[2], 10);
        if (size === 3 || size === 4) {
            return 4 * 4;
        } else {
            return size * 4;
        }
    }
    const is_square_matrix = /^mat([2-4])$/.exec(type);
    if (is_square_matrix != null) {
        const size = parseInt(is_square_matrix[1], 10);
        if (size === 3 || size === 4) {
            // Square mat3 or mat4 are 3 or 4 vec4 (vec3 aligned to 16-bytes)
            return size * 4 * 4;
        } else {
            return size * size * 4;
        }
    }
    throw new Error(`Unknown type: ${type}`);
}

export function getAlignment(type) {
    if (['float', 'int', 'uint'].indexOf(type) >= 0) {
        return 4;
    }
    const is_vector = /^([ui])?vec([2-4])$/.exec(type);
    if (is_vector != null) {
        const size = parseInt(is_vector[2], 10);
        if (size === 3 || size === 4) {
            return 4 * 4;
        } else {
            return size * 4;
        }
    }
    const is_square_matrix = /^mat([2-4])$/.exec(type);
    if (is_square_matrix != null) {
        const size = parseInt(is_square_matrix[1], 10);
        if (size === 3 || size === 4) {
            return 4 * 4;
        } else {
            return size * 4;
        }
    }
    throw new Error(`Unknown type: ${type}`);
}
