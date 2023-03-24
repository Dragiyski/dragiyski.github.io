import { assert, assertVectorLength } from '../../../lib/math-assert.js';

export default class PerspectiveCamera {
    #fieldOfView;
    #origin;
    #direction;
    #screenDistance;
    #width;
    #height;
    #aspectRatio;
    #velocity;
    #forward;
    #right;
    #up;
    #timestamp = null;

    constructor({
        fieldOfView = 60.0,
        origin = [0, 0, 2],
        direction = [0, 0, -1],
        screenDistance = 1.0
    }) {
        assert(typeof fieldOfView === 'number' && isFinite(fieldOfView) && fieldOfView > 0 && fieldOfView < 180);
        assertVectorLength(origin, 3);
        assertVectorLength(direction, 3);
        assert(typeof screenDistance === 'number' && isFinite(screenDistance) && screenDistance > 0);
        this.#fieldOfView = fieldOfView;
        this.#origin = [...origin];
        this.#direction = [...direction];
        this.#screenDistance = screenDistance;
    }

    resize(width, height) {
        assert(Number.isSafeInteger(width) && width > 0);
        assert(Number.isSafeInteger(height) && width > 0);
        this.#width = width;
        this.#height = height;
        this.#aspectRatio = width / height;
    }
}
