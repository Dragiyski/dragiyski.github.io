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
    constructor() {
        super();
        this.near_frame = 1.0;
        this.world_up = [0, 0, 1];
        this.field_of_view = 60;
        this.controls = {
            mouse_speed_x: 0.75,
            mouse_speed_y: 0.75,
            move_speed: 12
        };
        this.camera = {
            position: [0, 0, 2],
            direction: [0, 1, 0],
            yaw: 0.0,
            pitch: 0.0,
            move_speed: [0, 0, 0],
            keyboard_move_positive: [0, 0, 0],
            keyboard_move_negative: [0, 0, 0],
            timestamp: null
        };
        this.antialias = 1;
        this.max_width = 400;
        this.max_height = 300;
    }

    async loadResources() {
        // TODO: Load sources for the shaders here.
        this.shader_source = {};
        this.images = {};
        const jobs = [
            loadShader('shader/compute-normal.vertex.glsl').then(source => (this.shader_source.compute_normal_vertex = source)),
            loadShader('shader/raytrace.fragment.glsl').then(source => (this.shader_source.raytrace_fragment = source)),
            loadImage('scene/wall-color.png').then(image => (this.images.wall_color = image)),
            loadImage('scene/wall-normal.png').then(image => (this.images.wall_normal = image)),
            loadImage('scene/crate-color.jpg').then(image => (this.images.crate_color = image)),
            loadImage('scene/crate-normal.jpg').then(image => (this.images.crate_normal = image))
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
        context.timer_queue_ext = null;
        for (const extName of ['EXT_disjoint_timer_query_webgl2', 'EXT_disjoint_timer_query']) {
            const ext = gl.getExtension(extName);
            if (ext != null) {
                context.timer_queue_ext = ext;
                break;
            }
        }
        if (context.timer_queue_ext != null) {
            context.frame_time_query = gl.createQuery();
            context.in_this_frame = false;
            context.expect_result = false;
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

        this.raytrace_program = createProgram(gl, this.shader_source.compute_normal_vertex, this.shader_source.raytrace_fragment);

        this.wall_color_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.wall_color_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 5);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB8,
            this.images.wall_color.naturalWidth,
            this.images.wall_color.naturalHeight,
            0,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            this.images.wall_color
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.wall_normal_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.wall_normal_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 5);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB8,
            this.images.wall_normal.naturalWidth,
            this.images.wall_normal.naturalHeight,
            0,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            this.images.wall_normal
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.crate_color_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.crate_color_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 5);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB8,
            this.images.crate_color.naturalWidth,
            this.images.crate_color.naturalHeight,
            0,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            this.images.crate_color
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.crate_normal_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.crate_normal_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 5);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB8,
            this.images.crate_normal.naturalWidth,
            this.images.crate_normal.naturalHeight,
            0,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            this.images.crate_normal
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.test_fbo = gl.createFramebuffer();
        this.test_tex = gl.createTexture();

        // gl.clearColor(0.2, 0.5, 0.7, 1.0);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onResize(gl, context) {
        super.onResize(gl, context);
        this.width = gl.canvas.width;
        this.height = gl.canvas.height;

        document.getElementById('max-width').textContent = gl.canvas.clientWidth.toString(10);
        document.getElementById('max-height').textContent = gl.canvas.clientHeight.toString(10);
        document.getElementById('current-width').textContent = this.width.toString(10);
        document.getElementById('current-height').textContent = this.height.toString(10);

        // gl.bindTexture(gl.TEXTURE_2D, this.test_tex);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, this.width, this.height);
        // gl.bindTexture(gl.TEXTURE_2D, null);
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
        document.getElementById('current-antialias').textContent = this.antialias + 'x';
        if (this.frame_time_interval_id != null) {
            cancelAnimationFrame(this.frame_time_interval_id);
            this.frame_time_interval_id = null;
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        // Compute first-person camera screen
        const camera_triple = this.getCameraTriple();
        const field_of_view = (this.field_of_view * 0.5) / 180 * Math.PI;
        const aspect_ratio = this.width / this.height;
        const diagonal_size = Math.tan(field_of_view) * this.near_frame;
        const world_screen_height = diagonal_size / Math.sqrt(1 + aspect_ratio * aspect_ratio);
        const world_screen_width = aspect_ratio * world_screen_height;
        const world_screen_up = mul_number_vector(world_screen_height, camera_triple[1]);
        const world_screen_right = mul_number_vector(world_screen_width, camera_triple[0]);
        if (this.camera.timestamp != null) {
            const factor = (performance.now() - this.camera.timestamp) * 1e-3;
            const move_offset = mul_number_vector(factor * this.controls.move_speed, this.camera.move_speed);
            let move_vector = [0, 0, 0];
            for (let i = 0; i < 3; ++i) {
                const move_direction = mul_number_vector(move_offset[i], camera_triple[i]);
                move_vector = add_vector_vector(move_vector, move_direction);
            }
            this.camera.position = add_vector_vector(this.camera.position, move_vector);
        }
        const camera_position = this.camera.position;
        const world_screen_center = add_vector_vector(camera_position, mul_number_vector(this.near_frame, camera_triple[2]));

        if (context.timer_queue_ext != null && !context.frame_time_query.expect_result) {
            gl.beginQuery(context.timer_queue_ext.TIME_ELAPSED_EXT, context.frame_time_query);
            context.frame_time_query.expect_result = true;
            context.frame_time_query.in_this_frame = true;
        }

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.SCISSOR_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DITHER);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        let program = null;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // gl.bindFramebuffer(gl.FRAMEBUFFER, this.test_fbo);
        // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.test_tex, 0);
        gl.useProgram(program = this.raytrace_program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.wall_color_texture);
        program.uniform.wall_color_texture?.setValue?.(0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.crate_color_texture);
        program.uniform.crate_color_texture?.setValue?.(1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.wall_normal_texture);
        program.uniform.wall_normal_texture?.setValue?.(2);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.crate_normal_texture);
        program.uniform.crate_normal_texture?.setValue?.(3);
        program.uniform.antialias?.setValue?.(this.antialias);
        program.uniform.screen_size?.setValue?.(this.width, this.height);
        program.uniform.camera_position?.setArray?.(camera_position);
        program.uniform.world_screen_center?.setArray?.(world_screen_center);
        program.uniform.world_screen_right?.setArray?.(world_screen_right);
        program.uniform.world_screen_up?.setArray?.(world_screen_up);
        gl.bindVertexArray(this.compute_vertex_array);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);

        // gl.finish();
        // const data = new Float32Array(this.width * this.height * 4);
        // gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.FLOAT, data);
        // debugger;

        if (context.timer_queue_ext != null && context.frame_time_query.in_this_frame) {
            gl.endQuery(context.timer_queue_ext.TIME_ELAPSED_EXT);
            context.frame_time_query.in_this_frame = false;
            this.updateFrameTime(gl, context);
        }

        this.camera.timestamp = performance.now();
    }

    updateFrameTime(gl, context) {
        if (!context.frame_time_query.expect_result) {
            return;
        }
        if (gl.getQueryParameter(context.frame_time_query, gl.QUERY_RESULT_AVAILABLE)) {
            let time = gl.getQueryParameter(context.frame_time_query, gl.QUERY_RESULT);
            time /= 1e6;
            document.getElementById('frame-info').textContent = `${time.toFixed(3)}ms`;
            context.frame_time_query.expect_result = false;
        } else {
            this.frame_time_interval_id = setTimeout(() => {
                this.updateFrameTime(gl, context);
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
