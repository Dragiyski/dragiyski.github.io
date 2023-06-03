import { Vector4D } from '../math/index.js';

export default class RaytraceScene {
    #data_int;
    #data_float;
    #data_object;
    #data_tree;
    #array_int;
    #array_float;
    #array_object;
    #array_tree;
    #texture_list;
    #initial_node_index;

    #self;

    constructor(binary) {
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
        let indexStart = 20;
        let indexEnd = 20 + header[1] * 4;
        const buffer_float = binary.slice(indexStart, indexEnd);
        indexStart = indexEnd;
        indexEnd += header[2] * 4;
        const buffer_int = binary.slice(indexStart, indexEnd);
        indexStart = indexEnd;
        indexEnd += header[3] * 4 * 4;
        const buffer_object = binary.slice(indexStart, indexEnd);
        indexStart = indexEnd;
        indexEnd += header[4] * 4 * 4;
        const buffer_tree = binary.slice(indexStart, indexEnd);
        this.#data_float = new Float32Array(buffer_float);
        this.#data_int = new Int32Array(buffer_int);
        this.#data_object = new Int32Array(buffer_object);
        this.#data_tree = new Int32Array(buffer_tree);

        this.#array_float = this.#data_float;
        this.#array_int = this.#data_int;
        this.#array_object = new Array(this.#data_object.length >>> 2);
        this.#array_tree = new Array(this.#data_tree.length >>> 2);
        for (const [source, target] of [[this.#data_object, this.#array_object], [this.#data_tree, this.#array_tree]]) {
            for (let i = 0; i < target.length; ++i) {
                target[i] = Vector4D.using(source, i * 4);
            }
        }
        this.#initial_node_index = initialIndex;
        this.#self = Symbol('RaytraceScene');
    }

    get intData() {
        return this.#array_int;
    }

    get floatData() {
        return this.#array_float;
    }

    get objectData() {
        return this.#array_object;
    }

    get treeData() {
        return this.#array_tree;
    }

    get initialNodeIndex() {
        return this.#initial_node_index;
    }
}
