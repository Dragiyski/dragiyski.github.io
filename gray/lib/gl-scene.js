export default class OpenGLScene {
    constructor(options) {
        options = Object.assign(Object.create(null), options ?? {});
        for (const name in [
            'create',
            'release',
            'start',
            'stop',
            'resize',
            'paint'
        ]) {
            if (name in options) {
                const value = options[name];
                if (typeof value === 'function') {
                    const methodName = 'on' + name.substring(0, 1).toUpperCase() + name.substring(1);
                    Object.defineProperty(this, methodName, {
                        configurable: true,
                        writable: true,
                        value
                    });
                }
            }
        }
    }

    /**
     * Invoked when the context is first attached to screen.
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     */
    onCreate(gl, storage) {
    }

    /**
     * Invoked by info.release() method.
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     */
    onRelease(gl, storage) {
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
