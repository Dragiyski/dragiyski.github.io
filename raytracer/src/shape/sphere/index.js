export const id = 1;

export class Sphere {
    #position
    constructor({
        position, radius
    }) {
        this.#position = position;
        this.#radius = radius;
    }
}

export class DrawableSphere extends Sphere {
    constructor({
        material,
        ...options
    }) {
        super(...options);
    }
}

export default class Sphere {
    #data;
    #texture;
    constructor({
        center, radius, material = null
    }) {
        this.#data = {
            float: [],
            int: [],
            object: []
        };
    }
}

export async function registerObject({
    float, int, object, texture
}, {
    center, radius,
    color = [1, 1, 1, 1]
}) {
    const floatIndex = float.length / 4;
    const intIndex = int.length / 4;
    const objectIndex = object.length / 4;

    let flags = 0;
    if (typeof color === 'number') {
        color = [color, color, color, 1];
    }
    if (color === Object(color) && typeof color[Symbol.iterator] === 'function') {
        if (color.length > 4) {
            throw new TypeError('Invalid object property "color": color specified must be array of 4 or less');
        }
        const value = [0, 0, 0, 1];
        for (let i = 0; i < color.length; ++i) {
            value[i] = color[i];
        }
        color = value;
    } else if (typeof color === 'string') {
        flags |= 1;
        const textureId = getTexture(color);
    } else {
        throw new TypeError('Invalid object property "color": color must be either a number/array for RGB(A) or string containing texture path');
    }

    object.push(
        id,

    );
}
