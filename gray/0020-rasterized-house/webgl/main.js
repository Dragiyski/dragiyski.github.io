import '../../lib/math/formatter.js';
import '../../lib/webgl-screen.js';
import '../../lib/keyboard-mouse-control.js';
import RaytraceScene from './scene.js';
import '../../lib/gl-screen.js';
import { Vector3D, normalize, radians_from, sub } from '../../lib/math/index.js';

async function main() {
    window.addEventListener('performance.frametime', onFrameTimeMeasure);
    const scene = new RaytraceScene({
        camera: {
            options: {
                moveSpeed: 2,
                fieldOfView: 60,
                worldUp: new Vector3D(0, 1, 0),
                worldDepth: new Vector3D(0, 0, 1)
            }
        }
    });
    const screen = document.getElementById('screen');
    screen.scene = scene;
    screen.addEventListener('click', onScreenMouseClick);
}

function onScreenMouseClick(event) {
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
        return;
    }
    maybePromise.then(() => {
    }, error => {
        screen.canvas.requestPointerLock();
    });
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
    const screen = document.getElementById('screen');
    if (screen.scene != null) {
        screen.release(screen.scene);
    }
}

function onFrameTimeMeasure(event) {
    const frame_info = document.getElementById('frame-info');
    if (frame_info != null) {
        frame_info.textContent = `${event.milliseconds.toFixed(3)}ms`;
    }
}
