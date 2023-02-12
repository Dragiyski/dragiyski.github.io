const u32 = Uint32Array.from([0x11223344]);
const u8 = new Uint8Array(u32.buffer);
let defaultLittleEndian;
if (u8[0] === 0x44) {
    defaultLittleEndian = true;
} else if (u8[0] === 0x11) {
    defaultLittleEndian = false;
} else {
    throw new TypeError('Cannot determine system endianness.');
}

export default class SystemDataView extends DataView {
    setUint16(offset, value, littleEndian) {
        return super.setUint16(offset, value, littleEndian ?? defaultLittleEndian);
    }

    setUint32(offset, value, littleEndian) {
        return super.setUint32(offset, value, littleEndian ?? defaultLittleEndian);
    }

    setBigUint64(offset, value, littleEndian) {
        return super.setBigUint64(offset, value, littleEndian ?? defaultLittleEndian);
    }

    setInt16(offset, value, littleEndian) {
        return super.setInt16(offset, value, littleEndian ?? defaultLittleEndian);
    }

    setInt32(offset, value, littleEndian) {
        return super.setInt32(offset, value, littleEndian ?? defaultLittleEndian);
    }

    setBigInt64(offset, value, littleEndian) {
        return super.setBigInt64(offset, value, littleEndian ?? defaultLittleEndian);
    }

    setFloat32(offset, value, littleEndian) {
        return super.setFloat32(offset, value, littleEndian ?? defaultLittleEndian);
    }

    setFloat64(offset, value, littleEndian) {
        return super.setFloat64(offset, value, littleEndian ?? defaultLittleEndian);
    }

    getUint16(offset, littleEndian) {
        return super.getUint16(offset, littleEndian ?? defaultLittleEndian);
    }

    getUint32(offset, littleEndian) {
        return super.getUint32(offset, littleEndian ?? defaultLittleEndian);
    }

    getBigUint64(offset, littleEndian) {
        return super.getBigUint64(offset, littleEndian ?? defaultLittleEndian);
    }

    getInt16(offset, littleEndian) {
        return super.getInt16(offset, littleEndian ?? defaultLittleEndian);
    }

    getInt32(offset, littleEndian) {
        return super.getInt32(offset, littleEndian ?? defaultLittleEndian);
    }

    getBigInt64(offset, littleEndian) {
        return super.getBigInt64(offset, littleEndian ?? defaultLittleEndian);
    }

    getFloat32(offset, littleEndian) {
        return super.getFloat32(offset, littleEndian ?? defaultLittleEndian);
    }

    getFloat64(offset, littleEndian) {
        return super.getFloat64(offset, littleEndian ?? defaultLittleEndian);
    }
};
