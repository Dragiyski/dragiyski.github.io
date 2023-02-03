class AssertError extends Error {}

function assert(cond, message) {
    if (!cond) {
        message = message ?? 'Assertion failed';
        throw new AssertError(message);
    }
};

export function add_vector_vector(x, y) {
    const l = x.length;
    assert(y.length === l);
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = x[i] + y[i];
    }
    return z;
}

export function sub_vector_vector(x, y) {
    const l = x.length;
    assert(y.length === l);
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = x[i] - y[i];
    }
    return z;
}

export function mul_vector_vector(x, y) {
    const l = x.length;
    assert(y.length === l);
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = x[i] * y[i];
    }
    return z;
}

export function div_vector_vector(x, y) {
    const l = x.length;
    assert(y.length === l);
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = x[i] / y[i];
    }
    return z;
}

export function neg_vector(x) {
    const l = x.length;
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = -x[i];
    }
    return z;
}

export function add_vector_number(x, n) {
    const l = x.length;
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = x[i] + n;
    }
    return z;
}

export function add_number_vector(n, x) {
    const l = x.length;
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = n + x[i];
    }
    return z;
}

export function sub_vector_number(x, n) {
    const l = x.length;
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = x[i] - n;
    }
    return z;
}

export function sub_number_vector(n, x) {
    const l = x.length;
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = n - x[i];
    }
    return z;
}

export function mul_vector_number(x, n) {
    const l = x.length;
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = x[i] * n;
    }
    return z;
}

export function mul_number_vector(n, x) {
    const l = x.length;
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = n * x[i];
    }
    return z;
}

export function div_vector_number(x, n) {
    const l = x.length;
    assert(Number.isSafeInteger(l));
    const z = new Array(l);
    for (let i = 0; i < l; ++i) {
        z[i] = x[i] / n;
    }
    return z;
}

export function vector4_to_vector3(x) {
    const l = x.length;
    assert(l === 4);
    const z = new Array(3);
    for (let i = 0; i < 3; ++i) {
        z[i] = x[i] / x[3];
    }
}

export function dot_vector_vector(x, y) {
    const l = x.length;
    assert(y.length === l);
    assert(Number.isSafeInteger(l));
    let n = 0;
    for (let i = 0; i < l; ++i) {
        n += x[i] * y[i];
    }
    return n;
}

export function cross_vector_vector(x, y) {
    assert(x.length === 3);
    assert(y.length === 3);
    const z = new Array(3);
    z[0] = x[1] * y[2] - x[2] * y[1];
    z[1] = x[2] * y[0] - x[0] * y[2];
    z[2] = x[0] * y[1] - x[1] * y[0];
    return z;
}
