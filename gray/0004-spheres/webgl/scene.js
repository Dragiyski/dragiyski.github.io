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

export class Scene extends OpenGLScene {
    async loadResources() {
        // TODO: Load sources for the shaders here.
        this.shader_source = {};
        const jobs = [
            loadShader('shader/camera-ray-generator.fragment.glsl').then(source => (this.shader_source.camera_ray_generator_fragment = source)),
            loadShader('shader/compute-center.vertex.glsl').then(source => (this.shader_source.compute_center_vertex = source)),
            loadShader('shader/compute-normal.vertex.glsl').then(source => (this.shader_source.compute_normal_vertex = source)),
            loadShader('shader/screen-camera-ray-preview.fragment.glsl').then(source => (this.shader_source.screen_camera_ray_preview_fragment = source)),
            loadShader('shader/raytrace-init.fragment.glsl').then(source => (this.shader_source.raytrace_init_fragment = source)),
            loadShader('shader/raytrace-sphere.fragment.glsl').then(source => (this.shader_source.raytrace_sphere_fragment = source))
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

        this.near_frame = 0.1;
        this.camera_position = [0, 0, 0];
        this.view_yaw = 0.0;
        this.view_pitch = 0.0;
        this.world_up = [0, 0, 1];
        this.camera_direction = [0, 1, 0];
        this.field_of_view = 60;

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

        this.camera_program = createProgram(gl, this.shader_source.compute_center_vertex, this.shader_source.camera_ray_generator_fragment);
        this.ray_direction_texture = gl.createTexture();
        this.ray_direction_framebuffer = gl.createFramebuffer();

        this.raytrace_init_program = createProgram(gl, this.shader_source.compute_normal_vertex, this.shader_source.raytrace_init_fragment);
        this.raytrace_texture = gl.createTexture();
        this.raytrace_framebuffer = gl.createFramebuffer();
        this.raytrace_sphere_program = createProgram(gl, this.shader_source.compute_normal_vertex, this.shader_source.raytrace_sphere_fragment);

        this.preview_program = createProgram(gl, this.shader_source.compute_normal_vertex, this.shader_source.screen_camera_ray_preview_fragment);

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

        gl.bindTexture(gl.TEXTURE_2D, this.ray_direction_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, this.width, this.height);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindTexture(gl.TEXTURE_2D, this.raytrace_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, this.width, this.height);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onPaint(gl, context) {
        if (this.frame_time_interval_id != null) {
            cancelAnimationFrame(this.frame_time_interval_id);
            this.frame_time_interval_id = null;
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        const view_yaw = this.view_yaw / 180 * Math.PI;
        const view_pitch = this.view_pitch / 180 * Math.PI;
        const camera_rotation_matrix = mul_matrix_matrix(mat4_rotation_z(-view_yaw), mat4_rotation_x(view_pitch));
        let camera_direction = mul_matrix_vector(camera_rotation_matrix, [...this.camera_direction, 1]); // +y = front = north;
        camera_direction = normalize_vector(div_vector_number(camera_direction.slice(0, 3), camera_direction[3]));
        const screen_center = add_vector_vector(this.camera_position, mul_number_vector(this.near_frame, camera_direction));
        const screen_right = normalize_vector(cross_vector_vector(camera_direction, this.world_up));
        const screen_up = normalize_vector(neg_vector(cross_vector_vector(camera_direction, screen_right)));
        const field_of_view = (this.field_of_view * 0.5) / 180 * Math.PI;
        const diagonal_size = Math.tan(field_of_view) * this.near_frame;
        const aspect_ratio = this.width / this.height;
        const world_screen_height = diagonal_size / Math.sqrt(1 + aspect_ratio * aspect_ratio);
        const world_screen_width = aspect_ratio * world_screen_height;
        const screen_height_vector = mul_number_vector(world_screen_height, screen_up);
        const screen_width_vector = mul_number_vector(world_screen_width, screen_right);

        if (this.EXT_disjoint_timer_query_webgl2 != null) {
            gl.beginQuery(this.EXT_disjoint_timer_query_webgl2.TIME_ELAPSED_EXT, this.frame_time_query);
        }

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.SCISSOR_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DITHER);

        gl.useProgram(this.camera_program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.ray_direction_framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.ray_direction_texture, 0);
        this.camera_program.uniform.world_screen_center?.setArray?.(screen_center);
        this.camera_program.uniform.world_screen_right?.setArray?.(screen_width_vector);
        this.camera_program.uniform.world_screen_up?.setArray?.(screen_height_vector);
        this.camera_program.uniform.camera_position?.setArray?.(this.camera_position);
        this.camera_program.uniform.screen_size?.setValue?.(this.width, this.height);
        gl.bindVertexArray(this.compute_vertex_array);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);

        gl.useProgram(this.raytrace_sphere_program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.raytrace_framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.raytrace_texture, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.ray_direction_texture);
        this.raytrace_sphere_program.uniform.ray_direction_texture?.setValue?.(0);
        this.raytrace_sphere_program.uniform.ray_origin?.setArray?.(this.camera_position);
        this.raytrace_sphere_program.uniform.sphere_origin?.setValue?.(0, 20, 0);
        this.raytrace_sphere_program.uniform.sphere_radius?.setValue?.(1);
        gl.bindVertexArray(this.compute_vertex_array);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(this.preview_program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.raytrace_texture);
        this.preview_program.uniform.color_texture?.setValue(0);
        gl.bindVertexArray(this.compute_vertex_array);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        if (this.EXT_disjoint_timer_query_webgl2 != null) {
            gl.endQuery(this.EXT_disjoint_timer_query_webgl2.TIME_ELAPSED_EXT);
            this.updateFrameTime(gl);
        }
    }

    updateFrameTime(gl) {
        if (gl.getQueryParameter(this.frame_time_query, gl.QUERY_RESULT_AVAILABLE)) {
            let time = gl.getQueryParameter(this.frame_time_query, gl.QUERY_RESULT);
            time /= 1e6;
            document.getElementById('frame-info').textContent = `${time.toFixed(3)}ms`;
        } else {
            this.frame_time_interval_id = requestAnimationFrame(() => {
                this.updateFrameTime(gl);
            });
        }
    }
}
