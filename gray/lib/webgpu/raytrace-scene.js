import { Vector4D } from '../math/index.js';

/**
 * @param {GPUDevice} device
 * @param {string|URL} url
 */
export async function loadBinaryScene(device, binary) {
    let byteOffset = 0;
    let byteLength;
    if (ArrayBuffer.isView(binary)) {
        byteOffset = binary.byteOffset;
        byteLength = binary.byteLength;
        binary = binary.buffer;
    } else if (binary instanceof ArrayBuffer) {
        byteLength = binary.byteLength;
    }
    if (byteLength < 20) {
        throw new TypeError('The provided binary is not long enough to contain raytracing scene: expected 20 byte header at least');
    }
    const header = new Int32Array(binary, byteOffset, 20);
    if (header.slice(1, 5).some(n => n < 0)) {
        throw new TypeError('The provided binary is not a proper format: All lengths must be non-zero');
    }
    const totalLength = header[1] * 4 + header[2] * 4 + header[3] * 4 * 4 + header[4] * 4 * 4;
    if (byteLength < totalLength + 20) {
        throw new TypeError('The provided binary is not a proper format: the sum of all 4 data sources length is longer than the binary');
    }
    const initialIndex = header[0];
    if (initialIndex < 0 || initialIndex > header[4]) {
        throw new TypeError('The provided binary is not a proper format: the initial index is not within the bounds of the tree data');
    }
    const data = Object.create(null);
    data.float = Object.create(null);
    data.int = Object.create(null);
    data.object = Object.create(null);
    data.tree = Object.create(null);
    data.startIndex = initialIndex;
    data.float.itemByteLength = data.int.itemByteLength = 4;
    data.object.itemByteLength = data.tree.itemByteLength = 4 * 4;
    let indexStart = 20;
    let indexEnd = 20 + header[1] * data.float.itemByteLength;
    data.float.buffer = binary.slice(indexStart, indexEnd);
    indexStart = indexEnd;
    indexEnd += header[2] * data.int.itemByteLength;
    data.int.buffer = binary.slice(indexStart, indexEnd);
    indexStart = indexEnd;
    indexEnd += header[3] * data.object.itemByteLength;
    data.object.buffer = binary.slice(indexStart, indexEnd);
    indexStart = indexEnd;
    indexEnd += header[4] * data.tree.itemByteLength;
    data.tree.buffer = binary.slice(indexStart, indexEnd);

    for (const name of ['float', 'int', 'object', 'tree']) {
        data[name].gpuByteLength = Math.ceil(data[name].buffer.byteLength / device.limits.minStorageBufferOffsetAlignment) * device.limits.minStorageBufferOffsetAlignment;
        data[name].gpuBuffer = device.createBuffer({
            size: data[name].gpuByteLength,
            usage: GPUBufferUsage.STORAGE,
            mappedAtCreation: true
        });
        data[name].byteLength = data[name].buffer.byteLength;
        const buffer = data[name].gpuBuffer.getMappedRange(0, data[name].buffer.byteLength);
        const array = new Uint8Array(buffer);
        const sourceArray = new Uint8Array(data[name].buffer);
        array.set(sourceArray, 0);
        data[name].gpuBuffer.unmap();
        delete data[name].buffer;
    }
    return data;
}
