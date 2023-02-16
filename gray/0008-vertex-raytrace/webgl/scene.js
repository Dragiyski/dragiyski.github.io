/* eslint-disable array-element-newline */
import OpenGLScene from '../../lib/gl-scene.js';
import createProgram from '../../lib/gl-program.js';
import { float32 } from '../../lib/float.js';
import {
    add_vector_vector,
    cross_vector_vector,
    div_vector_number,
    mat4_rotation_x,
    mat4_rotation_z,
    mul_matrix_matrix,
    mul_matrix_vector,
    mul_number_vector,
    neg_vector,
    normalize_vector
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
    preview: 'shader/preview.glsl'
};

const methods = {
    resume: Symbol('resume'),
    pause: Symbol('pause'),
    frame: Symbol('frame')
};

const events = {
    pointerLockChange: Symbol('pointerLockChange'),
    controlMouseMove: Symbol('controlMouseMove')
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
            positive_walk: [0, 0, 0],
            negative_walk: [0, 0, 0],
            field_of_view: (60 / 2) / 180 * Math.PI,
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
        createFrameTimeMeasure(gl, context);

        {
            const vertex_data = Float32Array.from([
                -1, +1,
                -1, -1,
                +1, -1,
                +1, +1
            ]);
            const index_data = Uint8Array.from([
                0, 1, 2,
                0, 2, 3
            ]);

            context.compute_vertex_array = gl.createVertexArray();
            const vertexBuffer = gl.createBuffer();
            const indexBuffer = gl.createBuffer();

            gl.bindVertexArray(context.compute_vertex_array);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertex_data, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index_data, gl.STATIC_DRAW);

            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);

            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        context.eventPointerLockChange = this[events.pointerLockChange].bind(this, gl, context);
        context.eventControlMouseMove = this[events.controlMouseMove].bind(this, gl, context);

        context.camera_ray_direction_framebuffer = gl.createFramebuffer();
        context.camera_ray_direction_texture = gl.createTexture();
        context.camera_ray_direction_program = createProgram(gl, shader_source.compute_center, shader_source.camera);
        gl.bindFramebuffer(gl.FRAMEBUFFER, context.camera_ray_direction_framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, context.camera_ray_direction_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, context.camera_ray_direction_texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.disable(gl.DITHER);
        gl.disable(gl.STENCIL_TEST);
        gl.disable(gl.SCISSOR_TEST);
        gl.disable(gl.CULL_FACE);

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
        this.camera.timestamp = performance.now();
        gl.screen.passive = false;
    }

    [methods.pause](gl, context) {
        gl.screen.removeEventListener('control.mouse.move', context.eventControlMouseMove);
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

        gl.bindTexture(gl.TEXTURE_2D, context.camera_ray_direction_texture);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, this.camera.width, this.camera.height);
        gl.bindTexture(gl.TEXTURE_2D, null);
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
        const camera_up = normalize_vector(neg_vector(cross_vector_vector(camera_forward, camera_right)));
        this.camera.axes = [
            camera_right,
            camera_up,
            camera_forward
        ];
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
        const aspect_ratio = this.camera.aspect_ratio;
        const diagonal_size = Math.tan(this.camera.field_of_view);
        const view_height = diagonal_size / Math.sqrt(1 + aspect_ratio * aspect_ratio);
        const view_width = aspect_ratio * view_height;
        const screen_right = mul_number_vector(view_width, this.camera.axes[0]);
        const screen_up = mul_number_vector(view_height, this.camera.axes[1]);
        const screen_center = add_vector_vector(this.camera.origin, this.camera.axes[2]);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        {
            const program = context.camera_ray_direction_program;
            gl.useProgram(program);
            program.uniform.camera_origin?.setArray?.(this.camera.origin);
            program.uniform.screen_center?.setArray?.(screen_center);
            program.uniform.screen_right?.setArray?.(screen_right);
            program.uniform.screen_up?.setArray?.(screen_up);
            gl.bindFramebuffer(gl.FRAMEBUFFER, context.camera_ray_direction_framebuffer);
            gl.bindVertexArray(context.compute_vertex_array);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
            gl.bindVertexArray(null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.useProgram(null);
        }

        this.raytrace(gl, context);
    }

    raytrace(gl, context) {}

    onRelease(gl, context) {
        destroyFrameTimeMeasure(gl, context);
    }
}
