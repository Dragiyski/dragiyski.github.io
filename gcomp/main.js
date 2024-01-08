let isLoaded = false;

const shaderSource = {
    main: await (await fetch(new URL('main.wgsl', import.meta.url))).text()
};

const Main = {
    async run() {
        this.adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });
        console.log('Adapter features: ', [...this.adapter.features.keys()]);
        console.log('Adapter limits: ', this.adapter.limits);
        const optionalFeatures = [];
        if (this.adapter.features.has('timestamp-query')) {
            optionalFeatures.push('timestamp-query');
        }
        this.device = await this.adapter.requestDevice({
            requiredFeatures: optionalFeatures,
            requiredLimits: {
                maxBufferSize: this.adapter.limits.maxBufferSize,
                maxStorageBufferBindingSize: this.adapter.limits.maxStorageBufferBindingSize,
                maxComputeInvocationsPerWorkgroup: this.adapter.limits.maxComputeInvocationsPerWorkgroup,
                maxComputeWorkgroupSizeX: this.adapter.limits.maxComputeWorkgroupSizeX,
                maxComputeWorkgroupSizeY: this.adapter.limits.maxComputeWorkgroupSizeY,
                maxComputeWorkgroupSizeZ: this.adapter.limits.maxComputeWorkgroupSizeZ,
                maxComputeWorkgroupStorageSize: this.adapter.limits.maxComputeWorkgroupStorageSize,
                maxComputeWorkgroupsPerDimension: this.adapter.limits.maxComputeWorkgroupsPerDimension
            }
        });
        console.log('Device features: ', [...this.device.features.keys()]);
        console.log('Device limits: ', this.device.limits);

        if (this.device.features.has('timestamp-query')) {
            this.timestampQuerySet = this.device.createQuerySet({
                type: 'timestamp',
                count: 2
            });
            this.timestampWriteBuffer = this.device.createBuffer({
                size: 256,
                usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
                mappedAtCreation: false
            });
            this.timestampReadBuffer = this.device.createBuffer({
                size: 2 * 8,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
            });
        }

        this.screen = document.getElementById('screen');
        this.frameInfo = document.getElementById('frame-info');
        this.context = this.screen.getContext('webgpu');

        this.layoutGroup0 = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'storage',
                        hasDynamicOffset: false
                    }
                }
            ]
        });
        this.layout = this.device.createPipelineLayout({
            bindGroupLayouts: [
                this.layoutGroup0
            ]
        });
        this.shader = this.device.createShaderModule({
            code: shaderSource.main,
            compilationHints: [
                {
                    entryPoint: 'main',
                    layout: this.layout
                }
            ]
        });

        this.grid = {};
        this.grid.y = this.device.limits.maxComputeInvocationsPerWorkgroup / this.device.limits.maxComputeWorkgroupSizeX;
        if (Number.isSafeInteger(this.grid.y)) {
            this.grid.x = this.device.limits.maxComputeWorkgroupSizeX;
            this.grid.z = 1;
        } else {
            let total = this.device.limits.maxComputeInvocationsPerWorkgroup;
            const mid = Math.floor(Math.pow(total, 1 / 3));
            this.grid.z = Math.max(1, Math.floor(total / (mid * mid)));
            total = Math.floor(total / mid);
            this.grid.y = Math.max(1, Math.floor(total / mid));
            this.grid.x = total / mid;
        }

        this.pipeline = this.device.createComputePipeline({
            compute: {
                module: this.shader,
                entryPoint: 'main',
                constants: {
                    grid_x: this.grid.x,
                    grid_y: this.grid.y,
                    grid_z: this.grid.z
                }
            },
            layout: this.layout
        });
        this.memoryBufferSize = Math.min(this.device.limits.maxStorageBufferBindingSize, 1024 * 1024 * 1024);

        this.listener_onScreenMouseClick = this.onScreenMouseClick.bind(this);
        this.listener_onPointerLockChange = this.onPointerLockChange.bind(this);
        this.listener_animationFrame = this.animationFrame.bind(this);
        document.addEventListener('pointerlockchange', this.listener_onPointerLockChange);
        this.screen.addEventListener('click', this.listener_onScreenMouseClick);
    },

    onPointerLockChange(event) {
        if (document.pointerLockElement === this.screen) {
            this.startRender();
        } else {
            this.stopRender();
        }
    },

    onScreenMouseClick(event) {
        if (event.button !== 0) {
            return;
        }
        if (document.pointerLockElement === this.screen) {
            return;
        }
        if (document.pointerLockElement != null) {
            return;
        }
        event.preventDefault();
        const maybePromise = this.screen.requestPointerLock({
            unadjustedMovement: true
        });
        if (!maybePromise) {
            return;
        }
        maybePromise.then(() => {
        }, error => {
            this.screen.requestPointerLock();
        });
    },

    initMemoryBuffer() {
        this.memoryBuffer = this.device.createBuffer({
            size: this.memoryBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
            mappedAtCreation: false
        });
        this.bindGroup0 = this.device.createBindGroup({
            layout: this.layoutGroup0,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.memoryBuffer,
                        offset: 0,
                        size: this.memoryBufferSize
                    }
                }
            ]
        });

        // TODO: This must go into the resize handler, but for now here is good enough.
        this.screen.width = this.screen.clientWidth;
        this.screen.height = this.screen.clientHeight;
        this.context.configure({
            device: this.device,
            format: 'rgba8unorm',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });
    },

    freeMemoryBuffer() {
        delete this.bindGroup0;
        this.memoryBuffer.destroy();
    },

    startRender() {
        if (!this.isRendering) {
            this.initMemoryBuffer();
            this.isRendering = true;
            this.nextFrameId = requestAnimationFrame(this.listener_animationFrame);
        }
    },

    stopRender() {
        if (this.isRendering) {
            if (this.nextFrameId != null) {
                cancelAnimationFrame(this.nextFrameId);
            }
            this.isRendering = false;
            this.freeMemoryBuffer();
        }
    },

    animationFrame() {
        console.log('Animation Frame');
        this.nextFrameId = null;
        const cameraBuffer = this.device.createBuffer({
            size: 16 * 4,
            usage: GPUBufferUsage.COPY_SRC,
            mappedAtCreation: true
        });
        const width = this.screen.width;
        const height = this.screen.height;
        {
            const cameraBufferArray = cameraBuffer.getMappedRange();
            const cameraBufferUint = new Uint32Array(cameraBufferArray);
            const cameraBufferFloat = new Float32Array(cameraBufferArray);
            cameraBufferFloat[0] = 0.0;
            cameraBufferFloat[1] = 0.0;
            cameraBufferFloat[2] = -2.0;
            cameraBufferFloat[3] = 1.0;
            cameraBufferFloat[4] = 0.0;
            cameraBufferFloat[5] = 0.0;
            cameraBufferFloat[6] = 1.0;
            cameraBufferFloat[7] = 1.0;
            cameraBufferUint[8] = width;
            cameraBufferUint[9] = height;
            cameraBufferFloat[10] = (60 / 180) * Math.PI;
            cameraBufferFloat[11] = 0.0;
            cameraBufferUint[12] = 0;
            cameraBufferUint[13] = 0;
            cameraBufferUint[14] = 16;
            cameraBufferUint[15] = 0;
        }
        cameraBuffer.unmap();

        const commandEncoder = this.device.createCommandEncoder();

        commandEncoder.copyBufferToBuffer(cameraBuffer, 0, this.memoryBuffer, 0, 16 * 4);

        {
            const computePassArgs = [];
            if (this.device.features.has('timestamp-query') && this.timestampQuerySet != null) {
                computePassArgs.push({
                    timestampWrites: {
                        querySet: this.timestampQuerySet,
                        beginningOfPassWriteIndex: 0,
                        endOfPassWriteIndex: 1
                    }
                });
            }
            const computePass = commandEncoder.beginComputePass(...computePassArgs);
            computePass.setPipeline(this.pipeline);
            computePass.setBindGroup(0, this.bindGroup0);
            computePass.dispatchWorkgroups(256);
            computePass.end();
        }

        commandEncoder.copyBufferToTexture({
            buffer: this.memoryBuffer,
            offset: 256 * 4,
            bytesPerRow: (Math.ceil(width / 64) * 64) * 4,
            rowsPerImage: height
        }, {
            texture: this.context.getCurrentTexture()
        }, {
            width,
            height,
            depthOrArrayLayers: 1
        });

        if (this.device.features.has('timestamp-query') && this.timestampQuerySet != null) {
            commandEncoder.resolveQuerySet(this.timestampQuerySet, 0, 2, this.timestampWriteBuffer, 0);
            commandEncoder.copyBufferToBuffer(this.timestampWriteBuffer, 0, this.timestampReadBuffer, 0, 2 * 8);
        }

        const commandBuffer = commandEncoder.finish();
        this.device.queue.submit([commandBuffer]);
        this.device.queue.onSubmittedWorkDone().then(async () => {
            if (this.device.features.has('timestamp-query') && this.timestampQuerySet != null && this.frameInfo != null) {
                await this.timestampReadBuffer.mapAsync(GPUMapMode.READ);
                const timestampBuffer = this.timestampReadBuffer.getMappedRange();
                const timestampArray = new BigUint64Array(timestampBuffer);
                const duration = timestampArray[1] - timestampArray[0];
                this.timestampReadBuffer.unmap();
                const seconds = (duration / 1000000n).toString(10);
                let milliseconds = (duration % 1000000n).toString(10);
                while (milliseconds.length < 6) {
                    milliseconds = '0' + milliseconds;
                }
                this.frameInfo.textContent = `${seconds}.${milliseconds} ms`;
            }
            if (this.isRendering && this.nextFrameId == null) {
                this.nextFrameId = requestAnimationFrame(this.listener_animationFrame);
            }
        });
    }
};

if (document.readyState !== 'complete') {
    window.addEventListener('load', onFirstLoadedEvent);
    document.addEventListener('readystatechange', onDocumentStateChangeEvent);
    window.addEventListener('beforeunload', onFirstUnloadEvent);
    window.addEventListener('pagehide', onFirstUnloadEvent);
} else {
    runMain();
}

function onDocumentStateChangeEvent() {
    if (document.readyState === 'complete') {
        onFirstLoadedEvent();
    }
}

function onFirstLoadedEvent() {
    window.removeEventListener('load', onFirstLoadedEvent);
    document.removeEventListener('readystatechange', onDocumentStateChangeEvent);
    runMain();
}

function onFirstUnloadEvent() {
    window.removeEventListener('beforeunload', onFirstUnloadEvent);
    window.removeEventListener('pagehide', onFirstUnloadEvent);
    unload();
}

function unload() {
    isLoaded = false;
}

function runMain() {
    Main.run().catch(error => {
        console.error(error);
        unload();
    });
}
