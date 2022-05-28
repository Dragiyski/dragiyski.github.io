/* eslint-disable camelcase */
/* global GPURenderPassEncoder, GPUCommandEncoder */
if (navigator.gpu != null) {
    const GPU_prototype = Object.getPrototypeOf(navigator.gpu);
    if (GPU_prototype != null) {
        if (typeof GPU_prototype.getPreferredCanvasFormat !== 'function') {
            /**
             * Chromium replaced GPUCanvasContext.prototype.getPreferredFormat(GPUAdapter)
             * with GPU.prototype.getPreferredCanvasFormat() with adapter not required.
             *
             * Firefox still requires adapter, which must be obtained asynchrnously...
             */
            const defaultAdapter = await navigator.gpu.requestAdapter();
            const canvas = document?.createElement?.('canvas');
            const context = canvas?.getContext?.('webgpu');
            if (defaultAdapter != null && context != null && typeof context.getPreferredFormat === 'function') {
                GPU_prototype.getPreferredCanvasFormat = context.getPreferredFormat.bind(context, defaultAdapter);
            }
        }
    }
    /**
     * Chromium GPURenderPassEncoder.prototype.endPass is deprecated in favour of GPURenderPassEncoder.prototype.end
     * Firefox nightly still uses GPURenderPassEncoder.prototype.endPass
     */
    if (typeof GPURenderPassEncoder === 'function' && GPURenderPassEncoder.prototype != null) {
        if (typeof GPURenderPassEncoder.prototype.end !== 'function' && typeof GPURenderPassEncoder.prototype.endPass === 'function') {
            GPURenderPassEncoder.prototype.end = GPURenderPassEncoder.prototype.endPass;
        }
    }
    /**
     * Firefox still requires "colorAttachments" to have "loadValue", while chromium deprecated it in favour of "clearValue" and "loadOp";
     */
    if (typeof GPUCommandEncoder === 'function' && GPUCommandEncoder.prototype != null) {
        if (typeof GPUCommandEncoder.prototype.beginRenderPass === 'function') {
            const GPUCommandEncoder_beginRenderPass = GPUCommandEncoder.prototype.beginRenderPass;
            Object.defineProperty(GPUCommandEncoder.prototype, 'beginRenderPass', {
                configurable: true,
                writable: true,
                value: function beginRenderPass(descriptor) {
                    if (descriptor != null) {
                        descriptor = { ...descriptor };
                        if (descriptor.colorAttachments != null) {
                            descriptor.colorAttachments = [...descriptor.colorAttachments];
                            descriptor.colorAttachments.forEach(attachment => {
                                if (attachment.clearValue != null) {
                                    attachment.loadValue = attachment.clearValue;
                                }
                            });
                        }
                    }
                    return GPUCommandEncoder_beginRenderPass.apply(this, arguments);
                }
            });
        }
    }
}
