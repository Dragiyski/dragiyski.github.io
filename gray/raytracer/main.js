import '../lib/math/formatter.js';
import { Vector3D, add, cross, mul, normalize, sub, limits as NumberLimits, length, limits } from '../lib/math/index.js';
import { loadBinaryScene } from '../lib/webgpu/raytrace-scene.js';

if (document.readyState !== 'complete') {
    window.addEventListener('load', onFirstLoadedEvent);
    document.addEventListener('readystatechange', onDocumentStateChangeEvent);
    window.addEventListener('beforeunload', onFirstUnloadEvent);
    window.addEventListener('pagehide', onFirstUnloadEvent);
} else {
    main();
}

function onDocumentStateChangeEvent() {
    if (document.readyState === 'complete') {
        onFirstLoadedEvent();
    }
}

function onFirstLoadedEvent() {
    window.removeEventListener('load', onFirstLoadedEvent);
    document.removeEventListener('readystatechange', onDocumentStateChangeEvent);
    main().catch(error => {
        console.error(error);
        unload();
    });
}

function onFirstUnloadEvent() {
    window.removeEventListener('beforeunload', onFirstUnloadEvent);
    window.removeEventListener('pagehide', onFirstUnloadEvent);
    unload();
}

function unload() {
}

async function main() {
    const url = window.raytrace_model_url;
    const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
    });
    const requiredFeatures = [];
    for (const feature of ['timestamp-query', 'timestamp-query-inside-passes']) {
        if (adapter.features.has(feature)) {
            requiredFeatures.push(feature);
        }
    }
    const device = await adapter.requestDevice({ requiredFeatures });
    const workgroupSize = {
        x: 1,
        y: 1
    };
    workgroupSize.y = Math.floor(Math.sqrt(device.limits.maxComputeInvocationsPerWorkgroup));
    workgroupSize.x = Math.floor(device.limits.maxComputeInvocationsPerWorkgroup / workgroupSize.y);
    const imageSize = {
        width: 1440,
        height: 768
    };
    const workgroups = [
        Math.ceil(imageSize.width / workgroupSize.x),
        Math.ceil(imageSize.height / workgroupSize.y)
    ];
    const binary = await (await fetch(url, { cache: 'force-cache' })).arrayBuffer();
    const sceneData = await loadBinaryScene(device, binary);
    const uniformBuffer = device.createBuffer({
        size: Math.ceil(80 / device.limits.minUniformBufferOffsetAlignment) * device.limits.minUniformBufferOffsetAlignment,
        usage: GPUBufferUsage.UNIFORM,
        mappedAtCreation: true
    });
    {
        const buffer = uniformBuffer.getMappedRange();
        const dataView = new DataView(buffer);
        dataView.setUint32(0, imageSize.width, true);
        dataView.setUint32(4, imageSize.height, true);
        dataView.setUint32(8, sceneData.startIndex, true);
        const cameraOrigin = Vector3D.using(new Float32Array(buffer, 16, 3));
        const screenCenter = Vector3D.using(new Float32Array(buffer, 32, 3));
        const screenRight = Vector3D.using(new Float32Array(buffer, 48, 3));
        const screenUp = Vector3D.using(new Float32Array(buffer, 64, 3));
        cameraOrigin.xyz = window.camera_origin;
        const cameraForward = normalize(sub(Vector3D.from(window.camera_target), cameraOrigin));
        add(cameraOrigin, cameraForward).into(screenCenter);
        const fieldOfView = ((60 / 2) / 180) * Math.PI;
        const aspectRatio = imageSize.width / imageSize.height;
        const diagonalSize = Math.tan(fieldOfView);
        const worldHalfScreenHeight = diagonalSize / Math.sqrt(1 + aspectRatio * aspectRatio);
        const worldHalfScreenWidth = aspectRatio * worldHalfScreenHeight;
        // Z = up (note: it is division by 0 if looking exactly up and exactly down)
        let worldScreenRightNormal = cross(cameraForward, Vector3D.from([0, 0, 1]));
        let worldScreenUpNormal;
        if (length(worldScreenRightNormal) < limits.float32.epsilon) {
            worldScreenUpNormal = cross(cameraForward, Vector3D.from([1, 0, 0]));
        } else {
            worldScreenRightNormal = normalize(worldScreenRightNormal);
            worldScreenUpNormal = cross(cameraForward, worldScreenRightNormal);
        }
        mul(worldHalfScreenWidth, worldScreenRightNormal).into(screenRight);
        mul(worldHalfScreenWidth, worldScreenUpNormal).into(screenUp);
        uniformBuffer.unmap();
    }
    const colorTexture = device.createTexture({
        size: {
            width: imageSize.width,
            height: imageSize.height
        },
        dimension: '2d',
        format: 'rgba8unorm',
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC
    });
    const readBuffer = device.createBuffer({
        size: (Math.ceil(imageSize.width / 256) * 256) * imageSize.height * 4,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    });
    let measureQuerySet = null;
    let measureBufferWrite = null;
    let measureBufferRead = null;
    if (device.features.has('timestamp-query')) {
        measureQuerySet = device.createQuerySet({
            type: 'timestamp',
            count: 2
        });
        measureBufferWrite = device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.QUERY_RESOLVE
        });
        measureBufferRead = device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
        });
    }
    const shaderCode = await (await fetch(new URL('main.wgsl', import.meta.url))).text();
    const shaderModule = device.createShaderModule({
        code: shaderCode
    });
    const pipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [
                device.createBindGroupLayout({
                    entries: [
                        {
                            binding: 0,
                            visibility: GPUShaderStage.COMPUTE,
                            buffer: {
                                type: 'read-only-storage'
                            }
                        },
                        {
                            binding: 1,
                            visibility: GPUShaderStage.COMPUTE,
                            buffer: {
                                type: 'read-only-storage'
                            }
                        },
                        {
                            binding: 2,
                            visibility: GPUShaderStage.COMPUTE,
                            buffer: {
                                type: 'read-only-storage'
                            }
                        },
                        {
                            binding: 3,
                            visibility: GPUShaderStage.COMPUTE,
                            buffer: {
                                type: 'read-only-storage'
                            }
                        }
                    ]
                }),
                device.createBindGroupLayout({
                    entries: [
                        {
                            binding: 0,
                            visibility: GPUShaderStage.COMPUTE,
                            storageTexture: {
                                access: 'write-only',
                                format: 'rgba8unorm',
                                viewDimension: '2d'
                            }
                        }
                    ]
                }),
                device.createBindGroupLayout({
                    entries: [
                        {
                            binding: 0,
                            visibility: GPUShaderStage.COMPUTE,
                            buffer: {
                                type: 'uniform',
                                minBindingSize: 80
                            }
                        }
                    ]
                })
            ]
        }),
        compute: {
            module: shaderModule,
            entryPoint: 'main',
            constants: {
                workgroup_size_x: workgroupSize.x,
                workgroup_size_y: workgroupSize.y
            }
        }
    });
    const encoder = device.createCommandEncoder();
    const computePassArgs = [];
    if (measureQuerySet != null) {
        computePassArgs.push({
            timestampWrites: {
                querySet: measureQuerySet,
                beginningOfPassWriteIndex: 0,
                endOfPassWriteIndex: 1
            }
        });
    }
    const pass = encoder.beginComputePass(...computePassArgs);
    pass.setPipeline(pipeline);
    const groups = [
        device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: sceneData.float.gpuBuffer,
                        offset: 0,
                        size: sceneData.float.byteLength
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: sceneData.int.gpuBuffer,
                        offset: 0,
                        size: sceneData.int.byteLength
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: sceneData.object.gpuBuffer,
                        offset: 0,
                        size: sceneData.object.byteLength
                    }
                },
                {
                    binding: 3,
                    resource: {
                        buffer: sceneData.tree.gpuBuffer,
                        offset: 0,
                        size: sceneData.tree.byteLength
                    }
                }
            ]
        }),
        device.createBindGroup({
            layout: pipeline.getBindGroupLayout(1),
            entries: [
                {
                    binding: 0,
                    resource: colorTexture.createView()
                }
            ]
        }),
        device.createBindGroup({
            layout: pipeline.getBindGroupLayout(2),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: uniformBuffer,
                        offset: 0,
                        size: 80
                    }
                }
            ]
        })
    ];
    for (let i = 0; i < groups.length; ++i) {
        pass.setBindGroup(i, groups[i]);
    }
    pass.dispatchWorkgroups(...workgroups);
    pass.end();
    encoder.copyTextureToBuffer({
        texture: colorTexture
    }, {
        buffer: readBuffer,
        offset: 0,
        bytesPerRow: Math.ceil(imageSize.width * 4 / 256) * 256,
        rowsPerImage: imageSize.height
    }, {
        width: imageSize.width,
        height: imageSize.height
    });
    if (measureQuerySet != null) {
        encoder.resolveQuerySet(measureQuerySet, 0, 2, measureBufferWrite, 0);
        encoder.copyBufferToBuffer(measureBufferWrite, 0, measureBufferRead, 0, 16);
    }
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
    await device.queue.onSubmittedWorkDone();
    await readBuffer.mapAsync(GPUMapMode.READ);
    await measureBufferRead.mapAsync(GPUMapMode.READ);
    const readBufferData = readBuffer.getMappedRange();
    const measureBufferData = measureBufferRead.getMappedRange();
    const measureBufferDataView = new DataView(measureBufferData);
    const raytraceTime = measureBufferDataView.getBigUint64(8, true) - measureBufferDataView.getBigUint64(0, true);
    const imageData = new ImageData(imageSize.width, imageSize.height);
    const rowByteLength = Math.ceil(imageSize.width * 4 / 256) * 256;
    for (let y = 0; y < imageSize.height; ++y) {
        imageData.data.set(new Uint8ClampedArray(readBufferData, y * rowByteLength, imageData.width * 4), y * imageData.width * 4);
    }
    const imageBitmap = await createImageBitmap(imageData);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = imageSize.width;
    canvas.height = imageSize.height;
    context.drawImage(imageBitmap, 0, 0);
    document.body.appendChild(canvas);
    const ms_int = Number(raytraceTime / 1000000n);
    let ms_frac = '000000' + (raytraceTime % 1000000n).toString(10);
    ms_frac = ms_frac.substring(ms_frac.length - 6);
    console.log(`Raytrace Time: ${ms_int}.${ms_frac}ms`);
    const debug_element = document.getElementById('debug');
    if (debug_element != null) {
        debug_element.textContent = `${ms_int}.${ms_frac}ms`;
    }
}
