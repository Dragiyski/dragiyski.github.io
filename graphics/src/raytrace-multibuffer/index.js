import createProgram from '../../lib/graphics/program.js';
import OpenGLScreen, {OpenGLContext} from '../../lib/screen.js';

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
        storage.programs.sphere = createProgram(gl, shaders.vertex.screen, shaders.fragment.sphere);
        storage.programs.test = createProgram(gl, shaders.vertex.screen, shaders.fragment.test);

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

        storage.framebuffer = gl.createFramebuffer();

        this.updateRaytraceTextures(gl, storage);

        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, storage.framebuffer);
        gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, storage.raytraceColorTexture, 0);
        gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, storage.raytraceNormalTexture, 0);

        const status = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER);
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
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    onStart(gl, storage) {
        super.onStart(gl, storage);
        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(+Infinity);
        gl.enable(gl.DEPTH_TEST);
    }

    onStop(gl, storage) {
        super.onStop(gl, storage);
    }

    onResize(gl, storage) {
        super.onResize(gl, storage);
        this.updateRaytraceTextures(gl, storage);
    }

    onPaint(gl, storage) {
        super.onPaint(gl, storage);

        gl.useProgram(storage.programs.sphere);

        gl.bindVertexArray(storage.screen.vertexArray);

        const screenSize = [gl.canvas.width, gl.canvas.height];
        const fieldOfView = 15;
        const fov = fieldOfView / 180 * Math.PI;
        const minScreen = Math.min(...screenSize);
        const topLeft = screenSize.map(n => n / minScreen);
        const viewSize = topLeft.map(n => n * 2);
        const diagonal = Math.sqrt(viewSize[0] * viewSize[0] + viewSize[1] * viewSize[1]);
        // const radius = diagonal / fov;
        const radius = (diagonal * 0.5) / Math.tan(fov / 2);

        if ('screenSize' in storage.programs.sphere.uniform) {
            storage.programs.sphere.uniform.screenSize.setArray(screenSize);
        }

        if ('viewSize' in storage.programs.sphere.uniform) {
            storage.programs.sphere.uniform.viewSize.setArray(viewSize);
        }

        if ('radius' in storage.programs.sphere.uniform) {
            storage.programs.sphere.uniform.radius.setValue(radius);
        }

        if ('diagonal' in storage.programs.sphere.uniform) {
            storage.programs.sphere.uniform.radius.setValue(diagonal);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);

        gl.clearBufferfv(gl.COLOR, 0, Float32Array.from([0, 0, 0, 0]));
        gl.clearBufferfv(gl.COLOR, 1, Float32Array.from([0, 0, 0, +Infinity]));

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.useProgram(storage.programs.test);

        if ('inputTexture' in storage.programs.test.uniform) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, storage.raytraceNormalTexture);
            storage.programs.test.uniform.inputTexture.setValue(0);
        }

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, null);

        gl.bindVertexArray(null);

        gl.useProgram(null);
    }

    onRelease(gl, storage) {
        super.onRelease(gl, storage);
    }

    updateRaytraceTextures(gl, storage) {
        if (storage.raytraceColorTexture == null) {
            storage.raytraceColorTexture = gl.createTexture();
        }
        if (storage.raytraceNormalTexture == null) {
            storage.raytraceNormalTexture = gl.createTexture();
        }
        gl.bindTexture(gl.TEXTURE_2D, storage.raytraceColorTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        gl.bindTexture(gl.TEXTURE_2D, storage.raytraceNormalTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

async function main() {
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

const shaders = {
    vertex: {
        screen: await fetchTextFile(new URL('screen.vertex.glsl', import.meta.url))
    },
    fragment: {
        sphere: await fetchTextFile(new URL('sphere.fragment.glsl', import.meta.url)),
        test: await fetchTextFile(new URL('test.fragment.glsl', import.meta.url))
    }
};

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

customElements.whenDefined('opengl-screen').then(onStart, onError);
