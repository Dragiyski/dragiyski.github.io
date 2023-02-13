/* eslint-disable array-element-newline */
import createProgram from '../../../lib/gl-program.js';
import OpenGLScene from '../../../lib/gl-scene.js';
import PerspectiveCamera from './perspective-camera.js';
import { getSize, getAlignment } from './uniform.js';

export const indent = '    ';

const properties = {
    camera: Symbol('camera'),
    uniform: Symbol('uniform'),
    objects: Symbol('objects'),
    fragment_code: Symbol('fragment_code'),
    uniform_need_update: Symbol('uniform_need_update')
};

const methods = {
    compile: Symbol('compile'),
    update_uniforms: Symbol('update_uniforms')
};

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
        this[properties.camera] = camera;
        this[properties.uniform] = Object.assign(Object.create(null), {
            size: 0,
            list: [],
            object_map: new WeakMap()
        });
        this[properties.objects] = [camera];
        this[properties.fragment_code] = this[methods.compile]();
    }

    get camera() {
        return this[properties.camera];
    }

    get code() {
        return this[properties.fragment_code];
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

        context.objectBuffer = gl.createBuffer();
        this.updateUniforms(gl, context);

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

        context.program = createProgram(gl, compute_vertex_normal_source, this[properties.fragment_code]);

        gl.clearColor(0.2, 0.5, 0.7, 1.0);
    }

    invalidate() {
        this[properties.uniform_need_update] = true;
    }

    updateUniforms(gl, context) {
        const objectBuffer = new ArrayBuffer(this[properties.uniform].size);
        for (let i = 0; i < this[properties.objects].length; ++i) {
            const object = this[properties.objects][i];
            if (object == null) {
                continue;
            }
            const offset_map = this[properties.uniform].object_map.get(object).offset_map;
            object.writeUniformData(objectBuffer, offset_map);
        }

        gl.bindBuffer(gl.UNIFORM_BUFFER, context.objectBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, objectBuffer, gl.STATIC_DRAW);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        this[properties.uniform_need_update] = false;
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

        if (this[properties.uniform_need_update]) {
            this.updateUniforms(gl, context);
        }

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
        gl.bindBufferBase(gl.UNIFORM_BUFFER, context.program.uniform_block.uniform_data_1.binding, context.objectBuffer);
        gl.bindVertexArray(context.compute_vertex_array);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, context.program.uniform_block.uniform_data_1.binding, null);
        gl.useProgram(null);

        if (context.EXT_disjoint_timer_query_webgl2 != null && context.frame_time_query.in_this_frame) {
            gl.endQuery(context.EXT_disjoint_timer_query_webgl2.TIME_ELAPSED_EXT);
            context.frame_time_query.in_this_frame = false;
            this.updateFrameTime(gl, context);
        }
    }

    [methods.compile]() {
        const uniforms = this[properties.uniform];
        const uniform_code = [];
        for (let index = 0; index < this[properties.objects].length; ++index) {
            const object = this[properties.objects][index];
            if (object == null) {
                continue;
            }
            const uniform_storage = Object.assign(Object.create(null), {
                qualified_map: Object.create(null),
                description: Object.create(null),
                offset_map: Object.create(null)
            });
            uniforms.object_map.set(object, uniform_storage);
            const compileUniformBlock = object.compileUniformBlock;
            if (typeof compileUniformBlock === 'function') {
                compileUniformBlock.call(object, registerUniform.bind(this, index));
            }
        }
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
        if (uniform_code.length > 0) {
            code.push('layout(std140) uniform uniform_data_1 {');
            code.push(...uniform_code);
            code.push('};', '');
        }

        code.push('void main() {');
        code.push(`${indent}vec3 screen_ray_origin;`);
        code.push(`${indent}vec3 screen_ray_direction;`);

        {
            const camera = this[properties.camera];
            const qualified_map = uniforms.object_map.get(camera).qualified_map;
            code.push(...camera.compile(qualified_map, {
                position: 'position',
                ray_origin: 'screen_ray_origin',
                ray_direction: 'screen_ray_direction'
            }).map(line => `${indent}${line}`));
        }

        code.push(`${indent}color = vec4(screen_ray_direction * 0.5 + 0.5, 1.0);`);

        code.push('}', '');

        return code.join('\n');

        function registerUniform(index, type, name) {
            const uniforms = this[properties.uniform];
            const size = getSize(type);
            const alignment = getAlignment(type);
            const offset_alignment = uniforms.size % alignment;
            if (offset_alignment !== 0) {
                uniforms.size += alignment - offset_alignment;
            }
            const qualified_name = `object_${index}_${name}`;
            const global_id = uniforms.list.length;
            const description = {
                global_id,
                object_id: index,
                name,
                qualified_name,
                size,
                alignment,
                type,
                offset: uniforms.size
            };
            uniforms.size += size;
            uniforms.list.push(description);
            const object_map = uniforms.object_map.get(this[properties.objects][index]);
            object_map.qualified_map[name] = qualified_name;
            object_map.description[name] = description;
            object_map.offset_map[name] = description.offset;
            uniform_code.push(`${indent}${description.type} ${qualified_name};`);
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
