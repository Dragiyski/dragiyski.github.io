import { float32 } from '../../lib/float.js';
import createProgram from '../../lib/gl-program.js';
import { assert, assertVectorLength } from '../../lib/math-assert.js';
import { dot_vector_vector, get_prev_power_2, length_vector, mul_number_vector } from '../../lib/math.js';
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
    earth_color_1024: 'texture/earth-color-1024.jpg'
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

/**
 * @param {WebGL2RenderingContext} gl
 * @param {Array} length
 */
function getArrayTextureSize(gl, length) {
    if (length % 4 !== 0) {
        throw new TypeError('Array represented as texture must have size divisible by 4.');
    }
    const maxWidth = get_prev_power_2(gl.getParameter(gl.MAX_TEXTURE_SIZE));
    const pixels = Math.floor(length / 4);
    if (pixels < maxWidth) {
        return [pixels, 1];
    }
    const height = Math.ceil(pixels / maxWidth);
    return [maxWidth, height];
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLTexture} gl
 * @param {number} length
 * @param {number} format
 */
function initArrayTexture(gl, texture, length, format = gl.RGBA32F) {
    if (format !== gl.RGBA32F && format !== gl.RGBA32I) {
        throw new TypeError('format: must be either gl.RGBA32F or gl.RGBA32I');
    }
    if (texture == null) {
        texture = gl.createTexture();
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    texture.width = 0;
    texture.height = 0;
    const [width, height] = getArrayTextureSize(gl, length);
    texture.width = width;
    texture.height = height;
    texture.format = format;
    if (width * height > 0) {
        gl.texStorage2D(gl.TEXTURE_2D, 1, format, width, height);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLTexture} texture
 * @param {Array} data
 * @param {*} offset
 */
function copyTextureData(gl, texture, data, offset = 0) {
    offset = offset | 0;
    if (!ArrayBuffer.isView(data) && !Array.isArray(data)) {
        throw new Error('data: must be Array or ArrayBufferView');
    }
    if (offset < 0) {
        throw new RangeError(`offset: must be between 0 and ${data.length}`);
    }
    if (!(texture instanceof WebGLTexture)) {
        throw new TypeError('texture: must be a texture');
    }
    if (data.length % 4 !== 0) {
        throw new TypeError('offset and length: must be divisible by 4');
    }
    let length = Math.floor(data.length / 4);
    const width = texture.width;
    const ops = [];
    let s = 0;
    if (offset % width > 0) {
        const o = Object.create(null);
        o.x = offset % width;
        o.y = Math.floor(offset / width);
        o.w = width - ops[0].x;
        o.h = 1;
        o.s = s;
        o.l = o.w * 4;
        ops.push(o);
        length -= o.w;
        offset += o.w;
        s += o.l;
    }
    const height = Math.floor(length / width);
    if (height > 0) {
        const o = Object.create(null);
        o.h = height;
        o.w = width;
        o.x = 0;
        o.y = Math.floor(offset / width);
        o.s = s;
        o.l = o.w * o.h * 4;
        ops.push(o);
        length -= o.w * o.h;
        offset += o.w * o.h;
        s += o.l;
    }
    if (length > 0) {
        const o = Object.create(null);
        o.x = 0;
        o.h = 1;
        o.w = length;
        o.y = Math.floor(offset / width);
        o.s = s;
        o.l = length * 4;
    }
    let type, format;
    let view;
    if (texture.format === gl.RGBA32F) {
        type = gl.FLOAT;
        format = gl.RGBA;
        view = Float32Array;
    } else if (texture.format === gl.RGBA32I) {
        type = gl.INT;
        format = gl.RGBA_INTEGER;
        view = Int32Array;
    } else {
        throw new TypeError(`Invalid or missing texture.format`);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    for (const op of ops) {
        const slice = view.from(data.slice(op.s, op.l));
        gl.texSubImage2D(gl.TEXTURE_2D, 0, op.x, op.y, op.w, op.h, format, type, slice);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
}

export default class RaytraceScene extends FirstPersonScene {
    static objectTypes = objectTypes;

    constructor({
        ...options
    }) {
        super({ ...options });
        this.instruction = {
            float: [],
            int: [],
            object: [],
            tree: []
        };
        Object.setPrototypeOf(this.instruction, null);
        for (let i = 0; i < 100; ++i) {
            const d = [0, 0, 0].map(() => Math.random() * 2 - 1);
            const h = 20 + Math.random() * (100 - 20);
            const r = 1 + Math.random() * (10 - 1);
            const o = mul_number_vector(h, d);
            const c = [Math.random(), Math.random(), Math.random()];
            const fi = this.instruction.float.length;
            this.instruction.float.push(...o, r, ...c, 1, 0, 1, 0, 0);
            this.instruction.object.push(1, 1, fi, 0);
        }
        this.instruction.object.push(0, 0, 0, 0);
        this.object_start = 0;
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
        }

        for (const name in this.instruction) {
            let type;
            if (name === 'float') {
                type = gl.RGBA32F;
            } else {
                type = gl.RGBA32I;
            }
            const texture = context[`instruction_${name}`] = initArrayTexture(gl, null, this.instruction[name].length, type);
            copyTextureData(gl, texture, this.instruction[name], 0);
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
        program.uniform.perspective_origin.setArray(this.camera.state.origin);
        program.uniform.perspective_center.setArray(this.camera.screen.origin);
        program.uniform.perspective_right.setArray(this.camera.screen.right);
        program.uniform.perspective_up.setArray(this.camera.screen.up);
        program.uniform.start_instruction_object?.setValue?.(this.object_start);
        program.uniform.start_instruction_light?.setValue?.(this.light_start);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, context.instruction_object);
        program.uniform.instruction_object?.setValue?.(0);
        program.uniform.size_instruction_object?.setValue?.(context.instruction_object.width, context.instruction_object.height);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, context.instruction_float);
        program.uniform.instruction_float?.setValue?.(1);
        program.uniform.size_instruction_float?.setValue?.(context.instruction_float.width, context.instruction_float.height);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, context.instruction_int);
        program.uniform.instruction_int?.setValue?.(2);
        program.uniform.size_instruction_int?.setValue?.(context.instruction_int.width, context.instruction_int.height);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, context.instruction_tree);
        program.uniform.instruction_tree?.setValue?.(3);
        program.uniform.size_instruction_tree?.setValue?.(context.instruction_tree.width, context.instruction_tree.height);

        gl.bindVertexArray(context.compute_vertex_array);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);
        gl.useProgram(null);
    }
}
