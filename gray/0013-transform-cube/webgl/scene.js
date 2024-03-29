import createProgram from '../../lib/gl-program.js';
import { Matrix4x4, Vector2D, Vector3D, Vector4D, add, cross, div, dot, hg_collapse, hg_expand, inverse, length, limits, mul, neg, normalize, radians_from, sub } from '../../lib/math/index.js';
import { loadTextFile } from '../../lib/utils.js';
import FirstPersonScene from '../../lib/webgl/first-person/scene.js';

const objectTypes = {
    NULL: 0,
    DRAWABLE_SPHERE: 1
};
Object.setPrototypeOf(objectTypes, null);

const script_url = import.meta.url;

const shader_source = {
    compute_normal_vertex: 'shader/compute-normal.vertex.glsl',
    compute_center_vertex: 'shader/compute-center.vertex.glsl',
    raytrace_fragment: 'shader/raytrace.fragment.glsl'
};

const texture_source = {
    crate_color: '../../resources/crate/crate-color.jpg',
    crate_normal: '../../resources/crate/crate-normal.jpg'
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
    for (const name in texture_source) {
        const path = texture_source[name];
        const url = new URL(path, script_url);
        const image = new Image();
        image.src = url;
        jobs.push(image.decode().then(async () => {
            texture_source[name] = image;
        }));
    }
    await Promise.all(jobs);
}

export default class RaytraceScene extends FirstPersonScene {
    static objectTypes = objectTypes;
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onCreate(gl, context) {
        super.onCreate(gl, context);

        // Everything is handled by the fragment shader, no additional processing required.
        gl.disable(gl.BLEND);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.DITHER);
        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
        gl.disable(gl.SAMPLE_COVERAGE);
        gl.disable(gl.SCISSOR_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.clearDepth(-1);
        gl.hint(gl.GENERATE_MIPMAP_HINT, gl.NICEST);

        {
            const compute_vertex_data = Float32Array.from([
                -1, +1,
                -1, -1,
                +1, -1,
                +1, +1
            ]);
            const compute_index_data = Int8Array.from([
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

            context.crate_color_texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, context.crate_color_texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 10);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGB,
                texture_source.crate_color.naturalWidth,
                texture_source.crate_color.naturalHeight,
                0,
                gl.RGB,
                gl.UNSIGNED_BYTE,
                texture_source.crate_color
            );
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

            context.crate_normal_texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, context.crate_normal_texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 10);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGB,
                texture_source.crate_normal.naturalWidth,
                texture_source.crate_normal.naturalHeight,
                0,
                gl.RGB,
                gl.UNSIGNED_BYTE,
                texture_source.crate_normal
            );
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        context.raytrace_program = createProgram(gl, shader_source.compute_center_vertex, shader_source.raytrace_fragment);
        this.model_transform = Matrix4x4.scale(0.3, 0.8, 1).rotation(radians_from(-60), [-0.4, 1, 0]).translation(0, 5, 0);
        // this.model_transform = Matrix4x4.translation(0, 5, 0);
        this.inverse_model_transform = inverse(this.model_transform);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onPaint(gl, context) {
        super.onPaint(gl, context);

        {
            const program = context.raytrace_program;
            gl.useProgram(program);
            program.uniform.perspective_origin.setValue(...this.camera.state.origin);
            program.uniform.perspective_center.setValue(...this.camera.screen.origin);
            program.uniform.perspective_right.setValue(...this.camera.screen.right);
            program.uniform.perspective_up.setValue(...this.camera.screen.up);
            program.uniform.model_transform?.setArray?.(this.model_transform.columns.array);
            program.uniform.inverse_model_transform?.setArray?.(this.inverse_model_transform.columns.array);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, context.crate_color_texture);
            program.uniform.color_texture?.setValue?.(0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, context.crate_normal_texture);
            program.uniform.normal_texture?.setValue?.(1);

            gl.bindVertexArray(context.compute_vertex_array);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
            gl.bindVertexArray(null);
            gl.useProgram(null);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }
}
