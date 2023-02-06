/* eslint-disable array-element-newline */
import { getShaderCode } from "./utils.js";

/**
 * @param {WebGL2RenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 */
export async function initializeGL(gl, canvas) {
    console.log('GL Version: %s', gl.getParameter(gl.VERSION));
    const vertexCode = await getShaderCode('shaders/vertshader.glsl');
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexCode);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(vertexShader);
        throw new Error('ShaderCompileError: Vertex shader compilation failed\n' + log);
    }
    const fragmentCode = await getShaderCode('shaders/fragshader.glsl');
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentCode);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(fragmentShader);
        throw new Error('ShaderCompileError: Fragment shader compilation failed\n' + log);
    }
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program);
        throw new Error('ProgramLinkError: Program link failed\n' + log);
    }
    canvas.program = program;
    canvas.vertexShader = vertexShader;
    canvas.fragmentShader = fragmentShader;

    const arrayBufferData = Float32Array.from([
        /* x y r g b */
        -1.0, -1.0, +1.0, +0.0, +0.0,
        +1.0, -1.0, +0.0, +1.0, +0.0,
        +0.0, +1.0, +0.0, +0.0, +1.0
    ]);

    canvas.vao = gl.createVertexArray();
    canvas.vbo = gl.createBuffer();

    gl.bindVertexArray(canvas.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, canvas.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, arrayBufferData, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    // Stride is 5 * sizeof Float32Array element = 4
    // Each vertex has 5 float values before the next vertex, so adding 20 bytes give the next value in the attribute.
    // So: vertex[7].attribute[0] will be at: 7 * (5 * 4) + (0 * 4) and it will be 2 float vector (2 * 32-bit);
    // and: vertex[9].attribute[1] will be at: 9 * (5 * 4) + (2 * 4) and it will be 3 float vector (3 * 32-bit);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 5 * 4, 0 * 4);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.clearColor(0.2, 0.5, 0.7, 1.0);
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 */
export function uninitializeGL(gl, canvas) {
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);
    gl.deleteVertexArray(canvas.vao);
    gl.deleteBuffer(canvas.vbo);
    gl.deleteProgram(canvas.program);
    gl.deleteShader(canvas.vertexShader);
    gl.deleteShader(canvas.fragmentShader);
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 */
export function resizeGL(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 */
export function paintGL(gl, canvas) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(canvas.program);
    gl.bindVertexArray(canvas.vao);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindVertexArray(null);
    gl.useProgram(null);
}
