/* eslint-disable array-element-newline */
import createProgram from '../../../lib/gl-program.js';
import OpenGLScene from '../../../lib/gl-scene.js';
import PerspectiveCamera from './perspective-camera.js';
import { getSize, getAlignment } from './uniform.js';

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

export class Scene extends OpenGLScene {
    constructor({
        camera = new PerspectiveCamera()
    } = {}) {
        super();
        this.camera = camera;

        this.uniform_buffer_offset = 0;
        this.uniform_buffer_variables = [];
        this.uniform_buffer_variable_by_object = new WeakMap();
        this.state_compiled = new WeakSet();
        this.objects = [null, this.camera];
        this.fragment_code = this.compile();
    }

    async loadResources() {
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onCreate(gl, context) {
        super.onCreate(gl, context);

        if (gl.getExtension('EXT_color_buffer_float') == null) {
            throw new Error('Missing required WebGL extension: EXT_color_buffer_float');
        }
        if ((context.EXT_disjoint_timer_query_webgl2 = gl.getExtension('EXT_disjoint_timer_query_webgl2')) != null) {
            context.frame_time_query = gl.createQuery();
        }

        {
            const compute_vertex_data = Float32Array.from([
                -1, +1,
                -1, -1,
                +1, -1,
                +1, +1
            ]);
            const compute_index_data = Uint8Array.from([
                // 0 3
                // 1 2
                0, 1, 2,
                0, 2, 3
            ]);
            context.compute_vertex_array = gl.createVertexArray();
            context.compute_vertex_buffer = gl.createBuffer();
            context.compute_index_buffer = gl.createBuffer();

            gl.bindVertexArray(context.compute_vertex_array);
            gl.bindBuffer(gl.ARRAY_BUFFER, context.compute_vertex_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, compute_vertex_data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.compute_index_buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, compute_index_data, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * compute_vertex_data.BYTES_PER_ELEMENT, 0);
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        context.program = createProgram(gl, compute_vertex_normal_source, this.fragment_code);
        context.objectBuffer = gl.createBuffer();

        gl.clearColor(0.2, 0.5, 0.7, 1.0);
    }

    onResize(gl, context) {
        super.onResize(gl, context);
        this.camera.aspect_ratio = gl.canvas.width / gl.canvas.height;
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onPaint(gl, context) {
        super.onPaint(gl, context);

        const objectBuffer = new ArrayBuffer(this.uniform_buffer_offset);
        for (let i = 1; i < this.objects.length; ++i) {
            const object = this.objects[i];
            if (object == null) {
                continue;
            }
            const offset_map = this.uniform_buffer_variable_by_object.get(object).offset_map;
            object.writeUniformData(objectBuffer, offset_map);
        }

        gl.bindBuffer(gl.UNIFORM_BUFFER, context.objectBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, objectBuffer, gl.STATIC_DRAW);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);

        gl.bindBufferBase(gl.UNIFORM_BUFFER, gl.getUniformBlockIndex(context.program, 'uniform_data_1'), context.objectBuffer);

        if (context.EXT_disjoint_timer_query_webgl2 != null && !context.frame_time_query.expect_result) {
            if (context.frame_time_query.interval_id != null) {
                clearTimeout(context.frame_time_query.interval_id);
                context.frame_time_query.interval_id = null;
            }
            gl.beginQuery(context.EXT_disjoint_timer_query_webgl2.TIME_ELAPSED_EXT, context.frame_time_query);
            context.frame_time_query.expect_result = true;
            context.frame_time_query.in_this_frame = true;
        }

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(context.program);
        gl.bindVertexArray(context.compute_vertex_array);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
        gl.useProgram(null);

        gl.bindBufferBase(gl.UNIFORM_BUFFER, gl.getUniformBlockIndex(context.program, 'uniform_data_1'), null);

        if (context.EXT_disjoint_timer_query_webgl2 != null && context.frame_time_query.in_this_frame) {
            gl.endQuery(context.EXT_disjoint_timer_query_webgl2.TIME_ELAPSED_EXT);
            context.frame_time_query.in_this_frame = false;
            this.updateFrameTime(gl, context);
        }
    }

    compile() {
        const code = [
            `#version 300 es`,
            '',
            `precision highp float;`,
            `precision highp int;`,
            '',
            `const float positive_infinity = uintBitsToFloat(0x7F800000u);`,
            `const float negative_infinity = uintBitsToFloat(0xFF800000u);`,
            `const float not_a_number = uintBitsToFloat(0x7fc00000u);`,
            '',
            `in vec2 position;`,
            `out vec4 color;`,
            ''
        ];
        if (this.objects.length > 1) {
            code.push('layout(std140) uniform uniform_data_1 {');
            for (let index = 1; index < this.objects.length; ++index) {
                const object = this.objects[index];
                if (object == null) {
                    continue;
                }
                this.uniform_buffer_variable_by_object.set(this.objects[index], Object.assign(Object.create(null), {
                    qualified_map: Object.create(null),
                    description: Object.create(null),
                    offset_map: Object.create(null)
                }));
                object.compileUniformBlock(registerUniform.bind(this, index));
                const storage = this.uniform_buffer_variable_by_object.get(object);
                for (const name in storage.description) {
                    const type = storage.description[name].type;
                    const qualified_name = storage.description[name].qualified_name;
                    code.push(`${indent}${type} ${qualified_name};`);
                }
            }
            code.push('};', '');
        }

        code.push('void main() {');
        code.push(`${indent}vec3 screen_ray_origin;`);
        code.push(`${indent}vec3 screen_ray_direction;`);

        {
            const camera = this.camera;
            const uniforms = this.uniform_buffer_variable_by_object.get(camera).qualified_map;
            code.push(...camera.compile(uniforms, {
                position: 'position',
                ray_origin: 'screen_ray_origin',
                ray_direction: 'screen_ray_direction'
            }).map(line => `${indent}${line}`));
        }

        code.push(`${indent}color = vec4(screen_ray_direction * 0.5 + 0.5, 1.0);`);

        code.push('}', '');

        return code.join('\n');

        function registerUniform(index, type, name) {
            const size = getSize(type);
            const alignment = getAlignment(type);
            const offset_alignment = this.uniform_buffer_offset % alignment;
            if (offset_alignment !== 0) {
                this.uniform_buffer_offset += alignment - offset_alignment;
            }
            const qualified_name = `object_${index}_${name}`;
            const global_id = this.uniform_buffer_variables.length;
            const description = {
                global_id,
                object_id: index,
                name,
                qualified_name,
                size,
                alignment,
                type,
                offset: this.uniform_buffer_offset
            };
            this.uniform_buffer_variables.push(description);
            const storage = this.uniform_buffer_variable_by_object.get(this.objects[index]);
            storage.qualified_map[name] = qualified_name;
            storage.description[name] = description;
            storage.offset_map[name] = description.offset;
            this.uniform_buffer_offset += size;
        }
    }

    updateFrameTime(gl, context) {
        if (!context.frame_time_query.expect_result) {
            return;
        }
        if (gl.getQueryParameter(context.frame_time_query, gl.QUERY_RESULT_AVAILABLE)) {
            let time = gl.getQueryParameter(context.frame_time_query, gl.QUERY_RESULT);
            time /= 1e6;
            const element = document.getElementById('frame-info');
            if (element != null) {
                element.textContent = `${time.toFixed(3)}ms`;
            }
            context.frame_time_query.expect_result = false;
        } else {
            context.frame_time_query.interval_id = setTimeout(() => {
                this.updateFrameTime(gl, context);
            }, 0);
        }
    }
}
