/* eslint-disable array-element-newline */
import OpenGLScene from '../../lib/gl-scene.js';
import createProgram from '../../lib/gl-program.js';
import { float32 } from '../../lib/float.js';
import {
    add_vector_vector,
    cross_vector_vector,
    div_vector_number,
    dot_vector_vector,
    length_vector,
    mat4_rotation_x,
    mat4_rotation_z,
    mul_matrix_matrix,
    mul_matrix_vector,
    mul_number_vector,
    neg_vector,
    normalize_vector,
    sub_vector_vector
} from '../../lib/math.js';
import {
    beginFrameTimeMeasure,
    createFrameTimeMeasure,
    destroyFrameTimeMeasure,
    endFrameTimeMeasure
} from './frame-time.js';
import { loadTextFile } from '../../lib/utils.js';

const script_url = import.meta.url;

export const shader_source = {
    compute_normal: 'shader/compute-normal.glsl',
    compute_center: 'shader/compute-center.glsl',
    camera: 'shader/camera.glsl',
    preview: 'shader/preview.glsl',
    quad_vertex: 'shader/quad.vertex.glsl',
    quad_fragment: 'shader/quad.fragment.glsl'
};

const methods = {
    resume: Symbol('resume'),
    pause: Symbol('pause'),
    frame: Symbol('frame')
};

const events = {
    pointerLockChange: Symbol('pointerLockChange'),
    controlMouseMove: Symbol('controlMouseMove'),
    controlKeyboardMove: Symbol('controlKeyboardMove')
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

export class Scene extends OpenGLScene {
    constructor() {
        super();
        this.camera = {
            origin: [0, 0, 0],
            axes: [
                [1, 0, 0], // = right
                [0, 0, 1], // = up
                [0, 1, 0] //  = forward
            ],
            field_of_view: (60 / 2) / 180 * Math.PI,
            move_velocity: [0, 0, 0],
            move_speed: 12,
            timestamp: null
        };
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onCreate(gl, context) {
        super.onCreate(gl, context);

        if (gl.getExtension('EXT_color_buffer_float') == null) {
            throw new Error('Missing required WebGL extension: EXT_color_buffer_float');
        }
        if ((context.EXT_disjoint_timer_query_webgl2 = gl.getExtension('EXT_disjoint_timer_query_webgl2')) != null) {
            context.frame_time_query = gl.createQuery();
        }
        createFrameTimeMeasure(gl, context);

        context.eventPointerLockChange = this[events.pointerLockChange].bind(this, gl, context);
        context.eventControlMouseMove = this[events.controlMouseMove].bind(this, gl, context);
        context.eventControlKeyboardMove = this[events.controlKeyboardMove].bind(this, gl, context);

        gl.disable(gl.DITHER);
        gl.disable(gl.STENCIL_TEST);
        gl.disable(gl.SCISSOR_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);
        gl.depthRange(0, 1000);

        context.quad_program = createProgram(gl, shader_source.quad_vertex, shader_source.quad_fragment);

        context.vertexBuffer = gl.createBuffer();
        context.indexBuffer = gl.createBuffer();
        context.vertexArray = gl.createVertexArray();

        const quad_data = [
            [-3, 50, -3],
            [6, 0, 0],
            [0, 0, 8]
        ];
        const vertex_data = Float32Array.from([
            ...quad_data[0],
            ...add_vector_vector(quad_data[0], quad_data[1]),
            ...add_vector_vector(quad_data[0], quad_data[2]),
            ...add_vector_vector(add_vector_vector(quad_data[0], quad_data[1]), quad_data[2])
        ]);
        const index_data = Uint8Array.from([
            0, 1, 2,
            1, 3, 2
        ]);

        gl.bindVertexArray(context.vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, context.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertex_data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index_data, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.clearColor(0.2, 0.5, 0.7, 1.0);
    }

    onStart(gl, context) {
        const document = gl.screen.ownerDocument;
        document.addEventListener('pointerlockchange', context.eventPointerLockChange, { passive: true });

        if (document.pointerLockElement === gl.screen) {
            this[methods.resume]();
        }
    }

    onStop(gl, context) {
        const document = gl.screen.ownerDocument;
        document.removeEventListener('pointerlockchange', context.eventPointerLockChange);
        document.removeEventListener('control.mouse.move', context.eventControlMouseMove);
        this.camera.timestamp = null;
        // We won't change the screen state to passive, as it might be required to be active in the next scene.
    }

    [events.pointerLockChange](gl, context, event) {
        if (document.pointerLockElement === gl.screen) {
            this[methods.resume](gl, context);
        } else {
            this[methods.pause](gl, context);
        }
    }

    [methods.resume](gl, context) {
        gl.screen.addEventListener('control.mouse.move', context.eventControlMouseMove, { passive: true });
        gl.screen.addEventListener('control.keyboard.move', context.eventControlKeyboardMove, { passive: true });
        this.camera.timestamp = performance.now();
        gl.screen.passive = false;
    }

    [methods.pause](gl, context) {
        gl.screen.removeEventListener('control.mouse.move', context.eventControlMouseMove);
        gl.screen.removeEventListener('control.keyboard.move', context.eventControlKeyboardMove);
        this.camera.timestamp = null;
        gl.screen.passive = true;
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onResize(gl, context) {
        super.onResize(gl, context);
        this.camera.width = gl.canvas.width;
        this.camera.height = gl.canvas.height;
        this.camera.aspect_ratio = this.camera.width / this.camera.height;

        // gl.bindTexture(gl.TEXTURE_2D, context.camera_ray_direction_texture);
        // gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, this.camera.width, this.camera.height);
        // gl.bindTexture(gl.TEXTURE_2D, null);
    }

    [events.controlMouseMove](gl, context, event) {
        const camera_rotation_matrix = mul_matrix_matrix(mat4_rotation_z(-event.yaw), mat4_rotation_x(event.pitch));
        let camera_forward = mul_matrix_vector(camera_rotation_matrix, [0, 1, 0, 1]);
        camera_forward = normalize_vector(div_vector_number(camera_forward.slice(0, 3), camera_forward[3]));
        // Ensures forward is never colinear with [0, 0, 1] (including [0, 0, -1])...
        if (camera_forward[0] === 0 && camera_forward[1] === 0) {
            camera_forward = [float32.epsilon, float32.epsilon, camera_forward[2]];
        }
        const camera_right = normalize_vector(cross_vector_vector(camera_forward, [0, 0, 1]));
        console.log(camera_right);
        const camera_up = normalize_vector(neg_vector(cross_vector_vector(camera_forward, camera_right)));
        this.camera.axes = [
            camera_right,
            camera_up,
            camera_forward
        ];
    }

    [events.controlKeyboardMove](gl, context, event) {
        const keyboard_vector = sub_vector_vector(event.positive, event.negative);
        const kv_length = length_vector(keyboard_vector);
        if (kv_length < 0.001) {
            this.camera.move_velocity = [0, 0, 0];
            this.camera.timestamp = null;
        } else {
            this.camera.move_velocity = div_vector_number(keyboard_vector, kv_length);
            this.camera.timestamp = performance.now();
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onPaint(gl, context) {
        super.onPaint(gl, context);

        try {
            beginFrameTimeMeasure(gl, context);
            this[methods.frame](gl, context);
        } finally {
            endFrameTimeMeasure(gl, context);
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    [methods.frame](gl, context) {
        if (this.camera.timestamp != null) {
            const now = performance.now();
            const time_delta = (now - this.camera.timestamp) * 1e-3;
            const move_offset = mul_number_vector(time_delta * this.camera.move_speed, this.camera.move_velocity);
            let move_vector = [0, 0, 0];
            for (let i = 0; i < 3; ++i) {
                move_vector = add_vector_vector(move_vector, mul_number_vector(move_offset[i], this.camera.axes[i]));
            }
            this.camera.origin = add_vector_vector(this.camera.origin, move_vector);
            this.camera.timestamp = now;
        }

        const aspect_ratio = this.camera.aspect_ratio;
        const diagonal_size = Math.tan(this.camera.field_of_view);
        const view_height = diagonal_size / Math.sqrt(1 + aspect_ratio * aspect_ratio);
        const view_width = aspect_ratio * view_height;
        const screen_right = mul_number_vector(view_width, this.camera.axes[0]);
        const screen_up = mul_number_vector(view_height, this.camera.axes[1]);
        const screen_center = add_vector_vector(this.camera.origin, this.camera.axes[2]);
        const dot_camera_direction_screen_center = dot_vector_vector(this.camera.axes[2], screen_center);
        const dot_camera_direction_camera_origin = dot_vector_vector(this.camera.axes[2], this.camera.origin);
        const screen_right_square = dot_vector_vector(screen_right, screen_right);
        const screen_up_square = dot_vector_vector(screen_up, screen_up);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const program = context.quad_program;
        gl.useProgram(program);
        program.uniform.camera_origin?.setArray?.(this.camera.origin);
        program.uniform.camera_direction?.setArray?.(this.camera.axes[2]);
        program.uniform.screen_center?.setArray?.(screen_center);
        program.uniform.screen_right?.setArray?.(screen_right);
        program.uniform.screen_up?.setArray?.(screen_up);
        program.uniform.dot_camera_direction_screen_center?.setValue?.(dot_camera_direction_screen_center);
        program.uniform.dot_camera_direction_camera_origin?.setValue?.(dot_camera_direction_camera_origin);
        program.uniform.screen_right_square?.setValue?.(screen_right_square);
        program.uniform.screen_up_square?.setValue?.(screen_up_square);
        gl.bindVertexArray(context.vertexArray);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
        gl.useProgram(null);

        // {
        //     const program = context.camera_ray_direction_program;
        //     gl.useProgram(program);
        //     program.uniform.camera_origin?.setArray?.(this.camera.origin);
        //     program.uniform.screen_center?.setArray?.(screen_center);
        //     program.uniform.screen_right?.setArray?.(screen_right);
        //     program.uniform.screen_up?.setArray?.(screen_up);
        //     gl.bindFramebuffer(gl.FRAMEBUFFER, context.camera_ray_direction_framebuffer);
        //     gl.bindVertexArray(context.compute_vertex_array);
        //     gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        //     gl.bindVertexArray(null);
        //     gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //     gl.useProgram(null);
        // }

        // this.raytrace(gl, context);
    }

    raytrace(gl, context) {}

    onRelease(gl, context) {
        destroyFrameTimeMeasure(gl, context);
    }
}
