import { assertVectorLength } from '../../../../lib/math-assert.js';
import { add_vector_vector, cross_vector_vector, normalize_vector } from '../../../../lib/math.js';

const properties = {
    resources: Symbol('resources')
};

export class Quad {
    #definition;
    constructor({
        origin,
        direction: [direction_x, direction_y]
    }) {
        assertVectorLength(origin, 3);
        assertVectorLength(direction_x, 3);
        assertVectorLength(direction_y, 3);
        this.#definition = {
            origin,
            direction: [direction_x, direction_y]
        };
    }

    getQuad() {
        return [
            [...this.#definition.origin],
            add_vector_vector(this.#definition.origin, this.#definition.direction[0]),
            add_vector_vector(this.#definition.origin, this.#definition.direction[1]),
            add_vector_vector(add_vector_vector(this.#definition.origin, this.#definition.direction[0]), this.#definition[1])
        ];
    }

    getNormal() {
        return normalize_vector(cross_vector_vector(this.#definition.direction[0], this.#definition.direction[1]));
    }
}
