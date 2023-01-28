export default class OpenGLContext {
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
        gl.screen.freeContextResources(this);
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
        gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
    }

    /**
     * Invoked when the screen is repainted with this context.
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     */
    onPaint(gl, storage) {
    }
}
