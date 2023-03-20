export const number = numericLimits([0, 0, 0]);
export const float32 = numericLimits(new Float32Array(new ArrayBuffer(3 * 4)));
export const float64 = numericLimits(new Float64Array(new ArrayBuffer(3 * 8)));

function numericLimits(array) {
    const limits = {};
    [limits.minExponent, limits.minValue] = getMin();
    [limits.maxExponent, limits.maxValue] = getMax();
    [limits.fractionBits, limits.epsilon] = getFraction();
    limits.minNormalValue = getMinNormal();
    limits.isEqual = isEqual;
    return Object.freeze(limits);

    function getMin() {
        array[0] = 1;
        array[1] = 0;
        let exp = 0;
        while (array[1] !== array[0]) {
            array[2] = array[0];
            array[0] *= 0.5;
            ++exp;
        }
        return [-(exp - 1), array[2]];
    }

    function getMax() {
        array[0] = 2;
        array[1] = 1 / 0;
        let exp = 1;
        while (array[1] !== array[0]) {
            array[2] = array[0];
            array[0] *= 2;
            ++exp;
        }
        return [--exp, array[2]];
    }

    function getFraction() {
        array[0] = 1;
        array[1] = 1;
        let exp = 0;
        do {
            ++exp;
            array[1] *= 0.5;
            array[2] = array[0] - array[1];
        } while (array[2] !== array[0]);
        return [exp - 2, array[1] * 4];
    }

    function getMinNormal() {
        const boundary = -(limits.minExponent + limits.fractionBits);
        array[0] = 1;
        for (let i = 0; i < boundary; ++i) {
            array[0] *= 0.5;
        }
        return array[0];
    }

    function isEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (isNaN(a) || isNaN(b)) {
            return false;
        }
        const diff = Math.abs(a - b);
        // Finite amplitude, there is a chance |A + B| yields +Infinity, in this case use the max finite value.
        const finAmp = Math.min(Math.abs(a) + Math.abs(b), limits.maxValue);
        // EPSILON * amplitude gives the absolute error around A, assuming B is really close to A (If not, this will result in false).
        // In case both A and B are denormals the relative error will -Infinity, in this case use the min finite value.
        return diff < Math.max(limits.minValue, limits.epsilon * finAmp);
    }
}
