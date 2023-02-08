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
}

/**
 * @param {KeyboardEvent} event
 */
function onKeyDown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
    }
    const screen = document.getElementById('screen');
    if (event.key === 'ArrowRight') {
        event.preventDefault();
        screen.scene.view_yaw = (screen.scene.view_yaw + 1) % 360;
        screen.update();
        return;
    }
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        screen.scene.view_yaw = (360 + screen.scene.view_yaw - 1) % 360;
        screen.update();
        return;
    }
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        screen.scene.view_pitch = Math.max(-90, Math.min(90, screen.scene.view_pitch + 1));
        screen.update();
        return;
    }
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        screen.scene.view_pitch = Math.max(-90, Math.min(90, screen.scene.view_pitch - 1));
        screen.update();
        return;
    }
    if (event.key === 'i') {
        event.preventDefault();
        screen.scene.field_of_view = Math.max(1, Math.min(179, screen.scene.field_of_view - 1));
        screen.update();
        return;
    }
    if (event.key === 'o') {
        event.preventDefault();
        screen.scene.field_of_view = Math.max(1, Math.min(179, screen.scene.field_of_view + 1));
        screen.update();
        return;
    }
    if (event.key === 'p') {
        event.preventDefault();
        screen.passive = !screen.passive;
        return;
    }
    if (event.key === 'w') {
        event.preventDefault();
        const camera_triple = screen.scene.getCameraTriple();
        const camera_position = screen.scene.camera_position;
        screen.scene.camera_position = add_vector_vector(camera_position, mul_number_vector(0.1, camera_triple[2]));
        screen.update();
        return;
    }
    if (event.key === 's') {
        event.preventDefault();
        const camera_triple = screen.scene.getCameraTriple();
        const camera_position = screen.scene.camera_position;
        screen.scene.camera_position = add_vector_vector(camera_position, mul_number_vector(0.1, neg_vector(camera_triple[2])));
        screen.update();
        return;
    }

    if (event.key === 'd') {
        event.preventDefault();
        const camera_triple = screen.scene.getCameraTriple();
        const camera_position = screen.scene.camera_position;
        screen.scene.camera_position = add_vector_vector(camera_position, mul_number_vector(0.1, camera_triple[0]));
        screen.update();
        return;
    }
    if (event.key === 'a') {
        event.preventDefault();
        const camera_triple = screen.scene.getCameraTriple();
        const camera_position = screen.scene.camera_position;
        screen.scene.camera_position = add_vector_vector(camera_position, mul_number_vector(0.1, neg_vector(camera_triple[0])));
        screen.update();
        return;
    }
    console.log(event);
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
