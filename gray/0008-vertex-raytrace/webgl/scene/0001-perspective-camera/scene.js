import createProgram from '../../../../lib/gl-program.js';
import { loadTextFile } from '../../../../lib/utils.js';
import { Scene as BaseScene, shader_source as scene_shader_source } from '../../scene.js';

const script_url = import.meta.url;

const shader_source = Object.assign(Object.create(null), {
    camera_preview: 'shader/preview.glsl'
});

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

export class Scene extends BaseScene {
    onCreate(gl, context) {
        super.onCreate(gl, context);

        context.preview_program = createProgram(gl, scene_shader_source.compute_normal, shader_source.camera_preview);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    raytrace(gl, context) {
        const program = context.preview_program;
        gl.useProgram(program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, context.camera_ray_direction_texture);
        program.uniform.color_texture?.setValue?.(0);
        gl.bindVertexArray(context.compute_vertex_array);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
        gl.useProgram(null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
