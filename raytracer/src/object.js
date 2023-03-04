const objectTypeList = [];
const objectTypeMap = new Map();

export class Object {
    constructor() {
        if (new.target === Object) {
            throw new TypeError(`Class "Object" is abstract`);
        }
    }

    build() {
        const self = Object.getPrototypeOf(this);
        if (self === Object.prototype || self.build === Object.prototype.build) {
            throw new TypeError(`Method "build" of class "Object" is abstract`);
        }
    }
}

function isObjectClass(constructor) {
    if (typeof constructor !== 'function') {
        return false;
    }
    let p = Object.getPrototypeOf(constructor);
    while (p != null) {
        if (p === Object) {
            return true;
        }
        p = Object.getPrototypeOf(p);
    }
    return false;
}

export function registerObjectType(constructor) {
    if (!isObjectClass(constructor)) {
        throw new TypeError('Invalid arguments[0]: Expected class constructor for an object');
    }
    if (objectTypeMap.has(constructor)) {
        return objectTypeMap.get(constructor);
    }
    const objectTypeId = objectTypeList.length;
    objectTypeList[objectTypeId] = constructor;
    objectTypeMap.set(constructor, objectTypeId);
}

export function getObjectType(id) {
    if (!Number.isSafeInteger(id) || id < 0 || id >= objectTypeList.length) {
        return null;
    }
    return objectTypeList[id];
}

export function getObjectTypeId(constructor) {
    if (constructor !== Object(constructor)) {
        return -1;
    }
    if (!objectTypeMap.has(constructor)) {
        return -1;
    }
    return objectTypeMap.get(constructor);
}
