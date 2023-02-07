/* eslint-disable array-element-newline */
import OpenGLScene from '../../lib/gl-scene.js';
import createProgram from '../../lib/gl-program.js';
import {
    add_vector_vector,
    cross_vector_vector,
    mul_number_vector,
    neg_vector,
    normalize_vector,
    mat4_rotation_x,
    mat4_rotation_z,
    mul_matrix_matrix,
    mul_matrix_vector,
    div_vector_number,
    sub_vector_vector
} from '../../lib/math.js';

const this_url = import.meta.url;

async function loadShader(url) {
    return (await fetch(new URL(url, this_url))).text();
}

function reportNumber(n) {
    n = n.toFixed(3);
    if (!n.startsWith('-')) {
        n = '+' + n;
    }
    return n;
}

function reportToDebug(...lines) {
    const debug = document.getElementById('debug');
    if (debug == null) {
        return;
    }
    debug.innerHTML = '';
    for (const line of lines) {
        const div = document.createElement('div');
        div.textContent = line;
        debug.appendChild(div);
    }
}

function appendDebugLine(line) {
    const debug = document.getElementById('debug');
    if (debug == null) {
        return;
    }
    const div = document.createElement('div');
    div.textContent = line;
    debug.appendChild(div);
}

function reportVector(arr) {
    return '[' + arr.map(reportNumber).join(', ') + ']';
}

export class Scene extends OpenGLScene {
    async loadResources() {
        // TODO: Load sources for the shaders here.
        this.shader_source = {};
        const jobs = [
            loadShader('shader/camera-ray-generator.vertex.glsl').then(source => (this.shader_source.camera_ray_generator = source)),
            loadShader('shader/screen.vertex.glsl').then(source => (this.shader_source.screen = source)),
            loadShader('shader/screen-camera-ray-preview.fragment.glsl').then(source => (this.shader_source.screen_camera_ray_preview = source))
        ];
        return Promise.all(jobs);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onCreate(gl, context) {
        super.onCreate(gl, context);

        // Required only for reading the data from the RGBA32F textures.
        // Those textures can be given to shaders without this extensions, but they cannot be rendered to screen/framebuffer and thus cannot readPixels().
        gl.getExtension('EXT_color_buffer_float');
        if ((this.EXT_disjoint_timer_query_webgl2 = gl.getExtension('EXT_disjoint_timer_query_webgl2')) != null) {
            this.frame_time_query = gl.createQuery();
        }

        this.view_buffer = gl.createBuffer();
        this.view_feedback = gl.createTransformFeedback();
        this.view_texture = gl.createTexture();
        this.near_frame = 0.1;
        this.camera_position = [0, 0, 0];
        this.view_yaw = 0.0;
        this.view_pitch = 0.0;
        this.world_up = [0, 0, 1];
        this.camera_direction = [0, 1, 0];
        this.field_of_view = 60;

        this.camera_program = createProgram(gl, this.shader_source.camera_ray_generator, null, {
            beforeLink: program => {
                gl.transformFeedbackVaryings(program, ['ray_direction'], gl.INTERLEAVED_ATTRIBS);
            }
        });

        this.preview_program = createProgram(gl, this.shader_source.screen, this.shader_source.screen_camera_ray_preview);

        const screen_vertex_data = Float32Array.from([
            -1, +1,
            -1, -1,
            +1, -1,
            +1, +1
        ]);
        const screen_index_data = Uint8Array.from([
            // 0 3
            // 1 2
            0, 1, 2,
            0, 2, 3
        ]);
        this.screen_vertex_array = gl.createVertexArray();
        this.screen_vertex_buffer = gl.createBuffer();
        this.screen_index_buffer = gl.createBuffer();
        this.test_fbo = gl.createFramebuffer();
        this.test_rbo = gl.createRenderbuffer();

        gl.bindVertexArray(this.screen_vertex_array);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.screen_vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, screen_vertex_data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.screen_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, screen_index_data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        gl.clearColor(0.2, 0.5, 0.7, 1.0);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onResize(gl, context) {
        super.onResize(gl, context);
        this.width = gl.canvas.width;
        this.height = gl.canvas.height;

        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.view_buffer);
        gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, this.width * this.height * 4 * 4, gl.DYNAMIC_DRAW | gl.DYNAMIC_READ);
        gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onPaint(gl, context) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        reportToDebug(
            'camera_position: ' + reportVector(this.camera_position),
            'camera_rotation: ' + reportVector([this.view_yaw, this.view_pitch]),
            'field of view: ' + this.field_of_view.toFixed(3)
        );
        const view_yaw = this.view_yaw / 180 * Math.PI;
        const view_pitch = this.view_pitch / 180 * Math.PI;
        const camera_rotation_matrix = mul_matrix_matrix(mat4_rotation_z(-view_yaw), mat4_rotation_x(view_pitch));
        let camera_direction = mul_matrix_vector(camera_rotation_matrix, [...this.camera_direction, 1]); // +y = front = north;
        camera_direction = normalize_vector(div_vector_number(camera_direction.slice(0, 3), camera_direction[3]));
        console.log(camera_direction);
        appendDebugLine('camera_direction: ' + reportVector(camera_direction));
        const screen_center = add_vector_vector(this.camera_position, mul_number_vector(this.near_frame, camera_direction));
        appendDebugLine('screen_center: ' + reportVector(screen_center));
        appendDebugLine('expected_screen_front: ' + reportVector(normalize_vector(sub_vector_vector(screen_center, this.camera_position))));
        const screen_right = normalize_vector(cross_vector_vector(camera_direction, this.world_up));
        const screen_up = normalize_vector(neg_vector(cross_vector_vector(camera_direction, screen_right)));
        appendDebugLine('screen_right: ' + reportVector(screen_right));
        appendDebugLine('screen_up: ' + reportVector(screen_up));
        const field_of_view = (this.field_of_view * 0.5) / 180 * Math.PI;
        const diagonal_size = Math.tan(field_of_view) * this.near_frame;
        const aspect_ratio = this.width / this.height;
        const world_screen_height = diagonal_size / Math.sqrt(1 + aspect_ratio * aspect_ratio);
        const world_screen_width = aspect_ratio * world_screen_height;
        const screen_height_vector = mul_number_vector(world_screen_height, screen_up);
        const screen_width_vector = mul_number_vector(world_screen_width, screen_right);
        appendDebugLine('screen_world_size: ' + reportVector([world_screen_width, world_screen_height]));
        // Let have 1920x1080 screen
        // The center at 960x540 will have coordinates (0, 0)
        // Position 100x100 on the top left on the screen will have bottom-left coordinates: (100, 1079-100) = (100, 979)
        // The coordinates from the center will be (100-960, 979-540) = (-860, 439)
        // Screen partial coordinates will be (-860 / 960, 439 / 540) = (-0.895833(3)..., 0.81296(296)...)
        // screen_position = screen_center + (-0.895833(3)... * screen_width_vector, 0.81296(296)... * screen_height_vector) = vec3
        // view_vector = screen_position - camera_position

        if (this.EXT_disjoint_timer_query_webgl2 != null) {
            gl.beginQuery(this.EXT_disjoint_timer_query_webgl2.TIME_ELAPSED_EXT, this.frame_time_query);
        }

        gl.enable(gl.RASTERIZER_DISCARD);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.disable(gl.SCISSOR_TEST);
        gl.disable(gl.DITHER);
        gl.disable(gl.CULL_FACE);

        gl.useProgram(this.camera_program);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.view_feedback);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.view_buffer);
        this.camera_program.uniform.screen_size?.setValue?.(this.width, this.height);
        this.camera_program.uniform.world_screen_center?.setArray?.(screen_center);
        this.camera_program.uniform.world_screen_right?.setArray?.(screen_width_vector);
        this.camera_program.uniform.world_screen_up?.setArray?.(screen_height_vector);
        this.camera_program.uniform.camera_position?.setArray?.(this.camera_position);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, this.width * this.height);
        gl.endTransformFeedback();

        // Now the buffer contains the data of the view vectors, upload that to texture.

        // {
        //     gl.finish();
        //     const data = new Float32Array(new ArrayBuffer(this.width * this.height * 4 * 4));
        //     gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, data);
        //     const center_index = Math.floor(this.width / 2) + Math.floor(this.height / 2) * this.width;
        //     const bottom_left_index = 0;
        //     const bottom_right_index = this.width - 1;
        //     const top_left_index = (this.height - 1) * this.width;
        //     const top_right_index = this.width * this.height - 1;
        //     const center_vector = data.slice(center_index * 4, center_index * 4 + 3);
        //     const bottom_left_vector = data.slice(bottom_left_index * 4, bottom_left_index * 4 + 3);
        //     const bottom_right_vector = data.slice(bottom_right_index * 4, bottom_right_index * 4 + 3);
        //     const top_left_vector = data.slice(top_left_index * 4, top_left_index * 4 + 3);
        //     const top_right_vector = data.slice(top_right_index * 4, top_right_index * 4 + 3);
        //     appendDebugLine('computed_screen_front: ' + reportVector([...center_vector]));
        //     appendDebugLine('computed_screen_TL: ' + reportVector([...top_left_vector]));
        //     appendDebugLine('computed_screen_TR: ' + reportVector([...top_right_vector]));
        //     appendDebugLine('computed_screen_BL: ' + reportVector([...bottom_left_vector]));
        //     appendDebugLine('computed_screen_BR: ' + reportVector([...bottom_right_vector]));
        // }

        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, this.view_buffer);
        gl.bindTexture(gl.TEXTURE_2D, this.view_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, this.width, this.height, 0, gl.RGBA, gl.FLOAT, 0);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

        gl.disable(gl.RASTERIZER_DISCARD);
        // gl.bindFramebuffer(gl.FRAMEBUFFER, this.test_fbo);
        // gl.bindRenderbuffer(gl.RENDERBUFFER, this.test_rbo);
        // gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA32F, gl.canvas.width, gl.canvas.height);
        // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.view_texture, 0);
        // const data = new Float32Array(new ArrayBuffer(gl.canvas.width * gl.canvas.height * 4 * 4));
        // gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.FLOAT, data);
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.test_fbo);
        // gl.blitFramebuffer(0, 0, this.width, this.height, 0, 0, this.width, this.height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
        // debugger;

        gl.useProgram(this.preview_program);
        gl.bindVertexArray(this.screen_vertex_array);
        gl.activeTexture(gl.TEXTURE0);
        // gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, this.view_buffer);
        gl.bindTexture(gl.TEXTURE_2D, this.view_texture);
        // // Last argument = 0 is pbo_offset, pbo = pixel_buffer_object will copy data from PIXEL_UNPACK_BUFFER
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.FLOAT, 0);
        // gl.flush();
        // gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
        this.preview_program.uniform.color_texture?.setValue(0);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);

        gl.useProgram(null);

        if (this.EXT_disjoint_timer_query_webgl2 != null) {
            gl.endQuery(this.EXT_disjoint_timer_query_webgl2.TIME_ELAPSED_EXT);
            const getResult = () => {
                if (gl.getQueryParameter(this.frame_time_query, gl.QUERY_RESULT_AVAILABLE)) {
                    let time = gl.getQueryParameter(this.frame_time_query, gl.QUERY_RESULT);
                    time /= 1e6;
                    document.getElementById('frame-info').textContent = `${time.toFixed(3)}ms`;
                } else {
                    setTimeout(getResult, 0);
                }
            };
            setTimeout(getResult, 0);
        }
    }
}

export let isLoaded = false;
const scene = new Scene();

async function main() {
    isLoaded = true;
    await scene.loadResources();
    const canvas = document.getElementById('screen');
    canvas.scene = scene;
}

if (document.readyState !== 'complete') {
    window.addEventListener('load', onFirstLoadedEvent);
    document.addEventListener('readystatechange', onDocumentStateChangeEvent);
    window.addEventListener('beforeunload', onFirstUnloadEvent);
    window.addEventListener('pagehide', onFirstUnloadEvent);
} else {
    main();
}

function onDocumentStateChangeEvent() {
    if (document.readyState === 'complete') {
        onFirstLoadedEvent();
    }
}

function onFirstLoadedEvent() {
    window.removeEventListener('load', onFirstLoadedEvent);
    document.removeEventListener('readystatechange', onDocumentStateChangeEvent);
    main().catch(error => {
        console.error(error);
        unload();
    });
}

function onFirstUnloadEvent() {
    window.removeEventListener('beforeunload', onFirstUnloadEvent);
    window.removeEventListener('pagehide', onFirstUnloadEvent);
    unload();
}

function unload() {
    isLoaded = false;
    const canvas = document.getElementById('screen');
    canvas.release(scene);
}
