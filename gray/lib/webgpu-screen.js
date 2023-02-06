import WebGPUScene from './webgpu-scene.js';

if (navigator?.gpu == null) {
    throw new Error('WebGPU is not supported');
}

if (typeof GPURenderPassEncoder?.prototype?.end !== 'function' && typeof GPURenderPassEncoder?.prototype?.endPass === 'function') {
    GPURenderPassEncoder.prototype.end = GPURenderPassEncoder.prototype.endPass;
}

const properties = {
    screen: Symbol('screen'),
    canvas: Symbol('canvas'),
    context: Symbol('context'),
    animationTimer: Symbol('animationTimer'),
    inAnimationLoop: Symbol('inAnimationLoop'),
    inUpdate: Symbol('inUpdate'),
    contextMap: Symbol('contextMap'),
    scene: Symbol('scene'),
    neutralState: Symbol('neutralState'),
    autoResize: Symbol('autoResize'),
    forceResize: Symbol('forceResize')
};

const methods = {
    startAnimationLoop: Symbol('startAnimationLoop'),
    stopAnimationLoop: Symbol('stopAnimationLoop'),
    paint: Symbol('paint'),
    clear: Symbol('clear'),
    resize: Symbol('resize'),
    createsceneContext: Symbol('createsceneContext'),
    clearContext: Symbol('clearContext'),
    callContext: Symbol('callContext'),
    freeResources: Symbol('freeResources'),
    wrapContextResourceMethods: Symbol('wrapContextResourceMethods')
};

const events = {
    resize: Symbol('event.resize'),
    animation: Symbol('event.animation'),
    unload: Symbol('event.unload')
};

const screenResizeObserver = new ResizeObserver(onScreenResize);

export default class WebGPUScreen extends HTMLDivElement {
    constructor() {
        super();
        for (const key of Object.keys(events)) {
            const event = events[key];
            if (typeof this[event] === 'function') {
                this[event] = this[event].bind(this);
            }
        }
        this[properties.sceneMap] = new Map();
        this[properties.scene] = null;
        this[properties.autoResize] = true;
        this[properties.forceResize] = false;
        this[properties.inAnimationLoop] = this[properties.inUpdate] = false;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        const canvas = this.ownerDocument.createElement('canvas');
        const context = canvas.getContext('webgpu');
        Object.defineProperties(this, {
            canvas: {
                value: canvas
            },
            context: {
                value: context
            }
        });
        this.ownerDocument.defaultView.addEventListener('unload', this[events.unload], { once: true, passive: true });
        shadowRoot.appendChild(canvas);
    }

    forceResize() {
        this[properties.forceResize] = true;
    }

    /**
     * Returns `true` of the drawing is passive, `false` otherwise.
     * @returns {boolean}
     */
    get passive() {
        return !this[properties.inAnimationLoop];
    }

    /**
     * @returns {WebGPUScene|null}
     */
    get scene() {
        return this[properties.scene];
    }

    get autoResize() {
        return this[properties.autoResize];
    }

    set autoResize(value) {
        this[properties.autoResize] = !!value;
        if (this.isConnected) {
            if (this[properties.autoResize]) {
                screenResizeObserver.observe(this);
            } else {
                screenResizeObserver.unobserve(this);
            }
        }
    }

    /**
     * @param {WebGPUScene|null} scene
     * @returns {boolean}
     */
    set scene(scene) {
        if (!(scene instanceof WebGPUScene) && scene != null) {
            throw new TypeError('Expected [object OpenGLScreen]::scene to be [object WebGPUScene]');
        }
        if (this[properties.scene] === scene) {
            this.update();
            return true;
        }
        if (this[properties.scene] != null) {
            this[methods.clearContext]();
        }
        if (scene != null) {
            if (!this[properties.sceneMap].has(scene)) {
                const sceneContext = this[methods.createsceneContext]();
                this[properties.sceneMap].set(scene, sceneContext);
                this[methods.callContext]('onCreate', this[properties.scene] = scene);
            }
            this[methods.callContext]('onStart', this[properties.scene] = scene);
            this[methods.callContext]('onResize', this[properties.scene]);
        } else {
            this[properties.scene] = null;
        }
        this.update();
        return true;
    }

    [methods.createsceneContext]() {
        const sceneContext = Object.create(null);
        sceneContext.storage = Object.create(null);
        sceneContext.resource = Object.create(null);
        sceneContext.error = null;
        return sceneContext;
    }

    [methods.clearContext]() {
        if (this[methods.callContext]('onStop', this[properties.scene])) {
            /* TODO: resetState, if possible */
        }
    }

    [methods.callContext](callback, scene) {
        const sceneContext = this[properties.sceneMap].get(scene);
        if (sceneContext == null || sceneContext.error != null) {
            return true;
        }
        try {
            scene[callback](this, sceneContext.storage);
        } catch (e) {
            console.error(sceneContext.error = e);
            /* TODO: resetState, if possible */
            this[methods.freeResources](sceneContext.resource);
            const error = new ErrorEvent('webgpu.scene.error', {
                message: e?.message ?? '',
                error: e
            });
            Object.defineProperties(error, {
                scene: {
                    value: scene
                },
                callbackName: {
                    value: callback
                }
            });
            this.dispatchEvent(error);
            return false;
        }
        return true;
    }

    [methods.freeResources](resources) {
    }

    /**
     * Retrieve the scene information connecting this screen and scene.
     * Only applicable if the scene has been assigned to screen at least once.
     * @param {WebGPUScene} scene
     * @returns {object|null}
     */
    getSceneContext(scene) {
        if (this[properties.sceneMap].has(scene)) {
            return this[properties.sceneMap].get(scene).storage;
        }
        return null;
    }

    getSceneError(scene) {
        if (this[properties.sceneMap].has(scene)) {
            return this[properties.sceneMap].get(scene).error;
        }
        return null;
    }

    resetSceneError(scene) {
        if (this[properties.sceneMap].has(scene)) {
            const sceneContext = this[properties.sceneMap].get(scene);
            if (sceneContext.error != null) {
                if (this[properties.scene] === scene) {
                    this[properties.scene] = null;
                }
                this[properties.sceneMap].delete(scene);
            }
        }
        return this;
    }

    freeSceneResources(scene) {
        if (this[properties.sceneMap].has(scene)) {
            const sceneContext = this[properties.sceneMap].get(scene);
            if (sceneContext?.resource != null) {
                this[methods.freeResources](sceneContext.resource);
            }
        }
    }

    /**
     * In passive mode, the canvas is updated when {@link update}() is called.
     * In active mode, the canvas is updated on every vsync event (unless update is in progress).
     * (currently webgl does not support variable refresh rate).
     * @param {boolean} value
     */
    set passive(value) {
        if (!value) {
            this[methods.startAnimationLoop]();
        } else {
            this[methods.stopAnimationLoop]();
        }
    }

    /**
     * Invoked by DOM, when this element is connected to a DOM tree that is displayed on the screen.
     * This could be called synchronously from customElements.define() for any element already in the DOM tree.
     */
    connectedCallback() {
        if (this[properties.autoResize]) {
            screenResizeObserver.observe(this);
        }
        this[methods.resize]();
        if (this[properties.scene] != null) {
            this[methods.callContext]('onStart', this[properties.scene]);
        }
        this.update();
    }

    /**
     * Invoked by DOM, when this element is removed from DOM tree.
     * The element can be re-attached to the DOM later in which case it is restored and updated.
     */
    disconnectedCallback() {
        this[methods.stopAnimationLoop]();
        screenResizeObserver.unobserve(this);
        if (this[properties.scene] != null) {
            this[methods.callContext]('onStop', this[properties.scene]);
        }
    }

    /**
     * Update the screen, useful when {@link passive} is ``true``.
     */
    update() {
        this[properties.inUpdate] = true;
        if (this[properties.animationTimer] == null) {
            this[properties.animationTimer] = requestAnimationFrame(this[events.animation]);
        }
    }

    /**
     * Release a scene (calling onRelease) from screen.
     * This can be used to free any resources allocated for a scene
     * in a specific screen (resources are screen dependent).
     *
     * If scene is omitted or null/undefined, the current scene is released, if any.
     * @param {WebGPUScene|null} scene
     */
    release(scene) {
        if (scene == null) {
            scene = this[properties.scene];
            if (scene == null) {
                return;
            }
        }
        if (!(scene instanceof WebGPUScene)) {
            throw new TypeError('Expected [object OpenGLScreen]::scene to be instance of [object WebGPUScene]');
        }
        if (this[properties.scene] === scene) {
            if (!this[methods.callContext]('onStop', scene)) {
                this[properties.scene] = null;
                return;
            }
            this[properties.scene] = null;
        }
        if (this[methods.callContext]('onRelease', scene)) {
            this[properties.sceneMap].delete(scene);
        }
    }

    requestFullscreen(options) {
        return this.canvas.requestFullscreen(options);
    }

    [methods.startAnimationLoop]() {
        if (this[properties.scene] == null) {
            return;
        }
        const sceneContext = this[properties.sceneMap].get(this[properties.scene]);
        if (sceneContext == null || sceneContext.error != null) {
            return;
        }
        this[properties.inAnimationLoop] = true;
        if (this[properties.animationTimer] == null) {
            this[properties.animationTimer] = requestAnimationFrame(this[events.animation]);
        }
    }

    [methods.stopAnimationLoop]() {
        this[properties.inAnimationLoop] = false;
        if (!this[properties.inUpdate] && this[properties.animationTimer] != null) {
            cancelAnimationFrame(this[properties.animationTimer]);
        }
    }

    [events.animation]() {
        this[properties.animationTimer] = null;
        this[properties.inUpdate] = false;
        let method = methods.paint;
        const scene = this[properties.scene];
        if (scene == null) {
            method = methods.clear;
        } else {
            const sceneContext = this[properties.sceneMap].get(scene);
            if (sceneContext == null || sceneContext.error != null) {
                method = methods.clear;
            }
        }
        if (this[method]()) {
            if (this[properties.inAnimationLoop] && this[properties.animationTimer] == null) {
                this[properties.animationTimer] = requestAnimationFrame(this[events.animation]);
            }
        } else {
            this[properties.inAnimationLoop] = false;
        }
    }

    [events.unload]() {
        for (const knownContext of this[properties.sceneMap]) {
            const sceneContext = this[properties.sceneMap].get(knownContext);
            try {
                knownContext.onRelease(sceneContext);
            } catch {
            }
        }
        this[properties.sceneMap].clear();
    }

    [methods.clear]() {
        /* TODO: Clear the screen somehow? */
        return false;
    }

    [methods.paint]() {
        const scene = this[properties.scene];
        if (scene == null) {
            return this[methods.clear]();
        }
        const sceneContext = this[properties.sceneMap].get(scene);
        if (sceneContext == null || sceneContext.error != null) {
            return this[methods.clear]();
        }
        if (!this[methods.callContext]('onPaint', scene)) {
            return this[methods.clear]();
        }
        return true;
    }

    [methods.resize]() {
        const canvas = this.canvas;
        if (this.clientWidth !== canvas.width || this.clientHeight !== canvas.height) {
            canvas.width = this.clientWidth;
            canvas.height = this.clientHeight;
            this[methods.callContext]('onResize', this[properties.scene]);
            this.update();
        }
    }
}

function onScreenResize(entries, observer) {
    for (const entry of entries) {
        if (typeof entry.target[methods.resize] === 'function') {
            entry.target[methods.resize]();
        }
    }
}

export const name = 'webgpu-screen';

customElements.define(name, WebGPUScreen, { extends: 'div' });
