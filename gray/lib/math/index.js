/* eslint-disable function-call-argument-newline */
/* eslint-disable camelcase */
/* eslint-disable no-extend-native */
import * as limits from './limits.js';
export { limits };
export * from './power.js';

const polymorphism = Symbol('polymorphism');
const Number_polymorphism = Number.prototype[polymorphism] = Symbol('Number.polymorphism');
const implementation = Object.create(null);
implementation[Number_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Number_polymorphism] = Object.create(null);
const internal = Symbol('internal');
export const Vector = Object.create(null);
export const Matrix = Object.create(null);

Matrix[2] = Object.create(null);
Matrix[3] = Object.create(null);
Matrix[4] = Object.create(null);

export class Vector2D {
    constructor(...args) {
        if (args.length === 1 && args[0] instanceof Vector3D) {
            this[internal] = Object.seal([
                args[0][internal][0] / args[0][internal][2],
                args[0][internal][1] / args[0][internal][2]
            ]);
            return;
        }
        let items = recursive_items_from_args(2, args);
        if (items.length === 0) {
            items = [0, 0];
        } else if (items.length === 1) {
            items = (new Array(2).fill(items[0]));
        } else if (items.length !== 2) {
            throw new TypeError(`Invalid number of arguments: expected 0, 1, or 2, got ${items.length}`);
        }
        this[internal] = Object.seal(items.map(item => +item));
    }

    static from(array, offset = 0) {
        return vector_create_from_array(this, 2, array, offset);
    }

    static using(array, offset = 0) {
        return vector_create_using_array(this, 2, array, offset);
    }

    static piecewise(...items) {
        return vector_create_piecewise(this, 2, items);
    }

    * [Symbol.iterator]() {
        yield * this[internal];
    }

    set(...args) {
        const items = recursive_items_from_args(2, args);
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        return this;
    }

    into(target) {
        if (!(target instanceof Vector2D)) {
            throw new TypeError(`Invalid arguments`);
        }
        return target.set(this);
    }

    get x() {
        return this[internal][0];
    }

    set x(value) {
        this[internal][0] = +value;
    }

    get y() {
        return this[internal][1];
    }

    set y(value) {
        this[internal][1] = +value;
    }

    get xx() {
        return new Vector2D(this[internal][0], this[internal][0]);
    }

    set xx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
    }

    get xy() {
        return new Vector2D(this[internal][0], this[internal][1]);
    }

    set xy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
    }

    get yx() {
        return new Vector2D(this[internal][1], this[internal][0]);
    }

    set yx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
    }

    get yy() {
        return new Vector2D(this[internal][1], this[internal][1]);
    }

    set yy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
    }

    get xxx() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][0]);
    }

    set xxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get xxy() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][1]);
    }

    set xxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get xyx() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][0]);
    }

    set xyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get xyy() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][1]);
    }

    set xyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get yxx() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][0]);
    }

    set yxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get yxy() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][1]);
    }

    set yxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get yyx() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][0]);
    }

    set yyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get yyy() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][1]);
    }

    set yyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get xxxx() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][0]);
    }

    set xxxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get xxxy() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][1]);
    }

    set xxxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get xxyx() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][0]);
    }

    set xxyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get xxyy() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][1]);
    }

    set xxyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get xyxx() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][0]);
    }

    set xyxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get xyxy() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][1]);
    }

    set xyxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get xyyx() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][0]);
    }

    set xyyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get xyyy() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][1]);
    }

    set xyyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get yxxx() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][0]);
    }

    set yxxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get yxxy() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][1]);
    }

    set yxxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get yxyx() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][0]);
    }

    set yxyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get yxyy() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][1]);
    }

    set yxyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get yyxx() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][0]);
    }

    set yyxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get yyxy() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][1]);
    }

    set yyxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get yyyx() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][0]);
    }

    set yyyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get yyyy() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][1]);
    }

    set yyyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get r() {
        return this[internal][0];
    }

    set r(value) {
        this[internal][0] = +value;
    }

    get g() {
        return this[internal][1];
    }

    set g(value) {
        this[internal][1] = +value;
    }

    get rr() {
        return new Vector2D(this[internal][0], this[internal][0]);
    }

    set rr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
    }

    get rg() {
        return new Vector2D(this[internal][0], this[internal][1]);
    }

    set rg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
    }

    get gr() {
        return new Vector2D(this[internal][1], this[internal][0]);
    }

    set gr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
    }

    get gg() {
        return new Vector2D(this[internal][1], this[internal][1]);
    }

    set gg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
    }

    get rrr() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][0]);
    }

    set rrr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get rrg() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][1]);
    }

    set rrg([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get rgr() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][0]);
    }

    set rgr([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get rgg() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][1]);
    }

    set rgg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get grr() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][0]);
    }

    set grr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get grg() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][1]);
    }

    set grg([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get ggr() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][0]);
    }

    set ggr([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get ggg() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][1]);
    }

    set ggg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get rrrr() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][0]);
    }

    set rrrr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get rrrg() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][1]);
    }

    set rrrg([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get rrgr() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][0]);
    }

    set rrgr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get rrgg() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][1]);
    }

    set rrgg([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get rgrr() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][0]);
    }

    set rgrr([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get rgrg() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][1]);
    }

    set rgrg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get rggr() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][0]);
    }

    set rggr([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get rggg() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][1]);
    }

    set rggg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get grrr() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][0]);
    }

    set grrr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get grrg() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][1]);
    }

    set grrg([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get grgr() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][0]);
    }

    set grgr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get grgg() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][1]);
    }

    set grgg([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get ggrr() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][0]);
    }

    set ggrr([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get ggrg() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][1]);
    }

    set ggrg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get gggr() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][0]);
    }

    set gggr([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get gggg() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][1]);
    }

    set gggg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }
}

const Vector2D_polymorphism = Vector2D.prototype[polymorphism] = Symbol(`Vector2D.polymorphism`);

Object.defineProperties(Vector2D.prototype, {
    0: {
        enumerable: true,
        get() {
            return this[internal][0];
        },
        set(value) {
            this[internal][0] = +value;
        }
    },
    1: {
        enumerable: true,
        get() {
            return this[internal][1];
        },
        set(value) {
            this[internal][1] = +value;
        }
    },
    size: {
        enumerable: true,
        value: 2
    },
    [Symbol.toStringTag]: {
        value: 'Vector2D'
    }
});

Vector[2] = Vector2D;

export class Vector3D {
    constructor(...args) {
        if (args.length === 1 && args[0] instanceof Vector4D) {
            this[internal] = Object.seal([
                args[0][internal][0] / args[0][internal][3],
                args[0][internal][1] / args[0][internal][3],
                args[0][internal][2] / args[0][internal][3]
            ]);
            return;
        }
        let items = recursive_items_from_args(3, args);
        if (items.length === 0) {
            items = [0, 0, 0];
        } else if (items.length === 1) {
            items = (new Array(3).fill(items[0]));
        } else if (items.length !== 3) {
            throw new TypeError(`Invalid number of arguments: expected 0, 1, or 3, got ${items.length}`);
        }
        this[internal] = Object.seal(items.map(item => +item));
    }

    static from(array, offset = 0) {
        return vector_create_from_array(this, 3, array, offset);
    }

    static using(array, offset = 0) {
        return vector_create_using_array(this, 3, array, offset);
    }

    static piecewise(...items) {
        return vector_create_piecewise(this, 3, items);
    }

    * [Symbol.iterator]() {
        yield * this[internal];
    }

    set(...args) {
        const items = recursive_items_from_args(3, args);
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        return this;
    }

    into(target) {
        if (!(target instanceof Vector3D)) {
            throw new TypeError(`Invalid arguments`);
        }
        return target.set(this);
    }

    get x() {
        return this[internal][0];
    }

    set x(value) {
        this[internal][0] = +value;
    }

    get y() {
        return this[internal][1];
    }

    set y(value) {
        this[internal][1] = +value;
    }

    get z() {
        return this[internal][2];
    }

    set z(value) {
        this[internal][2] = +value;
    }

    get xx() {
        return new Vector2D(this[internal][0], this[internal][0]);
    }

    set xx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
    }

    get xy() {
        return new Vector2D(this[internal][0], this[internal][1]);
    }

    set xy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
    }

    get xz() {
        return new Vector2D(this[internal][0], this[internal][2]);
    }

    set xz([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
    }

    get yx() {
        return new Vector2D(this[internal][1], this[internal][0]);
    }

    set yx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
    }

    get yy() {
        return new Vector2D(this[internal][1], this[internal][1]);
    }

    set yy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
    }

    get yz() {
        return new Vector2D(this[internal][1], this[internal][2]);
    }

    set yz([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
    }

    get zx() {
        return new Vector2D(this[internal][2], this[internal][0]);
    }

    set zx([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
    }

    get zy() {
        return new Vector2D(this[internal][2], this[internal][1]);
    }

    set zy([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
    }

    get zz() {
        return new Vector2D(this[internal][2], this[internal][2]);
    }

    set zz([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
    }

    get xxx() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][0]);
    }

    set xxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get xxy() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][1]);
    }

    set xxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get xxz() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][2]);
    }

    set xxz([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get xyx() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][0]);
    }

    set xyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get xyy() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][1]);
    }

    set xyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get xyz() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][2]);
    }

    set xyz([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get xzx() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][0]);
    }

    set xzx([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get xzy() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][1]);
    }

    set xzy([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get xzz() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][2]);
    }

    set xzz([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get yxx() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][0]);
    }

    set yxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get yxy() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][1]);
    }

    set yxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get yxz() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][2]);
    }

    set yxz([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get yyx() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][0]);
    }

    set yyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get yyy() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][1]);
    }

    set yyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get yyz() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][2]);
    }

    set yyz([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get yzx() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][0]);
    }

    set yzx([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get yzy() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][1]);
    }

    set yzy([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get yzz() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][2]);
    }

    set yzz([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get zxx() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][0]);
    }

    set zxx([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get zxy() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][1]);
    }

    set zxy([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get zxz() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][2]);
    }

    set zxz([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get zyx() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][0]);
    }

    set zyx([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get zyy() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][1]);
    }

    set zyy([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get zyz() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][2]);
    }

    set zyz([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get zzx() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][0]);
    }

    set zzx([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get zzy() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][1]);
    }

    set zzy([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get zzz() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][2]);
    }

    set zzz([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get xxxx() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][0]);
    }

    set xxxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get xxxy() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][1]);
    }

    set xxxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get xxxz() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][2]);
    }

    set xxxz([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get xxyx() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][0]);
    }

    set xxyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get xxyy() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][1]);
    }

    set xxyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get xxyz() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][2]);
    }

    set xxyz([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get xxzx() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][0]);
    }

    set xxzx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get xxzy() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][1]);
    }

    set xxzy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get xxzz() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][2]);
    }

    set xxzz([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get xyxx() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][0]);
    }

    set xyxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get xyxy() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][1]);
    }

    set xyxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get xyxz() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][2]);
    }

    set xyxz([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get xyyx() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][0]);
    }

    set xyyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get xyyy() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][1]);
    }

    set xyyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get xyyz() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][2]);
    }

    set xyyz([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get xyzx() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][0]);
    }

    set xyzx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get xyzy() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][1]);
    }

    set xyzy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get xyzz() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][2]);
    }

    set xyzz([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get xzxx() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][0]);
    }

    set xzxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get xzxy() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][1]);
    }

    set xzxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get xzxz() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][2]);
    }

    set xzxz([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get xzyx() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][0]);
    }

    set xzyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get xzyy() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][1]);
    }

    set xzyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get xzyz() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][2]);
    }

    set xzyz([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get xzzx() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][0]);
    }

    set xzzx([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get xzzy() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][1]);
    }

    set xzzy([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get xzzz() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][2]);
    }

    set xzzz([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get yxxx() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][0]);
    }

    set yxxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get yxxy() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][1]);
    }

    set yxxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get yxxz() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][2]);
    }

    set yxxz([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get yxyx() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][0]);
    }

    set yxyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get yxyy() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][1]);
    }

    set yxyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get yxyz() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][2]);
    }

    set yxyz([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get yxzx() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][0]);
    }

    set yxzx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get yxzy() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][1]);
    }

    set yxzy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get yxzz() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][2]);
    }

    set yxzz([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get yyxx() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][0]);
    }

    set yyxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get yyxy() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][1]);
    }

    set yyxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get yyxz() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][2]);
    }

    set yyxz([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get yyyx() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][0]);
    }

    set yyyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get yyyy() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][1]);
    }

    set yyyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get yyyz() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][2]);
    }

    set yyyz([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get yyzx() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][0]);
    }

    set yyzx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get yyzy() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][1]);
    }

    set yyzy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get yyzz() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][2]);
    }

    set yyzz([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get yzxx() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][0]);
    }

    set yzxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get yzxy() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][1]);
    }

    set yzxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get yzxz() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][2]);
    }

    set yzxz([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get yzyx() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][0]);
    }

    set yzyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get yzyy() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][1]);
    }

    set yzyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get yzyz() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][2]);
    }

    set yzyz([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get yzzx() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][0]);
    }

    set yzzx([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get yzzy() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][1]);
    }

    set yzzy([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get yzzz() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][2]);
    }

    set yzzz([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get zxxx() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][0]);
    }

    set zxxx([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get zxxy() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][1]);
    }

    set zxxy([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get zxxz() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][2]);
    }

    set zxxz([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get zxyx() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][0]);
    }

    set zxyx([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get zxyy() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][1]);
    }

    set zxyy([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get zxyz() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][2]);
    }

    set zxyz([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get zxzx() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][0]);
    }

    set zxzx([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get zxzy() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][1]);
    }

    set zxzy([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get zxzz() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][2]);
    }

    set zxzz([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get zyxx() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][0]);
    }

    set zyxx([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get zyxy() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][1]);
    }

    set zyxy([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get zyxz() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][2]);
    }

    set zyxz([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get zyyx() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][0]);
    }

    set zyyx([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get zyyy() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][1]);
    }

    set zyyy([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get zyyz() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][2]);
    }

    set zyyz([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get zyzx() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][0]);
    }

    set zyzx([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get zyzy() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][1]);
    }

    set zyzy([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get zyzz() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][2]);
    }

    set zyzz([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get zzxx() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][0]);
    }

    set zzxx([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get zzxy() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][1]);
    }

    set zzxy([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get zzxz() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][2]);
    }

    set zzxz([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get zzyx() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][0]);
    }

    set zzyx([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get zzyy() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][1]);
    }

    set zzyy([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get zzyz() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][2]);
    }

    set zzyz([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get zzzx() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][0]);
    }

    set zzzx([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get zzzy() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][1]);
    }

    set zzzy([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get zzzz() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][2]);
    }

    set zzzz([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get r() {
        return this[internal][0];
    }

    set r(value) {
        this[internal][0] = +value;
    }

    get g() {
        return this[internal][1];
    }

    set g(value) {
        this[internal][1] = +value;
    }

    get b() {
        return this[internal][2];
    }

    set b(value) {
        this[internal][2] = +value;
    }

    get rr() {
        return new Vector2D(this[internal][0], this[internal][0]);
    }

    set rr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
    }

    get rg() {
        return new Vector2D(this[internal][0], this[internal][1]);
    }

    set rg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
    }

    get rb() {
        return new Vector2D(this[internal][0], this[internal][2]);
    }

    set rb([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
    }

    get gr() {
        return new Vector2D(this[internal][1], this[internal][0]);
    }

    set gr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
    }

    get gg() {
        return new Vector2D(this[internal][1], this[internal][1]);
    }

    set gg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
    }

    get gb() {
        return new Vector2D(this[internal][1], this[internal][2]);
    }

    set gb([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
    }

    get br() {
        return new Vector2D(this[internal][2], this[internal][0]);
    }

    set br([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
    }

    get bg() {
        return new Vector2D(this[internal][2], this[internal][1]);
    }

    set bg([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
    }

    get bb() {
        return new Vector2D(this[internal][2], this[internal][2]);
    }

    set bb([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
    }

    get rrr() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][0]);
    }

    set rrr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get rrg() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][1]);
    }

    set rrg([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get rrb() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][2]);
    }

    set rrb([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get rgr() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][0]);
    }

    set rgr([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get rgg() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][1]);
    }

    set rgg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get rgb() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][2]);
    }

    set rgb([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get rbr() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][0]);
    }

    set rbr([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get rbg() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][1]);
    }

    set rbg([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get rbb() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][2]);
    }

    set rbb([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get grr() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][0]);
    }

    set grr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get grg() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][1]);
    }

    set grg([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get grb() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][2]);
    }

    set grb([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get ggr() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][0]);
    }

    set ggr([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get ggg() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][1]);
    }

    set ggg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get ggb() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][2]);
    }

    set ggb([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get gbr() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][0]);
    }

    set gbr([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get gbg() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][1]);
    }

    set gbg([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get gbb() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][2]);
    }

    set gbb([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get brr() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][0]);
    }

    set brr([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get brg() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][1]);
    }

    set brg([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get brb() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][2]);
    }

    set brb([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get bgr() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][0]);
    }

    set bgr([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get bgg() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][1]);
    }

    set bgg([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get bgb() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][2]);
    }

    set bgb([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get bbr() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][0]);
    }

    set bbr([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get bbg() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][1]);
    }

    set bbg([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get bbb() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][2]);
    }

    set bbb([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get rrrr() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][0]);
    }

    set rrrr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get rrrg() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][1]);
    }

    set rrrg([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get rrrb() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][2]);
    }

    set rrrb([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get rrgr() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][0]);
    }

    set rrgr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get rrgg() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][1]);
    }

    set rrgg([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get rrgb() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][2]);
    }

    set rrgb([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get rrbr() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][0]);
    }

    set rrbr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get rrbg() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][1]);
    }

    set rrbg([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get rrbb() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][2]);
    }

    set rrbb([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get rgrr() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][0]);
    }

    set rgrr([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get rgrg() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][1]);
    }

    set rgrg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get rgrb() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][2]);
    }

    set rgrb([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get rggr() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][0]);
    }

    set rggr([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get rggg() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][1]);
    }

    set rggg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get rggb() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][2]);
    }

    set rggb([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get rgbr() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][0]);
    }

    set rgbr([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get rgbg() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][1]);
    }

    set rgbg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get rgbb() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][2]);
    }

    set rgbb([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get rbrr() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][0]);
    }

    set rbrr([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get rbrg() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][1]);
    }

    set rbrg([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get rbrb() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][2]);
    }

    set rbrb([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get rbgr() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][0]);
    }

    set rbgr([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get rbgg() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][1]);
    }

    set rbgg([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get rbgb() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][2]);
    }

    set rbgb([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get rbbr() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][0]);
    }

    set rbbr([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get rbbg() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][1]);
    }

    set rbbg([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get rbbb() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][2]);
    }

    set rbbb([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get grrr() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][0]);
    }

    set grrr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get grrg() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][1]);
    }

    set grrg([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get grrb() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][2]);
    }

    set grrb([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get grgr() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][0]);
    }

    set grgr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get grgg() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][1]);
    }

    set grgg([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get grgb() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][2]);
    }

    set grgb([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get grbr() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][0]);
    }

    set grbr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get grbg() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][1]);
    }

    set grbg([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get grbb() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][2]);
    }

    set grbb([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get ggrr() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][0]);
    }

    set ggrr([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get ggrg() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][1]);
    }

    set ggrg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get ggrb() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][2]);
    }

    set ggrb([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get gggr() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][0]);
    }

    set gggr([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get gggg() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][1]);
    }

    set gggg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get gggb() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][2]);
    }

    set gggb([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get ggbr() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][0]);
    }

    set ggbr([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get ggbg() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][1]);
    }

    set ggbg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get ggbb() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][2]);
    }

    set ggbb([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get gbrr() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][0]);
    }

    set gbrr([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get gbrg() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][1]);
    }

    set gbrg([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get gbrb() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][2]);
    }

    set gbrb([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get gbgr() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][0]);
    }

    set gbgr([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get gbgg() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][1]);
    }

    set gbgg([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get gbgb() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][2]);
    }

    set gbgb([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get gbbr() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][0]);
    }

    set gbbr([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get gbbg() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][1]);
    }

    set gbbg([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get gbbb() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][2]);
    }

    set gbbb([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get brrr() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][0]);
    }

    set brrr([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get brrg() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][1]);
    }

    set brrg([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get brrb() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][2]);
    }

    set brrb([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get brgr() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][0]);
    }

    set brgr([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get brgg() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][1]);
    }

    set brgg([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get brgb() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][2]);
    }

    set brgb([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get brbr() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][0]);
    }

    set brbr([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get brbg() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][1]);
    }

    set brbg([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get brbb() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][2]);
    }

    set brbb([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get bgrr() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][0]);
    }

    set bgrr([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get bgrg() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][1]);
    }

    set bgrg([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get bgrb() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][2]);
    }

    set bgrb([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get bggr() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][0]);
    }

    set bggr([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get bggg() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][1]);
    }

    set bggg([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get bggb() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][2]);
    }

    set bggb([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get bgbr() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][0]);
    }

    set bgbr([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get bgbg() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][1]);
    }

    set bgbg([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get bgbb() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][2]);
    }

    set bgbb([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get bbrr() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][0]);
    }

    set bbrr([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get bbrg() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][1]);
    }

    set bbrg([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get bbrb() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][2]);
    }

    set bbrb([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get bbgr() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][0]);
    }

    set bbgr([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get bbgg() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][1]);
    }

    set bbgg([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get bbgb() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][2]);
    }

    set bbgb([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get bbbr() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][0]);
    }

    set bbbr([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get bbbg() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][1]);
    }

    set bbbg([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get bbbb() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][2]);
    }

    set bbbb([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }
}

const Vector3D_polymorphism = Vector3D.prototype[polymorphism] = Symbol(`Vector3D.polymorphism`);

Object.defineProperties(Vector3D.prototype, {
    0: {
        enumerable: true,
        get() {
            return this[internal][0];
        },
        set(value) {
            this[internal][0] = +value;
        }
    },
    1: {
        enumerable: true,
        get() {
            return this[internal][1];
        },
        set(value) {
            this[internal][1] = +value;
        }
    },
    2: {
        enumerable: true,
        get() {
            return this[internal][2];
        },
        set(value) {
            this[internal][2] = +value;
        }
    },
    size: {
        enumerable: true,
        value: 3
    },
    [Symbol.toStringTag]: {
        value: 'Vector3D'
    }
});

Vector[3] = Vector3D;

export class Vector4D {
    constructor(...args) {
        let items = recursive_items_from_args(4, args);
        if (items.length === 0) {
            items = [0, 0, 0, 1];
        } else if (items.length === 1) {
            items = (new Array(4).fill(items[0]));
        } else if (items.length !== 4) {
            throw new TypeError(`Invalid number of arguments: expected 0, 1, or 4, got ${items.length}`);
        }
        this[internal] = Object.seal(items.map(item => +item));
    }

    static from(array, offset = 0) {
        return vector_create_from_array(this, 4, array, offset);
    }

    static using(array, offset = 0) {
        return vector_create_using_array(this, 4, array, offset);
    }

    static piecewise(...items) {
        return vector_create_piecewise(this, 4, items);
    }

    * [Symbol.iterator]() {
        yield * this[internal];
    }

    set(...args) {
        const items = recursive_items_from_args(4, args);
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
        return this;
    }

    into(target) {
        if (!(target instanceof Vector4D)) {
            throw new TypeError(`Invalid arguments`);
        }
        return target.set(this);
    }

    static quaternions(radians, ...coords) {
        let axis = recursive_items_from_args(3, coords);
        if (axis.length !== 3) {
            throw new TypeError(`Invalid number of arguments, expected 3D coordinates, got ${axis.length}D`);
        }
        axis = normalize(new Vector3D(axis));
        return new Vector4D(
            axis[0] * Math.sin(radians / 2),
            axis[1] * Math.sin(radians / 2),
            axis[2] * Math.sin(radians / 2),
            Math.cos(radians / 2)
        );
    }

    get x() {
        return this[internal][0];
    }

    set x(value) {
        this[internal][0] = +value;
    }

    get y() {
        return this[internal][1];
    }

    set y(value) {
        this[internal][1] = +value;
    }

    get z() {
        return this[internal][2];
    }

    set z(value) {
        this[internal][2] = +value;
    }

    get w() {
        return this[internal][3];
    }

    set w(value) {
        this[internal][3] = +value;
    }

    get xx() {
        return new Vector2D(this[internal][0], this[internal][0]);
    }

    set xx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
    }

    get xy() {
        return new Vector2D(this[internal][0], this[internal][1]);
    }

    set xy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
    }

    get xz() {
        return new Vector2D(this[internal][0], this[internal][2]);
    }

    set xz([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
    }

    get xw() {
        return new Vector2D(this[internal][0], this[internal][3]);
    }

    set xw([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
    }

    get yx() {
        return new Vector2D(this[internal][1], this[internal][0]);
    }

    set yx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
    }

    get yy() {
        return new Vector2D(this[internal][1], this[internal][1]);
    }

    set yy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
    }

    get yz() {
        return new Vector2D(this[internal][1], this[internal][2]);
    }

    set yz([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
    }

    get yw() {
        return new Vector2D(this[internal][1], this[internal][3]);
    }

    set yw([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
    }

    get zx() {
        return new Vector2D(this[internal][2], this[internal][0]);
    }

    set zx([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
    }

    get zy() {
        return new Vector2D(this[internal][2], this[internal][1]);
    }

    set zy([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
    }

    get zz() {
        return new Vector2D(this[internal][2], this[internal][2]);
    }

    set zz([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
    }

    get zw() {
        return new Vector2D(this[internal][2], this[internal][3]);
    }

    set zw([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
    }

    get wx() {
        return new Vector2D(this[internal][3], this[internal][0]);
    }

    set wx([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
    }

    get wy() {
        return new Vector2D(this[internal][3], this[internal][1]);
    }

    set wy([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
    }

    get wz() {
        return new Vector2D(this[internal][3], this[internal][2]);
    }

    set wz([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
    }

    get ww() {
        return new Vector2D(this[internal][3], this[internal][3]);
    }

    set ww([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
    }

    get xxx() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][0]);
    }

    set xxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get xxy() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][1]);
    }

    set xxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get xxz() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][2]);
    }

    set xxz([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get xxw() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][3]);
    }

    set xxw([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
    }

    get xyx() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][0]);
    }

    set xyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get xyy() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][1]);
    }

    set xyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get xyz() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][2]);
    }

    set xyz([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get xyw() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][3]);
    }

    set xyw([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
    }

    get xzx() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][0]);
    }

    set xzx([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get xzy() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][1]);
    }

    set xzy([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get xzz() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][2]);
    }

    set xzz([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get xzw() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][3]);
    }

    set xzw([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
    }

    get xwx() {
        return new Vector3D(this[internal][0], this[internal][3], this[internal][0]);
    }

    set xwx([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
    }

    get xwy() {
        return new Vector3D(this[internal][0], this[internal][3], this[internal][1]);
    }

    set xwy([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
    }

    get xwz() {
        return new Vector3D(this[internal][0], this[internal][3], this[internal][2]);
    }

    set xwz([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
    }

    get xww() {
        return new Vector3D(this[internal][0], this[internal][3], this[internal][3]);
    }

    set xww([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
    }

    get yxx() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][0]);
    }

    set yxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get yxy() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][1]);
    }

    set yxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get yxz() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][2]);
    }

    set yxz([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get yxw() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][3]);
    }

    set yxw([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
    }

    get yyx() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][0]);
    }

    set yyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get yyy() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][1]);
    }

    set yyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get yyz() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][2]);
    }

    set yyz([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get yyw() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][3]);
    }

    set yyw([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
    }

    get yzx() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][0]);
    }

    set yzx([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get yzy() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][1]);
    }

    set yzy([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get yzz() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][2]);
    }

    set yzz([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get yzw() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][3]);
    }

    set yzw([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
    }

    get ywx() {
        return new Vector3D(this[internal][1], this[internal][3], this[internal][0]);
    }

    set ywx([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
    }

    get ywy() {
        return new Vector3D(this[internal][1], this[internal][3], this[internal][1]);
    }

    set ywy([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
    }

    get ywz() {
        return new Vector3D(this[internal][1], this[internal][3], this[internal][2]);
    }

    set ywz([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
    }

    get yww() {
        return new Vector3D(this[internal][1], this[internal][3], this[internal][3]);
    }

    set yww([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
    }

    get zxx() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][0]);
    }

    set zxx([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get zxy() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][1]);
    }

    set zxy([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get zxz() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][2]);
    }

    set zxz([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get zxw() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][3]);
    }

    set zxw([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
    }

    get zyx() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][0]);
    }

    set zyx([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get zyy() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][1]);
    }

    set zyy([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get zyz() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][2]);
    }

    set zyz([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get zyw() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][3]);
    }

    set zyw([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
    }

    get zzx() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][0]);
    }

    set zzx([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get zzy() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][1]);
    }

    set zzy([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get zzz() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][2]);
    }

    set zzz([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get zzw() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][3]);
    }

    set zzw([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
    }

    get zwx() {
        return new Vector3D(this[internal][2], this[internal][3], this[internal][0]);
    }

    set zwx([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
    }

    get zwy() {
        return new Vector3D(this[internal][2], this[internal][3], this[internal][1]);
    }

    set zwy([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
    }

    get zwz() {
        return new Vector3D(this[internal][2], this[internal][3], this[internal][2]);
    }

    set zwz([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
    }

    get zww() {
        return new Vector3D(this[internal][2], this[internal][3], this[internal][3]);
    }

    set zww([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
    }

    get wxx() {
        return new Vector3D(this[internal][3], this[internal][0], this[internal][0]);
    }

    set wxx([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get wxy() {
        return new Vector3D(this[internal][3], this[internal][0], this[internal][1]);
    }

    set wxy([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get wxz() {
        return new Vector3D(this[internal][3], this[internal][0], this[internal][2]);
    }

    set wxz([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get wxw() {
        return new Vector3D(this[internal][3], this[internal][0], this[internal][3]);
    }

    set wxw([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
    }

    get wyx() {
        return new Vector3D(this[internal][3], this[internal][1], this[internal][0]);
    }

    set wyx([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get wyy() {
        return new Vector3D(this[internal][3], this[internal][1], this[internal][1]);
    }

    set wyy([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get wyz() {
        return new Vector3D(this[internal][3], this[internal][1], this[internal][2]);
    }

    set wyz([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get wyw() {
        return new Vector3D(this[internal][3], this[internal][1], this[internal][3]);
    }

    set wyw([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
    }

    get wzx() {
        return new Vector3D(this[internal][3], this[internal][2], this[internal][0]);
    }

    set wzx([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get wzy() {
        return new Vector3D(this[internal][3], this[internal][2], this[internal][1]);
    }

    set wzy([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get wzz() {
        return new Vector3D(this[internal][3], this[internal][2], this[internal][2]);
    }

    set wzz([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get wzw() {
        return new Vector3D(this[internal][3], this[internal][2], this[internal][3]);
    }

    set wzw([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
    }

    get wwx() {
        return new Vector3D(this[internal][3], this[internal][3], this[internal][0]);
    }

    set wwx([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
    }

    get wwy() {
        return new Vector3D(this[internal][3], this[internal][3], this[internal][1]);
    }

    set wwy([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
    }

    get wwz() {
        return new Vector3D(this[internal][3], this[internal][3], this[internal][2]);
    }

    set wwz([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
    }

    get www() {
        return new Vector3D(this[internal][3], this[internal][3], this[internal][3]);
    }

    set www([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
    }

    get xxxx() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][0]);
    }

    set xxxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get xxxy() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][1]);
    }

    set xxxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get xxxz() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][2]);
    }

    set xxxz([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get xxxw() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][3]);
    }

    set xxxw([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get xxyx() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][0]);
    }

    set xxyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get xxyy() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][1]);
    }

    set xxyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get xxyz() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][2]);
    }

    set xxyz([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get xxyw() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][3]);
    }

    set xxyw([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get xxzx() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][0]);
    }

    set xxzx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get xxzy() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][1]);
    }

    set xxzy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get xxzz() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][2]);
    }

    set xxzz([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get xxzw() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][3]);
    }

    set xxzw([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get xxwx() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][3], this[internal][0]);
    }

    set xxwx([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get xxwy() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][3], this[internal][1]);
    }

    set xxwy([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get xxwz() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][3], this[internal][2]);
    }

    set xxwz([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get xxww() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][3], this[internal][3]);
    }

    set xxww([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get xyxx() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][0]);
    }

    set xyxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get xyxy() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][1]);
    }

    set xyxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get xyxz() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][2]);
    }

    set xyxz([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get xyxw() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][3]);
    }

    set xyxw([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get xyyx() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][0]);
    }

    set xyyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get xyyy() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][1]);
    }

    set xyyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get xyyz() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][2]);
    }

    set xyyz([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get xyyw() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][3]);
    }

    set xyyw([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get xyzx() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][0]);
    }

    set xyzx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get xyzy() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][1]);
    }

    set xyzy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get xyzz() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][2]);
    }

    set xyzz([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get xyzw() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][3]);
    }

    set xyzw([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get xywx() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][3], this[internal][0]);
    }

    set xywx([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get xywy() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][3], this[internal][1]);
    }

    set xywy([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get xywz() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][3], this[internal][2]);
    }

    set xywz([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get xyww() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][3], this[internal][3]);
    }

    set xyww([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get xzxx() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][0]);
    }

    set xzxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get xzxy() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][1]);
    }

    set xzxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get xzxz() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][2]);
    }

    set xzxz([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get xzxw() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][3]);
    }

    set xzxw([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get xzyx() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][0]);
    }

    set xzyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get xzyy() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][1]);
    }

    set xzyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get xzyz() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][2]);
    }

    set xzyz([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get xzyw() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][3]);
    }

    set xzyw([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get xzzx() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][0]);
    }

    set xzzx([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get xzzy() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][1]);
    }

    set xzzy([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get xzzz() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][2]);
    }

    set xzzz([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get xzzw() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][3]);
    }

    set xzzw([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get xzwx() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][3], this[internal][0]);
    }

    set xzwx([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get xzwy() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][3], this[internal][1]);
    }

    set xzwy([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get xzwz() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][3], this[internal][2]);
    }

    set xzwz([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get xzww() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][3], this[internal][3]);
    }

    set xzww([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get xwxx() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][0], this[internal][0]);
    }

    set xwxx([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get xwxy() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][0], this[internal][1]);
    }

    set xwxy([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get xwxz() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][0], this[internal][2]);
    }

    set xwxz([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get xwxw() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][0], this[internal][3]);
    }

    set xwxw([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get xwyx() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][1], this[internal][0]);
    }

    set xwyx([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get xwyy() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][1], this[internal][1]);
    }

    set xwyy([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get xwyz() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][1], this[internal][2]);
    }

    set xwyz([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get xwyw() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][1], this[internal][3]);
    }

    set xwyw([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get xwzx() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][2], this[internal][0]);
    }

    set xwzx([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get xwzy() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][2], this[internal][1]);
    }

    set xwzy([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get xwzz() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][2], this[internal][2]);
    }

    set xwzz([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get xwzw() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][2], this[internal][3]);
    }

    set xwzw([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get xwwx() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][3], this[internal][0]);
    }

    set xwwx([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get xwwy() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][3], this[internal][1]);
    }

    set xwwy([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get xwwz() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][3], this[internal][2]);
    }

    set xwwz([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get xwww() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][3], this[internal][3]);
    }

    set xwww([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get yxxx() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][0]);
    }

    set yxxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get yxxy() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][1]);
    }

    set yxxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get yxxz() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][2]);
    }

    set yxxz([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get yxxw() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][3]);
    }

    set yxxw([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get yxyx() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][0]);
    }

    set yxyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get yxyy() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][1]);
    }

    set yxyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get yxyz() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][2]);
    }

    set yxyz([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get yxyw() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][3]);
    }

    set yxyw([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get yxzx() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][0]);
    }

    set yxzx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get yxzy() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][1]);
    }

    set yxzy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get yxzz() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][2]);
    }

    set yxzz([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get yxzw() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][3]);
    }

    set yxzw([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get yxwx() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][3], this[internal][0]);
    }

    set yxwx([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get yxwy() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][3], this[internal][1]);
    }

    set yxwy([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get yxwz() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][3], this[internal][2]);
    }

    set yxwz([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get yxww() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][3], this[internal][3]);
    }

    set yxww([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get yyxx() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][0]);
    }

    set yyxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get yyxy() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][1]);
    }

    set yyxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get yyxz() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][2]);
    }

    set yyxz([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get yyxw() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][3]);
    }

    set yyxw([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get yyyx() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][0]);
    }

    set yyyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get yyyy() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][1]);
    }

    set yyyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get yyyz() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][2]);
    }

    set yyyz([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get yyyw() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][3]);
    }

    set yyyw([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get yyzx() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][0]);
    }

    set yyzx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get yyzy() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][1]);
    }

    set yyzy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get yyzz() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][2]);
    }

    set yyzz([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get yyzw() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][3]);
    }

    set yyzw([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get yywx() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][3], this[internal][0]);
    }

    set yywx([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get yywy() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][3], this[internal][1]);
    }

    set yywy([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get yywz() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][3], this[internal][2]);
    }

    set yywz([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get yyww() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][3], this[internal][3]);
    }

    set yyww([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get yzxx() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][0]);
    }

    set yzxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get yzxy() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][1]);
    }

    set yzxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get yzxz() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][2]);
    }

    set yzxz([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get yzxw() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][3]);
    }

    set yzxw([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get yzyx() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][0]);
    }

    set yzyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get yzyy() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][1]);
    }

    set yzyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get yzyz() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][2]);
    }

    set yzyz([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get yzyw() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][3]);
    }

    set yzyw([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get yzzx() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][0]);
    }

    set yzzx([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get yzzy() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][1]);
    }

    set yzzy([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get yzzz() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][2]);
    }

    set yzzz([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get yzzw() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][3]);
    }

    set yzzw([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get yzwx() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][3], this[internal][0]);
    }

    set yzwx([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get yzwy() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][3], this[internal][1]);
    }

    set yzwy([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get yzwz() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][3], this[internal][2]);
    }

    set yzwz([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get yzww() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][3], this[internal][3]);
    }

    set yzww([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get ywxx() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][0], this[internal][0]);
    }

    set ywxx([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get ywxy() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][0], this[internal][1]);
    }

    set ywxy([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get ywxz() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][0], this[internal][2]);
    }

    set ywxz([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get ywxw() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][0], this[internal][3]);
    }

    set ywxw([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get ywyx() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][1], this[internal][0]);
    }

    set ywyx([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get ywyy() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][1], this[internal][1]);
    }

    set ywyy([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get ywyz() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][1], this[internal][2]);
    }

    set ywyz([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get ywyw() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][1], this[internal][3]);
    }

    set ywyw([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get ywzx() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][2], this[internal][0]);
    }

    set ywzx([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get ywzy() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][2], this[internal][1]);
    }

    set ywzy([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get ywzz() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][2], this[internal][2]);
    }

    set ywzz([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get ywzw() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][2], this[internal][3]);
    }

    set ywzw([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get ywwx() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][3], this[internal][0]);
    }

    set ywwx([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get ywwy() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][3], this[internal][1]);
    }

    set ywwy([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get ywwz() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][3], this[internal][2]);
    }

    set ywwz([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get ywww() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][3], this[internal][3]);
    }

    set ywww([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get zxxx() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][0]);
    }

    set zxxx([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get zxxy() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][1]);
    }

    set zxxy([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get zxxz() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][2]);
    }

    set zxxz([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get zxxw() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][3]);
    }

    set zxxw([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get zxyx() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][0]);
    }

    set zxyx([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get zxyy() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][1]);
    }

    set zxyy([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get zxyz() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][2]);
    }

    set zxyz([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get zxyw() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][3]);
    }

    set zxyw([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get zxzx() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][0]);
    }

    set zxzx([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get zxzy() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][1]);
    }

    set zxzy([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get zxzz() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][2]);
    }

    set zxzz([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get zxzw() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][3]);
    }

    set zxzw([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get zxwx() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][3], this[internal][0]);
    }

    set zxwx([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get zxwy() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][3], this[internal][1]);
    }

    set zxwy([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get zxwz() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][3], this[internal][2]);
    }

    set zxwz([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get zxww() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][3], this[internal][3]);
    }

    set zxww([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get zyxx() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][0]);
    }

    set zyxx([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get zyxy() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][1]);
    }

    set zyxy([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get zyxz() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][2]);
    }

    set zyxz([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get zyxw() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][3]);
    }

    set zyxw([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get zyyx() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][0]);
    }

    set zyyx([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get zyyy() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][1]);
    }

    set zyyy([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get zyyz() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][2]);
    }

    set zyyz([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get zyyw() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][3]);
    }

    set zyyw([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get zyzx() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][0]);
    }

    set zyzx([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get zyzy() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][1]);
    }

    set zyzy([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get zyzz() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][2]);
    }

    set zyzz([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get zyzw() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][3]);
    }

    set zyzw([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get zywx() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][3], this[internal][0]);
    }

    set zywx([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get zywy() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][3], this[internal][1]);
    }

    set zywy([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get zywz() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][3], this[internal][2]);
    }

    set zywz([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get zyww() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][3], this[internal][3]);
    }

    set zyww([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get zzxx() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][0]);
    }

    set zzxx([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get zzxy() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][1]);
    }

    set zzxy([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get zzxz() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][2]);
    }

    set zzxz([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get zzxw() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][3]);
    }

    set zzxw([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get zzyx() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][0]);
    }

    set zzyx([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get zzyy() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][1]);
    }

    set zzyy([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get zzyz() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][2]);
    }

    set zzyz([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get zzyw() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][3]);
    }

    set zzyw([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get zzzx() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][0]);
    }

    set zzzx([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get zzzy() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][1]);
    }

    set zzzy([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get zzzz() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][2]);
    }

    set zzzz([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get zzzw() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][3]);
    }

    set zzzw([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get zzwx() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][3], this[internal][0]);
    }

    set zzwx([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get zzwy() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][3], this[internal][1]);
    }

    set zzwy([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get zzwz() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][3], this[internal][2]);
    }

    set zzwz([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get zzww() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][3], this[internal][3]);
    }

    set zzww([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get zwxx() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][0], this[internal][0]);
    }

    set zwxx([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get zwxy() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][0], this[internal][1]);
    }

    set zwxy([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get zwxz() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][0], this[internal][2]);
    }

    set zwxz([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get zwxw() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][0], this[internal][3]);
    }

    set zwxw([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get zwyx() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][1], this[internal][0]);
    }

    set zwyx([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get zwyy() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][1], this[internal][1]);
    }

    set zwyy([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get zwyz() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][1], this[internal][2]);
    }

    set zwyz([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get zwyw() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][1], this[internal][3]);
    }

    set zwyw([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get zwzx() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][2], this[internal][0]);
    }

    set zwzx([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get zwzy() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][2], this[internal][1]);
    }

    set zwzy([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get zwzz() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][2], this[internal][2]);
    }

    set zwzz([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get zwzw() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][2], this[internal][3]);
    }

    set zwzw([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get zwwx() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][3], this[internal][0]);
    }

    set zwwx([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get zwwy() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][3], this[internal][1]);
    }

    set zwwy([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get zwwz() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][3], this[internal][2]);
    }

    set zwwz([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get zwww() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][3], this[internal][3]);
    }

    set zwww([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get wxxx() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][0], this[internal][0]);
    }

    set wxxx([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get wxxy() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][0], this[internal][1]);
    }

    set wxxy([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get wxxz() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][0], this[internal][2]);
    }

    set wxxz([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get wxxw() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][0], this[internal][3]);
    }

    set wxxw([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get wxyx() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][1], this[internal][0]);
    }

    set wxyx([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get wxyy() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][1], this[internal][1]);
    }

    set wxyy([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get wxyz() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][1], this[internal][2]);
    }

    set wxyz([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get wxyw() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][1], this[internal][3]);
    }

    set wxyw([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get wxzx() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][2], this[internal][0]);
    }

    set wxzx([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get wxzy() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][2], this[internal][1]);
    }

    set wxzy([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get wxzz() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][2], this[internal][2]);
    }

    set wxzz([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get wxzw() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][2], this[internal][3]);
    }

    set wxzw([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get wxwx() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][3], this[internal][0]);
    }

    set wxwx([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get wxwy() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][3], this[internal][1]);
    }

    set wxwy([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get wxwz() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][3], this[internal][2]);
    }

    set wxwz([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get wxww() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][3], this[internal][3]);
    }

    set wxww([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get wyxx() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][0], this[internal][0]);
    }

    set wyxx([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get wyxy() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][0], this[internal][1]);
    }

    set wyxy([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get wyxz() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][0], this[internal][2]);
    }

    set wyxz([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get wyxw() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][0], this[internal][3]);
    }

    set wyxw([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get wyyx() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][1], this[internal][0]);
    }

    set wyyx([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get wyyy() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][1], this[internal][1]);
    }

    set wyyy([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get wyyz() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][1], this[internal][2]);
    }

    set wyyz([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get wyyw() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][1], this[internal][3]);
    }

    set wyyw([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get wyzx() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][2], this[internal][0]);
    }

    set wyzx([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get wyzy() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][2], this[internal][1]);
    }

    set wyzy([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get wyzz() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][2], this[internal][2]);
    }

    set wyzz([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get wyzw() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][2], this[internal][3]);
    }

    set wyzw([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get wywx() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][3], this[internal][0]);
    }

    set wywx([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get wywy() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][3], this[internal][1]);
    }

    set wywy([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get wywz() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][3], this[internal][2]);
    }

    set wywz([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get wyww() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][3], this[internal][3]);
    }

    set wyww([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get wzxx() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][0], this[internal][0]);
    }

    set wzxx([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get wzxy() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][0], this[internal][1]);
    }

    set wzxy([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get wzxz() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][0], this[internal][2]);
    }

    set wzxz([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get wzxw() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][0], this[internal][3]);
    }

    set wzxw([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get wzyx() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][1], this[internal][0]);
    }

    set wzyx([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get wzyy() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][1], this[internal][1]);
    }

    set wzyy([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get wzyz() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][1], this[internal][2]);
    }

    set wzyz([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get wzyw() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][1], this[internal][3]);
    }

    set wzyw([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get wzzx() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][2], this[internal][0]);
    }

    set wzzx([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get wzzy() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][2], this[internal][1]);
    }

    set wzzy([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get wzzz() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][2], this[internal][2]);
    }

    set wzzz([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get wzzw() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][2], this[internal][3]);
    }

    set wzzw([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get wzwx() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][3], this[internal][0]);
    }

    set wzwx([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get wzwy() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][3], this[internal][1]);
    }

    set wzwy([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get wzwz() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][3], this[internal][2]);
    }

    set wzwz([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get wzww() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][3], this[internal][3]);
    }

    set wzww([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get wwxx() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][0], this[internal][0]);
    }

    set wwxx([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get wwxy() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][0], this[internal][1]);
    }

    set wwxy([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get wwxz() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][0], this[internal][2]);
    }

    set wwxz([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get wwxw() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][0], this[internal][3]);
    }

    set wwxw([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get wwyx() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][1], this[internal][0]);
    }

    set wwyx([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get wwyy() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][1], this[internal][1]);
    }

    set wwyy([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get wwyz() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][1], this[internal][2]);
    }

    set wwyz([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get wwyw() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][1], this[internal][3]);
    }

    set wwyw([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get wwzx() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][2], this[internal][0]);
    }

    set wwzx([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get wwzy() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][2], this[internal][1]);
    }

    set wwzy([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get wwzz() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][2], this[internal][2]);
    }

    set wwzz([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get wwzw() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][2], this[internal][3]);
    }

    set wwzw([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get wwwx() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][3], this[internal][0]);
    }

    set wwwx([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get wwwy() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][3], this[internal][1]);
    }

    set wwwy([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get wwwz() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][3], this[internal][2]);
    }

    set wwwz([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get wwww() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][3], this[internal][3]);
    }

    set wwww([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get r() {
        return this[internal][0];
    }

    set r(value) {
        this[internal][0] = +value;
    }

    get g() {
        return this[internal][1];
    }

    set g(value) {
        this[internal][1] = +value;
    }

    get b() {
        return this[internal][2];
    }

    set b(value) {
        this[internal][2] = +value;
    }

    get a() {
        return this[internal][3];
    }

    set a(value) {
        this[internal][3] = +value;
    }

    get rr() {
        return new Vector2D(this[internal][0], this[internal][0]);
    }

    set rr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
    }

    get rg() {
        return new Vector2D(this[internal][0], this[internal][1]);
    }

    set rg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
    }

    get rb() {
        return new Vector2D(this[internal][0], this[internal][2]);
    }

    set rb([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
    }

    get ra() {
        return new Vector2D(this[internal][0], this[internal][3]);
    }

    set ra([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
    }

    get gr() {
        return new Vector2D(this[internal][1], this[internal][0]);
    }

    set gr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
    }

    get gg() {
        return new Vector2D(this[internal][1], this[internal][1]);
    }

    set gg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
    }

    get gb() {
        return new Vector2D(this[internal][1], this[internal][2]);
    }

    set gb([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
    }

    get ga() {
        return new Vector2D(this[internal][1], this[internal][3]);
    }

    set ga([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
    }

    get br() {
        return new Vector2D(this[internal][2], this[internal][0]);
    }

    set br([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
    }

    get bg() {
        return new Vector2D(this[internal][2], this[internal][1]);
    }

    set bg([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
    }

    get bb() {
        return new Vector2D(this[internal][2], this[internal][2]);
    }

    set bb([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
    }

    get ba() {
        return new Vector2D(this[internal][2], this[internal][3]);
    }

    set ba([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
    }

    get ar() {
        return new Vector2D(this[internal][3], this[internal][0]);
    }

    set ar([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
    }

    get ag() {
        return new Vector2D(this[internal][3], this[internal][1]);
    }

    set ag([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
    }

    get ab() {
        return new Vector2D(this[internal][3], this[internal][2]);
    }

    set ab([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
    }

    get aa() {
        return new Vector2D(this[internal][3], this[internal][3]);
    }

    set aa([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
    }

    get rrr() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][0]);
    }

    set rrr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get rrg() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][1]);
    }

    set rrg([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get rrb() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][2]);
    }

    set rrb([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get rra() {
        return new Vector3D(this[internal][0], this[internal][0], this[internal][3]);
    }

    set rra([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
    }

    get rgr() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][0]);
    }

    set rgr([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get rgg() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][1]);
    }

    set rgg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get rgb() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][2]);
    }

    set rgb([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get rga() {
        return new Vector3D(this[internal][0], this[internal][1], this[internal][3]);
    }

    set rga([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
    }

    get rbr() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][0]);
    }

    set rbr([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get rbg() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][1]);
    }

    set rbg([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get rbb() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][2]);
    }

    set rbb([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get rba() {
        return new Vector3D(this[internal][0], this[internal][2], this[internal][3]);
    }

    set rba([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
    }

    get rar() {
        return new Vector3D(this[internal][0], this[internal][3], this[internal][0]);
    }

    set rar([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
    }

    get rag() {
        return new Vector3D(this[internal][0], this[internal][3], this[internal][1]);
    }

    set rag([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
    }

    get rab() {
        return new Vector3D(this[internal][0], this[internal][3], this[internal][2]);
    }

    set rab([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
    }

    get raa() {
        return new Vector3D(this[internal][0], this[internal][3], this[internal][3]);
    }

    set raa([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
    }

    get grr() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][0]);
    }

    set grr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get grg() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][1]);
    }

    set grg([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get grb() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][2]);
    }

    set grb([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get gra() {
        return new Vector3D(this[internal][1], this[internal][0], this[internal][3]);
    }

    set gra([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
    }

    get ggr() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][0]);
    }

    set ggr([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get ggg() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][1]);
    }

    set ggg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get ggb() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][2]);
    }

    set ggb([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get gga() {
        return new Vector3D(this[internal][1], this[internal][1], this[internal][3]);
    }

    set gga([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
    }

    get gbr() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][0]);
    }

    set gbr([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get gbg() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][1]);
    }

    set gbg([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get gbb() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][2]);
    }

    set gbb([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get gba() {
        return new Vector3D(this[internal][1], this[internal][2], this[internal][3]);
    }

    set gba([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
    }

    get gar() {
        return new Vector3D(this[internal][1], this[internal][3], this[internal][0]);
    }

    set gar([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
    }

    get gag() {
        return new Vector3D(this[internal][1], this[internal][3], this[internal][1]);
    }

    set gag([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
    }

    get gab() {
        return new Vector3D(this[internal][1], this[internal][3], this[internal][2]);
    }

    set gab([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
    }

    get gaa() {
        return new Vector3D(this[internal][1], this[internal][3], this[internal][3]);
    }

    set gaa([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
    }

    get brr() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][0]);
    }

    set brr([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get brg() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][1]);
    }

    set brg([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get brb() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][2]);
    }

    set brb([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get bra() {
        return new Vector3D(this[internal][2], this[internal][0], this[internal][3]);
    }

    set bra([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
    }

    get bgr() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][0]);
    }

    set bgr([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get bgg() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][1]);
    }

    set bgg([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get bgb() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][2]);
    }

    set bgb([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get bga() {
        return new Vector3D(this[internal][2], this[internal][1], this[internal][3]);
    }

    set bga([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
    }

    get bbr() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][0]);
    }

    set bbr([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get bbg() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][1]);
    }

    set bbg([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get bbb() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][2]);
    }

    set bbb([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get bba() {
        return new Vector3D(this[internal][2], this[internal][2], this[internal][3]);
    }

    set bba([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
    }

    get bar() {
        return new Vector3D(this[internal][2], this[internal][3], this[internal][0]);
    }

    set bar([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
    }

    get bag() {
        return new Vector3D(this[internal][2], this[internal][3], this[internal][1]);
    }

    set bag([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
    }

    get bab() {
        return new Vector3D(this[internal][2], this[internal][3], this[internal][2]);
    }

    set bab([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
    }

    get baa() {
        return new Vector3D(this[internal][2], this[internal][3], this[internal][3]);
    }

    set baa([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
    }

    get arr() {
        return new Vector3D(this[internal][3], this[internal][0], this[internal][0]);
    }

    set arr([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
    }

    get arg() {
        return new Vector3D(this[internal][3], this[internal][0], this[internal][1]);
    }

    set arg([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
    }

    get arb() {
        return new Vector3D(this[internal][3], this[internal][0], this[internal][2]);
    }

    set arb([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
    }

    get ara() {
        return new Vector3D(this[internal][3], this[internal][0], this[internal][3]);
    }

    set ara([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
    }

    get agr() {
        return new Vector3D(this[internal][3], this[internal][1], this[internal][0]);
    }

    set agr([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
    }

    get agg() {
        return new Vector3D(this[internal][3], this[internal][1], this[internal][1]);
    }

    set agg([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
    }

    get agb() {
        return new Vector3D(this[internal][3], this[internal][1], this[internal][2]);
    }

    set agb([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
    }

    get aga() {
        return new Vector3D(this[internal][3], this[internal][1], this[internal][3]);
    }

    set aga([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
    }

    get abr() {
        return new Vector3D(this[internal][3], this[internal][2], this[internal][0]);
    }

    set abr([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
    }

    get abg() {
        return new Vector3D(this[internal][3], this[internal][2], this[internal][1]);
    }

    set abg([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
    }

    get abb() {
        return new Vector3D(this[internal][3], this[internal][2], this[internal][2]);
    }

    set abb([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
    }

    get aba() {
        return new Vector3D(this[internal][3], this[internal][2], this[internal][3]);
    }

    set aba([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
    }

    get aar() {
        return new Vector3D(this[internal][3], this[internal][3], this[internal][0]);
    }

    set aar([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
    }

    get aag() {
        return new Vector3D(this[internal][3], this[internal][3], this[internal][1]);
    }

    set aag([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
    }

    get aab() {
        return new Vector3D(this[internal][3], this[internal][3], this[internal][2]);
    }

    set aab([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
    }

    get aaa() {
        return new Vector3D(this[internal][3], this[internal][3], this[internal][3]);
    }

    set aaa([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
    }

    get rrrr() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][0]);
    }

    set rrrr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get rrrg() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][1]);
    }

    set rrrg([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get rrrb() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][2]);
    }

    set rrrb([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get rrra() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][0], this[internal][3]);
    }

    set rrra([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get rrgr() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][0]);
    }

    set rrgr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get rrgg() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][1]);
    }

    set rrgg([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get rrgb() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][2]);
    }

    set rrgb([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get rrga() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][1], this[internal][3]);
    }

    set rrga([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get rrbr() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][0]);
    }

    set rrbr([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get rrbg() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][1]);
    }

    set rrbg([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get rrbb() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][2]);
    }

    set rrbb([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get rrba() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][2], this[internal][3]);
    }

    set rrba([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get rrar() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][3], this[internal][0]);
    }

    set rrar([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get rrag() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][3], this[internal][1]);
    }

    set rrag([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get rrab() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][3], this[internal][2]);
    }

    set rrab([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get rraa() {
        return new Vector4D(this[internal][0], this[internal][0], this[internal][3], this[internal][3]);
    }

    set rraa([...items]) {
        this[internal][0] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get rgrr() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][0]);
    }

    set rgrr([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get rgrg() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][1]);
    }

    set rgrg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get rgrb() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][2]);
    }

    set rgrb([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get rgra() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][0], this[internal][3]);
    }

    set rgra([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get rggr() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][0]);
    }

    set rggr([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get rggg() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][1]);
    }

    set rggg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get rggb() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][2]);
    }

    set rggb([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get rgga() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][1], this[internal][3]);
    }

    set rgga([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get rgbr() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][0]);
    }

    set rgbr([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get rgbg() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][1]);
    }

    set rgbg([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get rgbb() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][2]);
    }

    set rgbb([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get rgba() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][2], this[internal][3]);
    }

    set rgba([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get rgar() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][3], this[internal][0]);
    }

    set rgar([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get rgag() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][3], this[internal][1]);
    }

    set rgag([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get rgab() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][3], this[internal][2]);
    }

    set rgab([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get rgaa() {
        return new Vector4D(this[internal][0], this[internal][1], this[internal][3], this[internal][3]);
    }

    set rgaa([...items]) {
        this[internal][0] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get rbrr() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][0]);
    }

    set rbrr([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get rbrg() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][1]);
    }

    set rbrg([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get rbrb() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][2]);
    }

    set rbrb([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get rbra() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][0], this[internal][3]);
    }

    set rbra([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get rbgr() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][0]);
    }

    set rbgr([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get rbgg() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][1]);
    }

    set rbgg([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get rbgb() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][2]);
    }

    set rbgb([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get rbga() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][1], this[internal][3]);
    }

    set rbga([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get rbbr() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][0]);
    }

    set rbbr([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get rbbg() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][1]);
    }

    set rbbg([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get rbbb() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][2]);
    }

    set rbbb([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get rbba() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][2], this[internal][3]);
    }

    set rbba([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get rbar() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][3], this[internal][0]);
    }

    set rbar([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get rbag() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][3], this[internal][1]);
    }

    set rbag([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get rbab() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][3], this[internal][2]);
    }

    set rbab([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get rbaa() {
        return new Vector4D(this[internal][0], this[internal][2], this[internal][3], this[internal][3]);
    }

    set rbaa([...items]) {
        this[internal][0] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get rarr() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][0], this[internal][0]);
    }

    set rarr([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get rarg() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][0], this[internal][1]);
    }

    set rarg([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get rarb() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][0], this[internal][2]);
    }

    set rarb([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get rara() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][0], this[internal][3]);
    }

    set rara([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get ragr() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][1], this[internal][0]);
    }

    set ragr([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get ragg() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][1], this[internal][1]);
    }

    set ragg([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get ragb() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][1], this[internal][2]);
    }

    set ragb([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get raga() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][1], this[internal][3]);
    }

    set raga([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get rabr() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][2], this[internal][0]);
    }

    set rabr([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get rabg() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][2], this[internal][1]);
    }

    set rabg([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get rabb() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][2], this[internal][2]);
    }

    set rabb([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get raba() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][2], this[internal][3]);
    }

    set raba([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get raar() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][3], this[internal][0]);
    }

    set raar([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get raag() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][3], this[internal][1]);
    }

    set raag([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get raab() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][3], this[internal][2]);
    }

    set raab([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get raaa() {
        return new Vector4D(this[internal][0], this[internal][3], this[internal][3], this[internal][3]);
    }

    set raaa([...items]) {
        this[internal][0] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get grrr() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][0]);
    }

    set grrr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get grrg() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][1]);
    }

    set grrg([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get grrb() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][2]);
    }

    set grrb([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get grra() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][0], this[internal][3]);
    }

    set grra([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get grgr() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][0]);
    }

    set grgr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get grgg() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][1]);
    }

    set grgg([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get grgb() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][2]);
    }

    set grgb([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get grga() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][1], this[internal][3]);
    }

    set grga([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get grbr() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][0]);
    }

    set grbr([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get grbg() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][1]);
    }

    set grbg([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get grbb() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][2]);
    }

    set grbb([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get grba() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][2], this[internal][3]);
    }

    set grba([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get grar() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][3], this[internal][0]);
    }

    set grar([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get grag() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][3], this[internal][1]);
    }

    set grag([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get grab() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][3], this[internal][2]);
    }

    set grab([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get graa() {
        return new Vector4D(this[internal][1], this[internal][0], this[internal][3], this[internal][3]);
    }

    set graa([...items]) {
        this[internal][1] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get ggrr() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][0]);
    }

    set ggrr([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get ggrg() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][1]);
    }

    set ggrg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get ggrb() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][2]);
    }

    set ggrb([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get ggra() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][0], this[internal][3]);
    }

    set ggra([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get gggr() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][0]);
    }

    set gggr([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get gggg() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][1]);
    }

    set gggg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get gggb() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][2]);
    }

    set gggb([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get ggga() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][1], this[internal][3]);
    }

    set ggga([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get ggbr() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][0]);
    }

    set ggbr([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get ggbg() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][1]);
    }

    set ggbg([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get ggbb() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][2]);
    }

    set ggbb([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get ggba() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][2], this[internal][3]);
    }

    set ggba([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get ggar() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][3], this[internal][0]);
    }

    set ggar([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get ggag() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][3], this[internal][1]);
    }

    set ggag([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get ggab() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][3], this[internal][2]);
    }

    set ggab([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get ggaa() {
        return new Vector4D(this[internal][1], this[internal][1], this[internal][3], this[internal][3]);
    }

    set ggaa([...items]) {
        this[internal][1] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get gbrr() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][0]);
    }

    set gbrr([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get gbrg() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][1]);
    }

    set gbrg([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get gbrb() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][2]);
    }

    set gbrb([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get gbra() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][0], this[internal][3]);
    }

    set gbra([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get gbgr() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][0]);
    }

    set gbgr([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get gbgg() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][1]);
    }

    set gbgg([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get gbgb() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][2]);
    }

    set gbgb([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get gbga() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][1], this[internal][3]);
    }

    set gbga([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get gbbr() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][0]);
    }

    set gbbr([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get gbbg() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][1]);
    }

    set gbbg([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get gbbb() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][2]);
    }

    set gbbb([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get gbba() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][2], this[internal][3]);
    }

    set gbba([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get gbar() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][3], this[internal][0]);
    }

    set gbar([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get gbag() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][3], this[internal][1]);
    }

    set gbag([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get gbab() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][3], this[internal][2]);
    }

    set gbab([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get gbaa() {
        return new Vector4D(this[internal][1], this[internal][2], this[internal][3], this[internal][3]);
    }

    set gbaa([...items]) {
        this[internal][1] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get garr() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][0], this[internal][0]);
    }

    set garr([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get garg() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][0], this[internal][1]);
    }

    set garg([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get garb() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][0], this[internal][2]);
    }

    set garb([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get gara() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][0], this[internal][3]);
    }

    set gara([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get gagr() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][1], this[internal][0]);
    }

    set gagr([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get gagg() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][1], this[internal][1]);
    }

    set gagg([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get gagb() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][1], this[internal][2]);
    }

    set gagb([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get gaga() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][1], this[internal][3]);
    }

    set gaga([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get gabr() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][2], this[internal][0]);
    }

    set gabr([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get gabg() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][2], this[internal][1]);
    }

    set gabg([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get gabb() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][2], this[internal][2]);
    }

    set gabb([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get gaba() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][2], this[internal][3]);
    }

    set gaba([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get gaar() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][3], this[internal][0]);
    }

    set gaar([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get gaag() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][3], this[internal][1]);
    }

    set gaag([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get gaab() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][3], this[internal][2]);
    }

    set gaab([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get gaaa() {
        return new Vector4D(this[internal][1], this[internal][3], this[internal][3], this[internal][3]);
    }

    set gaaa([...items]) {
        this[internal][1] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get brrr() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][0]);
    }

    set brrr([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get brrg() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][1]);
    }

    set brrg([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get brrb() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][2]);
    }

    set brrb([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get brra() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][0], this[internal][3]);
    }

    set brra([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get brgr() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][0]);
    }

    set brgr([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get brgg() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][1]);
    }

    set brgg([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get brgb() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][2]);
    }

    set brgb([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get brga() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][1], this[internal][3]);
    }

    set brga([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get brbr() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][0]);
    }

    set brbr([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get brbg() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][1]);
    }

    set brbg([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get brbb() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][2]);
    }

    set brbb([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get brba() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][2], this[internal][3]);
    }

    set brba([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get brar() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][3], this[internal][0]);
    }

    set brar([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get brag() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][3], this[internal][1]);
    }

    set brag([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get brab() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][3], this[internal][2]);
    }

    set brab([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get braa() {
        return new Vector4D(this[internal][2], this[internal][0], this[internal][3], this[internal][3]);
    }

    set braa([...items]) {
        this[internal][2] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get bgrr() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][0]);
    }

    set bgrr([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get bgrg() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][1]);
    }

    set bgrg([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get bgrb() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][2]);
    }

    set bgrb([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get bgra() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][0], this[internal][3]);
    }

    set bgra([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get bggr() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][0]);
    }

    set bggr([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get bggg() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][1]);
    }

    set bggg([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get bggb() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][2]);
    }

    set bggb([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get bgga() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][1], this[internal][3]);
    }

    set bgga([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get bgbr() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][0]);
    }

    set bgbr([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get bgbg() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][1]);
    }

    set bgbg([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get bgbb() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][2]);
    }

    set bgbb([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get bgba() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][2], this[internal][3]);
    }

    set bgba([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get bgar() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][3], this[internal][0]);
    }

    set bgar([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get bgag() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][3], this[internal][1]);
    }

    set bgag([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get bgab() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][3], this[internal][2]);
    }

    set bgab([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get bgaa() {
        return new Vector4D(this[internal][2], this[internal][1], this[internal][3], this[internal][3]);
    }

    set bgaa([...items]) {
        this[internal][2] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get bbrr() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][0]);
    }

    set bbrr([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get bbrg() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][1]);
    }

    set bbrg([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get bbrb() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][2]);
    }

    set bbrb([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get bbra() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][0], this[internal][3]);
    }

    set bbra([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get bbgr() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][0]);
    }

    set bbgr([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get bbgg() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][1]);
    }

    set bbgg([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get bbgb() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][2]);
    }

    set bbgb([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get bbga() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][1], this[internal][3]);
    }

    set bbga([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get bbbr() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][0]);
    }

    set bbbr([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get bbbg() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][1]);
    }

    set bbbg([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get bbbb() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][2]);
    }

    set bbbb([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get bbba() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][2], this[internal][3]);
    }

    set bbba([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get bbar() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][3], this[internal][0]);
    }

    set bbar([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get bbag() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][3], this[internal][1]);
    }

    set bbag([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get bbab() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][3], this[internal][2]);
    }

    set bbab([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get bbaa() {
        return new Vector4D(this[internal][2], this[internal][2], this[internal][3], this[internal][3]);
    }

    set bbaa([...items]) {
        this[internal][2] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get barr() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][0], this[internal][0]);
    }

    set barr([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get barg() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][0], this[internal][1]);
    }

    set barg([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get barb() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][0], this[internal][2]);
    }

    set barb([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get bara() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][0], this[internal][3]);
    }

    set bara([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get bagr() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][1], this[internal][0]);
    }

    set bagr([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get bagg() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][1], this[internal][1]);
    }

    set bagg([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get bagb() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][1], this[internal][2]);
    }

    set bagb([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get baga() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][1], this[internal][3]);
    }

    set baga([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get babr() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][2], this[internal][0]);
    }

    set babr([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get babg() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][2], this[internal][1]);
    }

    set babg([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get babb() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][2], this[internal][2]);
    }

    set babb([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get baba() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][2], this[internal][3]);
    }

    set baba([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get baar() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][3], this[internal][0]);
    }

    set baar([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get baag() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][3], this[internal][1]);
    }

    set baag([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get baab() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][3], this[internal][2]);
    }

    set baab([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get baaa() {
        return new Vector4D(this[internal][2], this[internal][3], this[internal][3], this[internal][3]);
    }

    set baaa([...items]) {
        this[internal][2] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get arrr() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][0], this[internal][0]);
    }

    set arrr([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get arrg() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][0], this[internal][1]);
    }

    set arrg([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get arrb() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][0], this[internal][2]);
    }

    set arrb([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get arra() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][0], this[internal][3]);
    }

    set arra([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get argr() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][1], this[internal][0]);
    }

    set argr([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get argg() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][1], this[internal][1]);
    }

    set argg([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get argb() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][1], this[internal][2]);
    }

    set argb([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get arga() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][1], this[internal][3]);
    }

    set arga([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get arbr() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][2], this[internal][0]);
    }

    set arbr([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get arbg() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][2], this[internal][1]);
    }

    set arbg([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get arbb() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][2], this[internal][2]);
    }

    set arbb([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get arba() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][2], this[internal][3]);
    }

    set arba([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get arar() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][3], this[internal][0]);
    }

    set arar([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get arag() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][3], this[internal][1]);
    }

    set arag([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get arab() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][3], this[internal][2]);
    }

    set arab([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get araa() {
        return new Vector4D(this[internal][3], this[internal][0], this[internal][3], this[internal][3]);
    }

    set araa([...items]) {
        this[internal][3] = +items[0];
        this[internal][0] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get agrr() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][0], this[internal][0]);
    }

    set agrr([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get agrg() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][0], this[internal][1]);
    }

    set agrg([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get agrb() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][0], this[internal][2]);
    }

    set agrb([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get agra() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][0], this[internal][3]);
    }

    set agra([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get aggr() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][1], this[internal][0]);
    }

    set aggr([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get aggg() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][1], this[internal][1]);
    }

    set aggg([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get aggb() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][1], this[internal][2]);
    }

    set aggb([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get agga() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][1], this[internal][3]);
    }

    set agga([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get agbr() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][2], this[internal][0]);
    }

    set agbr([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get agbg() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][2], this[internal][1]);
    }

    set agbg([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get agbb() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][2], this[internal][2]);
    }

    set agbb([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get agba() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][2], this[internal][3]);
    }

    set agba([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get agar() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][3], this[internal][0]);
    }

    set agar([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get agag() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][3], this[internal][1]);
    }

    set agag([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get agab() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][3], this[internal][2]);
    }

    set agab([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get agaa() {
        return new Vector4D(this[internal][3], this[internal][1], this[internal][3], this[internal][3]);
    }

    set agaa([...items]) {
        this[internal][3] = +items[0];
        this[internal][1] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get abrr() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][0], this[internal][0]);
    }

    set abrr([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get abrg() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][0], this[internal][1]);
    }

    set abrg([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get abrb() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][0], this[internal][2]);
    }

    set abrb([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get abra() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][0], this[internal][3]);
    }

    set abra([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get abgr() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][1], this[internal][0]);
    }

    set abgr([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get abgg() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][1], this[internal][1]);
    }

    set abgg([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get abgb() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][1], this[internal][2]);
    }

    set abgb([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get abga() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][1], this[internal][3]);
    }

    set abga([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get abbr() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][2], this[internal][0]);
    }

    set abbr([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get abbg() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][2], this[internal][1]);
    }

    set abbg([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get abbb() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][2], this[internal][2]);
    }

    set abbb([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get abba() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][2], this[internal][3]);
    }

    set abba([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get abar() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][3], this[internal][0]);
    }

    set abar([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get abag() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][3], this[internal][1]);
    }

    set abag([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get abab() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][3], this[internal][2]);
    }

    set abab([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get abaa() {
        return new Vector4D(this[internal][3], this[internal][2], this[internal][3], this[internal][3]);
    }

    set abaa([...items]) {
        this[internal][3] = +items[0];
        this[internal][2] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }

    get aarr() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][0], this[internal][0]);
    }

    set aarr([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][0] = +items[3];
    }

    get aarg() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][0], this[internal][1]);
    }

    set aarg([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][1] = +items[3];
    }

    get aarb() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][0], this[internal][2]);
    }

    set aarb([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][2] = +items[3];
    }

    get aara() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][0], this[internal][3]);
    }

    set aara([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][0] = +items[2];
        this[internal][3] = +items[3];
    }

    get aagr() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][1], this[internal][0]);
    }

    set aagr([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][0] = +items[3];
    }

    get aagg() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][1], this[internal][1]);
    }

    set aagg([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][1] = +items[3];
    }

    get aagb() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][1], this[internal][2]);
    }

    set aagb([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][2] = +items[3];
    }

    get aaga() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][1], this[internal][3]);
    }

    set aaga([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][1] = +items[2];
        this[internal][3] = +items[3];
    }

    get aabr() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][2], this[internal][0]);
    }

    set aabr([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][0] = +items[3];
    }

    get aabg() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][2], this[internal][1]);
    }

    set aabg([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][1] = +items[3];
    }

    get aabb() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][2], this[internal][2]);
    }

    set aabb([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][2] = +items[3];
    }

    get aaba() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][2], this[internal][3]);
    }

    set aaba([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][2] = +items[2];
        this[internal][3] = +items[3];
    }

    get aaar() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][3], this[internal][0]);
    }

    set aaar([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][0] = +items[3];
    }

    get aaag() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][3], this[internal][1]);
    }

    set aaag([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][1] = +items[3];
    }

    get aaab() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][3], this[internal][2]);
    }

    set aaab([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][2] = +items[3];
    }

    get aaaa() {
        return new Vector4D(this[internal][3], this[internal][3], this[internal][3], this[internal][3]);
    }

    set aaaa([...items]) {
        this[internal][3] = +items[0];
        this[internal][3] = +items[1];
        this[internal][3] = +items[2];
        this[internal][3] = +items[3];
    }
}

const Vector4D_polymorphism = Vector4D.prototype[polymorphism] = Symbol(`Vector4D.polymorphism`);

Object.defineProperties(Vector4D.prototype, {
    0: {
        enumerable: true,
        get() {
            return this[internal][0];
        },
        set(value) {
            this[internal][0] = +value;
        }
    },
    1: {
        enumerable: true,
        get() {
            return this[internal][1];
        },
        set(value) {
            this[internal][1] = +value;
        }
    },
    2: {
        enumerable: true,
        get() {
            return this[internal][2];
        },
        set(value) {
            this[internal][2] = +value;
        }
    },
    3: {
        enumerable: true,
        get() {
            return this[internal][3];
        },
        set(value) {
            this[internal][3] = +value;
        }
    },
    size: {
        enumerable: true,
        value: 4
    },
    [Symbol.toStringTag]: {
        value: 'Vector4D'
    }
});

Vector[4] = Vector4D;

export class Matrix2x2 {
    constructor(...args) {
        let items = recursive_items_from_args(4, args);
        if (items.length === 0) {
            items = [1, 0, 0, 1];
        } else if (items.length !== 4) {
            throw new TypeError(`Invalid number of arguments: expected 0, or 4, got ${items.length}`);
        }
        matrix_init_from_values_row_major(this, 2, 2, items);
    }

    static from_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 2, 2, vectors, true);
    }

    static using_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 2, 2, vectors, false);
    }

    static from_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 2, 2, vectors, true);
    }

    static using_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 2, 2, vectors, false);
    }

    set_identity() {
        this.rows[0].set(1, 0);
        this.rows[1].set(0, 1);
        return this;
    }

    rotation(...args) {
        return mul(Matrix2x2.rotation(...args), this);
    }

    scale(...args) {
        return mul(Matrix2x2.scale(...args), this);
    }

    static rotation(radians) {
        return new Matrix2x2(
            Math.cos(radians),
            -Math.sin(radians),
            Math.sin(radians),
            Math.cos(radians)
        );
    }

    static scale(...axis) {
        axis = new Vector2D(...axis);
        return new Matrix2x2(
            axis.x, 0,
            0, axis.y
        );
    }
}

const Matrix2x2_polymorphism = Matrix2x2.prototype[polymorphism] = Symbol('Matrix2x2.polymorphism');

Object.defineProperties(Matrix2x2.prototype, {
    [Symbol.toStringTag]: {
        value: 'Matrix2x2'
    }
});

Matrix[2][2] = Matrix2x2;

export class Matrix2x3 {
    constructor(...args) {
        let items = recursive_items_from_args(6, args);
        if (items.length === 0) {
            items = [0, 0, 0, 0, 0, 0];
        } else if (items.length !== 6) {
            throw new TypeError(`Invalid number of arguments: expected 0, or 6, got ${items.length}`);
        }
        matrix_init_from_values_row_major(this, 2, 3, items);
    }

    static from_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 2, 3, vectors, true);
    }

    static using_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 2, 3, vectors, false);
    }

    static from_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 2, 3, vectors, true);
    }

    static using_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 2, 3, vectors, false);
    }
}

const Matrix2x3_polymorphism = Matrix2x3.prototype[polymorphism] = Symbol('Matrix2x3.polymorphism');

Object.defineProperties(Matrix2x3.prototype, {
    [Symbol.toStringTag]: {
        value: 'Matrix2x3'
    }
});

Matrix[2][3] = Matrix2x3;

export class Matrix2x4 {
    constructor(...args) {
        let items = recursive_items_from_args(8, args);
        if (items.length === 0) {
            items = [0, 0, 0, 0, 0, 0, 0, 0];
        } else if (items.length !== 8) {
            throw new TypeError(`Invalid number of arguments: expected 0, or 8, got ${items.length}`);
        }
        matrix_init_from_values_row_major(this, 2, 4, items);
    }

    static from_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 2, 4, vectors, true);
    }

    static using_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 2, 4, vectors, false);
    }

    static from_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 2, 4, vectors, true);
    }

    static using_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 2, 4, vectors, false);
    }
}

const Matrix2x4_polymorphism = Matrix2x4.prototype[polymorphism] = Symbol('Matrix2x4.polymorphism');

Object.defineProperties(Matrix2x4.prototype, {
    [Symbol.toStringTag]: {
        value: 'Matrix2x4'
    }
});

Matrix[2][4] = Matrix2x4;

export class Matrix3x2 {
    constructor(...args) {
        let items = recursive_items_from_args(6, args);
        if (items.length === 0) {
            items = [0, 0, 0, 0, 0, 0];
        } else if (items.length !== 6) {
            throw new TypeError(`Invalid number of arguments: expected 0, or 6, got ${items.length}`);
        }
        matrix_init_from_values_row_major(this, 3, 2, items);
    }

    static from_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 3, 2, vectors, true);
    }

    static using_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 3, 2, vectors, false);
    }

    static from_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 3, 2, vectors, true);
    }

    static using_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 3, 2, vectors, false);
    }
}

const Matrix3x2_polymorphism = Matrix3x2.prototype[polymorphism] = Symbol('Matrix3x2.polymorphism');

Object.defineProperties(Matrix3x2.prototype, {
    [Symbol.toStringTag]: {
        value: 'Matrix3x2'
    }
});

Matrix[3][2] = Matrix3x2;

export class Matrix3x3 {
    constructor(...args) {
        let items = recursive_items_from_args(9, args);
        if (items.length === 0) {
            items = [1, 0, 0, 0, 1, 0, 0, 0, 1];
        } else if (items.length !== 9) {
            throw new TypeError(`Invalid number of arguments: expected 0, or 9, got ${items.length}`);
        }
        matrix_init_from_values_row_major(this, 3, 3, items);
    }

    static from_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 3, 3, vectors, true);
    }

    static using_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 3, 3, vectors, false);
    }

    static from_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 3, 3, vectors, true);
    }

    static using_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 3, 3, vectors, false);
    }

    set_identity() {
        this.rows[0].set(1, 0, 0);
        this.rows[1].set(0, 1, 0);
        this.rows[2].set(0, 0, 1);
        return this;
    }

    rotation(...args) {
        return mul(Matrix3x3.rotation(...args), this);
    }

    scale(...args) {
        return mul(Matrix3x3.scale(...args), this);
    }

    translation(...args) {
        return mul(Matrix3x3.translation(...args), this);
    }

    static translation(...args) {
        const vector = new Vector2D(...args);
        return Matrix3x3.using_columns(
            new Vector3D(1, 0, 0),
            new Vector3D(0, 1, 0),
            new Vector3D(vector, 1)
        );
    }

    static rotation(radians, ...axis) {
        if (axis.length === 0) {
            return new Matrix3x3(
                Math.cos(radians), -Math.sin(radians), 0,
                Math.sin(radians), Math.cos(radians), 0,
                0, 0, 1
            );
        } else {
            const q = Vector4D.quaternions(radians, ...axis);
            return new Matrix3x3(
                1 - 2 * q.y * q.y - 2 * q.z * q.z, 2 * q.x * q.y - 2 * q.z * q.w, 2 * q.x * q.z + 2 * q.y * q.w,
                2 * q.x * q.y + 2 * q.z * q.w, 1 - 2 * q.x * q.x - 2 * q.z * q.z, 2 * q.y * q.z - 2 * q.x * q.w,
                2 * q.x * q.z - 2 * q.y * q.w, 2 * q.y * q.z + 2 * q.x * q.w, 1 - 2 * q.x * q.x - 2 * q.y * q.y
            );
        }
    }

    static scale(...args) {
        let axis = recursive_items_from_args(3, args);
        if (axis.length === 2) {
            return new Matrix3x3(
                axis[0], 0, 0,
                0, axis[1], 0,
                0, 0, 1
            );
        }
        axis = new Vector3D(...args);
        return new Matrix3x3(
            axis[0], 0, 0,
            0, axis[1], 0,
            0, 0, axis[2]
        );
    }
}

const Matrix3x3_polymorphism = Matrix3x3.prototype[polymorphism] = Symbol('Matrix3x3.polymorphism');

Object.defineProperties(Matrix3x3.prototype, {
    [Symbol.toStringTag]: {
        value: 'Matrix3x3'
    }
});

Matrix[3][3] = Matrix3x3;

export class Matrix3x4 {
    constructor(...args) {
        let items = recursive_items_from_args(12, args);
        if (items.length === 0) {
            items = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        } else if (items.length !== 12) {
            throw new TypeError(`Invalid number of arguments: expected 0, or 12, got ${items.length}`);
        }
        matrix_init_from_values_row_major(this, 3, 4, items);
    }

    static from_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 3, 4, vectors, true);
    }

    static using_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 3, 4, vectors, false);
    }

    static from_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 3, 4, vectors, true);
    }

    static using_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 3, 4, vectors, false);
    }
}

const Matrix3x4_polymorphism = Matrix3x4.prototype[polymorphism] = Symbol('Matrix3x4.polymorphism');

Object.defineProperties(Matrix3x4.prototype, {
    [Symbol.toStringTag]: {
        value: 'Matrix3x4'
    }
});

Matrix[3][4] = Matrix3x4;

export class Matrix4x2 {
    constructor(...args) {
        let items = recursive_items_from_args(8, args);
        if (items.length === 0) {
            items = [0, 0, 0, 0, 0, 0, 0, 0];
        } else if (items.length !== 8) {
            throw new TypeError(`Invalid number of arguments: expected 0, or 8, got ${items.length}`);
        }
        matrix_init_from_values_row_major(this, 4, 2, items);
    }

    static from_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 4, 2, vectors, true);
    }

    static using_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 4, 2, vectors, false);
    }

    static from_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 4, 2, vectors, true);
    }

    static using_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 4, 2, vectors, false);
    }
}

const Matrix4x2_polymorphism = Matrix4x2.prototype[polymorphism] = Symbol('Matrix4x2.polymorphism');

Object.defineProperties(Matrix4x2.prototype, {
    [Symbol.toStringTag]: {
        value: 'Matrix4x2'
    }
});

Matrix[4][2] = Matrix4x2;

export class Matrix4x3 {
    constructor(...args) {
        let items = recursive_items_from_args(12, args);
        if (items.length === 0) {
            items = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        } else if (items.length !== 12) {
            throw new TypeError(`Invalid number of arguments: expected 0, or 12, got ${items.length}`);
        }
        matrix_init_from_values_row_major(this, 4, 3, items);
    }

    static from_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 4, 3, vectors, true);
    }

    static using_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 4, 3, vectors, false);
    }

    static from_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 4, 3, vectors, true);
    }

    static using_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 4, 3, vectors, false);
    }
}

const Matrix4x3_polymorphism = Matrix4x3.prototype[polymorphism] = Symbol('Matrix4x3.polymorphism');

Object.defineProperties(Matrix4x3.prototype, {
    [Symbol.toStringTag]: {
        value: 'Matrix4x3'
    }
});

Matrix[4][3] = Matrix4x3;

export class Matrix4x4 {
    constructor(...args) {
        let items = recursive_items_from_args(16, args);
        if (items.length === 0) {
            items = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        } else if (items.length !== 16) {
            throw new TypeError(`Invalid number of arguments: expected 0, or 16, got ${items.length}`);
        }
        matrix_init_from_values_row_major(this, 4, 4, items);
    }

    static from_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 4, 4, vectors, true);
    }

    static using_rows(...vectors) {
        return matrix_create_from_row_vectors(this, 4, 4, vectors, false);
    }

    static from_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 4, 4, vectors, true);
    }

    static using_columns(...vectors) {
        return matrix_create_from_column_vectors(this, 4, 4, vectors, false);
    }

    set_identity() {
        this.rows[0].set(1, 0, 0, 0);
        this.rows[1].set(0, 1, 0, 0);
        this.rows[2].set(0, 0, 1, 0);
        this.rows[3].set(0, 0, 0, 1);
        return this;
    }

    rotation(...args) {
        return mul(Matrix4x4.rotation(...args), this);
    }

    scale(...args) {
        return mul(Matrix4x4.scale(...args), this);
    }

    translation(...args) {
        return mul(Matrix4x4.translation(...args), this);
    }

    static translation(...args) {
        const vector = new Vector3D(...args);
        return Matrix4x4.using_columns(
            new Vector4D(1, 0, 0, 0),
            new Vector4D(0, 1, 0, 0),
            new Vector4D(0, 0, 1, 0),
            new Vector4D(vector, 1)
        );
    }

    static rotation(radians, ...axis) {
        const q = Vector4D.quaternions(radians, ...axis);
        return new Matrix4x4(
            1 - 2 * q.y * q.y - 2 * q.z * q.z, 2 * q.x * q.y - 2 * q.z * q.w, 2 * q.x * q.z + 2 * q.y * q.w, 0,
            2 * q.x * q.y + 2 * q.z * q.w, 1 - 2 * q.x * q.x - 2 * q.z * q.z, 2 * q.y * q.z - 2 * q.x * q.w, 0,
            2 * q.x * q.z - 2 * q.y * q.w, 2 * q.y * q.z + 2 * q.x * q.w, 1 - 2 * q.x * q.x - 2 * q.y * q.y, 0,
            0, 0, 0, 1
        );
    }

    static scale(...axis) {
        axis = new Vector3D(...axis);
        return new Matrix4x4(
            axis.x, 0, 0, 0,
            0, axis.y, 0, 0,
            0, 0, axis.z, 0,
            0, 0, 0, 1
        );
    }
}

const Matrix4x4_polymorphism = Matrix4x4.prototype[polymorphism] = Symbol('Matrix4x4.polymorphism');

Object.defineProperties(Matrix4x4.prototype, {
    [Symbol.toStringTag]: {
        value: 'Matrix4x4'
    }
});

Matrix[4][4] = Matrix4x4;

function recursive_items_from_args(size, args) {
    const items = [];
    walk_array(args);
    return items;

    function walk_array(array, ...path) {
        if (path.indexOf(array) >= 0) {
            return false;
        }
        for (const item of array) {
            if (typeof item === 'number') {
                if (items.push(item) >= size) {
                    return true;
                }
            } else if (item === Object(item) && typeof item[Symbol.iterator] === 'function') {
                if (walk_array(item, array, ...path)) {
                    return true;
                }
            } else {
                throw new TypeError('Invalid arguments');
            }
        }
        return false;
    }
}

function vector_create_from_array(Class, size, array, offset) {
    if (!Number.isSafeInteger(offset)) {
        throw new TypeError(`Invalid argument [offset]: not an index`);
    }
    if (offset < 0 || offset + size > array.length) {
        throw new RangeError(`Index out of bounds: [${offset}; ${offset + size}) not in range [0, ${array.length})`);
    }
    const self = Object.create(Class.prototype);
    self[internal] = new Array(size);
    for (let i = 0; i < size; ++i) {
        self[internal][i] = array[offset + i];
        if (typeof self[internal][i] !== 'number') {
            throw new TypeError(`Invalid array item[${i}]: not a numeric value`);
        }
    }
    Object.seal(self[internal]);
    return self;
}

function vector_create_using_array(Class, size, array, offset = 0) {
    if (!Number.isSafeInteger(offset)) {
        throw new TypeError(`Invalid argument [offset]: not an index`);
    }
    if (offset < 0 || offset + size > array.length) {
        throw new RangeError(`Index out of bounds: [${offset}; ${offset + size}) not in range [0, ${array.length})`);
    }
    const self = Object.create(Class.prototype);
    self[internal] = Object.create(Array.prototype);
    Object.defineProperty(self[internal], 'length', {
        value: size
    });
    for (let i = 0; i < size; ++i) {
        Object.defineProperty(self[internal], i, {
            enumerable: true,
            get: () => +array[offset + i],
            set: value => {
                if (typeof value !== 'number') {
                    throw new TypeError(`Cannot set item[${i}] to a non-numeric value`);
                }
                array[offset + i] = value;
            }
        });
    }
    Object.seal(self[internal]);
    return self;
}

function vector_create_piecewise(Class, size, items) {
    if (items.length !== size) {
        throw new TypeError('Invalid number of arguments');
    }

    const target = Object.create(Array.prototype);
    Object.defineProperty(target, 'length', {
        value: size
    });
    for (let i = 0; i < size; ++i) {
        const item = items[i];
        if (item === Object(item)) {
            if (Array.isArray(item)) {
                if (item.length === 0 || item.length > 2) {
                    throw new TypeError('ArrayReference by an array must contain 1 or 2 elements: [array, offset = 0]');
                }
                const [array, offset = 0] = item;
                if (!apply_reference(target, i, array, offset)) {
                    throw new TypeError('Invalid reference: expected [array, offset]');
                }
            } else {
                const { array, offset = 0 } = item;
                if (!apply_reference(target, i, array, offset)) {
                    throw new TypeError('Invalid reference: expected { array, offset }');
                }
            }
        } else {
            target[i] = +item;
        }
    }

    const self = Object.create(Class.prototype);
    self[internal] = Object.seal(target);
    return self;

    function apply_reference(target, index, array, offset) {
        if (array === Object(array) && typeof array[Symbol.iterator] === 'function' && offset in array) {
            Object.defineProperty(target, index, {
                enumerable: true,
                get: () => +array[offset],
                set: value => {
                    array[offset] = +value;
                }
            });
            return true;
        }
        return false;
    }
}

implementation[Vector2D_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Vector4D_polymorphism] = Object.create(null);

implementation[Vector3D_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Vector4D_polymorphism] = Object.create(null);

implementation[Vector4D_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Vector4D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Vector4D_polymorphism] = Object.create(null);

function matrix_init_from_values_row_major(self, rows, cols, items) {
    self[internal] = {
        rows: [],
        columns: []
    };
    for (let i = 0; i < rows; ++i) {
        self[internal].rows.push(new Vector[cols](items.slice(i * cols, i * cols + cols)));
    }
    for (let i = 0; i < cols; ++i) {
        const refs = [];
        for (let j = 0; j < rows; ++j) {
            refs.push([self[internal].rows[j], i]);
        }
        self[internal].columns.push(Vector[cols].piecewise(...refs));
    }
    Object.seal(self[internal].rows);
    Object.seal(self[internal].columns);
    matrix_init_properties_from_internal(self, rows, cols);
}

function matrix_init_properties_from_internal(self, rows, cols) {
    Object.defineProperties(self, {
        columns: {
            enumerable: true,
            value: Object.create(Array.prototype, {
                length: {
                    value: cols
                },
                array: {
                    get: () => self.columns.map(column => [...column]).flat()
                }
            })
        },
        rows: {
            enumerable: true,
            value: Object.create(Array.prototype, {
                length: {
                    value: rows
                },
                array: {
                    get: () => self.rows.map(row => [...row]).flat()
                }
            })
        }
    });
    for (let i = 0; i < cols; ++i) {
        Object.defineProperty(self.columns, i, {
            enumerable: true,
            get: () => self[internal].columns[i],
            set: value => {
                self[internal].columns[i].set(...value);
            }
        });
    }
    for (let i = 0; i < rows; ++i) {
        Object.defineProperty(self.rows, i, {
            enumerable: true,
            get: () => self[internal].rows[i],
            set: value => {
                self[internal].rows[i].set(...value);
            }
        });
    }
    Object.seal(self.columns);
    Object.seal(self.rows);
}

function matrix_create_from_row_vectors(Class, rows, cols, vectors, copy) {
    if (vectors.length !== rows) {
        throw new TypeError(`Invalid number of arguments: expected ${rows} vectors, got ${vectors.length}`);
    }
    for (let i = 0; i < vectors.length; ++i) {
        const vector = vectors[i];
        if (!(vector instanceof Vector[cols])) {
            throw new TypeError(`The vector at index [${i}] is not an instance of ${Vector[cols].name}`);
        }
    }
    const self = Object.create(Class.prototype);
    self[internal] = {
        rows: copy ? vectors.map(vector => new Vector[cols](...vector)) : vectors,
        columns: new Array(cols)
    };

    for (let i = 0; i < cols; ++i) {
        const refs = new Array(rows);
        for (let j = 0; j < rows; ++j) {
            refs[j] = [self[internal].rows[j], i];
        }
        self[internal].columns[i] = Vector[cols].piecewise(...refs);
    }

    Object.seal(self[internal].rows);
    Object.seal(self[internal].columns);

    matrix_init_properties_from_internal(self, rows, cols);
    return self;
}

function matrix_create_from_column_vectors(Class, rows, cols, vectors, copy) {
    if (vectors.length !== cols) {
        throw new TypeError(`Invalid number of arguments: expected ${cols} vectors, got ${vectors.length}`);
    }
    for (let i = 0; i < vectors.length; ++i) {
        const vector = vectors[i];
        if (!(vector instanceof Vector[rows])) {
            throw new TypeError(`The vector at index [${i}] is not an instance of ${Vector[rows].name}`);
        }
    }
    const self = Object.create(Class.prototype);
    self[internal] = {
        columns: copy ? vectors.map(vector => new Vector[rows](...vector)) : vectors,
        rows: new Array(rows)
    };

    for (let i = 0; i < rows; ++i) {
        const refs = new Array(cols);
        for (let j = 0; j < cols; ++j) {
            refs[j] = [self[internal].columns[j], i];
        }
        self[internal].rows[i] = Vector[rows].piecewise(...refs);
    }

    Object.seal(self[internal].rows);
    Object.seal(self[internal].columns);

    matrix_init_properties_from_internal(self, cols, rows);
    return self;
}

implementation[Matrix2x2_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix2x2_polymorphism][Vector4D_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix2x3_polymorphism][Vector4D_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix2x4_polymorphism][Vector4D_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix3x2_polymorphism][Vector4D_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix3x3_polymorphism][Vector4D_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix3x4_polymorphism][Vector4D_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix4x2_polymorphism][Vector4D_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix4x3_polymorphism][Vector4D_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism] = Object.create(null);
implementation[Number_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Number_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Matrix2x2_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Matrix2x3_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Matrix2x4_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Matrix3x2_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Matrix3x3_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Matrix3x4_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Matrix4x2_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Matrix4x3_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Vector2D_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Vector2D_polymorphism] = Object.create(null);
implementation[Vector3D_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Vector3D_polymorphism] = Object.create(null);
implementation[Vector4D_polymorphism][Matrix4x4_polymorphism] = Object.create(null);
implementation[Matrix4x4_polymorphism][Vector4D_polymorphism] = Object.create(null);

implementation[Vector2D_polymorphism].neg = function neg(x) {
    return new Vector2D(-x[internal][0], -x[internal][1]);
};
implementation[Vector2D_polymorphism][Vector2D_polymorphism].add = function add(x, y) {
    return new Vector2D(
        x[internal][0] + y[internal][0],
        x[internal][1] + y[internal][1]
    );
};
implementation[Number_polymorphism][Vector2D_polymorphism].add = function add(n, x) {
    return new Vector2D(
        n + x[internal][0],
        n + x[internal][1]
    );
};
implementation[Vector2D_polymorphism][Number_polymorphism].add = function add(x, n) {
    return new Vector2D(
        x[internal][0] + n,
        x[internal][1] + n
    );
};
implementation[Vector2D_polymorphism][Vector2D_polymorphism].sub = function sub(x, y) {
    return new Vector2D(
        x[internal][0] - y[internal][0],
        x[internal][1] - y[internal][1]
    );
};
implementation[Number_polymorphism][Vector2D_polymorphism].sub = function sub(n, x) {
    return new Vector2D(
        n - x[internal][0],
        n - x[internal][1]
    );
};
implementation[Vector2D_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return new Vector2D(
        x[internal][0] - n,
        x[internal][1] - n
    );
};
implementation[Vector2D_polymorphism][Vector2D_polymorphism].mul = function mul(x, y) {
    return new Vector2D(
        x[internal][0] * y[internal][0],
        x[internal][1] * y[internal][1]
    );
};
implementation[Number_polymorphism][Vector2D_polymorphism].mul = function mul(n, x) {
    return new Vector2D(
        n * x[internal][0],
        n * x[internal][1]
    );
};
implementation[Vector2D_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return new Vector2D(
        x[internal][0] * n,
        x[internal][1] * n
    );
};
implementation[Vector2D_polymorphism][Vector2D_polymorphism].div = function div(x, y) {
    return new Vector2D(
        x[internal][0] / y[internal][0],
        x[internal][1] / y[internal][1]
    );
};
implementation[Number_polymorphism][Vector2D_polymorphism].div = function div(n, x) {
    return new Vector2D(
        n / x[internal][0],
        n / x[internal][1]
    );
};
implementation[Vector2D_polymorphism][Number_polymorphism].div = function div(x, n) {
    return new Vector2D(
        x[internal][0] / n,
        x[internal][1] / n
    );
};
implementation[Vector2D_polymorphism][Vector2D_polymorphism].mod = function mod(x, y) {
    return new Vector2D(
        x[internal][0] % y[internal][0],
        x[internal][1] % y[internal][1]
    );
};
implementation[Number_polymorphism][Vector2D_polymorphism].mod = function mod(n, x) {
    return new Vector2D(
        n % x[internal][0],
        n % x[internal][1]
    );
};
implementation[Vector2D_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return new Vector2D(
        x[internal][0] % n,
        x[internal][1] % n
    );
};

implementation[Vector2D_polymorphism].abs = function abs(x) {
    return new Vector2D(Math.abs(x[internal][0]), Math.abs(x[internal][1]));
};
implementation[Vector2D_polymorphism].acos = function acos(x) {
    return new Vector2D(Math.acos(x[internal][0]), Math.acos(x[internal][1]));
};
implementation[Vector2D_polymorphism].acosh = function acosh(x) {
    return new Vector2D(Math.acosh(x[internal][0]), Math.acosh(x[internal][1]));
};
implementation[Vector2D_polymorphism].asin = function asin(x) {
    return new Vector2D(Math.asin(x[internal][0]), Math.asin(x[internal][1]));
};
implementation[Vector2D_polymorphism].asinh = function asinh(x) {
    return new Vector2D(Math.asinh(x[internal][0]), Math.asinh(x[internal][1]));
};
implementation[Vector2D_polymorphism].atan = function atan(x) {
    return new Vector2D(Math.atan(x[internal][0]), Math.atan(x[internal][1]));
};
implementation[Vector2D_polymorphism].atanh = function atanh(x) {
    return new Vector2D(Math.atanh(x[internal][0]), Math.atanh(x[internal][1]));
};
implementation[Vector2D_polymorphism].cbrt = function cbrt(x) {
    return new Vector2D(Math.cbrt(x[internal][0]), Math.cbrt(x[internal][1]));
};
implementation[Vector2D_polymorphism].ceil = function ceil(x) {
    return new Vector2D(Math.ceil(x[internal][0]), Math.ceil(x[internal][1]));
};
implementation[Vector2D_polymorphism].cos = function cos(x) {
    return new Vector2D(Math.cos(x[internal][0]), Math.cos(x[internal][1]));
};
implementation[Vector2D_polymorphism].cosh = function cosh(x) {
    return new Vector2D(Math.cosh(x[internal][0]), Math.cosh(x[internal][1]));
};
implementation[Vector2D_polymorphism].exp = function exp(x) {
    return new Vector2D(Math.exp(x[internal][0]), Math.exp(x[internal][1]));
};
implementation[Vector2D_polymorphism].expm1 = function expm1(x) {
    return new Vector2D(Math.expm1(x[internal][0]), Math.expm1(x[internal][1]));
};
implementation[Vector2D_polymorphism].floor = function floor(x) {
    return new Vector2D(Math.floor(x[internal][0]), Math.floor(x[internal][1]));
};
implementation[Vector2D_polymorphism].log = function log(x) {
    return new Vector2D(Math.log(x[internal][0]), Math.log(x[internal][1]));
};
implementation[Vector2D_polymorphism].log10 = function log10(x) {
    return new Vector2D(Math.log10(x[internal][0]), Math.log10(x[internal][1]));
};
implementation[Vector2D_polymorphism].log1p = function log1p(x) {
    return new Vector2D(Math.log1p(x[internal][0]), Math.log1p(x[internal][1]));
};
implementation[Vector2D_polymorphism].log2 = function log2(x) {
    return new Vector2D(Math.log2(x[internal][0]), Math.log2(x[internal][1]));
};
implementation[Vector2D_polymorphism].round = function round(x) {
    return new Vector2D(Math.round(x[internal][0]), Math.round(x[internal][1]));
};
implementation[Vector2D_polymorphism].sign = function sign(x) {
    return new Vector2D(Math.sign(x[internal][0]), Math.sign(x[internal][1]));
};
implementation[Vector2D_polymorphism].sin = function sin(x) {
    return new Vector2D(Math.sin(x[internal][0]), Math.sin(x[internal][1]));
};
implementation[Vector2D_polymorphism].sinh = function sinh(x) {
    return new Vector2D(Math.sinh(x[internal][0]), Math.sinh(x[internal][1]));
};
implementation[Vector2D_polymorphism].sqrt = function sqrt(x) {
    return new Vector2D(Math.sqrt(x[internal][0]), Math.sqrt(x[internal][1]));
};
implementation[Vector2D_polymorphism].tan = function tan(x) {
    return new Vector2D(Math.tan(x[internal][0]), Math.tan(x[internal][1]));
};
implementation[Vector2D_polymorphism].tanh = function tanh(x) {
    return new Vector2D(Math.tanh(x[internal][0]), Math.tanh(x[internal][1]));
};
implementation[Vector2D_polymorphism].trunc = function trunc(x) {
    return new Vector2D(Math.trunc(x[internal][0]), Math.trunc(x[internal][1]));
};

implementation[Vector2D_polymorphism][Vector2D_polymorphism].atan2 = function atan2(y, x) {
    return new Vector2D(
        Math.atan2(y[internal][0], x[internal][0]),
        Math.atan2(y[internal][1], x[internal][1])
    );
};
implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot = function dot(x, y) {
    return x[internal][0] * y[internal][0] + x[internal][1] * y[internal][1];
};
implementation[Vector2D_polymorphism].length = function length(x) {
    return Math.hypot(...x);
};
implementation[Vector2D_polymorphism].normalize = function normalize(x) {
    return implementation[Vector2D_polymorphism][Number_polymorphism].div(x, implementation[Vector2D_polymorphism].length(x));
};
implementation[Vector3D_polymorphism].neg = function neg(x) {
    return new Vector3D(-x[internal][0], -x[internal][1], -x[internal][2]);
};
implementation[Vector3D_polymorphism][Vector3D_polymorphism].add = function add(x, y) {
    return new Vector3D(
        x[internal][0] + y[internal][0],
        x[internal][1] + y[internal][1],
        x[internal][2] + y[internal][2]
    );
};
implementation[Number_polymorphism][Vector3D_polymorphism].add = function add(n, x) {
    return new Vector3D(
        n + x[internal][0],
        n + x[internal][1],
        n + x[internal][2]
    );
};
implementation[Vector3D_polymorphism][Number_polymorphism].add = function add(x, n) {
    return new Vector3D(
        x[internal][0] + n,
        x[internal][1] + n,
        x[internal][2] + n
    );
};
implementation[Vector3D_polymorphism][Vector3D_polymorphism].sub = function sub(x, y) {
    return new Vector3D(
        x[internal][0] - y[internal][0],
        x[internal][1] - y[internal][1],
        x[internal][2] - y[internal][2]
    );
};
implementation[Number_polymorphism][Vector3D_polymorphism].sub = function sub(n, x) {
    return new Vector3D(
        n - x[internal][0],
        n - x[internal][1],
        n - x[internal][2]
    );
};
implementation[Vector3D_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return new Vector3D(
        x[internal][0] - n,
        x[internal][1] - n,
        x[internal][2] - n
    );
};
implementation[Vector3D_polymorphism][Vector3D_polymorphism].mul = function mul(x, y) {
    return new Vector3D(
        x[internal][0] * y[internal][0],
        x[internal][1] * y[internal][1],
        x[internal][2] * y[internal][2]
    );
};
implementation[Number_polymorphism][Vector3D_polymorphism].mul = function mul(n, x) {
    return new Vector3D(
        n * x[internal][0],
        n * x[internal][1],
        n * x[internal][2]
    );
};
implementation[Vector3D_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return new Vector3D(
        x[internal][0] * n,
        x[internal][1] * n,
        x[internal][2] * n
    );
};
implementation[Vector3D_polymorphism][Vector3D_polymorphism].div = function div(x, y) {
    return new Vector3D(
        x[internal][0] / y[internal][0],
        x[internal][1] / y[internal][1],
        x[internal][2] / y[internal][2]
    );
};
implementation[Number_polymorphism][Vector3D_polymorphism].div = function div(n, x) {
    return new Vector3D(
        n / x[internal][0],
        n / x[internal][1],
        n / x[internal][2]
    );
};
implementation[Vector3D_polymorphism][Number_polymorphism].div = function div(x, n) {
    return new Vector3D(
        x[internal][0] / n,
        x[internal][1] / n,
        x[internal][2] / n
    );
};
implementation[Vector3D_polymorphism][Vector3D_polymorphism].mod = function mod(x, y) {
    return new Vector3D(
        x[internal][0] % y[internal][0],
        x[internal][1] % y[internal][1],
        x[internal][2] % y[internal][2]
    );
};
implementation[Number_polymorphism][Vector3D_polymorphism].mod = function mod(n, x) {
    return new Vector3D(
        n % x[internal][0],
        n % x[internal][1],
        n % x[internal][2]
    );
};
implementation[Vector3D_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return new Vector3D(
        x[internal][0] % n,
        x[internal][1] % n,
        x[internal][2] % n
    );
};

implementation[Vector3D_polymorphism].abs = function abs(x) {
    return new Vector3D(Math.abs(x[internal][0]), Math.abs(x[internal][1]), Math.abs(x[internal][2]));
};
implementation[Vector3D_polymorphism].acos = function acos(x) {
    return new Vector3D(Math.acos(x[internal][0]), Math.acos(x[internal][1]), Math.acos(x[internal][2]));
};
implementation[Vector3D_polymorphism].acosh = function acosh(x) {
    return new Vector3D(Math.acosh(x[internal][0]), Math.acosh(x[internal][1]), Math.acosh(x[internal][2]));
};
implementation[Vector3D_polymorphism].asin = function asin(x) {
    return new Vector3D(Math.asin(x[internal][0]), Math.asin(x[internal][1]), Math.asin(x[internal][2]));
};
implementation[Vector3D_polymorphism].asinh = function asinh(x) {
    return new Vector3D(Math.asinh(x[internal][0]), Math.asinh(x[internal][1]), Math.asinh(x[internal][2]));
};
implementation[Vector3D_polymorphism].atan = function atan(x) {
    return new Vector3D(Math.atan(x[internal][0]), Math.atan(x[internal][1]), Math.atan(x[internal][2]));
};
implementation[Vector3D_polymorphism].atanh = function atanh(x) {
    return new Vector3D(Math.atanh(x[internal][0]), Math.atanh(x[internal][1]), Math.atanh(x[internal][2]));
};
implementation[Vector3D_polymorphism].cbrt = function cbrt(x) {
    return new Vector3D(Math.cbrt(x[internal][0]), Math.cbrt(x[internal][1]), Math.cbrt(x[internal][2]));
};
implementation[Vector3D_polymorphism].ceil = function ceil(x) {
    return new Vector3D(Math.ceil(x[internal][0]), Math.ceil(x[internal][1]), Math.ceil(x[internal][2]));
};
implementation[Vector3D_polymorphism].cos = function cos(x) {
    return new Vector3D(Math.cos(x[internal][0]), Math.cos(x[internal][1]), Math.cos(x[internal][2]));
};
implementation[Vector3D_polymorphism].cosh = function cosh(x) {
    return new Vector3D(Math.cosh(x[internal][0]), Math.cosh(x[internal][1]), Math.cosh(x[internal][2]));
};
implementation[Vector3D_polymorphism].exp = function exp(x) {
    return new Vector3D(Math.exp(x[internal][0]), Math.exp(x[internal][1]), Math.exp(x[internal][2]));
};
implementation[Vector3D_polymorphism].expm1 = function expm1(x) {
    return new Vector3D(Math.expm1(x[internal][0]), Math.expm1(x[internal][1]), Math.expm1(x[internal][2]));
};
implementation[Vector3D_polymorphism].floor = function floor(x) {
    return new Vector3D(Math.floor(x[internal][0]), Math.floor(x[internal][1]), Math.floor(x[internal][2]));
};
implementation[Vector3D_polymorphism].log = function log(x) {
    return new Vector3D(Math.log(x[internal][0]), Math.log(x[internal][1]), Math.log(x[internal][2]));
};
implementation[Vector3D_polymorphism].log10 = function log10(x) {
    return new Vector3D(Math.log10(x[internal][0]), Math.log10(x[internal][1]), Math.log10(x[internal][2]));
};
implementation[Vector3D_polymorphism].log1p = function log1p(x) {
    return new Vector3D(Math.log1p(x[internal][0]), Math.log1p(x[internal][1]), Math.log1p(x[internal][2]));
};
implementation[Vector3D_polymorphism].log2 = function log2(x) {
    return new Vector3D(Math.log2(x[internal][0]), Math.log2(x[internal][1]), Math.log2(x[internal][2]));
};
implementation[Vector3D_polymorphism].round = function round(x) {
    return new Vector3D(Math.round(x[internal][0]), Math.round(x[internal][1]), Math.round(x[internal][2]));
};
implementation[Vector3D_polymorphism].sign = function sign(x) {
    return new Vector3D(Math.sign(x[internal][0]), Math.sign(x[internal][1]), Math.sign(x[internal][2]));
};
implementation[Vector3D_polymorphism].sin = function sin(x) {
    return new Vector3D(Math.sin(x[internal][0]), Math.sin(x[internal][1]), Math.sin(x[internal][2]));
};
implementation[Vector3D_polymorphism].sinh = function sinh(x) {
    return new Vector3D(Math.sinh(x[internal][0]), Math.sinh(x[internal][1]), Math.sinh(x[internal][2]));
};
implementation[Vector3D_polymorphism].sqrt = function sqrt(x) {
    return new Vector3D(Math.sqrt(x[internal][0]), Math.sqrt(x[internal][1]), Math.sqrt(x[internal][2]));
};
implementation[Vector3D_polymorphism].tan = function tan(x) {
    return new Vector3D(Math.tan(x[internal][0]), Math.tan(x[internal][1]), Math.tan(x[internal][2]));
};
implementation[Vector3D_polymorphism].tanh = function tanh(x) {
    return new Vector3D(Math.tanh(x[internal][0]), Math.tanh(x[internal][1]), Math.tanh(x[internal][2]));
};
implementation[Vector3D_polymorphism].trunc = function trunc(x) {
    return new Vector3D(Math.trunc(x[internal][0]), Math.trunc(x[internal][1]), Math.trunc(x[internal][2]));
};

implementation[Vector3D_polymorphism][Vector3D_polymorphism].atan2 = function atan2(y, x) {
    return new Vector3D(
        Math.atan2(y[internal][0], x[internal][0]),
        Math.atan2(y[internal][1], x[internal][1]),
        Math.atan2(y[internal][2], x[internal][2])
    );
};
implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot = function dot(x, y) {
    return x[internal][0] * y[internal][0] + x[internal][1] * y[internal][1] + x[internal][2] * y[internal][2];
};
implementation[Vector3D_polymorphism].length = function length(x) {
    return Math.hypot(...x);
};
implementation[Vector3D_polymorphism].normalize = function normalize(x) {
    return implementation[Vector3D_polymorphism][Number_polymorphism].div(x, implementation[Vector3D_polymorphism].length(x));
};
implementation[Vector4D_polymorphism].neg = function neg(x) {
    return new Vector4D(-x[internal][0], -x[internal][1], -x[internal][2], -x[internal][3]);
};
implementation[Vector4D_polymorphism][Vector4D_polymorphism].add = function add(x, y) {
    return new Vector4D(
        x[internal][0] + y[internal][0],
        x[internal][1] + y[internal][1],
        x[internal][2] + y[internal][2],
        x[internal][3] + y[internal][3]
    );
};
implementation[Number_polymorphism][Vector4D_polymorphism].add = function add(n, x) {
    return new Vector4D(
        n + x[internal][0],
        n + x[internal][1],
        n + x[internal][2],
        n + x[internal][3]
    );
};
implementation[Vector4D_polymorphism][Number_polymorphism].add = function add(x, n) {
    return new Vector4D(
        x[internal][0] + n,
        x[internal][1] + n,
        x[internal][2] + n,
        x[internal][3] + n
    );
};
implementation[Vector4D_polymorphism][Vector4D_polymorphism].sub = function sub(x, y) {
    return new Vector4D(
        x[internal][0] - y[internal][0],
        x[internal][1] - y[internal][1],
        x[internal][2] - y[internal][2],
        x[internal][3] - y[internal][3]
    );
};
implementation[Number_polymorphism][Vector4D_polymorphism].sub = function sub(n, x) {
    return new Vector4D(
        n - x[internal][0],
        n - x[internal][1],
        n - x[internal][2],
        n - x[internal][3]
    );
};
implementation[Vector4D_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return new Vector4D(
        x[internal][0] - n,
        x[internal][1] - n,
        x[internal][2] - n,
        x[internal][3] - n
    );
};
implementation[Vector4D_polymorphism][Vector4D_polymorphism].mul = function mul(x, y) {
    return new Vector4D(
        x[internal][0] * y[internal][0],
        x[internal][1] * y[internal][1],
        x[internal][2] * y[internal][2],
        x[internal][3] * y[internal][3]
    );
};
implementation[Number_polymorphism][Vector4D_polymorphism].mul = function mul(n, x) {
    return new Vector4D(
        n * x[internal][0],
        n * x[internal][1],
        n * x[internal][2],
        n * x[internal][3]
    );
};
implementation[Vector4D_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return new Vector4D(
        x[internal][0] * n,
        x[internal][1] * n,
        x[internal][2] * n,
        x[internal][3] * n
    );
};
implementation[Vector4D_polymorphism][Vector4D_polymorphism].div = function div(x, y) {
    return new Vector4D(
        x[internal][0] / y[internal][0],
        x[internal][1] / y[internal][1],
        x[internal][2] / y[internal][2],
        x[internal][3] / y[internal][3]
    );
};
implementation[Number_polymorphism][Vector4D_polymorphism].div = function div(n, x) {
    return new Vector4D(
        n / x[internal][0],
        n / x[internal][1],
        n / x[internal][2],
        n / x[internal][3]
    );
};
implementation[Vector4D_polymorphism][Number_polymorphism].div = function div(x, n) {
    return new Vector4D(
        x[internal][0] / n,
        x[internal][1] / n,
        x[internal][2] / n,
        x[internal][3] / n
    );
};
implementation[Vector4D_polymorphism][Vector4D_polymorphism].mod = function mod(x, y) {
    return new Vector4D(
        x[internal][0] % y[internal][0],
        x[internal][1] % y[internal][1],
        x[internal][2] % y[internal][2],
        x[internal][3] % y[internal][3]
    );
};
implementation[Number_polymorphism][Vector4D_polymorphism].mod = function mod(n, x) {
    return new Vector4D(
        n % x[internal][0],
        n % x[internal][1],
        n % x[internal][2],
        n % x[internal][3]
    );
};
implementation[Vector4D_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return new Vector4D(
        x[internal][0] % n,
        x[internal][1] % n,
        x[internal][2] % n,
        x[internal][3] % n
    );
};

implementation[Vector4D_polymorphism].abs = function abs(x) {
    return new Vector4D(Math.abs(x[internal][0]), Math.abs(x[internal][1]), Math.abs(x[internal][2]), Math.abs(x[internal][3]));
};
implementation[Vector4D_polymorphism].acos = function acos(x) {
    return new Vector4D(Math.acos(x[internal][0]), Math.acos(x[internal][1]), Math.acos(x[internal][2]), Math.acos(x[internal][3]));
};
implementation[Vector4D_polymorphism].acosh = function acosh(x) {
    return new Vector4D(Math.acosh(x[internal][0]), Math.acosh(x[internal][1]), Math.acosh(x[internal][2]), Math.acosh(x[internal][3]));
};
implementation[Vector4D_polymorphism].asin = function asin(x) {
    return new Vector4D(Math.asin(x[internal][0]), Math.asin(x[internal][1]), Math.asin(x[internal][2]), Math.asin(x[internal][3]));
};
implementation[Vector4D_polymorphism].asinh = function asinh(x) {
    return new Vector4D(Math.asinh(x[internal][0]), Math.asinh(x[internal][1]), Math.asinh(x[internal][2]), Math.asinh(x[internal][3]));
};
implementation[Vector4D_polymorphism].atan = function atan(x) {
    return new Vector4D(Math.atan(x[internal][0]), Math.atan(x[internal][1]), Math.atan(x[internal][2]), Math.atan(x[internal][3]));
};
implementation[Vector4D_polymorphism].atanh = function atanh(x) {
    return new Vector4D(Math.atanh(x[internal][0]), Math.atanh(x[internal][1]), Math.atanh(x[internal][2]), Math.atanh(x[internal][3]));
};
implementation[Vector4D_polymorphism].cbrt = function cbrt(x) {
    return new Vector4D(Math.cbrt(x[internal][0]), Math.cbrt(x[internal][1]), Math.cbrt(x[internal][2]), Math.cbrt(x[internal][3]));
};
implementation[Vector4D_polymorphism].ceil = function ceil(x) {
    return new Vector4D(Math.ceil(x[internal][0]), Math.ceil(x[internal][1]), Math.ceil(x[internal][2]), Math.ceil(x[internal][3]));
};
implementation[Vector4D_polymorphism].cos = function cos(x) {
    return new Vector4D(Math.cos(x[internal][0]), Math.cos(x[internal][1]), Math.cos(x[internal][2]), Math.cos(x[internal][3]));
};
implementation[Vector4D_polymorphism].cosh = function cosh(x) {
    return new Vector4D(Math.cosh(x[internal][0]), Math.cosh(x[internal][1]), Math.cosh(x[internal][2]), Math.cosh(x[internal][3]));
};
implementation[Vector4D_polymorphism].exp = function exp(x) {
    return new Vector4D(Math.exp(x[internal][0]), Math.exp(x[internal][1]), Math.exp(x[internal][2]), Math.exp(x[internal][3]));
};
implementation[Vector4D_polymorphism].expm1 = function expm1(x) {
    return new Vector4D(Math.expm1(x[internal][0]), Math.expm1(x[internal][1]), Math.expm1(x[internal][2]), Math.expm1(x[internal][3]));
};
implementation[Vector4D_polymorphism].floor = function floor(x) {
    return new Vector4D(Math.floor(x[internal][0]), Math.floor(x[internal][1]), Math.floor(x[internal][2]), Math.floor(x[internal][3]));
};
implementation[Vector4D_polymorphism].log = function log(x) {
    return new Vector4D(Math.log(x[internal][0]), Math.log(x[internal][1]), Math.log(x[internal][2]), Math.log(x[internal][3]));
};
implementation[Vector4D_polymorphism].log10 = function log10(x) {
    return new Vector4D(Math.log10(x[internal][0]), Math.log10(x[internal][1]), Math.log10(x[internal][2]), Math.log10(x[internal][3]));
};
implementation[Vector4D_polymorphism].log1p = function log1p(x) {
    return new Vector4D(Math.log1p(x[internal][0]), Math.log1p(x[internal][1]), Math.log1p(x[internal][2]), Math.log1p(x[internal][3]));
};
implementation[Vector4D_polymorphism].log2 = function log2(x) {
    return new Vector4D(Math.log2(x[internal][0]), Math.log2(x[internal][1]), Math.log2(x[internal][2]), Math.log2(x[internal][3]));
};
implementation[Vector4D_polymorphism].round = function round(x) {
    return new Vector4D(Math.round(x[internal][0]), Math.round(x[internal][1]), Math.round(x[internal][2]), Math.round(x[internal][3]));
};
implementation[Vector4D_polymorphism].sign = function sign(x) {
    return new Vector4D(Math.sign(x[internal][0]), Math.sign(x[internal][1]), Math.sign(x[internal][2]), Math.sign(x[internal][3]));
};
implementation[Vector4D_polymorphism].sin = function sin(x) {
    return new Vector4D(Math.sin(x[internal][0]), Math.sin(x[internal][1]), Math.sin(x[internal][2]), Math.sin(x[internal][3]));
};
implementation[Vector4D_polymorphism].sinh = function sinh(x) {
    return new Vector4D(Math.sinh(x[internal][0]), Math.sinh(x[internal][1]), Math.sinh(x[internal][2]), Math.sinh(x[internal][3]));
};
implementation[Vector4D_polymorphism].sqrt = function sqrt(x) {
    return new Vector4D(Math.sqrt(x[internal][0]), Math.sqrt(x[internal][1]), Math.sqrt(x[internal][2]), Math.sqrt(x[internal][3]));
};
implementation[Vector4D_polymorphism].tan = function tan(x) {
    return new Vector4D(Math.tan(x[internal][0]), Math.tan(x[internal][1]), Math.tan(x[internal][2]), Math.tan(x[internal][3]));
};
implementation[Vector4D_polymorphism].tanh = function tanh(x) {
    return new Vector4D(Math.tanh(x[internal][0]), Math.tanh(x[internal][1]), Math.tanh(x[internal][2]), Math.tanh(x[internal][3]));
};
implementation[Vector4D_polymorphism].trunc = function trunc(x) {
    return new Vector4D(Math.trunc(x[internal][0]), Math.trunc(x[internal][1]), Math.trunc(x[internal][2]), Math.trunc(x[internal][3]));
};

implementation[Vector4D_polymorphism][Vector4D_polymorphism].atan2 = function atan2(y, x) {
    return new Vector4D(
        Math.atan2(y[internal][0], x[internal][0]),
        Math.atan2(y[internal][1], x[internal][1]),
        Math.atan2(y[internal][2], x[internal][2]),
        Math.atan2(y[internal][3], x[internal][3])
    );
};
implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot = function dot(x, y) {
    return x[internal][0] * y[internal][0] + x[internal][1] * y[internal][1] + x[internal][2] * y[internal][2] + x[internal][3] * y[internal][3];
};
implementation[Vector4D_polymorphism].length = function length(x) {
    return Math.hypot(...x);
};
implementation[Vector4D_polymorphism].normalize = function normalize(x) {
    return implementation[Vector4D_polymorphism][Number_polymorphism].div(x, implementation[Vector4D_polymorphism].length(x));
};

implementation[Number_polymorphism][Number_polymorphism].add = function add(x, y) {
    return x + y;
};
implementation[Number_polymorphism][Number_polymorphism].sub = function sub(x, y) {
    return x - y;
};
implementation[Number_polymorphism][Number_polymorphism].mul = function mul(x, y) {
    return x * y;
};
implementation[Number_polymorphism][Number_polymorphism].div = function div(x, y) {
    return x / y;
};
implementation[Number_polymorphism][Number_polymorphism].mod = function mod(x, y) {
    return x % y;
};
implementation[Number_polymorphism].abs = function abs(x) {
    return Math.abs(x);
};
implementation[Number_polymorphism].acos = function acos(x) {
    return Math.acos(x);
};
implementation[Number_polymorphism].acosh = function acosh(x) {
    return Math.acosh(x);
};
implementation[Number_polymorphism].asin = function asin(x) {
    return Math.asin(x);
};
implementation[Number_polymorphism].asinh = function asinh(x) {
    return Math.asinh(x);
};
implementation[Number_polymorphism].atan = function atan(x) {
    return Math.atan(x);
};
implementation[Number_polymorphism].atanh = function atanh(x) {
    return Math.atanh(x);
};
implementation[Number_polymorphism].cbrt = function cbrt(x) {
    return Math.cbrt(x);
};
implementation[Number_polymorphism].ceil = function ceil(x) {
    return Math.ceil(x);
};
implementation[Number_polymorphism].cos = function cos(x) {
    return Math.cos(x);
};
implementation[Number_polymorphism].cosh = function cosh(x) {
    return Math.cosh(x);
};
implementation[Number_polymorphism].exp = function exp(x) {
    return Math.exp(x);
};
implementation[Number_polymorphism].expm1 = function expm1(x) {
    return Math.expm1(x);
};
implementation[Number_polymorphism].floor = function floor(x) {
    return Math.floor(x);
};
implementation[Number_polymorphism].log = function log(x) {
    return Math.log(x);
};
implementation[Number_polymorphism].log10 = function log10(x) {
    return Math.log10(x);
};
implementation[Number_polymorphism].log1p = function log1p(x) {
    return Math.log1p(x);
};
implementation[Number_polymorphism].log2 = function log2(x) {
    return Math.log2(x);
};
implementation[Number_polymorphism].round = function round(x) {
    return Math.round(x);
};
implementation[Number_polymorphism].sign = function sign(x) {
    return Math.sign(x);
};
implementation[Number_polymorphism].sin = function sin(x) {
    return Math.sin(x);
};
implementation[Number_polymorphism].sinh = function sinh(x) {
    return Math.sinh(x);
};
implementation[Number_polymorphism].sqrt = function sqrt(x) {
    return Math.sqrt(x);
};
implementation[Number_polymorphism].tan = function tan(x) {
    return Math.tan(x);
};
implementation[Number_polymorphism].tanh = function tanh(x) {
    return Math.tanh(x);
};
implementation[Number_polymorphism].trunc = function trunc(x) {
    return Math.trunc(x);
};

implementation[Vector3D_polymorphism][Vector3D_polymorphism].cross = function cross(x, y) {
    return new Vector3D(
        x[internal][1] * y[internal][2] - x[internal][2] * y[internal][1],
        x[internal][2] * y[internal][0] - x[internal][0] * y[internal][2],
        x[internal][0] * y[internal][1] - x[internal][1] * y[internal][0]
    );
};

implementation[Number_polymorphism][Matrix2x2_polymorphism].add = function add(n, x) {
    return Matrix2x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].add(n, v)));
};
implementation[Matrix2x2_polymorphism][Number_polymorphism].add = function add(x, n) {
    return Matrix2x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].add(v, n)));
};
implementation[Number_polymorphism][Matrix2x2_polymorphism].sub = function sub(n, x) {
    return Matrix2x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].sub(n, v)));
};
implementation[Matrix2x2_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return Matrix2x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].sub(v, n)));
};
implementation[Number_polymorphism][Matrix2x2_polymorphism].mul = function mul(n, x) {
    return Matrix2x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].mul(n, v)));
};
implementation[Matrix2x2_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return Matrix2x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].mul(v, n)));
};
implementation[Number_polymorphism][Matrix2x2_polymorphism].div = function div(n, x) {
    return Matrix2x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].div(n, v)));
};
implementation[Matrix2x2_polymorphism][Number_polymorphism].div = function div(x, n) {
    return Matrix2x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].div(v, n)));
};
implementation[Number_polymorphism][Matrix2x2_polymorphism].mod = function mod(n, x) {
    return Matrix2x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].mod(n, v)));
};
implementation[Matrix2x2_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return Matrix2x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].mod(v, n)));
};
implementation[Matrix2x2_polymorphism][Matrix2x2_polymorphism].mul = function mul(x, y) {
    return new Matrix2x2(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[1])
    );
};
implementation[Matrix2x3_polymorphism][Matrix3x2_polymorphism].mul = function mul(x, y) {
    return new Matrix2x2(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[1])
    );
};
implementation[Matrix2x4_polymorphism][Matrix4x2_polymorphism].mul = function mul(x, y) {
    return new Matrix2x2(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[1])
    );
};
implementation[Matrix2x2_polymorphism][Vector2D_polymorphism].mul = function mul(x, y) {
    return new Vector2D(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y)
    );
};
implementation[Vector2D_polymorphism][Matrix2x2_polymorphism].mul = function mul(x, y) {
    return new Vector2D(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x, y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x, y.columns[1])
    );
};
implementation[Number_polymorphism][Matrix2x3_polymorphism].add = function add(n, x) {
    return Matrix2x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].add(n, v)));
};
implementation[Matrix2x3_polymorphism][Number_polymorphism].add = function add(x, n) {
    return Matrix2x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].add(v, n)));
};
implementation[Number_polymorphism][Matrix2x3_polymorphism].sub = function sub(n, x) {
    return Matrix2x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].sub(n, v)));
};
implementation[Matrix2x3_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return Matrix2x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].sub(v, n)));
};
implementation[Number_polymorphism][Matrix2x3_polymorphism].mul = function mul(n, x) {
    return Matrix2x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].mul(n, v)));
};
implementation[Matrix2x3_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return Matrix2x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].mul(v, n)));
};
implementation[Number_polymorphism][Matrix2x3_polymorphism].div = function div(n, x) {
    return Matrix2x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].div(n, v)));
};
implementation[Matrix2x3_polymorphism][Number_polymorphism].div = function div(x, n) {
    return Matrix2x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].div(v, n)));
};
implementation[Number_polymorphism][Matrix2x3_polymorphism].mod = function mod(n, x) {
    return Matrix2x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].mod(n, v)));
};
implementation[Matrix2x3_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return Matrix2x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].mod(v, n)));
};
implementation[Matrix2x2_polymorphism][Matrix2x3_polymorphism].mul = function mul(x, y) {
    return new Matrix2x3(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[2])
    );
};
implementation[Matrix2x3_polymorphism][Matrix3x3_polymorphism].mul = function mul(x, y) {
    return new Matrix2x3(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[2])
    );
};
implementation[Matrix2x4_polymorphism][Matrix4x3_polymorphism].mul = function mul(x, y) {
    return new Matrix2x3(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[2])
    );
};
implementation[Matrix2x3_polymorphism][Vector3D_polymorphism].mul = function mul(x, y) {
    return new Vector2D(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y)
    );
};
implementation[Vector2D_polymorphism][Matrix2x3_polymorphism].mul = function mul(x, y) {
    return new Vector3D(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x, y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x, y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x, y.columns[2])
    );
};
implementation[Number_polymorphism][Matrix2x4_polymorphism].add = function add(n, x) {
    return Matrix2x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].add(n, v)));
};
implementation[Matrix2x4_polymorphism][Number_polymorphism].add = function add(x, n) {
    return Matrix2x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].add(v, n)));
};
implementation[Number_polymorphism][Matrix2x4_polymorphism].sub = function sub(n, x) {
    return Matrix2x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].sub(n, v)));
};
implementation[Matrix2x4_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return Matrix2x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].sub(v, n)));
};
implementation[Number_polymorphism][Matrix2x4_polymorphism].mul = function mul(n, x) {
    return Matrix2x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].mul(n, v)));
};
implementation[Matrix2x4_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return Matrix2x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].mul(v, n)));
};
implementation[Number_polymorphism][Matrix2x4_polymorphism].div = function div(n, x) {
    return Matrix2x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].div(n, v)));
};
implementation[Matrix2x4_polymorphism][Number_polymorphism].div = function div(x, n) {
    return Matrix2x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].div(v, n)));
};
implementation[Number_polymorphism][Matrix2x4_polymorphism].mod = function mod(n, x) {
    return Matrix2x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].mod(n, v)));
};
implementation[Matrix2x4_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return Matrix2x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].mod(v, n)));
};
implementation[Matrix2x2_polymorphism][Matrix2x4_polymorphism].mul = function mul(x, y) {
    return new Matrix2x4(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[3]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[3])
    );
};
implementation[Matrix2x3_polymorphism][Matrix3x4_polymorphism].mul = function mul(x, y) {
    return new Matrix2x4(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[3]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[3])
    );
};
implementation[Matrix2x4_polymorphism][Matrix4x4_polymorphism].mul = function mul(x, y) {
    return new Matrix2x4(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[3]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[3])
    );
};
implementation[Matrix2x4_polymorphism][Vector4D_polymorphism].mul = function mul(x, y) {
    return new Vector2D(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y)
    );
};
implementation[Vector2D_polymorphism][Matrix2x4_polymorphism].mul = function mul(x, y) {
    return new Vector4D(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x, y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x, y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x, y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x, y.columns[3])
    );
};
implementation[Number_polymorphism][Matrix3x2_polymorphism].add = function add(n, x) {
    return Matrix3x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].add(n, v)));
};
implementation[Matrix3x2_polymorphism][Number_polymorphism].add = function add(x, n) {
    return Matrix3x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].add(v, n)));
};
implementation[Number_polymorphism][Matrix3x2_polymorphism].sub = function sub(n, x) {
    return Matrix3x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].sub(n, v)));
};
implementation[Matrix3x2_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return Matrix3x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].sub(v, n)));
};
implementation[Number_polymorphism][Matrix3x2_polymorphism].mul = function mul(n, x) {
    return Matrix3x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].mul(n, v)));
};
implementation[Matrix3x2_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return Matrix3x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].mul(v, n)));
};
implementation[Number_polymorphism][Matrix3x2_polymorphism].div = function div(n, x) {
    return Matrix3x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].div(n, v)));
};
implementation[Matrix3x2_polymorphism][Number_polymorphism].div = function div(x, n) {
    return Matrix3x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].div(v, n)));
};
implementation[Number_polymorphism][Matrix3x2_polymorphism].mod = function mod(n, x) {
    return Matrix3x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].mod(n, v)));
};
implementation[Matrix3x2_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return Matrix3x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].mod(v, n)));
};
implementation[Matrix3x2_polymorphism][Matrix2x2_polymorphism].mul = function mul(x, y) {
    return new Matrix3x2(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[1])
    );
};
implementation[Matrix3x3_polymorphism][Matrix3x2_polymorphism].mul = function mul(x, y) {
    return new Matrix3x2(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[1])
    );
};
implementation[Matrix3x4_polymorphism][Matrix4x2_polymorphism].mul = function mul(x, y) {
    return new Matrix3x2(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[1])
    );
};
implementation[Matrix3x2_polymorphism][Vector2D_polymorphism].mul = function mul(x, y) {
    return new Vector3D(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y)
    );
};
implementation[Vector3D_polymorphism][Matrix3x2_polymorphism].mul = function mul(x, y) {
    return new Vector2D(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x, y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x, y.columns[1])
    );
};
implementation[Number_polymorphism][Matrix3x3_polymorphism].add = function add(n, x) {
    return Matrix3x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].add(n, v)));
};
implementation[Matrix3x3_polymorphism][Number_polymorphism].add = function add(x, n) {
    return Matrix3x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].add(v, n)));
};
implementation[Number_polymorphism][Matrix3x3_polymorphism].sub = function sub(n, x) {
    return Matrix3x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].sub(n, v)));
};
implementation[Matrix3x3_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return Matrix3x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].sub(v, n)));
};
implementation[Number_polymorphism][Matrix3x3_polymorphism].mul = function mul(n, x) {
    return Matrix3x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].mul(n, v)));
};
implementation[Matrix3x3_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return Matrix3x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].mul(v, n)));
};
implementation[Number_polymorphism][Matrix3x3_polymorphism].div = function div(n, x) {
    return Matrix3x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].div(n, v)));
};
implementation[Matrix3x3_polymorphism][Number_polymorphism].div = function div(x, n) {
    return Matrix3x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].div(v, n)));
};
implementation[Number_polymorphism][Matrix3x3_polymorphism].mod = function mod(n, x) {
    return Matrix3x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].mod(n, v)));
};
implementation[Matrix3x3_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return Matrix3x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].mod(v, n)));
};
implementation[Matrix3x2_polymorphism][Matrix2x3_polymorphism].mul = function mul(x, y) {
    return new Matrix3x3(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[2])
    );
};
implementation[Matrix3x3_polymorphism][Matrix3x3_polymorphism].mul = function mul(x, y) {
    return new Matrix3x3(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[2])
    );
};
implementation[Matrix3x4_polymorphism][Matrix4x3_polymorphism].mul = function mul(x, y) {
    return new Matrix3x3(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[2])
    );
};
implementation[Matrix3x3_polymorphism][Vector3D_polymorphism].mul = function mul(x, y) {
    return new Vector3D(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y)
    );
};
implementation[Vector3D_polymorphism][Matrix3x3_polymorphism].mul = function mul(x, y) {
    return new Vector3D(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x, y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x, y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x, y.columns[2])
    );
};
implementation[Number_polymorphism][Matrix3x4_polymorphism].add = function add(n, x) {
    return Matrix3x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].add(n, v)));
};
implementation[Matrix3x4_polymorphism][Number_polymorphism].add = function add(x, n) {
    return Matrix3x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].add(v, n)));
};
implementation[Number_polymorphism][Matrix3x4_polymorphism].sub = function sub(n, x) {
    return Matrix3x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].sub(n, v)));
};
implementation[Matrix3x4_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return Matrix3x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].sub(v, n)));
};
implementation[Number_polymorphism][Matrix3x4_polymorphism].mul = function mul(n, x) {
    return Matrix3x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].mul(n, v)));
};
implementation[Matrix3x4_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return Matrix3x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].mul(v, n)));
};
implementation[Number_polymorphism][Matrix3x4_polymorphism].div = function div(n, x) {
    return Matrix3x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].div(n, v)));
};
implementation[Matrix3x4_polymorphism][Number_polymorphism].div = function div(x, n) {
    return Matrix3x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].div(v, n)));
};
implementation[Number_polymorphism][Matrix3x4_polymorphism].mod = function mod(n, x) {
    return Matrix3x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].mod(n, v)));
};
implementation[Matrix3x4_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return Matrix3x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].mod(v, n)));
};
implementation[Matrix3x2_polymorphism][Matrix2x4_polymorphism].mul = function mul(x, y) {
    return new Matrix3x4(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[3]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[3]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[3])
    );
};
implementation[Matrix3x3_polymorphism][Matrix3x4_polymorphism].mul = function mul(x, y) {
    return new Matrix3x4(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[3]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[3]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[3])
    );
};
implementation[Matrix3x4_polymorphism][Matrix4x4_polymorphism].mul = function mul(x, y) {
    return new Matrix3x4(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[3]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[3]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[3])
    );
};
implementation[Matrix3x4_polymorphism][Vector4D_polymorphism].mul = function mul(x, y) {
    return new Vector3D(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y)
    );
};
implementation[Vector3D_polymorphism][Matrix3x4_polymorphism].mul = function mul(x, y) {
    return new Vector4D(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x, y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x, y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x, y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x, y.columns[3])
    );
};
implementation[Number_polymorphism][Matrix4x2_polymorphism].add = function add(n, x) {
    return Matrix4x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].add(n, v)));
};
implementation[Matrix4x2_polymorphism][Number_polymorphism].add = function add(x, n) {
    return Matrix4x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].add(v, n)));
};
implementation[Number_polymorphism][Matrix4x2_polymorphism].sub = function sub(n, x) {
    return Matrix4x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].sub(n, v)));
};
implementation[Matrix4x2_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return Matrix4x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].sub(v, n)));
};
implementation[Number_polymorphism][Matrix4x2_polymorphism].mul = function mul(n, x) {
    return Matrix4x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].mul(n, v)));
};
implementation[Matrix4x2_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return Matrix4x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].mul(v, n)));
};
implementation[Number_polymorphism][Matrix4x2_polymorphism].div = function div(n, x) {
    return Matrix4x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].div(n, v)));
};
implementation[Matrix4x2_polymorphism][Number_polymorphism].div = function div(x, n) {
    return Matrix4x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].div(v, n)));
};
implementation[Number_polymorphism][Matrix4x2_polymorphism].mod = function mod(n, x) {
    return Matrix4x2.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector2D_polymorphism].mod(n, v)));
};
implementation[Matrix4x2_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return Matrix4x2.using_rows(...x.rows.map(v => implementation[Vector2D_polymorphism][Number_polymorphism].mod(v, n)));
};
implementation[Matrix4x2_polymorphism][Matrix2x2_polymorphism].mul = function mul(x, y) {
    return new Matrix4x2(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[3], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[3], y.columns[1])
    );
};
implementation[Matrix4x3_polymorphism][Matrix3x2_polymorphism].mul = function mul(x, y) {
    return new Matrix4x2(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[3], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[3], y.columns[1])
    );
};
implementation[Matrix4x4_polymorphism][Matrix4x2_polymorphism].mul = function mul(x, y) {
    return new Matrix4x2(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[3], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[3], y.columns[1])
    );
};
implementation[Matrix4x2_polymorphism][Vector2D_polymorphism].mul = function mul(x, y) {
    return new Vector4D(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[3], y)
    );
};
implementation[Vector4D_polymorphism][Matrix4x2_polymorphism].mul = function mul(x, y) {
    return new Vector2D(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x, y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x, y.columns[1])
    );
};
implementation[Number_polymorphism][Matrix4x3_polymorphism].add = function add(n, x) {
    return Matrix4x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].add(n, v)));
};
implementation[Matrix4x3_polymorphism][Number_polymorphism].add = function add(x, n) {
    return Matrix4x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].add(v, n)));
};
implementation[Number_polymorphism][Matrix4x3_polymorphism].sub = function sub(n, x) {
    return Matrix4x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].sub(n, v)));
};
implementation[Matrix4x3_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return Matrix4x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].sub(v, n)));
};
implementation[Number_polymorphism][Matrix4x3_polymorphism].mul = function mul(n, x) {
    return Matrix4x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].mul(n, v)));
};
implementation[Matrix4x3_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return Matrix4x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].mul(v, n)));
};
implementation[Number_polymorphism][Matrix4x3_polymorphism].div = function div(n, x) {
    return Matrix4x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].div(n, v)));
};
implementation[Matrix4x3_polymorphism][Number_polymorphism].div = function div(x, n) {
    return Matrix4x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].div(v, n)));
};
implementation[Number_polymorphism][Matrix4x3_polymorphism].mod = function mod(n, x) {
    return Matrix4x3.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector3D_polymorphism].mod(n, v)));
};
implementation[Matrix4x3_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return Matrix4x3.using_rows(...x.rows.map(v => implementation[Vector3D_polymorphism][Number_polymorphism].mod(v, n)));
};
implementation[Matrix4x2_polymorphism][Matrix2x3_polymorphism].mul = function mul(x, y) {
    return new Matrix4x3(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[3], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[3], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[3], y.columns[2])
    );
};
implementation[Matrix4x3_polymorphism][Matrix3x3_polymorphism].mul = function mul(x, y) {
    return new Matrix4x3(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[3], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[3], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[3], y.columns[2])
    );
};
implementation[Matrix4x4_polymorphism][Matrix4x3_polymorphism].mul = function mul(x, y) {
    return new Matrix4x3(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[3], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[3], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[3], y.columns[2])
    );
};
implementation[Matrix4x3_polymorphism][Vector3D_polymorphism].mul = function mul(x, y) {
    return new Vector4D(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[3], y)
    );
};
implementation[Vector4D_polymorphism][Matrix4x3_polymorphism].mul = function mul(x, y) {
    return new Vector3D(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x, y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x, y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x, y.columns[2])
    );
};
implementation[Number_polymorphism][Matrix4x4_polymorphism].add = function add(n, x) {
    return Matrix4x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].add(n, v)));
};
implementation[Matrix4x4_polymorphism][Number_polymorphism].add = function add(x, n) {
    return Matrix4x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].add(v, n)));
};
implementation[Number_polymorphism][Matrix4x4_polymorphism].sub = function sub(n, x) {
    return Matrix4x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].sub(n, v)));
};
implementation[Matrix4x4_polymorphism][Number_polymorphism].sub = function sub(x, n) {
    return Matrix4x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].sub(v, n)));
};
implementation[Number_polymorphism][Matrix4x4_polymorphism].mul = function mul(n, x) {
    return Matrix4x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].mul(n, v)));
};
implementation[Matrix4x4_polymorphism][Number_polymorphism].mul = function mul(x, n) {
    return Matrix4x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].mul(v, n)));
};
implementation[Number_polymorphism][Matrix4x4_polymorphism].div = function div(n, x) {
    return Matrix4x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].div(n, v)));
};
implementation[Matrix4x4_polymorphism][Number_polymorphism].div = function div(x, n) {
    return Matrix4x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].div(v, n)));
};
implementation[Number_polymorphism][Matrix4x4_polymorphism].mod = function mod(n, x) {
    return Matrix4x4.using_rows(...x.rows.map(v => implementation[Number_polymorphism][Vector4D_polymorphism].mod(n, v)));
};
implementation[Matrix4x4_polymorphism][Number_polymorphism].mod = function mod(x, n) {
    return Matrix4x4.using_rows(...x.rows.map(v => implementation[Vector4D_polymorphism][Number_polymorphism].mod(v, n)));
};
implementation[Matrix4x2_polymorphism][Matrix2x4_polymorphism].mul = function mul(x, y) {
    return new Matrix4x4(
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[0], y.columns[3]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[1], y.columns[3]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[2], y.columns[3]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[3], y.columns[0]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[3], y.columns[1]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[3], y.columns[2]),
        implementation[Vector2D_polymorphism][Vector2D_polymorphism].dot(x.rows[3], y.columns[3])
    );
};
implementation[Matrix4x3_polymorphism][Matrix3x4_polymorphism].mul = function mul(x, y) {
    return new Matrix4x4(
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[0], y.columns[3]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[1], y.columns[3]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[2], y.columns[3]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[3], y.columns[0]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[3], y.columns[1]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[3], y.columns[2]),
        implementation[Vector3D_polymorphism][Vector3D_polymorphism].dot(x.rows[3], y.columns[3])
    );
};
implementation[Matrix4x4_polymorphism][Matrix4x4_polymorphism].mul = function mul(x, y) {
    return new Matrix4x4(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y.columns[3]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y.columns[3]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y.columns[3]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[3], y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[3], y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[3], y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[3], y.columns[3])
    );
};
implementation[Matrix4x4_polymorphism][Vector4D_polymorphism].mul = function mul(x, y) {
    return new Vector4D(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[0], y),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[1], y),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[2], y),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x.rows[3], y)
    );
};
implementation[Vector4D_polymorphism][Matrix4x4_polymorphism].mul = function mul(x, y) {
    return new Vector4D(
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x, y.columns[0]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x, y.columns[1]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x, y.columns[2]),
        implementation[Vector4D_polymorphism][Vector4D_polymorphism].dot(x, y.columns[3])
    );
};

implementation[Matrix2x2_polymorphism].determinant = function determinant(x) {
    return x.rows[0][0] * x.rows[1][1] - x.rows[0][1] * x.rows[1][0];
};
implementation[Matrix2x2_polymorphism].inverse = function inverse(x) {
    let det = implementation[Matrix2x2_polymorphism].determinant(x);
    if (limits.number.isEqual(det, 0)) {
        return null;
    }
    det = 1 / det;
    return new Matrix2x2(
        (1) * det * (x.rows[1][1]),
        (-1) * det * (x.rows[0][1]),
        (-1) * det * (x.rows[1][0]),
        (1) * det * (x.rows[0][0])
    );
};
implementation[Matrix3x3_polymorphism].determinant = function determinant(x) {
    return x.rows[0][0] * x.rows[1][1] * x.rows[2][2] + x.rows[0][1] * x.rows[1][2] * x.rows[2][0] + x.rows[0][2] * x.rows[1][0] * x.rows[2][1] - x.rows[0][0] * x.rows[1][2] * x.rows[2][1] - x.rows[0][1] * x.rows[1][0] * x.rows[2][2] - x.rows[0][2] * x.rows[1][1] * x.rows[2][0];
};
implementation[Matrix3x3_polymorphism].inverse = function inverse(x) {
    let det = implementation[Matrix3x3_polymorphism].determinant(x);
    if (limits.number.isEqual(det, 0)) {
        return null;
    }
    det = 1 / det;
    return new Matrix3x3(
        (1) * det * (x.rows[1][1] * x.rows[2][2] - x.rows[1][2] * x.rows[2][1]),
        (-1) * det * (x.rows[0][1] * x.rows[2][2] - x.rows[0][2] * x.rows[2][1]),
        (1) * det * (x.rows[0][1] * x.rows[1][2] - x.rows[0][2] * x.rows[1][1]),
        (-1) * det * (x.rows[1][0] * x.rows[2][2] - x.rows[1][2] * x.rows[2][0]),
        (1) * det * (x.rows[0][0] * x.rows[2][2] - x.rows[0][2] * x.rows[2][0]),
        (-1) * det * (x.rows[0][0] * x.rows[1][2] - x.rows[0][2] * x.rows[1][0]),
        (1) * det * (x.rows[1][0] * x.rows[2][1] - x.rows[1][1] * x.rows[2][0]),
        (-1) * det * (x.rows[0][0] * x.rows[2][1] - x.rows[0][1] * x.rows[2][0]),
        (1) * det * (x.rows[0][0] * x.rows[1][1] - x.rows[0][1] * x.rows[1][0])
    );
};
implementation[Matrix4x4_polymorphism].determinant = function determinant(x) {
    return x.rows[0][0] * x.rows[1][1] * x.rows[2][2] * x.rows[3][3] + x.rows[0][0] * x.rows[1][2] * x.rows[2][3] * x.rows[3][1] + x.rows[0][0] * x.rows[1][3] * x.rows[2][1] * x.rows[3][2] + x.rows[0][1] * x.rows[1][0] * x.rows[2][3] * x.rows[3][2] + x.rows[0][1] * x.rows[1][2] * x.rows[2][0] * x.rows[3][3] + x.rows[0][1] * x.rows[1][3] * x.rows[2][2] * x.rows[3][0] + x.rows[0][2] * x.rows[1][0] * x.rows[2][1] * x.rows[3][3] + x.rows[0][2] * x.rows[1][1] * x.rows[2][3] * x.rows[3][0] + x.rows[0][2] * x.rows[1][3] * x.rows[2][0] * x.rows[3][1] + x.rows[0][3] * x.rows[1][0] * x.rows[2][2] * x.rows[3][1] + x.rows[0][3] * x.rows[1][1] * x.rows[2][0] * x.rows[3][2] + x.rows[0][3] * x.rows[1][2] * x.rows[2][1] * x.rows[3][0] - x.rows[0][0] * x.rows[1][1] * x.rows[2][3] * x.rows[3][2] - x.rows[0][0] * x.rows[1][2] * x.rows[2][1] * x.rows[3][3] - x.rows[0][0] * x.rows[1][3] * x.rows[2][2] * x.rows[3][1] - x.rows[0][1] * x.rows[1][0] * x.rows[2][2] * x.rows[3][3] - x.rows[0][1] * x.rows[1][2] * x.rows[2][3] * x.rows[3][0] - x.rows[0][1] * x.rows[1][3] * x.rows[2][0] * x.rows[3][2] - x.rows[0][2] * x.rows[1][0] * x.rows[2][3] * x.rows[3][1] - x.rows[0][2] * x.rows[1][1] * x.rows[2][0] * x.rows[3][3] - x.rows[0][2] * x.rows[1][3] * x.rows[2][1] * x.rows[3][0] - x.rows[0][3] * x.rows[1][0] * x.rows[2][1] * x.rows[3][2] - x.rows[0][3] * x.rows[1][1] * x.rows[2][2] * x.rows[3][0] - x.rows[0][3] * x.rows[1][2] * x.rows[2][0] * x.rows[3][1];
};
implementation[Matrix4x4_polymorphism].inverse = function inverse(x) {
    let det = implementation[Matrix4x4_polymorphism].determinant(x);
    if (limits.number.isEqual(det, 0)) {
        return null;
    }
    det = 1 / det;
    return new Matrix4x4(
        (1) * det * (x.rows[1][1] * x.rows[2][2] * x.rows[3][3] + x.rows[1][2] * x.rows[2][3] * x.rows[3][1] + x.rows[1][3] * x.rows[2][1] * x.rows[3][2] - x.rows[1][1] * x.rows[2][3] * x.rows[3][2] - x.rows[1][2] * x.rows[2][1] * x.rows[3][3] - x.rows[1][3] * x.rows[2][2] * x.rows[3][1]),
        (-1) * det * (x.rows[0][1] * x.rows[2][2] * x.rows[3][3] + x.rows[0][2] * x.rows[2][3] * x.rows[3][1] + x.rows[0][3] * x.rows[2][1] * x.rows[3][2] - x.rows[0][1] * x.rows[2][3] * x.rows[3][2] - x.rows[0][2] * x.rows[2][1] * x.rows[3][3] - x.rows[0][3] * x.rows[2][2] * x.rows[3][1]),
        (1) * det * (x.rows[0][1] * x.rows[1][2] * x.rows[3][3] + x.rows[0][2] * x.rows[1][3] * x.rows[3][1] + x.rows[0][3] * x.rows[1][1] * x.rows[3][2] - x.rows[0][1] * x.rows[1][3] * x.rows[3][2] - x.rows[0][2] * x.rows[1][1] * x.rows[3][3] - x.rows[0][3] * x.rows[1][2] * x.rows[3][1]),
        (-1) * det * (x.rows[0][1] * x.rows[1][2] * x.rows[2][3] + x.rows[0][2] * x.rows[1][3] * x.rows[2][1] + x.rows[0][3] * x.rows[1][1] * x.rows[2][2] - x.rows[0][1] * x.rows[1][3] * x.rows[2][2] - x.rows[0][2] * x.rows[1][1] * x.rows[2][3] - x.rows[0][3] * x.rows[1][2] * x.rows[2][1]),
        (-1) * det * (x.rows[1][0] * x.rows[2][2] * x.rows[3][3] + x.rows[1][2] * x.rows[2][3] * x.rows[3][0] + x.rows[1][3] * x.rows[2][0] * x.rows[3][2] - x.rows[1][0] * x.rows[2][3] * x.rows[3][2] - x.rows[1][2] * x.rows[2][0] * x.rows[3][3] - x.rows[1][3] * x.rows[2][2] * x.rows[3][0]),
        (1) * det * (x.rows[0][0] * x.rows[2][2] * x.rows[3][3] + x.rows[0][2] * x.rows[2][3] * x.rows[3][0] + x.rows[0][3] * x.rows[2][0] * x.rows[3][2] - x.rows[0][0] * x.rows[2][3] * x.rows[3][2] - x.rows[0][2] * x.rows[2][0] * x.rows[3][3] - x.rows[0][3] * x.rows[2][2] * x.rows[3][0]),
        (-1) * det * (x.rows[0][0] * x.rows[1][2] * x.rows[3][3] + x.rows[0][2] * x.rows[1][3] * x.rows[3][0] + x.rows[0][3] * x.rows[1][0] * x.rows[3][2] - x.rows[0][0] * x.rows[1][3] * x.rows[3][2] - x.rows[0][2] * x.rows[1][0] * x.rows[3][3] - x.rows[0][3] * x.rows[1][2] * x.rows[3][0]),
        (1) * det * (x.rows[0][0] * x.rows[1][2] * x.rows[2][3] + x.rows[0][2] * x.rows[1][3] * x.rows[2][0] + x.rows[0][3] * x.rows[1][0] * x.rows[2][2] - x.rows[0][0] * x.rows[1][3] * x.rows[2][2] - x.rows[0][2] * x.rows[1][0] * x.rows[2][3] - x.rows[0][3] * x.rows[1][2] * x.rows[2][0]),
        (1) * det * (x.rows[1][0] * x.rows[2][1] * x.rows[3][3] + x.rows[1][1] * x.rows[2][3] * x.rows[3][0] + x.rows[1][3] * x.rows[2][0] * x.rows[3][1] - x.rows[1][0] * x.rows[2][3] * x.rows[3][1] - x.rows[1][1] * x.rows[2][0] * x.rows[3][3] - x.rows[1][3] * x.rows[2][1] * x.rows[3][0]),
        (-1) * det * (x.rows[0][0] * x.rows[2][1] * x.rows[3][3] + x.rows[0][1] * x.rows[2][3] * x.rows[3][0] + x.rows[0][3] * x.rows[2][0] * x.rows[3][1] - x.rows[0][0] * x.rows[2][3] * x.rows[3][1] - x.rows[0][1] * x.rows[2][0] * x.rows[3][3] - x.rows[0][3] * x.rows[2][1] * x.rows[3][0]),
        (1) * det * (x.rows[0][0] * x.rows[1][1] * x.rows[3][3] + x.rows[0][1] * x.rows[1][3] * x.rows[3][0] + x.rows[0][3] * x.rows[1][0] * x.rows[3][1] - x.rows[0][0] * x.rows[1][3] * x.rows[3][1] - x.rows[0][1] * x.rows[1][0] * x.rows[3][3] - x.rows[0][3] * x.rows[1][1] * x.rows[3][0]),
        (-1) * det * (x.rows[0][0] * x.rows[1][1] * x.rows[2][3] + x.rows[0][1] * x.rows[1][3] * x.rows[2][0] + x.rows[0][3] * x.rows[1][0] * x.rows[2][1] - x.rows[0][0] * x.rows[1][3] * x.rows[2][1] - x.rows[0][1] * x.rows[1][0] * x.rows[2][3] - x.rows[0][3] * x.rows[1][1] * x.rows[2][0]),
        (-1) * det * (x.rows[1][0] * x.rows[2][1] * x.rows[3][2] + x.rows[1][1] * x.rows[2][2] * x.rows[3][0] + x.rows[1][2] * x.rows[2][0] * x.rows[3][1] - x.rows[1][0] * x.rows[2][2] * x.rows[3][1] - x.rows[1][1] * x.rows[2][0] * x.rows[3][2] - x.rows[1][2] * x.rows[2][1] * x.rows[3][0]),
        (1) * det * (x.rows[0][0] * x.rows[2][1] * x.rows[3][2] + x.rows[0][1] * x.rows[2][2] * x.rows[3][0] + x.rows[0][2] * x.rows[2][0] * x.rows[3][1] - x.rows[0][0] * x.rows[2][2] * x.rows[3][1] - x.rows[0][1] * x.rows[2][0] * x.rows[3][2] - x.rows[0][2] * x.rows[2][1] * x.rows[3][0]),
        (-1) * det * (x.rows[0][0] * x.rows[1][1] * x.rows[3][2] + x.rows[0][1] * x.rows[1][2] * x.rows[3][0] + x.rows[0][2] * x.rows[1][0] * x.rows[3][1] - x.rows[0][0] * x.rows[1][2] * x.rows[3][1] - x.rows[0][1] * x.rows[1][0] * x.rows[3][2] - x.rows[0][2] * x.rows[1][1] * x.rows[3][0]),
        (1) * det * (x.rows[0][0] * x.rows[1][1] * x.rows[2][2] + x.rows[0][1] * x.rows[1][2] * x.rows[2][0] + x.rows[0][2] * x.rows[1][0] * x.rows[2][1] - x.rows[0][0] * x.rows[1][2] * x.rows[2][1] - x.rows[0][1] * x.rows[1][0] * x.rows[2][2] - x.rows[0][2] * x.rows[1][1] * x.rows[2][0])
    );
};

export function add(x, y) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.[y?.[polymorphism] ?? polymorphism]?.add ?? throw_type_error("add", x, y))(x, y);
}
export function sub(x, y) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.[y?.[polymorphism] ?? polymorphism]?.sub ?? throw_type_error("sub", x, y))(x, y);
}
export function mul(x, y) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.[y?.[polymorphism] ?? polymorphism]?.mul ?? throw_type_error("mul", x, y))(x, y);
}
export function div(x, y) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.[y?.[polymorphism] ?? polymorphism]?.div ?? throw_type_error("div", x, y))(x, y);
}
export function mod(x, y) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.[y?.[polymorphism] ?? polymorphism]?.mod ?? throw_type_error("mod", x, y))(x, y);
}
export function abs(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.abs ?? throw_type_error("abs", x))(x);
}
export function acos(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.acos ?? throw_type_error("acos", x))(x);
}
export function acosh(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.acosh ?? throw_type_error("acosh", x))(x);
}
export function asin(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.asin ?? throw_type_error("asin", x))(x);
}
export function asinh(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.asinh ?? throw_type_error("asinh", x))(x);
}
export function atan(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.atan ?? throw_type_error("atan", x))(x);
}
export function atanh(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.atanh ?? throw_type_error("atanh", x))(x);
}
export function cbrt(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.cbrt ?? throw_type_error("cbrt", x))(x);
}
export function ceil(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.ceil ?? throw_type_error("ceil", x))(x);
}
export function cos(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.cos ?? throw_type_error("cos", x))(x);
}
export function cosh(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.cosh ?? throw_type_error("cosh", x))(x);
}
export function exp(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.exp ?? throw_type_error("exp", x))(x);
}
export function expm1(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.expm1 ?? throw_type_error("expm1", x))(x);
}
export function floor(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.floor ?? throw_type_error("floor", x))(x);
}
export function log(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.log ?? throw_type_error("log", x))(x);
}
export function log10(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.log10 ?? throw_type_error("log10", x))(x);
}
export function log1p(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.log1p ?? throw_type_error("log1p", x))(x);
}
export function log2(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.log2 ?? throw_type_error("log2", x))(x);
}
export function round(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.round ?? throw_type_error("round", x))(x);
}
export function sign(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.sign ?? throw_type_error("sign", x))(x);
}
export function sin(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.sin ?? throw_type_error("sin", x))(x);
}
export function sinh(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.sinh ?? throw_type_error("sinh", x))(x);
}
export function sqrt(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.sqrt ?? throw_type_error("sqrt", x))(x);
}
export function tan(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.tan ?? throw_type_error("tan", x))(x);
}
export function tanh(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.tanh ?? throw_type_error("tanh", x))(x);
}
export function trunc(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.trunc ?? throw_type_error("trunc", x))(x);
}
export function neg(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.neg ?? throw_type_error("neg", x))(x);
}
export function length(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.length ?? throw_type_error("length", x))(x);
}
export function normalize(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.normalize ?? throw_type_error("normalize", x))(x);
}
export function determinant(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.determinant ?? throw_type_error("determinant", x))(x);
}
export function inverse(x) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.inverse ?? throw_type_error("inverse", x))(x);
}
export function cross(x, y) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.[y?.[polymorphism] ?? polymorphism]?.cross ?? throw_type_error("cross", x, y))(x, y);
}
export function dot(x, y) {
    return (implementation[x?.[polymorphism] ?? polymorphism]?.[y?.[polymorphism] ?? polymorphism]?.dot ?? throw_type_error("dot", x, y))(x, y);
}

function throw_type_error(name, ...args) {
    throw new TypeError(`"${name}": no matching overloaded function found, capable of accepting [${args.map(get_type).join(', ')}]`);
}

function get_type(value) {
    if (value === void 0) {
        return 'undefined';
    }
    if (value === null) {
        return 'null';
    }
    if (value !== Object(value)) {
        return typeof value;
    }
    if (typeof value === 'function') {
        return 'function';
    }
    const proto = Object.getPrototypeOf(value);
    let has_object_proto = false;
    for (let p = proto; p != null; p = Object.getPrototypeOf(p)) {
        if (p === Object.prototype) {
            has_object_proto = true;
            break;
        }
    }
    if (has_object_proto) {
        const constructor = proto.constructor;
        if (typeof constructor === 'function') {
            const name = constructor.name;
            if (typeof name === 'string' && name.trim().length > 0) {
                return `#<${name}>`;
            }
        }
    }
    return '#<Object>';
}

export function radians_from(value) {
    return value / 180 * Math.PI;
}

export function degrees_from(value) {
    return value / Math.PI * 180;
}
