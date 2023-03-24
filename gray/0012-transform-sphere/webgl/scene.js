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
    raytrace_fragment: 'shader/raytrace.fragment.glsl',
    outline_vertex: 'shader/outline.vertex.glsl',
    outline_fragment: 'shader/outline.fragment.glsl'
};

const texture_source = {
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
        }
        {
            const box_index_data = this.box_index_data = Uint8Array.from([
                // Bottom
                0, 2, 6,
                6, 4, 0,
                // Front
                0, 4, 1,
                1, 4, 5,
                // Left
                0, 1, 3,
                3, 2, 0,
                // Top
                1, 5, 7,
                7, 3, 1,
                // ?
                6, 2, 3,
                6, 3, 7,
                // ?
                4, 6, 7,
                7, 5, 4
            ]);
            context.ouline_vertex_array = gl.createVertexArray();
            context.outline_index_buffer = gl.createBuffer();
            context.outline_vertex_buffer = gl.createBuffer();
            gl.bindVertexArray(context.ouline_vertex_array);
            gl.bindBuffer(gl.ARRAY_BUFFER, context.outline_vertex_buffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.outline_index_buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, box_index_data, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        context.raytrace_program = createProgram(gl, shader_source.compute_center_vertex, shader_source.raytrace_fragment);
        this.model_transform = Matrix4x4.scale(0.1, 0.8, 1.2).rotation(radians_from(-60), [0, 1, 0]).translation(0, 5, 0);
        // this.model_transform = Matrix4x4.translation(0, 5, 0);
        this.inverse_model_transform = inverse(this.model_transform);

        context.outline_program = createProgram(gl, shader_source.outline_vertex, shader_source.outline_fragment);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onPaint(gl, context) {
        super.onPaint(gl, context);

        const model_box = new Array(8);
        for (let i = 0; i < 8; ++i) {
            const p = [-1, -1, -1];
            for (let k = 0; k < 3; ++k) {
                if (i & (1 << k)) {
                    p[k] = 1;
                }
            }
            model_box[i] = new Vector4D(p, 1);
        }

        const box = model_box.map(point => hg_collapse(mul(this.model_transform, point)));

        const model_camera_origin = hg_collapse(mul(this.inverse_model_transform, hg_expand(this.camera.state.origin)));
        const model_screen_origin = hg_collapse(mul(this.inverse_model_transform, hg_expand(this.camera.screen.origin)));
        const model_screen_mid_right = hg_collapse(mul(this.inverse_model_transform, hg_expand(add(this.camera.screen.origin, this.camera.screen.right))));
        const model_screen_mid_up = hg_collapse(mul(this.inverse_model_transform, hg_expand(add(this.camera.screen.origin, this.camera.screen.up))));
        const model_camera_forward = normalize(sub(model_screen_origin, model_camera_origin));
        const model_sphere_vector = normalize(model_camera_origin);
        const model_sphere_right = normalize(sub(model_screen_mid_right, model_screen_origin));
        const model_sphere_up = normalize(sub(model_screen_mid_up, model_screen_origin));

        const sphere_center = hg_collapse(mul(this.model_transform, new Vector4D(0, 0, 0, 1)));
        const sphere_right = hg_collapse(mul(this.model_transform, hg_expand(model_sphere_right)));
        const sphere_up = hg_collapse(mul(this.model_transform, hg_expand(model_sphere_up)));
        const sphere_center_right = sub(sphere_right, sphere_center);
        const sphere_center_up = sub(sphere_up, sphere_center);

        const frustrum_mid_right = normalize(sub(add(this.camera.screen.origin, this.camera.screen.right), this.camera.state.origin));
        const frustrum_mid_up = normalize(sub(add(this.camera.screen.origin, this.camera.screen.up), this.camera.state.origin));
        const min_cos_angle_right = dot(frustrum_mid_right, this.camera.state.forward);
        const min_cos_angle_up = dot(frustrum_mid_up, this.camera.state.forward);

        const cos_angle_sphere_right = dot(normalize(sub(sphere_right, this.camera.state.origin)), this.camera.state.forward);
        const cos_angle_sphere_up = dot(normalize(sub(sphere_up, this.camera.state.origin)), this.camera.state.forward);
        const screen_corner = add(add(this.camera.screen.origin, this.camera.screen.right), this.camera.screen.up);
        const screen_camera_corner = sub(screen_corner, this.camera.state.origin);
        const min_screen_angle = dot(this.camera.state.forward, normalize(screen_camera_corner));

        console.log(min_screen_angle);

        // Problem: How would this behave in a single-pass raytracing with indexed buffer... This might be redundant.

        // Idea: DO NOT USE the box to render, instead do the following:
        // A box gives dimensions to work with, we can find the longest dimension in the world space.
        // Using that the idea is to find 4 points that wrap the oval on the screen in perspective-space coordinates,
        // but generate 8 points (with duplicates) for a quad surrounding the object in perspective-space limited to
        // [-1, 1] (i.e. do a manual clipping).
        // Hint 1: Points inside projected area must be ignored, this will allow finding the true corners.
        // Hint 2: Each point must be assigned 4-bit case: 2 bit for x and 2 bit for y, indicating: 00 = in-screen, 01 = above, 10 = below
        // For each triangle: find the clipping using the angle: (1 - angle) / (1 - min_angle)
        // angle = dot(normalize(view_x or view_y), forward), min_angle = dot(screen_right_point - camera_origin, forward), etc.
        // For view_y, the view vector must be projected onto the plane by the camera_right and same with view_x in reverse (i.e. camera_up).
        // If all vertices are outside of the screen, all vertices must be mapped to [NaN, NaN] (this won't generate a triangle).
        // If all vertices are inside, the clipping points are [NaN, NaN], and the triangle is obtained by simple projection.
        const mapped = box.map(point => {
            // We have to do manual clipping here
            // For each triangle, the clipping will generate for every 3 points, to max 6 points
            // There are 6 * 3 = 18 triangles, resulting of maximum 36 points.
            // This will still be faster than raytracing the entire sphere most of the time.
            const view = normalize(sub(new Vector3D(point), this.camera.state.origin));
            const depth = 1 / dot(this.camera.state.forward, view);
            // With depth < 0, the vector is behind the camera, so its projection is on the opposite site of the screen
            // Once we find the screen coordinates, we can reverse their sign and set at infinity.
            const hit_point = add(this.camera.state.origin, mul(depth, view));
            const hit_vector = sub(hit_point, this.camera.screen.origin);
            const hit_x = dot(this.camera.screen.right, hit_vector) / dot(this.camera.screen.right, this.camera.screen.right);
            const hit_y = dot(this.camera.screen.up, hit_vector) / dot(this.camera.screen.up, this.camera.screen.up);
            return [hit_x, hit_y];
        });
        console.log(mapped.map(angle => ((1 - angle) / (1 - min_screen_angle))));
        // console.log(mapped.map(([vx, vy]) => `[${vx}, ${vy}]`).join('; '));
        // TODO: Try to compute sphere quadratic equation with the known points sphere_right and sphere_center
        const j = 0;

        {
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            const program = context.outline_program;
            gl.useProgram(program);
            gl.bindVertexArray(context.ouline_vertex_array);
            gl.bindBuffer(gl.ARRAY_BUFFER, context.outline_vertex_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(mapped.flat()), gl.STATIC_DRAW);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        // Now the quad must be projected onto the screen plane...
        // This is not easy task:
        // When all points are in front of the screen, finding the coordinates is simple.
        // When all the ponts are behind the camera, we can exclude the entire quad.
        // When some of the points are in front and some behind - we have a problem.

        {
            const program = context.raytrace_program;
            gl.useProgram(program);
            program.uniform.perspective_origin.setValue(...this.camera.state.origin);
            program.uniform.perspective_center.setValue(...this.camera.screen.origin);
            program.uniform.perspective_right.setValue(...this.camera.screen.right);
            program.uniform.perspective_up.setValue(...this.camera.screen.up);
            program.uniform.model_transform?.setArray?.(this.model_transform.columns.array);
            program.uniform.inverse_model_transform?.setArray?.(this.inverse_model_transform.columns.array);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.blendEquation(gl.FUNC_ADD);

            gl.bindVertexArray(context.compute_vertex_array);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
            gl.bindVertexArray(null);
            gl.useProgram(null);
        }
    }
}
