import createProgram from '../../lib/graphics/program.js';

let updateTimer = null;

function update() {
    if (updateTimer == null) {
        updateTimer = requestAnimationFrame(paint);
    }
}

function wrappedNumber(number, wrap) {
    return (number % wrap) / wrap;
}

function bounce(current, radius, height) {
    return radius + (current * (height - radius));
}

function paint() {
    updateTimer = null;
    const canvas = document.getElementById('screen');
    const gl = canvas.getContext('webgl2');
    const raytrace = canvas.raytrace;

    const now = performance.timeOrigin + performance.now();

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    gl.useProgram(raytrace.program);

    const speed = [
        Math.sin(wrappedNumber(now, 1402) * Math.PI),
        Math.sin(wrappedNumber(now, 3000) * Math.PI),
        Math.sin(wrappedNumber(now, 2193) * Math.PI),
        Math.sin(wrappedNumber(now, 9107) * Math.PI),
        Math.sin(wrappedNumber(now, 5571) * Math.PI)
    ];

    raytrace.program.uniform.screenSize.setUniformValue(canvas.width, canvas.height);

    gl.bindVertexArray(raytrace.vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, raytrace.spheres);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 3, 6, 0, gl.RGBA, gl.FLOAT, Float32Array.from([
         90, bounce(speed[1], 100, 320), 100, 50, 0.2, 0.7, 0.5, 64, 0.0, 0.0, 1.0, 1,
        210, bounce(speed[2], 50, 270), 300, 50, 0.2, 0.3, 0.5,  8, 0.0, 1.0, 0.0, 1,
        290, bounce(speed[4], 50, 170), 150, 50, 0.2, 0.7, 0.8, 32, 1.0, 0.0, 0.0, 1,
        140, bounce(speed[3], 50, 220), 400, 50, 0.2, 0.8, 0.5, 32, 1.0, 0.8, 0.0, 1,
        110, bounce(speed[0], 50, 130), 200, 50, 0.2, 0.8, 0.0,  1, 1.0, 0.5, 0.0, 1,
        200, 200,                     -1000,1000,0.2, 0.8, 0.1,  4, 0.4, 0.4, 0.4, 1
    ]));

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, raytrace.lights);

    raytrace.program.uniform.spheres.setUniformValue(0);
    raytrace.program.uniform.lights.setUniformValue(1);
    raytrace.program.uniform.antialias.setUniformValue(raytrace.antialias);
    raytrace.program.uniform.reflectionCount.setUniformValue(raytrace.reflect);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

    gl.bindVertexArray(null);

    gl.useProgram(null);

    gl.finish();

//     const duration = (performance.now() - now) * 1000;

//     console.log(`Frame time: ${duration.toFixed(0)}ms`);

    update();
}

function onResize() {
    const canvas = document.getElementById('screen');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const gl = canvas.getContext('webgl2');
    gl.viewport(0, 0, canvas.width, canvas.height);
    update();
}

function createSphereTexture() {
    const canvas = document.getElementById('screen');
    const gl = canvas.getContext('webgl2');
    const raytrace = canvas.raytrace = canvas.raytrace ?? {};
    raytrace.spheres = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, raytrace.spheres);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 3, 6, 0, gl.RGBA, gl.FLOAT, Float32Array.from([
         90, 320, 100, 50, 0.2, 0.7, 0.5, 64, 0.0, 0.0, 1.0, 1,
        210, 270, 300, 50, 0.2, 0.3, 0.5,  8, 0.0, 1.0, 0.0, 1,
        290, 170, 150, 50, 0.2, 0.7, 0.8, 32, 1.0, 0.0, 0.0, 1,
        140, 220, 400, 50, 0.2, 0.8, 0.0,  1, 1.0, 0.8, 0.0, 1,
        110, 130, 200, 50, 0.2, 0.8, 0.5, 32, 1.0, 0.5, 0.0, 1,
        200, 200,-1000,1000,0.2,0.8, 0.0,  1, 0.4, 0.4, 0.4, 1
    ]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // This texture must not have mipmaps, texels (texture pixels) are accessed directly.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function createLightTexture() {
    const canvas = document.getElementById('screen');
    const gl = canvas.getContext('webgl2');
    const raytrace = canvas.raytrace = canvas.raytrace ?? {};
    raytrace.lights = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, raytrace.lights);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB32F, 2, 2, 0, gl.RGB, gl.FLOAT, Float32Array.from([
        -200, +600, 1500, 1.0, 1.0, 1.0,
         600,  400, 1000, 0.0, 0.2, 0.4
    ]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // This texture must not have mipmaps, texels (texture pixels) are accessed directly.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function createRaytraceSurface() {
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
    const canvas = document.getElementById('screen');
    const gl = canvas.getContext('webgl2');

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DITHER);
    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.ZERO, gl.DST_ALPHA);

    const raytrace = canvas.raytrace = canvas.raytrace ?? {};
    raytrace.vao = gl.createVertexArray();
    raytrace.vbo = gl.createBuffer();
    raytrace.ibo = gl.createBuffer();

    gl.bindVertexArray(raytrace.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, raytrace.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, pseudoVertices, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, raytrace.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pseudoIndices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

async function fetchTextFile(url) {
    const response = await fetch(url);
    if(!response.ok) {
        const error = new Error(`Unable to fetch file: ${url}`);
        error.response = response;
        error.url = url;
        throw error;
    }
    return response.text();
}

async function main() {
    const canvas = document.getElementById('screen');
    const gl = canvas.getContext('webgl2');
    const raytrace = canvas.raytrace = canvas.raytrace ?? {};
    raytrace.antialias = 1;
    raytrace.reflect = 2;
    {
        const url = new URL(window.location.href);
        if (url.searchParams.has('antialias')) {
            let maybeAntialias = parseInt(url.searchParams.get('antialias'));
            if (Number.isSafeInteger(maybeAntialias) && maybeAntialias >= 1) {
                raytrace.antialias = Math.min(16, maybeAntialias);
            }
        }
        if (url.searchParams.has('reflect')) {
            let maybe = parseInt(url.searchParams.get('reflect'));
            if (Number.isSafeInteger(maybe) && maybe >= 0) {
                raytrace.reflect = Math.min(8, maybe);
            }
        }
    }
    const sources = {
        vertex: await fetchTextFile(new URL('vertex.glsl', import.meta.url)),
        fragment: await fetchTextFile(new URL('fragment.glsl', import.meta.url))
    }
    raytrace.program = createProgram(gl, sources.vertex, sources.fragment);
    createRaytraceSurface();
    createSphereTexture();
    createLightTexture();
    window.addEventListener('resize', onResize);
    onResize();
}

function freeResources() {
    const canvas = document.getElementById('screen');
    const gl = canvas.getContext('webgl2');
    const raytrace = canvas.raytrace = canvas.raytrace ?? {};

    if (gl.isBuffer(raytrace.vbo)) {
        gl.deleteBuffer(raytrace.vbo);
    }
    if (gl.isBuffer(raytrace.ibo)) {
        gl.deleteBuffer(raytrace.ibo);
    }
    if (gl.deleteVertexArray(raytrace.vao)) {
        gl.deleteVertexArray(raytrace.vao);
    }
    if (gl.isProgram(raytrace.program)) {
        for (const shader of gl.getAttachedShaders(raytrace.program)) {
            if (gl.isShader(shader)) {
                gl.deleteShader(shader);
            }
        }
        gl.deleteProgram(raytrace.program);
    }
    if (gl.isTexture(raytrace.spheres)) {
        gl.deleteTexture(raytrace.spheres);
    }
    if (gl.isTexture(raytrace.lights)) {
        gl.deleteTexture(raytrace.lights);
    }
}

function runMain() {
    main().catch(error => {
        console.error(error);
    });
}

// When using modules there is a possibility for global await in some import.
// In such case this code might be reached after the "load" event fires.
// Unfortunately, the "window" object does not keep a state, but the "document"
// does keep a state, but we must use "readystatechange" API.
if (document.readyState !== 'complete') {
    const onReadyStateChange = function (event) {
        if (document.readyState !== 'loading') {
            document.removeEventListener('readystatechange', onReadyStateChange);
            window.removeEventListener('load', onReadyStateChange);
            setTimeout(runMain, 0);
        }
    };
    document.addEventListener('readystatechange', onReadyStateChange, { passive: true });
    // In case "readystatechange" is not available, this is the best we can do.
    window.addEventListener('load', onReadyStateChange, { once: true, passive: true });
} else {
    setTimeout(runMain, 0);
}

window.addEventListener('unload', freeResources, {
    once: true,
    passive: true
});
