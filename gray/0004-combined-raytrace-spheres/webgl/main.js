import '../../lib/gl-screen.js';
import { add_vector_vector, mul_number_vector, neg_vector } from '../../lib/math.js';
import { Scene } from './scene.js';

export let isLoaded = false;

async function main() {
    isLoaded = true;
    const scene = new Scene();
    await scene.loadResources();
    const screen = document.getElementById('screen');
    screen.scene = scene;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('click', onWindowClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onLockPointerChange);
}

function onWindowClick(event) {
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
        console.log('[pointer-lock]: on');
    } else {
        screen.passive = true;
        if (screen.scene?.camera != null) {
            screen.scene.camera.timestamp = null;
        }
        console.log('[pointer-lock]: off');
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
    const diagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
    const yawChange = (event.movementX / diagonal) * scene.controls.mouse_speed_x * Math.PI * 2;
    const pitchChange = (event.movementY / diagonal) * scene.controls.mouse_speed_y * Math.PI * 2;
    scene.camera.yaw = (Math.PI * 2 + scene.camera.yaw + yawChange) % (Math.PI * 2);
    scene.camera.pitch = Math.max(-Math.PI * 0.5, Math.min(Math.PI * 0.5, scene.camera.pitch - pitchChange));
    console.log([scene.camera.yaw, scene.camera.pitch]);
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
            console.log('[pointer-lock]: off');
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
