import '../../lib/gl-screen.js';
import { mat4_rotation_x, mat4_rotation_z, mul_matrix_matrix, mul_matrix_vector, normalize_vector } from '../../lib/math.js';
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
    forward: [0, 1, 0]
};

async function main() {
    isLoaded = true;
    const scene = new Scene();
    await scene.loadResources();
    const screen = document.getElementById('screen');
    screen.scene = scene;
    // window.addEventListener('keydown', onKeyDown);
    // window.addEventListener('keyup', onKeyUp);
    screen.canvas.addEventListener('click', onScreenClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onLockPointerChange);
    // document.getElementById('set-max-width-height').addEventListener('click', setMaxWidthHeight);
    // document.getElementById('update').addEventListener('click', manualUpdate);
    // document.getElementById('state').textContent = 'paused';
}

function manualUpdate(event) {
    event.preventDefault();
    const screen = document.getElementById('screen');
    const max_width = document.getElementById('set-max-width').valueAsNumber;
    const max_height = document.getElementById('set-max-height').valueAsNumber;
    screen.scene.max_width = max_width;
    screen.scene.max_height = max_height;
    for (const element of document.querySelectorAll('[name="antialias"]')) {
        if (!element.checked) {
            continue;
        }
        const value = parseInt(element.value);
        if (!Number.isSafeInteger(value)) {
            continue;
        }
        screen.scene.antialias = value;
    }
    screen.forceResize();
    screen.update();
}

function setMaxWidthHeight(event) {
    event.preventDefault();
    const screen = document.getElementById('screen');
    const field_width = document.getElementById('set-max-width');
    const field_height = document.getElementById('set-max-height');
    field_width.value = screen.canvas.clientWidth;
    field_height.value = screen.canvas.clientHeight;
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
    scene.invalidate();
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
        if (screen.scene?.camera?.keyboard_move_positive != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_positive[2] = 1;
            screen.scene.updateCameraSpeed();
        }
    } else if (event.key === 's') {
        if (screen.scene?.camera?.keyboard_move_negative != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_negative[2] = 1;
            screen.scene.updateCameraSpeed();
        }
    } else if (event.key === 'a') {
        if (screen.scene?.camera?.keyboard_move_negative != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_negative[0] = 1;
            screen.scene.updateCameraSpeed();
        }
    } else if (event.key === 'd') {
        if (screen.scene?.camera?.keyboard_move_positive != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_positive[0] = 1;
            screen.scene.updateCameraSpeed();
        }
    } else if (event.key === 'e') {
        if (screen.scene?.camera?.keyboard_move_negative != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_negative[1] = 1;
            screen.scene.updateCameraSpeed();
        }
    } else if (event.key === 'q') {
        if (screen.scene?.camera?.keyboard_move_positive != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_positive[1] = 1;
            screen.scene.updateCameraSpeed();
        }
    }
}

/**
 * @param {KeyboardEvent} event
 */
function onKeyUp(event) {
    if (event.isComposing || event.keyCode === 229) {
        return;
    }
    const screen = document.getElementById('screen');
    if (event.key === 'w') {
        if (screen.scene?.camera?.keyboard_move_positive != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_positive[2] = 0;
            screen.scene.updateCameraSpeed();
        }
    } else if (event.key === 's') {
        if (screen.scene?.camera?.keyboard_move_negative != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_negative[2] = 0;
            screen.scene.updateCameraSpeed();
        }
    } else if (event.key === 'a') {
        if (screen.scene?.camera?.keyboard_move_negative != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_negative[0] = 0;
            screen.scene.updateCameraSpeed();
        }
    } else if (event.key === 'd') {
        if (screen.scene?.camera?.keyboard_move_positive != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_positive[0] = 0;
            screen.scene.updateCameraSpeed();
        }
    } else if (event.key === 'e') {
        if (screen.scene?.camera?.keyboard_move_negative != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_negative[1] = 0;
            screen.scene.updateCameraSpeed();
        }
    } else if (event.key === 'q') {
        if (screen.scene?.camera?.keyboard_move_positive != null && typeof screen.scene?.updateCameraSpeed === 'function') {
            event.preventDefault();
            screen.scene.camera.keyboard_move_positive[1] = 0;
            screen.scene.updateCameraSpeed();
        }
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
