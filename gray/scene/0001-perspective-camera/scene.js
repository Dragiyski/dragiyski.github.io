/* eslint-disable array-element-newline */
import OpenGLScene from '../../lib/gl-scene.js';
import { loadTextFile } from '../../lib/loader.js';

const script_url = import.meta.url;
const files = Object.assign(Object.create(null), {
    compute: 'shader/compute.glsl',
    camera: 'shader/camera.glsl'
});

export class Scene extends OpenGLScene {
    async loadResources() {
        const jobs = [];
        this.shader_files = {};
        for (const name in files) {
            const url = new URL(files[name], script_url);
            jobs.push(loadTextFile(url).then(source => {
                if (typeof source !== 'string' || source.length <= 0) {
                    throw new Error(`Unable to load file: ${url}`);
                }
                this.shader_files[name] = source;
            }));
        }
        return Promise.all(jobs);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} context
     */
    onCreate(gl, context) {
        super.onCreate(gl, context);

        {
            context.vertexArray = gl.createVertexArray();
            const vertexBuffer = gl.createBuffer();
            const indexBuffer = gl.createBuffer();

            const vertexBufferData = Float32Array.from([
                -1, +1,
                -1, -1,
                +1, -1,
                +1, +1
            ]);
            const indexBufferData = Uint8Array.from([
                0, 1, 2,
                0, 2, 3
            ]);

            gl.bindVertexArray(context.vertexArray);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBufferData, gl.STATIC_DRAW);

            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);

            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
    }
}
