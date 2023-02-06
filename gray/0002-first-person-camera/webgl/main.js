import '../../lib/gl-screen.js';
import { Scene } from './scene.js';

export let isLoaded = false;
const scene = new Scene();

async function main() {
    isLoaded = true;
    await scene.loadResources();
    const canvas = document.getElementById('screen');
    canvas.scene = scene;
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
        scene.view_yaw = (scene.view_yaw + 1) % 360;
        screen.update();
        return;
    }
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scene.view_yaw = (360 + scene.view_yaw - 1) % 360;
        screen.update();
        return;
    }
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        scene.view_pitch = Math.max(-90, Math.min(90, scene.view_pitch + 1));
        screen.update();
        return;
    }
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        scene.view_pitch = Math.max(-90, Math.min(90, scene.view_pitch - 1));
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
    const canvas = document.getElementById('screen');
    canvas.release(scene);
}
