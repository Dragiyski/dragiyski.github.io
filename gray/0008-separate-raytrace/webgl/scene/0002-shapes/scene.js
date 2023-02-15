import createProgram from '../../../../lib/gl-program.js';
import { loadTextFile } from '../../../../lib/utils.js';
import { Scene as BaseScene, shader_source as scene_shader_source } from '../../scene.js';
import Quad, { shader_source as quad_shader_source } from '../../shape/quad/shape.js';

const script_url = import.meta.url;

export class Scene extends BaseScene {
    constructor() {
        super();
        this.quads = [
            new Quad({
                origin: [-3, 50, -3],
                direction: [
                    [6, 0, 0],
                    [0, 0, 8]
                ]
            }),
            new Quad({
                origin: [-35, 55, 0],
                direction: [
                    [10, 0, 0],
                    [0, 0, 10]
                ]
            })
        ];
        this.id_map = new WeakMap();
        let nextId = 1;
        for (const quad of this.quads) {
            this.id_map.set(quad, nextId++);
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onCreate(gl, context) {
        super.onCreate(gl, context);

        context.quad_raytrace_program = createProgram(gl, scene_shader_source.compute_normal, quad_shader_source.raytrace);

        context.raytrace_depth_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, context.raytrace_depth_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        context.screen_raytrace_framebuffer = gl.createFramebuffer();
        context.screen_raytrace_normal_depth_texture = gl.createTexture();
        context.screen_raytrace_hit_point_texture = gl.createTexture();
        context.screen_raytrace_id_texture = gl.createTexture();
        gl.bindFramebuffer(gl.FRAMEBUFFER, context.screen_raytrace_framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, context.screen_raytrace_normal_depth_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, context.screen_raytrace_hit_point_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, context.screen_raytrace_id_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onResize(gl, context) {
        super.onResize(gl, context);

        gl.bindTexture(gl.TEXTURE_2D, context.raytrace_depth_texture);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT32F, this.camera.width, this.camera.height);

        gl.bindTexture(gl.TEXTURE_2D, context.screen_raytrace_normal_depth_texture);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, this.camera.width, this.camera.height);

        gl.bindTexture(gl.TEXTURE_2D, context.screen_raytrace_hit_point_texture);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, this.camera.width, this.camera.height);

        gl.bindTexture(gl.TEXTURE_2D, context.screen_raytrace_id_texture);
        gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R32UI, this.camera.width, this.camera.height);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    raytrace(gl, context) {
        // eslint-disable-next-line no-lone-blocks
        {
            const program = context.quad_raytrace_program;
            gl.useProgram(program);
            gl.bindFramebuffer(gl.FRAMEBUFFER, context.screen_raytrace_framebuffer);
            program.uniform.ray_origin?.setArray?.(this.camera.origin);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, context.camera_ray_direction_texture);
            program.uniform.ray_direction_texture?.setValue?.(0);
            gl.bindVertexArray(context.compute_vertex_array);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, context.screen_raytrace_normal_depth_texture, 0);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, context.screen_raytrace_hit_point_texture, 0);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, context.screen_raytrace_id_texture, 0);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, context.raytrace_depth_texture, 0);
            for (const quad of this.quads) {
                quad.applyRaytraceProgram(program);
                program.uniform.object_id?.setValue?.(this.id_map.get(quad));
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
            }

            gl.finish();
            const data = new Float32Array(this.camera.width * this.camera.height * 4);
            gl.readPixels(0, 0, this.camera.width, this.camera.height, gl.RGBA, gl.FLOAT, data);
            debugger;

            gl.bindVertexArray(null);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.useProgram(null);
        }
    }
}
