import { initializeGL, paintGL, resizeGL, uninitializeGL } from "./mainview.js";

(function () {
    'use strict';
    async function main() {
        const canvas = document.getElementById('opengl-widget');
        const context = canvas.getContext('webgl2');
        if (context == null) {
            throw new Error('WebGL2RenderingContext is not supported!');
        }
        isLoaded = true;
        await initializeGL(context, canvas);
        requestAnimationFrame(animationFrame);
    }

    function animationFrame() {
        if (!isLoaded) {
            return;
        }
        try {
            frame();
        } catch (error) {
            console.error(error);
            return;
        }
        requestAnimationFrame(animationFrame);
    }

    function frame() {
        const canvas = document.getElementById('opengl-widget');
        const context = canvas.getContext('webgl2');
        if (canvas.clientWidth !== canvas.width || canvas.clientHeight !== canvas.height) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            resizeGL(context, canvas);
        }
        paintGL(context, canvas);
    }

    let isLoaded = false;

    window.addEventListener('load', onFirstLoadedEvent);
    document.addEventListener('readystatechange', onDocumentStateChangeEvent);
    window.addEventListener('beforeunload', onFirstUnloadEvent);
    window.addEventListener('pagehide', onFirstUnloadEvent);

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
        const canvas = document.getElementById('opengl-widget');
        const context = canvas.getContext('webgl2');
        uninitializeGL(context, canvas);
    }
})();
