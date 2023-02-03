export default class WebGPUScene {
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
     * @param {import('./webgpu-screen.js').default} screen
     * @param {object} storage
     */
    onCreate(screen, storage) {
    }

    /**
     * Invoked by info.release() method.
     * @param {import('./webgpu-screen.js').default} screen
     * @param {object} storage
     */
    onRelease(screen, storage) {
    }

    /**
     * Invoked when scene is attached to a screen.
     * @param {import('./webgpu-screen.js').default} screen
     * @param {object} storage
     */
    onStart(screen, storage) {
    }

    /**
     * Invoked when scene is detached from a screen.
     * @param {import('./webgpu-screen.js').default} screen
     * @param {object} storage
     */
    onStop(screen, storage) {
    }

    /**
     * Invoked when this is an active context and the screen have been resized.
     * @param {import('./webgpu-screen.js').default} screen
     * @param {object} storage
     */
    onResize(screen, storage) {
    }

    /**
     * Invoked when the screen is repainted with this context.
     * @param {import('./webgpu-screen.js').default} screen
     * @param {object} storage
     */
    onPaint(screen, storage) {
    }
}
