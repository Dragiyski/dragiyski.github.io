import { beginFrameTimeMeasure, createFrameTimeMeasure, destroyFrameTimeMeasure, endFrameTimeMeasure } from './webgl-frame-time.js';

export default class WebGLScene {
    #frameTimeMeasure;
    constructor({ frameTimeMeasure = true }) {
        this.#frameTimeMeasure = frameTimeMeasure;

        if (this.#frameTimeMeasure) {
            const onPaint = this.onPaint;
            Object.defineProperty(this, 'onPaint', {
                configurable: true,
                writable: true,
                value: this.#onPaint.bind(this, onPaint)
            });
        }
    }

    #onPaint(onPaint, gl, context) {
        try {
            beginFrameTimeMeasure(gl, context);
            return onPaint.call(this, gl, context);
        } finally {
            endFrameTimeMeasure(gl, context);
        }
    }

    /**
     * Invoked when the context is first attached to screen.
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     */
    onCreate(gl, storage) {
        if (this.#frameTimeMeasure) {
            createFrameTimeMeasure(gl, storage);
        }
    }

    /**
     * Invoked by info.release() method.
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     */
    onRelease(gl, storage) {
        if (this.#frameTimeMeasure) {
            destroyFrameTimeMeasure(gl, storage);
        }
        gl.screen.freeSceneResources(this);
    }

    /**
     * Invoked when scene is attached to a screen.
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     */
    onStart(gl, storage) {
    }

    /**
     * Invoked when scene is detached from a screen.
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     */
    onStop(gl, storage) {
    }

    /**
     * Invoked when this is an active context and the screen have been resized.
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     */
    onResize(gl, storage) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    /**
     * Invoked when the screen is repainted with this context.
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     */
    onPaint(gl, storage) {
    }

    getDesiredSize(screen) {
        return [screen.canvas.clientWidth, screen.canvas.clientHeight];
    }
}
