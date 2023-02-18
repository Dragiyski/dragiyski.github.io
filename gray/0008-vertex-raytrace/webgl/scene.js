import createProgram from '../../lib/gl-program.js';
import { dot_vector_vector } from '../../lib/math.js';
import { loadTextFile } from '../../lib/utils.js';
import { endFrameTimeMeasure } from '../../lib/webgl-frame-time.js';
import FirstPersonScene from '../../lib/webgl/first-person/scene.js';
import { appendDebugLine, clearDebug, reportVector } from './debug.js';

const script_url = import.meta.url;

const shader_source = {
    quad_vertex: 'shader/quad.vertex.glsl',
    quad_fragment: 'shader/quad.fragment.glsl'
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
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onPaint(gl, context) {
        super.onPaint(gl, context);

        gl.clear(gl.COLOR_BUFFER_BIT);

        {
            const program = context.quad_program;
            gl.useProgram(program);
            program.uniform.camera_origin?.setArray?.(this.camera.state.origin);
            program.uniform.screen_normal?.setArray?.(this.camera.state.forward);
            program.uniform.screen_origin?.setArray?.(this.camera.screen.origin);
            program.uniform.screen_right?.setArray?.(this.camera.screen.right);
            program.uniform.screen_up?.setArray?.(this.camera.screen.up);
            program.uniform.dot_screen_normal_screen_origin?.setValue?.(dot_vector_vector(this.camera.state.forward, this.camera.screen.origin));
            program.uniform.dot_screen_normal_camera_origin?.setValue?.(dot_vector_vector(this.camera.state.forward, this.camera.state.origin));
            program.uniform.screen_right_2?.setValue?.(dot_vector_vector(this.camera.screen.right, this.camera.screen.right));
            program.uniform.screen_up_2?.setValue?.(dot_vector_vector(this.camera.screen.up, this.camera.screen.up));
            gl.bindVertexArray(context.quad_vao);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
            gl.bindVertexArray(null);
            gl.useProgram(null);
        }
        // Skip measuring transform feedback...
        endFrameTimeMeasure(gl, context);
        {
            const program = context.quad_program_feedback;
            gl.useProgram(program);
            program.uniform.camera_origin?.setArray?.(this.camera.state.origin);
            program.uniform.screen_normal?.setArray?.(this.camera.state.forward);
            program.uniform.screen_origin?.setArray?.(this.camera.screen.origin);
            program.uniform.screen_right?.setArray?.(this.camera.screen.right);
            program.uniform.screen_up?.setArray?.(this.camera.screen.up);
            program.uniform.dot_screen_normal_screen_origin?.setValue?.(dot_vector_vector(this.camera.state.forward, this.camera.screen.origin));
            program.uniform.dot_screen_normal_camera_origin?.setValue?.(dot_vector_vector(this.camera.state.forward, this.camera.state.origin));
            program.uniform.screen_right_2?.setValue?.(dot_vector_vector(this.camera.screen.right, this.camera.screen.right));
            program.uniform.screen_up_2?.setValue?.(dot_vector_vector(this.camera.screen.up, this.camera.screen.up));
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
