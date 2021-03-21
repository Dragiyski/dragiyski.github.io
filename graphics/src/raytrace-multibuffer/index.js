import createProgram from '../../lib/graphics/program.js';
import OpenGLScreen, { OpenGLContext } from '../../lib/screen.js';

class RaytraceContext extends OpenGLContext {
    onCreate(gl, storage) {
        super.onCreate(gl, storage);

        {
            const ext = gl.getExtension('EXT_color_buffer_float');
            if (ext == null) {
                throw new Error(`The required WebGL extension [EXT_color_buffer_float] is missing`);
            }
        }

        storage.programs = Object.create(null);
        storage.programs.flatScreen = createProgram(gl, shaders.vertex.screen, shaders.fragment.flatScreen);
        storage.programs.test = createProgram(gl, shaders.vertex.screen, shaders.fragment.test);
        storage.programs.raytrace = {
            sphere: {
                color: createProgram(gl, shaders.vertex.screen, shaders.fragment.raytrace.sphere.color)
            }
        };
        storage.programs.phong = createProgram(gl, shaders.vertex.screen, shaders.fragment.phong);

        storage.fieldOfView = 60 / 180 * Math.PI;

        const pseudoVertices = Float32Array.from([
            -1, +1,
            -1, -1,
            +1, -1,
            +1, +1
        ]);
        const pseudoIndices = Uint8Array.from([
            // 0 3
            // 1 2
            0, 1, 2,
            0, 2, 3
        ]);
        storage.screen = Object.create(null);
        const vertexBuffer = storage.screen.vertexBuffer = gl.createBuffer();
        const indexBuffer = storage.screen.indexBuffer = gl.createBuffer();
        const vertexArray = storage.screen.vertexArray = gl.createVertexArray();

        gl.bindVertexArray(vertexArray);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, pseudoVertices, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pseudoIndices, gl.STATIC_DRAW);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        storage.texture2D = Object.create(null);
        storage.framebuffer = Object.create(null);

        for (const texName of ['rayDirection', 'color', 'normal', 'hitPoint', 'material', 'phong']) {
            storage.texture2D[texName] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, storage.texture2D[texName]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.FLOAT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        storage.textureDepth = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, storage.textureDepth);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, gl.canvas.width, gl.canvas.height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        storage.framebuffer.rayDirection = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.rayDirection);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, storage.texture2D.rayDirection, 0);
        this.validateFrameBuffer(gl, gl.FRAMEBUFFER);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        storage.framebuffer.rayTrace = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.rayTrace);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, storage.texture2D.color, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, storage.texture2D.normal, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, storage.texture2D.hitPoint, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT3, gl.TEXTURE_2D, storage.texture2D.material, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT3, gl.TEXTURE_2D, storage.texture2D.phong, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, storage.textureDepth, 0);
        this.validateFrameBuffer(gl, gl.FRAMEBUFFER);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        storage.framebuffer.phong = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.phong);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, storage.texture2D.phong, 0);
        this.validateFrameBuffer(gl, gl.FRAMEBUFFER);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    validateFrameBuffer(gl, target) {
        const status = gl.checkFramebufferStatus(target);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            for (const errorName of [
                'FRAMEBUFFER_UNDEFINED',
                'FRAMEBUFFER_INCOMPLETE_ATTACHMENT',
                'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT',
                'FRAMEBUFFER_UNSUPPORTED',
                'FRAMEBUFFER_INCOMPLETE_MULTISAMPLE'
            ]) {
                if (typeof gl[errorName] === 'number' && status === gl[errorName]) {
                    throw new Error(`Failed to setup framebuffer: ${errorName}`);
                }
            }
        }
    }

    onStart(gl, storage) {
        super.onStart(gl, storage);
        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(+Infinity);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
    }

    onStop(gl, storage) {
        super.onStop(gl, storage);
    }

    onResize(gl, storage) {
        super.onResize(gl, storage);
        for (const texName of ['rayDirection', 'color', 'normal', 'hitPoint', 'material']) {
            gl.bindTexture(gl.TEXTURE_2D, storage.texture2D[texName]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.FLOAT, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        {
            gl.bindTexture(gl.TEXTURE_2D, storage.textureDepth);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, gl.canvas.width, gl.canvas.height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }

    onPaint(gl, storage) {
        super.onPaint(gl, storage);

        const screen = this.calculateRayDirection(gl, storage);

        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.rayTrace);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2, gl.COLOR_ATTACHMENT3, gl.COLOR_ATTACHMENT4]);
        gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]);
        gl.clearBufferfv(gl.COLOR, 1, [0, 0, 0, 0]);
        gl.clearBufferfi(gl.DEPTH_STENCIL, 0, +Infinity, 0);

        {
            let currentProgram = storage.programs.raytrace.sphere.color;
            gl.useProgram(currentProgram);

            currentProgram.uniform.rayOrigin.setArray(screen.origin);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture2D.rayDirection);
            currentProgram.uniform.rayDirectionArray.setValue(0);
            const timePosition = wrappedNumber(performance.now(), 5000);
            const movement = Math.sin(timePosition * Math.PI * 2.0);
            currentProgram.uniform.spherePosition.setValue(0, 0, -20);
            currentProgram.uniform.sphereRadius.setValue(3);
            currentProgram.uniform.sphereColor.setValue(1, 0, 0, 1);
            currentProgram.uniform.sphereMaterial.setValue(0.2, 0.8, 0.3, 7);

            gl.bindVertexArray(storage.screen.vertexArray);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, null);
            gl.bindVertexArray(null);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.phong);

        {
            let currentProgram = storage.programs.phong;

            gl.useProgram(currentProgram);

            currentProgram.uniform.lightPosition.setValue(-10, 10, 20);
            currentProgram.uniform.lightColor.setValue(1, 1, 1);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture2D.normal);
            currentProgram.uniform.texNormal.setValue(0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture2D.hitPoint);
            currentProgram.uniform.texNormal.setValue(1);

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture2D.color);
            currentProgram.uniform.texNormal.setValue(2);

            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture2D.material);
            currentProgram.uniform.texNormal.setValue(3);

            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture2D.phong);
            currentProgram.uniform.texNormal.setValue(4);

            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture2D.rayDirection);
            currentProgram.uniform.texRayDirection.setValue(5);

            gl.bindVertexArray(storage.screen.vertexArray);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, null);
            gl.bindVertexArray(null);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        /*{
            let currentProgram = storage.programs.test;
            gl.useProgram(currentProgram);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture2D.material);
            currentProgram.uniform.inputTexture.setValue(0);

            gl.bindVertexArray(storage.screen.vertexArray);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, null);
            gl.bindVertexArray(null);
        }*/
    }

    calculateRayDirection(gl, storage) {
        let currentProgram = storage.programs.flatScreen;

        gl.useProgram(currentProgram);

        const minScreen = Math.min(gl.canvas.width, gl.canvas.height);
        const halfDiagonal = [gl.canvas.width / minScreen, gl.canvas.height / minScreen];
        const halfDiagonalLength = Math.sqrt(halfDiagonal[0] * halfDiagonal[0] + halfDiagonal[1] * halfDiagonal[1]);
        const radius = storage.screenRadius = halfDiagonalLength / Math.tan(storage.fieldOfView * 0.5);

        currentProgram.uniform.screenSize.setValue(gl.canvas.width, gl.canvas.height);
        currentProgram.uniform.halfDiagonal.setArray(halfDiagonal);
        currentProgram.uniform.screenRadius.setValue(radius);

        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.rayDirection);

        gl.bindVertexArray(storage.screen.vertexArray);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, null);
        gl.bindVertexArray(null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(null);

        return {
            origin: [0, 0, radius],
            halfDiagonal,
            halfDiagonalLength,
            fieldOfView: storage.fieldOfView
        };
    }

    onRelease(gl, storage) {
        super.onRelease(gl, storage);
    }
}

async function main() {
    shaders = {
        vertex: {
            screen: await fetchTextFile(new URL('screen.vertex.glsl', import.meta.url))
        },
        fragment: {
            flatScreen: await fetchTextFile(new URL('flat-screen.fragment.glsl', import.meta.url)),
            test: await fetchTextFile(new URL('test.fragment.glsl', import.meta.url)),
            raytrace: {
                sphere: {
                    color: await fetchTextFile(new URL('raytrace/sphere-color.glsl', import.meta.url))
                }
            },
            phong: await fetchTextFile(new URL('illumination/phong.glsl', import.meta.url))
        }
    };
    const context = new RaytraceContext();
    const screen = document.getElementById('screen');
    if (screen instanceof OpenGLScreen) {
        screen.context = context;
    }
}

function onStart() {
    main().catch(onError);
}

function onError(error) {
    console.error(error);
}

let shaders;

async function fetchTextFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const error = new Error(`Unable to fetch file: ${url}`);
        error.response = response;
        error.url = url;
        throw error;
    }
    return response.text();
}

function wrappedNumber(number, wrap) {
    return (number % wrap) / wrap;
}

customElements.whenDefined('opengl-screen').then(onStart, onError);
