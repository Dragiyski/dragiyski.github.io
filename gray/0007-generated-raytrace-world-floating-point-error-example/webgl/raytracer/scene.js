/* eslint-disable array-element-newline */
import createProgram from '../../../lib/gl-program.js';
import OpenGLScene from '../../../lib/gl-scene.js';
import SystemDataView from '../../../lib/system-data-view.js';
import PerspectiveCamera from './perspective-camera.js';
import Quad from './quad.js';
import { getSize, getAlignment } from './uniform.js';

export const indent = '    ';

const properties = {
    camera: Symbol('camera'),
    uniform_state: Symbol('uniform_state'),
    objects: Symbol('objects'),
    fragment_code: Symbol('fragment_code'),
    uniform_need_update: Symbol('uniform_need_update'),
    next_primitive_id: Symbol('next_primitive_id'),
    base_id: Symbol('base_id'),
    hooks: Symbol('hooks')
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
    constructor({ objects = [], beforePaint = null } = {}) {
        super();
        this[properties.next_primitive_id] = 1;
        this[properties.camera] = new PerspectiveCamera();
        const uniform_state = this[properties.uniform_state] = Object.create(null);
        uniform_state.blocks = {
            list: [],
            by_name: Object.create(null)
        };
        uniform_state.variables = Object.create(null);
        uniform_state.per_object = new WeakMap();
        this[properties.objects] = [];
        for (const object of objects ?? []) {
            const size = object.size;
            object[properties.base_id] = this[properties.next_primitive_id];
            this[properties.next_primitive_id] += size;
            this[properties.objects].push(object);
        }
        this[properties.fragment_code] = this[methods.compile]();
        this[properties.hooks] = {
            beforePaint
        };
        console.log(this[properties.fragment_code]);
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

        context.uniformBuffers = [];
        {
            const length = this[properties.uniform_state].blocks.list.length;
            for (let i = 0; i < length; ++i) {
                context.uniformBuffers.push(gl.createBuffer());
            }
        }
        this.updateUniforms(gl, context);

        gl.clearColor(0.2, 0.5, 0.7, 1.0);
    }

    invalidate() {
        this[properties.uniform_need_update] = true;
    }

    updateUniforms(gl, context) {
        const uniform_state = this[properties.uniform_state];
        const buffers = [];
        for (const uniform_buffer of uniform_state.blocks.list) {
            const block_index = gl.getUniformBlockIndex(context.program, uniform_buffer.name);
            const size = gl.getActiveUniformBlockParameter(context.program, block_index, gl.UNIFORM_BLOCK_DATA_SIZE);
            const buffer = new ArrayBuffer(size);
            buffers.push(buffer);
        }
        for (let i = 0; i < this[properties.objects].length; ++i) {
            const object = this[properties.objects][i];
            const uniform_map = Object.create(null);
            const object_uniform = uniform_state.per_object.get(object);
            for (const name in object_uniform) {
                const variable = object_uniform[name];
                const value = Object.create(null);
                value.name = name;
                value.qualified_name = variable.qualified_name;
                value.buffer = new SystemDataView(buffers[variable.block_index]);
                const variable_index = gl.getUniformIndices(context.program, [variable.qualified_name])[0];
                value.offset = gl.getActiveUniforms(context.program, [variable_index], gl.UNIFORM_OFFSET)[0];
                value.type = gl.getActiveUniforms(context.program, [variable_index], gl.UNIFORM_TYPE)[0];
                value.block_index = gl.getActiveUniforms(context.program, [variable_index], gl.UNIFORM_BLOCK_INDEX)[0];
                value.size = gl.getActiveUniforms(context.program, [variable_index], gl.UNIFORM_SIZE)[0];
                uniform_map[name] = value;
            }
            object.writeUniformData(uniform_map);
        }

        for (let i = 0; i < buffers.length; ++i) {
            gl.bindBuffer(gl.UNIFORM_BUFFER, context.uniformBuffers[i]);
            gl.bufferData(gl.UNIFORM_BUFFER, buffers[i], gl.STATIC_DRAW);
            gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        }
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

        if (typeof this[properties.hooks].beforePaint === 'function') {
            const hook = this[properties.hooks].beforePaint;
            hook(this);
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
        {
            const uniform_state = this[properties.uniform_state];
            for (const name in uniform_state.blocks.by_name) {
                const index = uniform_state.blocks.by_name[name].index;
                const binding = context.program.block[name].binding;
                const buffer = context.uniformBuffers[index];
                gl.bindBufferBase(gl.UNIFORM_BUFFER, binding, buffer);
            }
        }
        gl.bindVertexArray(context.compute_vertex_array);
        this.camera.writeUniform(gl, context.program);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
        for (const name in context.program.block) {
            const binding = context.program.block[name.binding];
            gl.bindBufferBase(gl.UNIFORM_BUFFER, binding, null);
        }
        gl.useProgram(null);

        if (context.EXT_disjoint_timer_query_webgl2 != null && context.frame_time_query.in_this_frame) {
            gl.endQuery(context.EXT_disjoint_timer_query_webgl2.TIME_ELAPSED_EXT);
            context.frame_time_query.in_this_frame = false;
            this.updateFrameTime(gl, context);
        }
    }

    [methods.compile]() {
        const uniform_state = this[properties.uniform_state];
        const uniform_code = [];
        for (let index = 0; index < this[properties.objects].length; ++index) {
            const object = this[properties.objects][index];
            const object_uniform = Object.create(null);
            uniform_state.per_object.set(object, object_uniform);
            if (uniform_state.current_block == null) {
                const index = uniform_state.blocks.list.length;
                uniform_state.current_block = {
                    index,
                    name: `uniform_data_${index + 1}`,
                    variables: []
                };
                uniform_state.blocks.list.push(uniform_state.current_block);
                uniform_state.blocks.by_name[uniform_state.current_block.name] = uniform_state.current_block;
            }
            object.compileUniformBlock((type, name) => {
                const qualified_name = `object_${index + 1}_${name}`;
                uniform_code.push(`${indent}${type} ${qualified_name};`);
                const variable_index = uniform_state.current_block.variables.length;
                const variable = {
                    index: variable_index,
                    type,
                    name,
                    qualified_name,
                    block_index: uniform_state.current_block.index,
                    block_name: uniform_state.current_block.name,
                    object_index: index
                };
                uniform_state.current_block.variables.push(variable);
                uniform_state.variables[qualified_name] = variable;
                object_uniform[name] = variable;
            });
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
            '',
            'const vec3 light_position = vec3(-80.0, -80.0, 80.0);',
            'const vec3 light_color = vec3(1.0, 1.0, 1.0);',
            '',
            'float saturate(float value) {',
            `${indent}return max(0.0, min(1.0, value));`,
            '}',
            ''
        ];
        code.push(...this.camera.compileUniform());
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
            code.push(...camera.compile({
                position: 'position',
                ray_origin: 'screen_ray_origin',
                ray_direction: 'screen_ray_direction'
            }).map(line => `${indent}${line}`));
        }

        code.push(...[
            `${indent}uint screen_raytrace_id = 0u;`,
            `${indent}float screen_raytrace_depth = positive_infinity;`,
            `${indent}vec3 screen_raytrace_normal = vec3(0.0);`,
            `${indent}vec3 screen_raytrace_hit_point = vec3(not_a_number);`
        ]);

        for (const object of this[properties.objects]) {
            code.push(...object.compile(object[properties.base_id], createQualifiedMap(object), {
                state_id: 'screen_raytrace_id',
                state_depth: 'screen_raytrace_depth',
                state_normal: 'screen_raytrace_normal',
                state_hit_point: 'screen_raytrace_hit_point',
                ray_origin: 'screen_ray_origin',
                ray_direction: 'screen_ray_direction'
            }).map(line => `${indent}${line}`));
        }

        code.push(...[
            `${indent}if (screen_raytrace_id == 0u) {`,
            `${indent}${indent}discard;`,
            `${indent}${indent}return;`,
            `${indent}}`
        ]);

        code.push(...[
            `${indent}vec3 light_vector = light_position - screen_raytrace_hit_point;`,
            `${indent}float light_distance = length(light_vector);`,
            `${indent}vec3 light_direction = light_vector / light_distance;`,
            `${indent}float light_intensity = saturate(dot(light_direction, screen_raytrace_normal));`,
            `${indent}uint light_raytrace_id = 0u;`,
            `${indent}float light_raytrace_depth = positive_infinity;`
        ]);

        for (const object of this[properties.objects]) {
            code.push(...object.compile(object[properties.base_id], createQualifiedMap(object), {
                state_id: 'light_raytrace_id',
                state_depth: 'light_raytrace_depth',
                ray_origin: 'screen_raytrace_hit_point',
                ray_direction: 'light_direction',
                ray_limit: 'light_distance'
            }).map(line => `${indent}${line}`));
        }

        code.push(...[
            `${indent}if (light_raytrace_id != 0u) {`,
            `${indent}${indent}color = vec4(vec3(0.1), 1.0);`,
            `${indent}${indent}return;`,
            `${indent}}`
        ]);

        code.push(`${indent}color = vec4(vec3(max(0.1, light_intensity)), 1.0);`);

        code.push('}', '');

        return code.join('\n');

        function createQualifiedMap(object) {
            const variable_map = uniform_state.per_object.get(object);
            const qualified_map = Object.create(null);
            for (const name in variable_map) {
                qualified_map[name] = variable_map[name].qualified_name;
            }
            return qualified_map;
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
