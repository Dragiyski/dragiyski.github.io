/* eslint-disable array-element-newline */
import OpenGLScene from '../../lib/gl-scene.js';
import createProgram from '../../lib/gl-program.js';
import { add_vector_vector, cross_vector_vector, mul_number_vector, neg_vector } from '../../lib/math.js';

const this_url = import.meta.url;

async function loadShader(url) {
    return (await fetch(new URL(url, this_url))).text();
}

export class Scene extends OpenGLScene {
    async loadResources() {
        // TODO: Load sources for the shaders here.
        const jobs = [
            loadShader('shaders/camera.vertex.glsl').then(source => (this.camera_shader_source = source))
        ];
        return Promise.all(jobs);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onCreate(gl, context) {
        super.onCreate(gl, context);

        this.view_buffer = gl.createBuffer();
        this.view_feedback = gl.createTransformFeedback();
        this.near_frame = 0.1;
        this.camera_position = [0, 0, 0];
        this.camera_direction = [0, 1, 0];
        this.world_up = [0, 0, 1];
        this.field_of_view = ((60 / 2) / 180) * Math.PI; // 60 degrees field-of-view

        this.camera_program = createProgram(gl, this.camera_shader_source, null, {
            beforeLink: program => {
                gl.transformFeedbackVaryings(program, ['ray_direction'], gl.INTERLEAVED_ATTRIBS);
            }
        });
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onResize(gl, context) {
        super.onResize(gl, context);

        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.view_buffer);
        gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, gl.canvas.width * gl.canvas.height * 3 * 4, gl.STATIC_READ);
        gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onPaint(gl, context) {
        // Here we perform raytracing:
        // Input: A buffer containing the camera view vectors for each pixel;
        // Uniform: A buffer containing primitive data in world coordinates in some form;
        // Output: Normal vector, distance, objectId/primitiveId, more?
        // Hint: Currently this is only possible if the primitive data is per object...
        // Recursion is not possible in the vertex shader...

        // Order of operations: vertex shader => vertex processing => transform feedback => ...
        // vertex processing deals with clipping, using the gl_Position vector received from the vertex shader.
        // So if each pixel is a vertex containing a view vector coordinates, the output can be trimmed using gl_Position
        // specifying negative z-coordinate for GL_POINTS, resulting in omitting those points from the transform feedback.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        // gl.drawArray(GL_POINTS, count) will invoke vertex shader `count` times, as long as gl.ARRAY_BUFFER contains at least `count`
        // elements. The buffer need to contain only 1 attrubite (for first iteration): the view vector
        // uniforms: the origin point, the screen definition
        // The transform output returns the result.

        // How to generate the view vector buffer?
        // Assign nothing as ARRAY_BUFFER (no data) and call gl.draw() with count equal to the number of pixels?
        // Instead transform feedback buffer will be filled in.
        // Since no attributes are assigned to the VertexAttribArray (VAO), no reading should occur from the ARRAY_BUFFER.
        const screen_center = add_vector_vector(this.camera_position, mul_number_vector(this.near_frame, this.camera_direction));
        // Camera direction is a normal vector to the screen plane.
        // world_up is not necessarily in the screen plane, but their cross product lies into the screen plane.
        const screen_right = cross_vector_vector(this.camera_direction, this.world_up);
        const screen_up = neg_vector(cross_vector_vector(this.camera_direction, screen_right));
        // Now we have the "right" and "up" directions, but not their size.
        // The diagonal size divided by near plane gives tan(diagonal-field-of-view)
        // That is diagonal size = tan(diagonal-field-of-view) * near_frame
        const diagonal_size = Math.tan(this.field_of_view) * this.near_frame;
        // width / height = aspect_ratio
        // width^2 + height^2 = diagonal_size^2
        // we substitute: width = aspect_ratio * height
        // (height * aspect_ratio) ^2 + height^2 = diagonal_size^2
        // height^2 * aspect_ratio^2 + height^2 = diagonal_size^2
        // (1 + aspect_ratio^2) * height^2 = diagonal_size^2
        // height^2 = diagonal_size^2 / (1 + aspect_ratio^2)
        // height = diagonal_size / sqrt(1 + aspect_ratio^2)
        const aspect_ratio = gl.canvas.width / gl.canvas.height;
        const world_screen_height = diagonal_size / Math.sqrt(1 + aspect_ratio * aspect_ratio);
        const world_screen_width = aspect_ratio * world_screen_height;
        const screen_height_vector = mul_number_vector(world_screen_height, screen_up);
        const screen_width_vector = mul_number_vector(world_screen_width, screen_right);
        // Let have 1920x1080 screen
        // The center at 960x540 will have coordinates (0, 0)
        // Position 100x100 on the top left on the screen will have bottom-left coordinates: (100, 1079-100) = (100, 979)
        // The coordinates from the center will be (100-960, 979-540) = (-860, 439)
        // Screen partial coordinates will be (-860 / 960, 439 / 540) = (-0.895833(3)..., 0.81296(296)...)
        // screen_position = screen_center + (-0.895833(3)... * screen_width_vector, 0.81296(296)... * screen_height_vector) = vec3
        // view_vector = screen_position - camera_position

        gl.enable(gl.RASTERIZER_DISCARD);

        gl.useProgram(this.camera_program);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.view_feedback);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.view_buffer);
        this.camera_program.uniform.screen_size?.setValue?.(gl.canvas.width, gl.canvas.height);
        this.camera_program.uniform.world_screen_center?.setArray?.(screen_center);
        this.camera_program.uniform.world_screen_right?.setArray?.(screen_width_vector);
        this.camera_program.uniform.world_screen_up?.setArray?.(screen_height_vector);
        this.camera_program.uniform.camera_position?.setArray?.(this.camera_position);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, gl.canvas.width * gl.canvas.height);
        gl.endTransformFeedback();

        gl.finish();

        const data = new Float32Array(new ArrayBuffer(gl.canvas.width * gl.canvas.height * 3 * 4));
        gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, data);
        debugger;
    }
}
