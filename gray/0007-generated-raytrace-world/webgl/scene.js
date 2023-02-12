/* eslint-disable array-element-newline */
import OpenGLScene from '../../lib/gl-scene.js';
import createProgram from '../../lib/gl-program.js';
import {
    add_vector_vector,
    cross_vector_vector,
    dot_vector_vector,
    length_vector,
    mul_number_vector,
    neg_vector,
    normalize_vector,
    mat4_rotation_x,
    mat4_rotation_z,
    mul_matrix_matrix,
    mul_matrix_vector,
    sub_vector_vector,
    div_vector_number
} from '../../lib/math.js';
import Box from './raytracer/box.js';
import PerspectiveCamera from './raytracer/perspective-camera.js';

const this_url = import.meta.url;

async function loadShader(url) {
    return (await fetch(new URL(url, this_url))).text();
}

async function loadImage(url) {
    const image = new Image();
    image.src = new URL(url, this_url);
    return image.decode().then(() => image);
}

export class Scene extends OpenGLScene {
    async loadResources() {
        // TODO: Load sources for the shaders here.
        this.shader_source = {};
        this.images = {};
        const jobs = [
        ];
        return Promise.all(jobs);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onCreate(gl, context) {
        super.onCreate(gl, context);

        // Required for generating float32
        if (gl.getExtension('EXT_color_buffer_float') == null) {
            throw new Error('Missing required WebGL extension: EXT_color_buffer_float');
        }
        if ((this.EXT_disjoint_timer_query_webgl2 = gl.getExtension('EXT_disjoint_timer_query_webgl2')) != null) {
            this.frame_time_query = gl.createQuery();
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
            this.compute_vertex_array = gl.createVertexArray();
            this.compute_vertex_buffer = gl.createBuffer();
            this.compute_index_buffer = gl.createBuffer();

            gl.bindVertexArray(this.compute_vertex_array);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.compute_vertex_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, compute_vertex_data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.compute_index_buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, compute_index_data, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * compute_vertex_data.BYTES_PER_ELEMENT, 0);
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        this.program = 
        this.camera = new PerspectiveCamera();

        this.boxes = [
            new Box([-3, 50, 0], [6, 0, 0], [0, 5, 0], [0, 0, 8]),
            new Box([-35, 55, 0], [10, 0, 0], [0, 10, 0], [0, 0, 10])
        ];
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onResize(gl, context) {
        super.onResize(gl, context);
        this.width = gl.canvas.width;
        this.height = gl.canvas.height;
    }

    getCameraTriple() {
        const view_yaw = this.camera.yaw;
        const view_pitch = this.camera.pitch;
        const camera_rotation_matrix = mul_matrix_matrix(mat4_rotation_z(-view_yaw), mat4_rotation_x(view_pitch));
        let camera_direction = mul_matrix_vector(camera_rotation_matrix, [...this.camera.direction, 1]); // +y = front = north;
        camera_direction = normalize_vector(div_vector_number(camera_direction.slice(0, 3), camera_direction[3]));
        const screen_right = normalize_vector(cross_vector_vector(camera_direction, this.world_up));
        const screen_up = normalize_vector(neg_vector(cross_vector_vector(camera_direction, screen_right)));
        return [screen_right, screen_up, camera_direction];
    }

    updateCameraSpeed() {
        const keyboardSpeed = sub_vector_vector(this.camera.keyboard_move_positive, this.camera.keyboard_move_negative);
        // TODO: Additional vectors might be added from joystick.
        // The final speed vector will be normalized, so only direction is affected.
        // (For joystick, we may add speed factor to minimize the speed as fraction of maximum).
        if (length_vector(keyboardSpeed) < 0.001) {
            this.camera.move_speed = [0, 0, 0];
        } else {
            this.camera.move_speed = normalize_vector(keyboardSpeed);
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onPaint(gl, context) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        if (this.EXT_disjoint_timer_query_webgl2 != null && !this.frame_time_query.expect_result) {
            gl.beginQuery(this.EXT_disjoint_timer_query_webgl2.TIME_ELAPSED_EXT, this.frame_time_query);
            this.frame_time_query.expect_result = true;
            this.frame_time_query.in_this_frame = true;
        }

        if (this.EXT_disjoint_timer_query_webgl2 != null && this.frame_time_query.in_this_frame) {
            gl.endQuery(this.EXT_disjoint_timer_query_webgl2.TIME_ELAPSED_EXT);
            this.frame_time_query.in_this_frame = false;
            this.updateFrameTime(gl);
        }

        this.camera.timestamp = performance.now();
    }

    updateFrameTime(gl) {
        if (!this.frame_time_query.expect_result) {
            return;
        }
        if (gl.getQueryParameter(this.frame_time_query, gl.QUERY_RESULT_AVAILABLE)) {
            let time = gl.getQueryParameter(this.frame_time_query, gl.QUERY_RESULT);
            time /= 1e6;
            document.getElementById('frame-info').textContent = `${time.toFixed(3)}ms`;
            this.frame_time_query.expect_result = false;
        } else {
            this.frame_time_interval_id = setTimeout(() => {
                this.updateFrameTime(gl);
            }, 0);
        }
    }

    getDesiredSize(screen) {
        const [width, height] = super.getDesiredSize(screen);
        const aspect_ratio = width / height;
        const max_pixels = this.max_width * this.max_height;
        const desiredHeight = Math.floor(Math.sqrt(max_pixels / aspect_ratio));
        const desiredWidth = Math.floor(aspect_ratio * desiredHeight);
        return [desiredWidth, desiredHeight];
    }
}
