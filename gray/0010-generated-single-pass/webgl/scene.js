import createProgram from '../../lib/gl-program.js';
import { assert, assertVectorLength } from '../../lib/math-assert.js';
import { add_vector_vector } from '../../lib/math.js';
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

export default class RaytraceScene extends FirstPersonScene {
    #data = {
        float: [],
        uint: [],
        object: [],
        children: []
    };

    static objectTypes = objectTypes;

    constructor({
        objects = [],
        ...options
    }) {
        super({ ...options });
        objectData[objectTypes.NULL](this.#data, { ...options.null });
        for (const object of objects) {
            if (!(object.type in objectData)) {
                throw new Error('Unknown object type');
            }
            if (object.type === objectTypes.NULL) {
                throw new Error('Only one NULL object allowed, options specified must be in the "null" option');
            }
            objectData[object.type](this.#data, object);
        }
    }

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
        gl.hint(gl.GENERATE_MIPMAP_HINT, gl.NICEST);

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
        }

        const single_layer_textures = [];
        single_layer_textures.push(context.object_float_data = gl.createTexture());
        single_layer_textures.push(context.object_uint_data = gl.createTexture());
        single_layer_textures.push(context.object_index_data = gl.createTexture());
        single_layer_textures.push(context.object_children_data = gl.createTexture());

        for (const texture of single_layer_textures) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        if (this.#data.object.length > 0) {
            const data = Int32Array.from(this.#data.object);
            gl.bindTexture(gl.TEXTURE_2D, context.object_index_data);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32I, data.length / 4, 1, 0, gl.RGBA_INTEGER, gl.INT, data);
        }
        if (this.#data.float.length > 0) {
            const data = Float32Array.from(this.#data.float);
            gl.bindTexture(gl.TEXTURE_2D, context.object_float_data);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, data.length / 4, 1, 0, gl.RGBA, gl.FLOAT, data);
        }
        if (this.#data.uint.length > 0) {
            const data = Int32Array.from(this.#data.uint);
            gl.bindTexture(gl.TEXTURE_2D, context.object_uint_data);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32I, data.length / 4, 1, 0, gl.RGBA_INTEGER, gl.INT, data);
        }
        if (this.#data.children.length > 0) {
            const data = Int32Array.from(this.#data.children);
            gl.bindTexture(gl.TEXTURE_2D, context.object_children_data);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32I, data.length / 4, 1, 0, gl.RGBA_INTEGER, gl.INT, data);
        }

        context.raytrace_program = createProgram(gl, shader_source.compute_center_vertex, shader_source.raytrace_fragment);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onPaint(gl, context) {
        super.onPaint(gl, context);

        const program = context.raytrace_program;
        gl.useProgram(program);
        program.uniform.camera_origin.setArray(this.camera.state.origin);
        program.uniform.screen_origin.setArray(this.camera.screen.origin);
        program.uniform.screen_right.setArray(this.camera.screen.right);
        program.uniform.screen_up.setArray(this.camera.screen.up);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, context.object_index_data);
        program.uniform.data_object?.setValue?.(0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, context.object_float_data);
        program.uniform.data_float?.setValue?.(1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, context.object_uint_data);
        program.uniform.data_uint?.setValue?.(2);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, context.object_children_data);
        program.uniform.data_children?.setValue?.(3);

        // TODO: Bind at least the 4 data textures here;
        gl.bindVertexArray(context.compute_vertex_array);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
        gl.useProgram(null);
    }
}

const objectData = {
    [objectTypes.NULL]: function objectNull(data, { color = [0, 0, 0] }) {
        assertVectorLength(color, 3);
        data.float.push(...color, 1);
        data.object.push(objectTypes.NULL, 0, 0, 0);
    },
    [objectTypes.DRAWABLE_SPHERE]: function objectDrawableSphere(data, {
        position,
        radius,
        color
    }) {
        assertVectorLength(position, 3);
        assert(isFinite(radius) && radius > 0);
        assertVectorLength(color, 3);
        const floatBaseIndex = data.float.length / 4;
        // const uintBaseIndex = data.uint.length;
        // const objectId = data.object.length;
        data.float.push(...position, radius);
        data.float.push(...color, 1);
        data.object.push(objectTypes.DRAWABLE_SPHERE, 0, floatBaseIndex, 0);
    }
};
Object.setPrototypeOf(objectData, null);
