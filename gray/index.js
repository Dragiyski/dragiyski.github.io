import './lib/gl-screen.js';
import { Scene } from './scene/0001-colored-triangle/main.js';

let isLoaded = false;
const scene = new Scene();

async function main() {
    await scene.loadResources();
    const canvas = document.getElementById('screen');
    canvas.scene = scene;
}

if (document.readyState !== 'complete') {
    window.addEventListener('load', onFirstLoadedEvent);
    document.addEventListener('readystatechange', onDocumentStateChangeEvent);
    window.addEventListener('beforeunload', onFirstUnloadEvent);
    window.addEventListener('pagehide', onFirstUnloadEvent);
} else {
    isLoaded = true;
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
        unloadOpenGL();
    });
}

function onFirstUnloadEvent() {
    window.removeEventListener('beforeunload', onFirstUnloadEvent);
    window.removeEventListener('pagehide', onFirstUnloadEvent);
    unloadOpenGL();
}

function unloadOpenGL() {
    isLoaded = false;
    const canvas = document.getElementById('screen');
    canvas.release(scene);
}
