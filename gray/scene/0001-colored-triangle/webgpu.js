/* eslint-disable array-element-newline */
import WebGPUScreen from '../../lib/webgpu-screen.js';
import WebGPUScene from '../../lib/webgpu-scene.js';

const this_url = import.meta.url;

async function loadShader(url) {
    return (await fetch(new URL(url, this_url))).text();
}

export class Scene extends WebGPUScene {
    async loadResources() {
        this.adapter = await navigator.gpu.requestAdapter();
        this.device = await this.adapter.requestDevice();
        this.shader_source = await loadShader('shaders/shader.wgsl');
        this.format = 'rgba8unorm';
    }

    /**
     * @param {WebGPUScreen} screen
     * @param {Object} context
     */
    onCreate(screen, context) {
        console.log('onCreate');
        this.shader_module = this.device.createShaderModule({ code: this.shader_source });
        this.render_pipeline = this.device.createRenderPipeline({
            vertex: {
                module: this.shader_module,
                entryPoint: 'vertex_main',
                buffers: [
                    {
                        arrayStride: 5 * 4,
                        attributes: [
                            {
                                format: 'float32x2',
                                offset: 0,
                                shaderLocation: 0
                            },
                            {
                                format: 'float32x3',
                                offset: 2 * 4,
                                shaderLocation: 1
                            }
                        ]
                    }
                ]
            },
            fragment: {
                module: this.shader_module,
                entryPoint: 'fragment_main',
                targets: [
                    {
                        format: this.format
                    }
                ]
            }
        });
        this.vbo = this.device.createBuffer({
            size: 3 * 5 * 4,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true
        });
        const buffer = this.vbo.getMappedRange();
        const array_f32 = new Float32Array(buffer);
        array_f32.set([
            -1.0, -1.0, +1.0, +0.0, +0.0,
            +1.0, -1.0, +0.0, +1.0, +0.0,
            +0.0, +1.0, +0.0, +0.0, +1.0
        ]);
        this.vbo.unmap();
    }

    onStart(screen, context) {
        console.log('onStart');
        screen.context.configure({
            format: this.format,
            device: this.device
        });
    }

    onResize(screen, context) {
        console.log('onResize');
        screen.context.configure({
            format: this.format,
            device: this.device
        });
    }

    /**
     * @param {WebGPUScreen} screen
     * @param {Object} context
     */
    onPaint(screen, context) {
        console.log('onPaint');
        const ce = this.device.createCommandEncoder();
        const view = screen.context.getCurrentTexture().createView();
        const pass = ce.beginRenderPass({
            colorAttachments: [
                {
                    view,
                    loadOp: 'clear',
                    storeOp: 'store',
                    clearValue: {
                        r: 0.2,
                        g: 0.5,
                        b: 0.7,
                        a: 1.0
                    },
                    loadValue: {
                        r: 0.2,
                        g: 0.5,
                        b: 0.7,
                        a: 1.0
                    }
                }
            ]
        });
        pass.setPipeline(this.render_pipeline);
        pass.setVertexBuffer(0, this.vbo);
        pass.draw(3);
        pass.end();

        const cb = ce.finish();
        this.device.queue.submit([cb]);
    }
}
