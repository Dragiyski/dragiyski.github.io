import { float32 } from '../../float.js';
import { assert } from '../../math-assert.js';
import { add_vector_vector, cross_vector_vector, div_vector_number, dot_vector_vector, length_vector, mat4_rotation_x, mat4_rotation_z, mul_matrix_matrix, mul_matrix_vector, mul_number_vector, neg_vector, normalize_vector, sub_vector_vector } from '../../math.js';
import WebGLScene from '../../webgl-scene.js';

const events = {
    pointerLockChange: Symbol('pointerLockChange'),
    controlMouseMove: Symbol('controlMouseMove'),
    controlKeyboardMove: Symbol('controlKeyboardMove')
};

export default class FirstPersonScene extends WebGLScene {
    constructor({
        camera: {
            options: {
                moveSpeed = 1,
                mouseSpeedX = 0.5,
                mouseSpeedY = 0.5,
                worldUp = [0, 0, 1],
                worldDepth = [0, 1, 0],
                fieldOfView = 60
            } = {},
            state: {
                origin = [0, 0, 0],
                forward = [0, 1, 0],
                up = [0, 0, 1],
                right = [1, 0, 0],
                yaw = 0,
                pitch = 0
            } = {}
        } = {},
        ...options
    } = {}) {
        assert(float32.isEqual(dot_vector_vector(forward, up), 0));
        assert(float32.isEqual(dot_vector_vector(forward, right), 0));
        assert(float32.isEqual(dot_vector_vector(up, right), 0));
        assert(float32.isEqual(dot_vector_vector(worldUp, worldDepth), 0));
        super({ ...options });
        this.camera = {
            options: {
                moveSpeed,
                mouseSpeedX,
                mouseSpeedY,
                worldUp,
                worldDepth,
                fieldOfView,
                defaultForward: forward
            },
            state: {
                origin,
                forward,
                up,
                right,
                timestamp: null,
                moveVelocity: [0, 0, 0],
                yaw,
                pitch
            },
            screen: {}
        };
    }

    #pointerLockChange(gl, context) {
        if (document.pointerLockElement === gl.screen) {
            this.#resume(gl, context);
        } else {
            this.#pause(gl, context);
        }
    }

    #resume(gl, context) {
        gl.screen.addEventListener('control.mouse.move', context[events.controlMouseMove], { passive: true });
        gl.screen.addEventListener('control.keyboard.move', context[events.controlKeyboardMove], { passive: true });
        this.camera.timestamp = performance.now();
        gl.screen.passive = false;
    }

    #pause(gl, context, freeze = true) {
        gl.screen.removeEventListener('control.mouse.move', context[events.controlMouseMove]);
        gl.screen.removeEventListener('control.keyboard.move', context[events.controlKeyboardMove]);
        this.camera.timestamp = null;
        if (freeze) {
            gl.screen.passive = true;
        }
    }

    #controlMouseMove(gl, context, event) {
        this.camera.state.yaw = (Math.PI * 2 + this.camera.state.yaw + event.deltaYaw * this.camera.options.mouseSpeedX) % (Math.PI * 2);
        this.camera.state.pitch = Math.max(-Math.PI * 0.5, Math.min(Math.PI * 0.5, this.camera.state.pitch - event.deltaPitch * this.camera.options.mouseSpeedY));
        const camera_rotation_matrix = mul_matrix_matrix(mat4_rotation_z(-this.camera.state.yaw), mat4_rotation_x(this.camera.state.pitch));
        let camera_forward = mul_matrix_vector(camera_rotation_matrix, [...this.camera.options.defaultForward, 1]);
        camera_forward = normalize_vector(div_vector_number(camera_forward.slice(0, 3), camera_forward[3]));
        // TODO: If camera looks 100% up or down, camera_forward will be co-linear with worldUp;
        // TODO: Since we need a non-colinear vector we can use do worldDepth (be careful about the sign of the result)
        // TODO: In LHS system (checked by the initial camera values), result might be "left" and not "right".
        this.camera.state.right = normalize_vector(cross_vector_vector(camera_forward, this.camera.options.worldUp));
        this.camera.state.up = normalize_vector(neg_vector(cross_vector_vector(camera_forward, this.camera.state.right)));
        this.camera.state.forward = camera_forward;
    }

    #controlKeyboardMove(gl, context, event) {
        const keyboard_vector = sub_vector_vector(event.positive, event.negative);
        const kv_length = length_vector(keyboard_vector);
        if (float32.isEqual(kv_length, 0)) {
            this.camera.state.moveVelocity = [0, 0, 0];
            this.camera.state.timestamp = null;
        } else {
            // Same as normalize(), but the length is already known;
            this.camera.state.moveVelocity = div_vector_number(keyboard_vector, kv_length);
            this.camera.state.timestamp = performance.now();
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onCreate(gl, context) {
        super.onCreate(gl, context);

        if ((context.ext_color_buffer_float = gl.getExtension('EXT_color_buffer_float')) == null) {
            throw new Error('Missing required WebGL extension: EXT_color_buffer_float');
        }

        context[events.pointerLockChange] = this.#pointerLockChange.bind(this, gl, context);
        context[events.controlMouseMove] = this.#controlMouseMove.bind(this, gl, context);
        context[events.controlKeyboardMove] = this.#controlKeyboardMove.bind(this, gl, context);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onStart(gl, context) {
        const document = gl.screen.ownerDocument;
        document.addEventListener('pointerlockchange', context[events.pointerLockChange], { passive: true });

        if (document.pointerLockElement === gl.screen) {
            this.#resume(gl, context);
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onStop(gl, context) {
        const document = gl.screen.ownerDocument;
        document.removeEventListener('pointerlockchange', context.eventPointerLockChange);
        this.#pause(gl, context, false);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onResize(gl, context) {
        super.onResize(gl, context);
        context.width = gl.canvas.width;
        context.height = gl.canvas.height;
        context.aspectRatio = context.width / context.height;
    }

    onPaint(gl, context) {
        if (this.camera.state.timestamp != null) {
            const timestamp = performance.now();
            const time_delta = (timestamp - this.camera.state.timestamp) * 1e-3;
            this.camera.state.timestamp = timestamp;
            const move_offset = mul_number_vector(this.camera.options.moveSpeed * time_delta, this.camera.state.moveVelocity);
            let move_vector = [0, 0, 0];
            move_vector = add_vector_vector(move_vector, mul_number_vector(move_offset[0], this.camera.state.right));
            move_vector = add_vector_vector(move_vector, mul_number_vector(move_offset[1], this.camera.state.up));
            move_vector = add_vector_vector(move_vector, mul_number_vector(move_offset[2], this.camera.state.forward));
            this.camera.state.origin = add_vector_vector(this.camera.state.origin, move_vector);
        }
        const field_of_view = (this.camera.options.fieldOfView * 0.5) / 180 * Math.PI;
        const diagonal_size = Math.tan(field_of_view);
        const view_height = diagonal_size / Math.sqrt(1 + context.aspectRatio * context.aspectRatio);
        const view_width = context.aspectRatio * view_height;
        this.camera.screen.right = mul_number_vector(view_width, this.camera.state.right);
        this.camera.screen.up = mul_number_vector(view_height, this.camera.state.up);
        this.camera.screen.origin = add_vector_vector(this.camera.state.origin, this.camera.state.forward);
    }
}
