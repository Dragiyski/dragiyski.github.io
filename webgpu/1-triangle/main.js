import '../patch.js';

async function main() {
    const canvas = document.getElementById('screen');
    const context = canvas.getContext('webgpu');
    if (context == null) {
        throw new Error('GPUCanvasContext not supported.');
    }
    if (typeof navigator?.gpu?.requestAdapter !== 'function') {
        throw new Error('WebGPU not supported');
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter == null) {
        throw new Error('WebGPU Error: Unable to get an adapter');
    }
    const device = await adapter.requestDevice();
    if (device == null) {
        throw new Error('WebGPU Error: Unable to get a device');
    }
    let resizeHandler = resizeFirst;

    const vertexBuffer = device.createBuffer({
        size: Math.ceil((3 * 2 * 4) / 256) * 256,
        mappedAtCreation: true,
        usage: GPUBufferUsage.VERTEX
    });
    {
        const buffer = vertexBuffer.getMappedRange();
        const array = new Float32Array(buffer, 0, 3 * 2);
        array.set([
            +0.0,
            +0.5,
            -0.5,
            -0.5,
            +0.5,
            -0.5
        ]);
        vertexBuffer.unmap();
    }
    const indexBuffer = device.createBuffer({
        size: Math.ceil((3 * 2) / 256) * 256,
        mappedAtCreation: true,
        usage: GPUBufferUsage.INDEX
    });
    {
        const buffer = indexBuffer.getMappedRange();
        const array = new Uint16Array(buffer, 0, 3);
        array.set([0, 1, 2]);
        indexBuffer.unmap();
    }

    const uniformBuffer = device.createBuffer({
        size: Math.ceil((3 * 4) / 256) * 256,
        mappedAtCreation: true,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    {
        const buffer = uniformBuffer.getMappedRange();
        const array = new Float32Array(buffer, 0, 3);
        array.set(getTransientColor());
        uniformBuffer.unmap();
    }

    const shaderSource = await (await fetch(new URL('shader.wgsl', import.meta.url))).text();
    const shader = device.createShaderModule({ code: shaderSource });
    const format = navigator.gpu.getPreferredCanvasFormat();

    const layoutGroup0 = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform'
                }
            }
        ]
    });

    const bindGroup0 = device.createBindGroup({
        layout: layoutGroup0,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniformBuffer
                }
            }
        ]
    });
    const layout = device.createPipelineLayout({ bindGroupLayouts: [layoutGroup0] });

    const pipeline = device.createRenderPipeline({
        // Pipeline layout objects are not backed-up by Vulkan API and may disappear in favour of descriptor object.
        layout,
        vertex: {
            module: shader,
            entryPoint: 'vertex_main',
            buffers: [
                {
                    arrayStride: 2 * 4,
                    stepMode: 'vertex',
                    attributes: [
                        {
                            format: 'float32x2',
                            offset: 0,
                            shaderLocation: 0
                        }
                    ]
                }
            ]
        },
        fragment: {
            module: shader,
            entryPoint: 'fragment_main',
            targets: [
                {
                    format
                }
            ]
        },
        primitive: {
            topology: 'triangle-list'
        }
    });

    requestAnimationFrame(frame);

    function resize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        context.configure({
            device,
            format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            alphaMode: 'opaque'
        });
    }

    function resizeFirst() {
        resize();
        resizeHandler = resizeIfNeeded;
    }

    function resizeIfNeeded() {
        if (canvas.clientWidth !== canvas.width || canvas.clientHeight !== canvas.height) {
            resize();
        }
    }

    function frame() {
        resizeHandler();
        const canvasTexture = context.getCurrentTexture();
        const canvasTextureView = canvasTexture.createView();
        const commandEncoder = device.createCommandEncoder();
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: canvasTextureView,
                    clearValue: [0.0, 0.0, 0.0, 1.0],
                    loadOp: 'clear',
                    storeOp: 'store'
                }
            ]
        });
        {
            const uniformArrayBuffer = new ArrayBuffer(3 * 4);
            const uniformArrayBufferFloat = new Float32Array(uniformArrayBuffer, 0, 3);
            uniformArrayBufferFloat.set(getTransientColor());
            device.queue.writeBuffer(uniformBuffer, 0, uniformArrayBuffer, 0, 3 * 4);
        }
        renderPass.setBindGroup(0, bindGroup0);
        renderPass.setViewport(0, 0, canvas.width, canvas.height, 0.0, 1.0);
        renderPass.setPipeline(pipeline);
        renderPass.setVertexBuffer(0, vertexBuffer);
        renderPass.setIndexBuffer(indexBuffer, 'uint16');
        renderPass.drawIndexed(3);
        renderPass.end();

        const commandBuffer = commandEncoder.finish();

        device.queue.submit([commandBuffer]);

        requestAnimationFrame(frame);
    }
}

function runMain() {
    main().catch(error => {
        console.error(error);
    });
}

if (document.readyState !== 'complete') {
    const onReadyStateChange = function () {
        if (document.readyState === 'complete') {
            document.removeEventListener('readystatechange', onReadyStateChange);
            runMain();
        }
    };
    document.addEventListener('readystatechange', onReadyStateChange, { passive: true });
} else {
    runMain();
}

function getTransientColor() {
    const timestamp = Date.now() / 1000;
    const redCycle = Math.sqrt(5);
    const greenCycle = Math.sqrt(7);
    const blueCycle = Math.sqrt(6.33);
    const red = -Math.cos((timestamp / redCycle) * (2 * Math.PI)) * 0.5 + 0.5;
    const green = -Math.cos((timestamp / greenCycle) * (2 * Math.PI)) * 0.5 + 0.5;
    const blue = -Math.cos((timestamp / blueCycle) * (2 * Math.PI)) * 0.5 + 0.5;
    return [red, green, blue];
}
