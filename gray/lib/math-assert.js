export class AssertionError extends Error {};

export function assert(condition) {
    if (!condition) {
        throw new TypeError('Assertion failed');
    }
}

export function assertVector(value) {
    let length;
    assert(Number.isSafeInteger(length = value.length));
    for (let i = 0; i < length; ++i) {
        assert(typeof value[i] === 'number');
    }
}

export function assertVectorLength(value, length) {
    assert(value.length === length);
    for (let i = 0; i < length; ++i) {
        assert(typeof value[i] === 'number');
    }
}

export function assertSquareMatrix(value) {
    let length;
    assert(Number.isSafeInteger(length = value.length));
    assert(Number.isSafeInteger(Math.sqrt(length)));
    for (let i = 0; i < length; ++i) {
        assert(typeof value[i] === 'number');
    }
}
