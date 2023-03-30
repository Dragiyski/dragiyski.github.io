import { float32 } from '../../float.js';
import { Matrix3x3, Vector3D, cross, mul, neg, normalize, sub, length, div, add, Vector2D } from '../../math/index.js';
import WebGLScene from '../../webgl-scene.js';

const events = {
    pointerLockChange: Symbol('pointerLockChange'),
    controlMouseMove: Symbol('controlMouseMove'),
    controlKeyboardMove: Symbol('controlKeyboardMove'),
    joystickMove: Symbol('joystickMove'),
    joystickRotate: Symbol('joystickRotate')
};

export default class FirstPersonScene extends WebGLScene {
    constructor({
        camera: {
            options: {
                moveSpeed = 1,
                mouseSpeedX = 0.5,
                mouseSpeedY = 0.5,
                rotateSpeedX = 0.1,
                rotateSpeedY = 0.1,
                worldUp = new Vector3D(0, 0, 1),
                worldDepth = new Vector3D(0, 1, 0),
                fieldOfView = 60
            } = {},
            state: {
                origin = new Vector3D(0, 0, 0),
                forward = new Vector3D(0, 1, 0),
                up = new Vector3D(0, 0, 1),
                right = new Vector3D(1, 0, 0),
                yaw = 0,
                pitch = 0
            } = {}
        } = {},
        ...options
    } = {}) {
        super({ ...options });
        this.camera = {
            options: {
                moveSpeed,
                mouseSpeedX,
                mouseSpeedY,
                rotateSpeedX,
                rotateSpeedY,
                worldUp,
                worldDepth,
                fieldOfView,
                defaultForward: worldDepth
            },
            state: {
                origin,
                forward,
                up,
                right,
                timestamp: null,
                moveVelocity: new Vector3D(0, 0, 0),
                rotateVelocity: new Vector2D(0, 0),
                yaw,
                pitch
            },
            screen: {}
        };
        this.#computeView();
    }

    #pointerLockChange(gl, context) {
        if (document.pointerLockElement === gl.screen) {
            gl.screen.addEventListener('control.mouse.move', context[events.controlMouseMove], { passive: true });
            gl.screen.addEventListener('control.keyboard.move', context[events.controlKeyboardMove], { passive: true });
        } else {
            gl.screen.removeEventListener('control.mouse.move', context[events.controlMouseMove]);
            gl.screen.removeEventListener('control.keyboard.move', context[events.controlKeyboardMove]);
        }
    }

    #computeView() {
        const camera_rotation_matrix = mul(
            Matrix3x3.rotation(-this.camera.state.yaw, this.camera.options.worldUp),
            Matrix3x3.rotation(this.camera.state.pitch, [1, 0, 0])
        );
        let camera_forward = mul(camera_rotation_matrix, this.camera.options.defaultForward);
        camera_forward = normalize(camera_forward);
        // TODO: If camera looks 100% up or down, camera_forward will be co-linear with worldUp;
        // TODO: Since we need a non-colinear vector we can use do worldDepth (be careful about the sign of the result)
        // TODO: In LHS system (checked by the initial camera values), result might be "left" and not "right".
        this.camera.state.right = normalize(cross(camera_forward, this.camera.options.worldUp));
        this.camera.state.up = normalize(neg(cross(camera_forward, this.camera.state.right)));
        this.camera.state.forward = camera_forward;
    }

    #controlMouseMove(gl, context, event) {
        this.camera.state.yaw = (Math.PI * 2 + this.camera.state.yaw + event.deltaYaw * this.camera.options.mouseSpeedX) % (Math.PI * 2);
        this.camera.state.pitch = Math.max(-Math.PI * 0.5, Math.min(Math.PI * 0.5, this.camera.state.pitch - event.deltaPitch * this.camera.options.mouseSpeedY));
    }

    #controlKeyboardMove(gl, context, event) {
        const keyboard_vector = sub(new Vector3D(event.positive), new Vector3D(event.negative));
        const kv_length = length(keyboard_vector);
        if (float32.isEqual(kv_length, 0)) {
            this.camera.state.moveVelocity = new Vector3D(0, 0, 0);
        } else {
            // Same as normalize(), but the length is already known;
            this.camera.state.moveVelocity = div(keyboard_vector, kv_length);
        }
    }

    #joystickMove(gl, context, event) {
        let position = event.position;
        if (length(event.position) < 0.001) {
            position = new Vector2D(0, 0);
        }
        this.camera.state.moveVelocity.x = this.camera.options.moveSpeed * position.x;
        this.camera.state.moveVelocity.z = this.camera.options.moveSpeed * -position.y;
    }

    #joystickRotate(gl, context, event) {
        let position = event.position;
        if (length(event.position) < 0.001) {
            position = new Vector2D(0, 0);
        }
        this.camera.state.rotateVelocity.x = this.camera.options.rotateSpeedX * Math.PI * position.x;
        this.camera.state.rotateVelocity.y = this.camera.options.rotateSpeedY * Math.PI * position.y;
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
        context[events.joystickMove] = this.#joystickMove.bind(this, gl, context);
        context[events.joystickRotate] = this.#joystickRotate.bind(this, gl, context);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onStart(gl, context) {
        const document = gl.screen.ownerDocument;
        document.addEventListener('pointerlockchange', context[events.pointerLockChange], { passive: true });

        window.addEventListener('joystick-move', context[events.joystickMove]);
        window.addEventListener('joystick-rotate', context[events.joystickRotate]);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onStop(gl, context) {
        const document = gl.screen.ownerDocument;
        document.removeEventListener('pointerlockchange', context.eventPointerLockChange);

        window.removeEventListener('joystick-move', context[events.joystickMove]);
        window.removeEventListener('joystick-rotate', context[events.joystickRotate]);
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
            this.camera.state.yaw = (Math.PI * 2 + this.camera.state.yaw + time_delta * this.camera.state.rotateVelocity.x) % (Math.PI * 2);
            this.camera.state.pitch = Math.max(-Math.PI * 0.5, Math.min(Math.PI * 0.5, this.camera.state.pitch - time_delta * this.camera.state.rotateVelocity.y));
            this.#computeView();
            const move_offset = mul(this.camera.options.moveSpeed * time_delta, this.camera.state.moveVelocity);
            let move_vector = new Vector3D(0, 0, 0);
            move_vector = add(move_vector, mul(move_offset[0], this.camera.state.right));
            move_vector = add(move_vector, mul(move_offset[1], this.camera.state.up));
            move_vector = add(move_vector, mul(move_offset[2], this.camera.state.forward));
            this.camera.state.origin = add(this.camera.state.origin, move_vector);
        } else {
            this.camera.state.timestamp = performance.now();
        }
        const field_of_view = (this.camera.options.fieldOfView * 0.5) / 180 * Math.PI;
        const diagonal_size = Math.tan(field_of_view);
        const view_height = diagonal_size / Math.sqrt(1 + context.aspectRatio * context.aspectRatio);
        const view_width = context.aspectRatio * view_height;
        this.camera.screen.width = view_width;
        this.camera.screen.height = view_height;
        this.camera.screen.right = mul(view_width, this.camera.state.right);
        this.camera.screen.up = mul(view_height, this.camera.state.up);
        this.camera.screen.origin = add(this.camera.state.origin, this.camera.state.forward);
    }
}
