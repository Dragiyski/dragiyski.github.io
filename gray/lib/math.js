/* eslint-disable array-element-newline */
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

export function length_vector(x) {
    let z = 0;
    for (let i = 0; i < x.length; ++i) {
        z += x[i] * x[i];
    }
    return Math.sqrt(z);
}

export function normalize_vector(x) {
    return div_vector_number(x, length_vector(x));
}

export function mul_matrix_matrix(x, y) {
    assert(x.length === y.length);
    assert(Number.isSafeInteger(Math.sqrt(x.length)));
    const z = new Array(x.length);
    const l = Math.sqrt(x.length);
    z.fill(0);
    for (let i = 0; i < l; ++i) {
        for (let j = 0; j < l; ++j) {
            for (let k = 0; k < l; ++k) {
                z[i * l + j] += x[i * l + k] * y[k * l + j];
            }
        }
    }
    return z;
}

export function mul_matrix_vector(x, v) {
    const l = Math.sqrt(x.length);
    assert(Number.isSafeInteger(l));
    assert(v.length === l);
    const z = new Array(v.length);
    for (let i = 0; i < l; ++i) {
        z[i] = dot_vector_vector(x.slice(i * l, i * l + l), v);
    }
    return z;
}

export function mat4_rotation_x(radians) {
    return [
        1, 0, 0, 0,
        0, Math.cos(radians), -Math.sin(radians), 0,
        0, Math.sin(radians), Math.cos(radians), 0,
        0, 0, 0, 1
    ];
}

export function mat4_rotation_y(radians) {
    return [
        Math.cos(radians), 0, Math.sin(radians), 0,
        0, 1, 0, 0,
        -Math.sin(radians), 0, Math.cos(radians), 0,
        0, 0, 0, 1
    ];
}

export function mat4_rotation_z(radians) {
    return [
        Math.cos(radians), -Math.sin(radians), 0, 0,
        Math.sin(radians), Math.cos(radians), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

export function get_next_power_2(number) {
    let n = 1;
    let i = 0;
    while (n < number) {
        ++i;
        n = n << 1;
    }
    return 1 << i;
}

export function get_prev_power_2(number) {
    const p = get_next_power_2(number);
    if (p === number) {
        return p;
    }
    return p >> 1;
}
