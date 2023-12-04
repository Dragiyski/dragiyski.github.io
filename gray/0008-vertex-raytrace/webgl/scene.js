/* eslint-disable array-element-newline */
import createProgram from '../../lib/gl-program.js';
import { dot } from '../../lib/math/index.js';
import { loadTextFile } from '../../lib/utils.js';
import { endFrameTimeMeasure } from '../../lib/webgl-frame-time.js';
import FirstPersonScene from '../../lib/webgl/first-person/scene.js';
import { appendDebugLine, clearDebug, reportVector } from './debug.js';

const script_url = import.meta.url;

const shader_source = {
    quad_vertex: 'shader/quad.vertex.glsl',
    quad_fragment: 'shader/quad.fragment.glsl',
    compute_normal_vertex: 'shader/compute-normal.vertex.glsl',
    texture_fragment: 'shader/texture.fragment.glsl'
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

export default class Scene extends FirstPersonScene {
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onCreate(gl, context) {
        super.onCreate(gl, context);

        gl.clearColor(0.2, 0.5, 0.7, 1.0);

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

        {
            context.quad_program = createProgram(gl, shader_source.quad_vertex, shader_source.quad_fragment);
            context.quad_program_feedback = createProgram(gl, shader_source.quad_vertex, null, {
                beforeLink: program => {
                    gl.transformFeedbackVaryings(program, ['gl_Position'], gl.INTERLEAVED_ATTRIBS);
                }
            });
            context.quad_feedback = gl.createTransformFeedback();
            const vertex_data = Float32Array.from([
                [-3, 50, -3],
                [3, 50, -3],
                [-3, 50, 6],
                [3, 50, 6]
            ].flat());
            const index_data = Uint8Array.from([0, 1, 2, 1, 3, 2]);
            context.quad_vao = gl.createVertexArray();
            context.quad_vbo = gl.createBuffer();
            context.quad_ibo = gl.createBuffer();
            context.quad_feedback_buffer = gl.createBuffer();

            gl.bindVertexArray(context.quad_vao);
            gl.bindBuffer(gl.ARRAY_BUFFER, context.quad_vbo);
            gl.bufferData(gl.ARRAY_BUFFER, vertex_data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.quad_ibo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index_data, gl.STATIC_DRAW);

            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);

            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, context.quad_feedback_buffer);
            gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, 4 * 4 * 4, gl.STATIC_READ);
            gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
        }

        context.render_framebuffer = gl.createFramebuffer();
        context.render_color_texture = gl.createTexture();
        context.render_depth_texture = gl.createTexture();

        gl.bindFramebuffer(gl.FRAMEBUFFER, context.render_framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, context.render_color_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, context.render_color_texture, 0);
        gl.bindTexture(gl.TEXTURE_2D, context.render_depth_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, context.render_depth_texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        context.preview_program = createProgram(gl, shader_source.compute_normal_vertex, shader_source.texture_fragment);

        context.depth_framebuffer = gl.createFramebuffer();
        context.depth_render_texture = gl.createTexture();

        gl.bindFramebuffer(gl.FRAMEBUFFER, context.depth_framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, context.depth_render_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, context.depth_render_texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onResize(gl, context) {
        super.onResize(gl, context);

        gl.bindTexture(gl.TEXTURE_2D, context.render_color_texture);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, context.width, context.height);

        gl.bindTexture(gl.TEXTURE_2D, context.render_depth_texture);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT32F, context.width, context.height);

        gl.bindTexture(gl.TEXTURE_2D, context.depth_render_texture);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R32F, context.width, context.height);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onPaint(gl, context) {
        super.onPaint(gl, context);

        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, context.render_framebuffer);
            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(true);
            gl.clearDepth(0);
            gl.depthFunc(gl.ALWAYS);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            const program = context.quad_program;
            gl.useProgram(program);
            program.uniform.camera_origin?.setArray?.(this.camera.state.origin);
            program.uniform.screen_normal?.setArray?.(this.camera.state.forward);
            program.uniform.screen_origin?.setArray?.(this.camera.screen.origin);
            program.uniform.screen_right?.setArray?.(this.camera.screen.right);
            program.uniform.screen_up?.setArray?.(this.camera.screen.up);
            program.uniform.dot_screen_normal_screen_origin?.setValue?.(dot(this.camera.state.forward, this.camera.screen.origin));
            program.uniform.dot_screen_normal_camera_origin?.setValue?.(dot(this.camera.state.forward, this.camera.state.origin));
            program.uniform.screen_right_2?.setValue?.(dot(this.camera.screen.right, this.camera.screen.right));
            program.uniform.screen_up_2?.setValue?.(dot(this.camera.screen.up, this.camera.screen.up));
            gl.bindVertexArray(context.quad_vao);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
            // gl.finish();
            // const data = new Float32Array(context.width * context.height * 4);
            // gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.FLOAT, data);
            // debugger;
            gl.bindVertexArray(null);
            gl.useProgram(null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        {
            gl.disable(gl.DEPTH_TEST);
            const program = context.preview_program;
            gl.useProgram(program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, context.render_depth_texture);
            program.uniform.texture_in?.setValue?.(0);
            gl.bindVertexArray(context.compute_vertex_array);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
            gl.bindVertexArray(null);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.useProgram(null);
        }
        // Skip measuring transform feedback...
        endFrameTimeMeasure(gl, context);
        // {
        //     gl.bindFramebuffer(gl.FRAMEBUFFER, context.depth_framebuffer);
        //     const program = context.preview_program;
        //     gl.useProgram(program);
        //     gl.activeTexture(gl.TEXTURE0);
        //     gl.bindTexture(gl.TEXTURE_2D, context.render_depth_texture);
        //     program.uniform.texture_in?.setValue?.(0);
        //     gl.bindVertexArray(context.compute_vertex_array);
        //     gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        //     gl.finish();
        //     const data = new Float32Array(context.width * context.height);
        //     gl.readPixels(0, 0, context.width, context.height, gl.RED, gl.FLOAT, data);
        //     debugger;
        //     gl.bindVertexArray(null);
        //     gl.bindTexture(gl.TEXTURE_2D, null);
        //     gl.useProgram(null);
        // }
        {
            const program = context.quad_program_feedback;
            gl.useProgram(program);
            program.uniform.camera_origin?.setArray?.(this.camera.state.origin);
            program.uniform.screen_normal?.setArray?.(this.camera.state.forward);
            program.uniform.screen_origin?.setArray?.(this.camera.screen.origin);
            program.uniform.screen_right?.setArray?.(this.camera.screen.right);
            program.uniform.screen_up?.setArray?.(this.camera.screen.up);
            program.uniform.dot_screen_normal_screen_origin?.setValue?.(dot(this.camera.state.forward, this.camera.screen.origin));
            program.uniform.dot_screen_normal_camera_origin?.setValue?.(dot(this.camera.state.forward, this.camera.state.origin));
            program.uniform.screen_right_2?.setValue?.(dot(this.camera.screen.right, this.camera.screen.right));
            program.uniform.screen_up_2?.setValue?.(dot(this.camera.screen.up, this.camera.screen.up));
            gl.bindVertexArray(context.quad_vao);
            gl.enable(gl.RASTERIZER_DISCARD);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, context.quad_feedback_buffer);
            gl.beginTransformFeedback(gl.POINTS);
            gl.drawArrays(gl.POINTS, 0, 4);
            gl.endTransformFeedback();
            gl.finish();
            gl.disable(gl.RASTERIZER_DISCARD);
            gl.bindVertexArray(null);
            gl.useProgram(null);

            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
            gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, context.quad_feedback_buffer);
            const data = new Float32Array(4 * 4);
            gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, data);
            gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

            clearDebug();
            for (let i = 0; i < 4; ++i) {
                appendDebugLine(`quad[${i}] = ${reportVector([...data.slice(i * 4, i * 4 + 3)])}`);
            }
        }
    }
}
