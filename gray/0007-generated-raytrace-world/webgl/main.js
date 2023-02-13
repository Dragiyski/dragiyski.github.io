import '../../lib/gl-screen.js';
import { add_vector_vector, div_vector_number, length_vector, mat4_rotation_x, mat4_rotation_z, mul_matrix_matrix, mul_matrix_vector, mul_number_vector, normalize_vector, sub_vector_vector } from '../../lib/math.js';
import Quad from './raytracer/quad.js';
import { Scene } from './raytracer/scene.js';

export let isLoaded = false;

const control_options = {
    mouse_speed_x: 0.75,
    mouse_speed_y: 0.75,
    move_speed: 12
};

const control_state = {
    yaw: 0.0,
    pitch: 0.0,
    forward: [0, 1, 0],
    move_speed: [0, 0, 0],
    keyboard_move_positive: [0, 0, 0],
    keyboard_move_negative: [0, 0, 0],
    timestamp: null
};

async function main() {
    isLoaded = true;
    const scene = new Scene({
        objects: [
            new Quad({
                origin: [-3, 50, -3],
                direction_x: [6, 0, 0],
                direction_y: [0, 0, 8]
            }),
            new Quad({
                origin: [-3, 50, -3],
                direction_x: [6, 0, 0],
                direction_y: [0, 5, 0]
            }),
            new Quad({
                origin: [-3, 50, -3],
                direction_x: [0, 5, 0],
                direction_y: [0, 0, 8]
            }),
            new Quad({
                origin: add_vector_vector([-3, 50, -3], [0, 5, 0]),
                direction_x: [6, 0, 0],
                direction_y: [0, 0, 8]
            }),
            new Quad({
                origin: add_vector_vector([-3, 50, -3], [0, 0, 8]),
                direction_x: [6, 0, 0],
                direction_y: [0, 5, 0]
            }),
            new Quad({
                origin: add_vector_vector([-3, 50, -3], [6, 0, 0]),
                direction_x: [0, 5, 0],
                direction_y: [0, 0, 8]
            }),
            new Quad({
                origin: [-35.0, 55.0, 0.0],
                direction_x: [10, 0, 0],
                direction_y: [0, 0, 10]
            })
        ],
        beforePaint
    });
    await scene.loadResources();
    const screen = document.getElementById('screen');
    screen.scene = scene;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    screen.canvas.addEventListener('click', onScreenClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onLockPointerChange);
    // document.getElementById('set-max-width-height').addEventListener('click', setMaxWidthHeight);
    // document.getElementById('update').addEventListener('click', manualUpdate);
    // document.getElementById('state').textContent = 'paused';
}

function beforePaint(scene) {
    const previous_timestamp = control_state.timestamp;
    control_state.timestamp = performance.now();
    if (previous_timestamp == null) {
        return;
    }
    const time_fator = (control_state.timestamp - previous_timestamp) * 1e-3;
    let control_velocity = sub_vector_vector(control_state.keyboard_move_positive, control_state.keyboard_move_negative);
    const control_speed = length_vector(control_velocity);
    if (control_speed < 0.001) {
        control_velocity = [0, 0, 0];
    } else {
        control_velocity = div_vector_number(control_velocity, control_speed);
    }
    const move_offset = mul_number_vector(time_fator * control_options.move_speed, control_velocity);
    let move_vector = [0, 0, 0];
    move_vector = add_vector_vector(move_vector, mul_number_vector(move_offset[0], scene.camera.right));
    move_vector = add_vector_vector(move_vector, mul_number_vector(move_offset[1], scene.camera.up));
    move_vector = add_vector_vector(move_vector, mul_number_vector(move_offset[2], scene.camera.forward));
    scene.camera.origin = add_vector_vector(scene.camera.origin, move_vector);
}

function onScreenClick(event) {
    if (event.button !== 0) {
        return;
    }
    const screen = document.getElementById('screen');
    if (document.pointerLockElement === screen) {
        return;
    }
    if (document.pointerLockElement != null) {
        return;
    }
    event.preventDefault();
    const maybePromise = screen.canvas.requestPointerLock({
        unadjustedMovement: true
    });
    if (!maybePromise) {
        console.error('Unable to request pointer lock with unadjustedMovement option');
        document.exitPointerLock();
    }
    maybePromise.then(() => {
    }, error => {
        screen.canvas.requestPointerLock();
    });
}

function onLockPointerChange(event) {
    const screen = document.getElementById('screen');
    if (document.pointerLockElement === screen) {
        screen.passive = false;
        // console.log('[pointer-lock]: on');
    } else {
        screen.passive = true;
        // console.log('[pointer-lock]: off');
    }
}

function onMouseMove(event) {
    const screen = document.getElementById('screen');
    if (document.pointerLockElement !== screen) {
        return;
    }
    const canvas = screen.canvas;
    const scene = screen.scene;
    if (scene == null) {
        return;
    }
    const diagonal = Math.sqrt(canvas.clientWidth * canvas.clientWidth + canvas.clientHeight * canvas.clientHeight);
    const yawChange = (event.movementX / diagonal) * control_options.mouse_speed_x * Math.PI * 2;
    const pitchChange = (event.movementY / diagonal) * control_options.mouse_speed_y * Math.PI * 2;
    control_state.yaw = (Math.PI * 2 + control_state.yaw + yawChange) % (Math.PI * 2);
    control_state.pitch = Math.max(-Math.PI * 0.5, Math.min(Math.PI * 0.5, control_state.pitch - pitchChange));
    const camera_rotation_matrix = mul_matrix_matrix(mat4_rotation_z(-control_state.yaw), mat4_rotation_x(control_state.pitch));
    scene.camera.direction = normalize_vector(mul_matrix_vector(camera_rotation_matrix, [...control_state.forward, 1]).slice(0, 3));
    // console.log([control_state.yaw, control_state.pitch]);
}

/**
 * @param {KeyboardEvent} event
 */
function onKeyDown(event) {
    if (event.isComposing || event.keyCode === 229) {
        return;
    }
    const screen = document.getElementById('screen');
    if (event.key === 'Escape') {
        if (document.pointerLockElement === screen) {
            event.preventDefault();
            document.exitPointerLock();
            // console.log('[pointer-lock]: off');
        }
    } else if (event.key === 'w') {
        event.preventDefault();
        control_state.keyboard_move_positive[2] = 1;
    } else if (event.key === 's') {
        event.preventDefault();
        control_state.keyboard_move_negative[2] = 1;
    } else if (event.key === 'a') {
        event.preventDefault();
        control_state.keyboard_move_negative[0] = 1;
    } else if (event.key === 'd') {
        event.preventDefault();
        control_state.keyboard_move_positive[0] = 1;
    } else if (event.key === 'e') {
        event.preventDefault();
        control_state.keyboard_move_negative[1] = 1;
    } else if (event.key === 'q') {
        event.preventDefault();
        control_state.keyboard_move_positive[1] = 1;
    }
}

/**
 * @param {KeyboardEvent} event
 */
function onKeyUp(event) {
    if (event.isComposing || event.keyCode === 229) {
        return;
    }
    if (event.key === 'w') {
        event.preventDefault();
        control_state.keyboard_move_positive[2] = 0;
    } else if (event.key === 's') {
        event.preventDefault();
        control_state.keyboard_move_negative[2] = 0;
    } else if (event.key === 'a') {
        event.preventDefault();
        control_state.keyboard_move_negative[0] = 0;
    } else if (event.key === 'd') {
        event.preventDefault();
        control_state.keyboard_move_positive[0] = 0;
    } else if (event.key === 'e') {
        event.preventDefault();
        control_state.keyboard_move_negative[1] = 0;
    } else if (event.key === 'q') {
        event.preventDefault();
        control_state.keyboard_move_positive[1] = 0;
    }
}

if (document.readyState !== 'complete') {
    window.addEventListener('load', onFirstLoadedEvent);
    document.addEventListener('readystatechange', onDocumentStateChangeEvent);
    window.addEventListener('beforeunload', onFirstUnloadEvent);
    window.addEventListener('pagehide', onFirstUnloadEvent);
} else {
    main();
}

function onDocumentStateChangeEvent() {
    if (document.readyState === 'complete') {
        onFirstLoadedEvent();
    }
}

function onFirstLoadedEvent() {
    window.removeEventListener('load', onFirstLoadedEvent);
    document.removeEventListener('readystatechange', onDocumentStateChangeEvent);
    main().catch(error => {
        console.error(error);
        unload();
    });
}

function onFirstUnloadEvent() {
    window.removeEventListener('beforeunload', onFirstUnloadEvent);
    window.removeEventListener('pagehide', onFirstUnloadEvent);
    unload();
}

function unload() {
    isLoaded = false;
    const screen = document.getElementById('screen');
    if (screen.scene != null) {
        screen.release(screen.scene);
    }
}
