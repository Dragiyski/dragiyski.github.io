import WebGLScene from './webgl-scene.js';

const properties = {
    screen: Symbol('screen'),
    gl: Symbol('gl'),
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

export default class OpenGLScreen extends HTMLDivElement {
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
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        // canvas.style.imageRendering = 'optimizeQuality';
        const gl = this[properties.gl] = canvas.getContext('webgl2');
        this[properties.neutralState] = getState(gl);
        this[methods.wrapContextResourceMethods](gl);
        this.ownerDocument.defaultView.addEventListener('unload', this[events.unload], { once: true, passive: true });
        shadowRoot.appendChild(canvas);
    }

    forceResize() {
        this[properties.forceResize] = true;
    }

    /**
     * @returns {HTMLCanvasElement}
     */
    get canvas() {
        return this[properties.gl].canvas;
    }

    /**
     * @returns {WebGL2RenderingContext}
     */
    get gl() {
        return this[properties.gl];
    }

    /**
     * Returns `true` of the drawing is passive, `false` otherwise.
     * @returns {boolean}
     */
    get passive() {
        return !this[properties.inAnimationLoop];
    }

    /**
     * @returns {WebGLScene|null}
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
     * @param {WebGLScene|null} scene
     * @returns {boolean}
     */
    set scene(scene) {
        if (!(scene instanceof WebGLScene) && scene != null) {
            throw new TypeError('Expected [object OpenGLScreen]::scene to be [object OpenGLScene]');
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
            this[properties.forceResize] = true;
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
        for (const resource in resourceNameList) {
            sceneContext.resource[resource] = new Set();
        }
        return sceneContext;
    }

    [methods.clearContext]() {
        if (this[methods.callContext]('onStop', this[properties.scene])) {
            resetState(this[properties.gl], this[properties.neutralState]);
        }
    }

    [methods.callContext](callback, scene) {
        const sceneContext = this[properties.sceneMap].get(scene);
        if (sceneContext == null || sceneContext.error != null) {
            return true;
        }
        try {
            scene[callback](this.gl, sceneContext.storage);
        } catch (e) {
            console.error(sceneContext.error = e);
            resetState(this[properties.gl], this[properties.neutralState]);
            this[methods.freeResources](sceneContext.resource);
            const error = new ErrorEvent('gl.scene.error', {
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
        const gl = this[properties.gl];
        for (const name in resourceNameList) {
            if (!(name in resources)) {
                continue;
            }
            for (const resource of resources[name]) {
                if (gl[resourceNameList[name].is](resource)) {
                    gl[resourceNameList[name].delete](resource);
                }
            }
        }
    }

    [methods.wrapContextResourceMethods](gl) {
        const self = this;
        for (const resourceName in resourceNameList) {
            const resourceMethods = resourceNameList[resourceName];
            Object.defineProperties(gl, {
                [resourceMethods.create]: {
                    configurable: true,
                    writable: true,
                    value: function () {
                        const resource = WebGL2RenderingContext.prototype[resourceMethods.create].apply(this, arguments);
                        if (self[properties.scene] != null) {
                            const sceneContext = self[properties.sceneMap].get(self[properties.scene]);
                            sceneContext.resource[resourceName].add(resource);
                        }
                        return resource;
                    }
                },
                [resourceMethods.delete]: {
                    configurable: true,
                    writable: true,
                    value: function (resource) {
                        const result = WebGL2RenderingContext.prototype[resourceMethods.delete].apply(this, arguments);
                        if (self[properties.scene] != null) {
                            const sceneContext = self[properties.sceneMap].get(self[properties.scene]);
                            sceneContext.resource[resourceName].delete(resource);
                        }
                        return result;
                    }
                }
            });
        }
        Object.defineProperties(gl, {
            screen: {
                value: this
            }
        });
    }

    /**
     * Retrieve the scene information connecting this screen and scene.
     * Only applicable if the scene has been assigned to screen at least once.
     * @param {WebGLScene} scene
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
     * @param {WebGLScene|null} scene
     */
    release(scene) {
        if (scene == null) {
            scene = this[properties.scene];
            if (scene == null) {
                return;
            }
        }
        if (!(scene instanceof WebGLScene)) {
            throw new TypeError('Expected [object OpenGLScreen]::scene to be instance of [object OpenGLScene]');
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
            this[properties.animationTimer] = null;
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
        /** @var gl WebGL2RenderingContext */
        const gl = this[properties.gl];
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
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
        const [desiredWidth, desiredHeight] = scene.getDesiredSize(this);
        if (this[properties.forceResize] || this.canvas.width !== desiredWidth || this.canvas.height !== desiredHeight) {
            this[properties.forceResize] = false;
            this.canvas.width = desiredWidth;
            this.canvas.height = desiredHeight;
            if (!this[methods.callContext]('onResize', scene)) {
                return this[methods.clear]();
            }
            if (sceneContext.error != null) {
                return this[methods.clear]();
            }
        }
        if (!this[methods.callContext]('onPaint', scene)) {
            return this[methods.clear]();
        }
        return true;
    }

    [methods.resize]() {
        this[properties.forceResize] = true;
        this.update();
    }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @returns {object}
 */
function getState(gl) {
    const state = {
        activeTexture: gl.getParameter(gl.ACTIVE_TEXTURE),
        blend: gl.getParameter(gl.BLEND),
        blendColor: gl.getParameter(gl.BLEND_COLOR),
        blendDestAlpha: gl.getParameter(gl.BLEND_DST_ALPHA),
        blendDestRGB: gl.getParameter(gl.BLEND_DST_RGB),
        blendSrcAlpha: gl.getParameter(gl.BLEND_SRC_ALPHA),
        blendSrcRGB: gl.getParameter(gl.BLEND_SRC_RGB),
        blendEquationAlpha: gl.getParameter(gl.BLEND_EQUATION_ALPHA),
        blendEquationRGB: gl.getParameter(gl.BLEND_EQUATION_RGB),
        clearColor: gl.getParameter(gl.COLOR_CLEAR_VALUE),
        colorMask: gl.getParameter(gl.COLOR_WRITEMASK),
        cullFace: gl.getParameter(gl.CULL_FACE),
        cullFaceMode: gl.getParameter(gl.CULL_FACE_MODE),
        clearDepth: gl.getParameter(gl.DEPTH_CLEAR_VALUE),
        depthFunc: gl.getParameter(gl.DEPTH_FUNC),
        depthRange: gl.getParameter(gl.DEPTH_RANGE),
        depthTest: gl.getParameter(gl.DEPTH_TEST),
        depthMask: gl.getParameter(gl.DEPTH_WRITEMASK),
        dither: gl.getParameter(gl.DITHER),
        frontFace: gl.getParameter(gl.FRONT_FACE),
        generateMipmapHint: gl.getParameter(gl.GENERATE_MIPMAP_HINT),
        lineWidth: gl.getParameter(gl.LINE_WIDTH),
        packAlignment: gl.getParameter(gl.PACK_ALIGNMENT),
        polygonOffsetFill: gl.getParameter(gl.POLYGON_OFFSET_FILL),
        polygonOffsetFactor: gl.getParameter(gl.POLYGON_OFFSET_FACTOR),
        polygonOffsetUnits: gl.getParameter(gl.POLYGON_OFFSET_UNITS),
        sampleCoverage: gl.getParameter(gl.SAMPLE_COVERAGE),
        sampleCoverageValue: gl.getParameter(gl.SAMPLE_COVERAGE_VALUE),
        sampleCoverageInvert: gl.getParameter(gl.SAMPLE_COVERAGE_INVERT),
        scissorBox: gl.getParameter(gl.SCISSOR_BOX),
        scissorTest: gl.getParameter(gl.SCISSOR_TEST),
        stencilBackFail: gl.getParameter(gl.STENCIL_BACK_FAIL),
        stencilBackPassDepthFail: gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_FAIL),
        stencilBackPassDepthPass: gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_PASS),
        stencilBackFunc: gl.getParameter(gl.STENCIL_BACK_FUNC),
        stencilBackRef: gl.getParameter(gl.STENCIL_BACK_REF),
        stencilBackValueMask: gl.getParameter(gl.STENCIL_BACK_VALUE_MASK),
        stencilBackWriteMask: gl.getParameter(gl.STENCIL_BACK_WRITEMASK),
        stencilClearValue: gl.getParameter(gl.STENCIL_CLEAR_VALUE),
        stencilFail: gl.getParameter(gl.STENCIL_FAIL),
        stencilFunc: gl.getParameter(gl.STENCIL_FUNC),
        stencilPassDepthFail: gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL),
        stencilPassDepthPass: gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS),
        stencilRef: gl.getParameter(gl.STENCIL_REF),
        stencilValueMask: gl.getParameter(gl.STENCIL_VALUE_MASK),
        stencilWriteMask: gl.getParameter(gl.STENCIL_WRITEMASK),
        stencilTest: gl.getParameter(gl.STENCIL_TEST),
        unpackAlignment: gl.getParameter(gl.UNPACK_ALIGNMENT),
        unpackColorSpaceConversionWebGL: gl.getParameter(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL),
        unpackFlipYWebGL: gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL),
        unpackPremultiplyAlphaWebGL: gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL),
        viewport: gl.getParameter(gl.VIEWPORT),
        arrayBuffer: gl.getParameter(gl.ARRAY_BUFFER_BINDING),
        elementArrayBuffer: gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING),
        program: gl.getParameter(gl.CURRENT_PROGRAM),
        frameBuffer: gl.getParameter(gl.FRAMEBUFFER_BINDING),
        texture2D: gl.getParameter(gl.TEXTURE_BINDING_2D),
        textureCubeMap: gl.getParameter(gl.TEXTURE_BINDING_CUBE_MAP),
        copyReadBuffer: gl.getParameter(gl.COPY_READ_BUFFER_BINDING),
        copyWriteBuffer: gl.getParameter(gl.COPY_WRITE_BUFFER_BINDING),
        readFrameBuffer: gl.getParameter(gl.READ_FRAMEBUFFER_BINDING),
        fragmentShaderDerivativeHint: gl.getParameter(gl.FRAGMENT_SHADER_DERIVATIVE_HINT),
        packRowLength: gl.getParameter(gl.PACK_ROW_LENGTH),
        packSkipPixels: gl.getParameter(gl.PACK_SKIP_PIXELS),
        packSkipRows: gl.getParameter(gl.PACK_SKIP_ROWS),
        pixelPackBuffer: gl.getParameter(gl.PIXEL_PACK_BUFFER_BINDING),
        pixelUnpackBuffer: gl.getParameter(gl.PIXEL_UNPACK_BUFFER_BINDING),
        raterizerDiscard: gl.getParameter(gl.RASTERIZER_DISCARD),
        readBuffer: gl.getParameter(gl.READ_BUFFER),
        sampleAlphaToCoverage: gl.getParameter(gl.SAMPLE_ALPHA_TO_COVERAGE),
        samplerBinding: gl.getParameter(gl.SAMPLER_BINDING),
        texture2DArray: gl.getParameter(gl.TEXTURE_BINDING_2D_ARRAY),
        texture3D: gl.getParameter(gl.TEXTURE_BINDING_3D),
        transformFeedback: gl.getParameter(gl.TRANSFORM_FEEDBACK_BINDING),
        transformFeedbackBuffer: gl.getParameter(gl.TRANSFORM_FEEDBACK_BUFFER_BINDING),
        uniformBuffer: gl.getParameter(gl.UNIFORM_BUFFER_BINDING),
        unpackImageHeight: gl.getParameter(gl.UNPACK_IMAGE_HEIGHT),
        unpackRowLength: gl.getParameter(gl.UNPACK_ROW_LENGTH),
        unpackSkipRows: gl.getParameter(gl.UNPACK_SKIP_ROWS),
        unpackSkipPixels: gl.getParameter(gl.UNPACK_SKIP_PIXELS),
        unpackSkipImages: gl.getParameter(gl.UNPACK_SKIP_IMAGES),
        vertexArray: gl.getParameter(gl.VERTEX_ARRAY_BINDING),
        renderBuffer: gl.getParameter(gl.RENDERBUFFER_BINDING)
    };
    {
        const maxDrawBuffers = gl.getParameter(gl.MAX_DRAW_BUFFERS);
        const drawBuffers = new Array(maxDrawBuffers);
        for (let i = 0; i < maxDrawBuffers; ++i) {
            drawBuffers[i] = gl.getParameter(gl.DRAW_BUFFER0 + i);
        }
        state.drawBuffers = drawBuffers;
    }
    return state;
}

/**
 * @param {WebGL2RenderingContext} gl The OpenGL rendering context to reset.
 * @param {object} neutral The neutral state to reset to.
 */
function resetState(gl, neutral) {
    if (gl.getParameter(gl.TRANSFORM_FEEDBACK_ACTIVE)) {
        gl.endTransformFeedback();
    }
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, neutral.arrayBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, neutral.elementArrayBuffer);
    gl.bindBuffer(gl.COPY_READ_BUFFER, neutral.copyReadBuffer);
    gl.bindBuffer(gl.COPY_WRITE_BUFFER, neutral.copyWriteBuffer);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, neutral.transformFeedbackBuffer);
    gl.bindBuffer(gl.UNIFORM_BUFFER, neutral.uniformBuffer);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, neutral.pixelPackBuffer);
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, neutral.pixelUnpackBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, neutral.frameBuffer);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, neutral.readFrameBuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, neutral.renderBuffer);
    {
        const maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        for (let i = 0; i < maxTextureUnits; ++i) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            gl.bindTexture(gl.TEXTURE_3D, null);
            gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
        }
    }
    gl.activeTexture(neutral.activeTexture);
    gl[neutral.blend ? 'enable' : 'disable'](gl.BLEND);
    gl.blendColor(...neutral.blendColor);
    gl.blendFuncSeparate(neutral.blendSrcRGB, neutral.blendDestRGB, neutral.blendSrcAlpha, neutral.blendDestAlpha);
    gl.blendEquationSeparate(neutral.blendEquationRGB, neutral.blendEquationAlpha);
    gl.clearColor(...neutral.clearColor);
    gl.colorMask(...neutral.colorMask);
    gl[neutral.cullFace ? 'enable' : 'disable'](gl.CULL_FACE);
    gl.cullFace(neutral.cullFaceMode);
    gl.clearDepth(neutral.clearDepth);
    gl.depthFunc(neutral.depthFunc);
    gl.depthRange(...neutral.depthRange);
    gl[neutral.depthTest ? 'enable' : 'disable'](gl.DEPTH_TEST);
    gl.depthMask(neutral.depthMask);
    gl[neutral.dither ? 'enable' : 'disable'](gl.DITHER);
    gl.frontFace(neutral.frontFace);
    gl.hint(gl.GENERATE_MIPMAP_HINT, neutral.generateMipmapHint);
    gl.hint(gl.FRAGMENT_SHADER_DERIVATIVE_HINT, neutral.fragmentShaderDerivativeHint);
    gl.lineWidth(neutral.lineWidth);
    gl.pixelStorei(gl.PACK_ROW_LENGTH, neutral.packRowLength);
    gl.pixelStorei(gl.PACK_SKIP_PIXELS, neutral.packSkipPixels);
    gl.pixelStorei(gl.PACK_SKIP_ROWS, neutral.packSkipRows);
    gl.pixelStorei(gl.PACK_ALIGNMENT, neutral.packAlignment);
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, neutral.unpackRowLength);
    gl.pixelStorei(gl.UNPACK_IMAGE_HEIGHT, neutral.unpackImageHeight);
    gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, neutral.unpackSkipPixels);
    gl.pixelStorei(gl.UNPACK_SKIP_ROWS, neutral.unpackSkipRows);
    gl.pixelStorei(gl.UNPACK_SKIP_IMAGES, neutral.unpackSkipImages);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, neutral.unpackAlignment);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, neutral.unpackFlipYWebGL);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, neutral.unpackPremultiplyAlphaWebGL);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, neutral.unpackColorSpaceConversionWebGL);
    gl.polygonOffset(neutral.polygonOffsetFactor, neutral.polygonOffsetUnits);
    gl[neutral.polygonOffsetFill ? 'enable' : 'disable'](gl.POLYGON_OFFSET_FILL);
    gl[neutral.sampleCoverage ? 'enable' : 'disable'](gl.SAMPLE_COVERAGE);
    gl.sampleCoverage(neutral.sampleCoverageValue, neutral.sampleCoverageInvert);
    gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
    gl[neutral.scissorTest ? 'enable' : 'disable'](gl.SCISSOR_TEST);
    gl.stencilOpSeparate(gl.FRONT, neutral.stencilFail, neutral.stencilPassDepthFail, neutral.stencilPassDepthPass);
    gl.stencilOpSeparate(gl.BACK, neutral.stencilBackFail, neutral.stencilBackPassDepthFail, neutral.stencilBackPassDepthPass);
    gl.stencilFuncSeparate(gl.FRONT, neutral.stencilFunc, neutral.stencilRef, neutral.stencilValueMask);
    gl.stencilFuncSeparate(gl.BACK, neutral.stencilBackFunc, neutral.stencilBackRef, neutral.stencilBackValueMask);
    gl.stencilMaskSeparate(gl.FRONT, neutral.stencilWriteMask);
    gl.stencilMaskSeparate(gl.BACK, neutral.stencilBackWriteMask);
    gl.clearStencil(neutral.stencilClearValue);
    gl[neutral.stencilTest ? 'enable' : 'disable'](gl.STENCIL_TEST);
    gl.drawBuffers([neutral.drawBuffers[0]]);
    gl[neutral.raterizerDiscard ? 'enable' : 'disable'](gl.RASTERIZER_DISCARD);
    gl.readBuffer(neutral.readBuffer);
    gl[neutral.sampleAlphaToCoverage ? 'enable' : 'disable'](gl.SAMPLE_ALPHA_TO_COVERAGE);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

const resourceNameList = Object.create(null);

{
    const stringCreate = 'create';
    const names = Object.getOwnPropertyNames(WebGL2RenderingContext.prototype);
    const resourceNames = names.filter(name => {
        if (!name.startsWith(stringCreate) || typeof WebGL2RenderingContext.prototype[name] !== 'function') {
            return false;
        }
        const resourceName = name.substring(stringCreate.length);
        return typeof WebGL2RenderingContext.prototype[`is${resourceName}`] === 'function' &&
            typeof WebGL2RenderingContext.prototype[`delete${resourceName}`] === 'function';
    });
    for (const name of resourceNames) {
        const resourceName = name.substring(stringCreate.length);
        const keyName = resourceName.charAt(0).toLowerCase() + resourceName.substring(1);
        resourceNameList[keyName] = {
            create: name,
            is: `is${resourceName}`,
            delete: `delete${resourceName}`
        };
    }
    resourceNameList.sync = {
        create: 'fenceSync',
        is: 'isSync',
        delete: 'deleteSync'
    };
}

function onScreenResize(entries, observer) {
    for (const entry of entries) {
        if (typeof entry.target[methods.resize] === 'function') {
            entry.target[methods.resize]();
        }
    }
}

export const name = 'webgl-screen';

customElements.define(name, OpenGLScreen, { extends: 'div' });
