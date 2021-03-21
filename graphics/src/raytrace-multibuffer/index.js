import createProgram from '../../lib/graphics/program.js';
import OpenGLScreen, { OpenGLContext } from '../../lib/screen.js';

class RaytraceContext extends OpenGLContext {
    onCreate(gl, storage) {
        super.onCreate(gl, storage);
        storage.programs = Object.create(null);
        storage.programs.sphere = createProgram(gl, shaders.vertex.screen, shaders.fragment.sphere);

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
    }

    onStart(gl, storage) {
        super.onStart(gl, storage);
        gl.clearColor(0, 0, 0, 1);
    }

    onStop(gl, storage) {
        super.onStop(gl, storage);
    }

    onResize(gl, storage) {
        super.onResize(gl, storage);
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

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

        gl.bindVertexArray(null);

        gl.useProgram(null);
    }

    onRelease(gl, storage) {
        super.onRelease(gl, storage);
        if (storage.programs != null) {
            for (const programName in storage.programs) {
                const program = storage.programs[programName];
                if (gl.isProgram(program)) {
                    for (const shader of gl.getAttachedShaders(program)) {
                        if (gl.isShader(shader)) {
                            gl.deleteShader(shader);
                        }
                    }
                    gl.deleteProgram(program);
                }
            }
        }
        if (gl.isBuffer(storage.screen?.vertexBuffer)) {
            gl.deleteBuffer(storage.screen.vertexBuffer);
        }
        if (gl.isBuffer(storage.screen?.indexBuffer)) {
            gl.deleteBuffer(storage.screen.indexBuffer);
        }
        if (gl.isVertexArray(storage.screen?.vertexArray)) {
            gl.deleteVertexArray(storage.screen.vertexArray);
        }
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
        sphere: await fetchTextFile(new URL('sphere.fragment.glsl', import.meta.url))
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
