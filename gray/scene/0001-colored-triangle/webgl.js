/* eslint-disable array-element-newline */
import OpenGLScene from '../../lib/gl-scene.js';
import createProgram from '../../lib/gl-program.js';

const this_url = import.meta.url;

async function loadShader(url) {
    return (await fetch(new URL(url, this_url))).text();
}

export class Scene extends OpenGLScene {
    async loadResources() {
        const jobs = [
            loadShader('shaders/vertshader.glsl').then(source => {
                return this.vertex_source = source;
            }),
            loadShader('shaders/fragshader.glsl').then(source => {
                return this.fragment_source = source;
            })
        ];
        return Promise.all(jobs);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onCreate(gl, context) {
        super.onCreate(gl, context);

        context.program = createProgram(gl, this.vertex_source, this.fragment_source);

        const arrayBufferData = Float32Array.from([
            -1.0, -1.0, +1.0, +0.0, +0.0,
            +1.0, -1.0, +0.0, +1.0, +0.0,
            +0.0, +1.0, +0.0, +0.0, +1.0
        ]);

        context.vao = gl.createVertexArray();
        context.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, context.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, arrayBufferData, gl.STATIC_DRAW);
        gl.bindVertexArray(context.vao);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 5 * 4, 0 * 4);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.clearColor(0.2, 0.5, 0.7, 1.0);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Object} context
     */
    onPaint(gl, context) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(context.program);
        gl.bindVertexArray(context.vao);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.bindVertexArray(null);
        gl.useProgram(null);
    }
}
