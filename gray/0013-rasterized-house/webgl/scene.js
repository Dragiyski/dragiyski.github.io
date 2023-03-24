/* eslint-disable function-call-argument-newline */
import createProgram from '../../lib/gl-program.js';
import { Matrix3x3, Matrix4x4, Vector2D, Vector3D, Vector4D, add, cos, cross, div, dot, hg_collapse, hg_expand, inverse, length, limits, mul, neg, normalize, radians_from, sin, sub, transpose } from '../../lib/math/index.js';
import { loadTextFile } from '../../lib/utils.js';
import FirstPersonScene from '../../lib/webgl/first-person/scene.js';

const objectTypes = {
    NULL: 0,
    DRAWABLE_SPHERE: 1
};
Object.setPrototypeOf(objectTypes, null);

const script_url = import.meta.url;

const shader_source = {
    vertex: 'shader/vertex.glsl',
    fragment: 'shader/fragment.glsl'
};

const resources = {
    cottage_vertex_data: new URL('../../resources/cottage/vertex-buffer.bin', document.baseURI),
    cottage_index_data: new URL('../../resources/cottage/index-buffer.bin', document.baseURI)
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
    for (const name in resources) {
        const url = resources[name];
        jobs.push((async (name, url) => {
            const response = await fetch(url);
            const blob = await response.arrayBuffer();
            resources[name] = blob;
        })(name, url));
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

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(0);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);

        context.vertex_array = gl.createVertexArray();
        context.vertex_buffer = gl.createBuffer();
        context.index_buffer = gl.createBuffer();

        let vertices = [];
        let indices = [];

        for (let d = 0; d < 3; ++d) {
            for (let s = 0; s < 2; ++s) {
                const base_index = vertices.length;
                const nd = [0, 1, 2];
                nd.splice(d, 1);
                for (let g = 0; g < 4; ++g) {
                    const position = new Array(3);
                    position[d] = s ? 1 : -1;
                    position[nd[0]] = (g & (1 << 0)) ? 1 : -1;
                    position[nd[1]] = (g & (1 << 1)) ? 1 : -1;
                    const normal = [0, 0, 0];
                    normal[d] = s ? 1 : -1;
                    const texture = [position[nd[0]], position[nd[1]]];
                    vertices.push([...position, ...normal, ...texture]);
                }
                indices.push(
                    base_index + 0,
                    base_index + 1,
                    base_index + 2,
                    base_index + 3,
                    base_index + 2,
                    base_index + 1
                );
            }
        }

        vertices = Float32Array.from(vertices.flat());
        indices = Uint16Array.from(indices);

        gl.bindVertexArray(context.vertex_array);
        gl.bindBuffer(gl.ARRAY_BUFFER, context.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, resources.cottage_vertex_data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, resources.cottage_index_data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * 4, 0);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        // context.index_count = resources.cottage_index_data.byteLength / 2;
        context.index_count = resources.cottage_index_data.byteLength / 2;

        this.model_matrix = new Matrix4x4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 10,
            0, 0, 0, 1
        );

        context.mesh_program = createProgram(gl, shader_source.vertex, shader_source.fragment);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onResize(gl, context) {
        super.onResize(gl, context);
        const near = 0.1;
        const far = 1000;
        const clip = far - near;
        const fov = radians_from(this.camera.options.fieldOfView);
        const tan_fov = Math.tan(fov / 2);
        const p11 = 1 / tan_fov;
        const p22 = context.aspectRatio / tan_fov;
        const p33 = far / clip;
        const p34 = -(far * near) / clip;
        const p43 = 1;
        context.perspective_matrix = new Matrix4x4(
            p11, 0, 0, 0,
            0, p22, 0, 0,
            0, 0, p33, p34,
            0, 0, p43, 0
        );
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onPaint(gl, context) {
        super.onPaint(gl, context);

        const view_quaternions = new Vector4D();
        const dot_foward_default = dot(this.camera.options.defaultForward, this.camera.state.forward);
        if (limits.float32.isEqual(dot_foward_default, 1)) {
            view_quaternions.xyzw = [0, 0, 0, 1];
        } else {
            view_quaternions.xyz = cross(this.camera.options.defaultForward, this.camera.state.forward);
            view_quaternions.w = Math.sqrt(dot(this.camera.options.defaultForward, this.camera.options.defaultForward) * dot(this.camera.state.forward, this.camera.state.forward)) + dot_foward_default;
            view_quaternions.xyzw = normalize(view_quaternions);
        }
        const view_matrix = Matrix4x4.translation(this.camera.state.origin.x, neg(this.camera.state.origin.yz)).rotation(-this.camera.state.yaw, [0, 1, 0]).rotation(this.camera.state.pitch, [1, 0, 0]);
        const model_view_matrix = mul(view_matrix, this.model_matrix);
        const total_matrix = mul(context.perspective_matrix, model_view_matrix);
        let normal_matrix = Matrix3x3.from_columns(
            model_view_matrix.columns[0].xyz,
            model_view_matrix.columns[1].xyz,
            model_view_matrix.columns[2].xyz
        );
        normal_matrix = inverse(normal_matrix);
        if (normal_matrix == null) {
            normal_matrix = new Matrix3x3();
        } else {
            normal_matrix = transpose(normal_matrix);
        }
        const skylight = normalize(mul(normal_matrix, new Vector3D(-0.5, 2, -1)));

        {
            const program = context.mesh_program;
            gl.useProgram(program);
            const array_total_matrix = total_matrix.columns.map(c => [...c]).flat();
            program.uniform.transform_matrix?.setArray(array_total_matrix);
            const array_normal_matrix = normal_matrix.columns.map(c => [...c]).flat();
            program.uniform.normal_matrix?.setArray(array_normal_matrix);
            program.uniform.skylight?.setValue?.(...skylight);
            gl.bindVertexArray(context.vertex_array);
            gl.drawElements(gl.TRIANGLES, context.index_count, gl.UNSIGNED_SHORT, 0);
            gl.bindVertexArray(null);
            gl.useProgram(null);
        }
    }
}
