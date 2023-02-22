export default class Program {
    #define;
    #extension;
    #const;
    #uniform;
    #struct;
    #output;
    #function;

    constructor() {
        this.#define = Object.create(null);
        this.#extension = Object.create(null);
        this.#const = Object.create(null);
        this.#uniform = Object.create(null);
        this.#struct = Object.create(null);
        this.#output = Object.create(null);
        this.#function = Object.create(null);
    }

    setDefinition(name, value) {
        this.#define[name] = value;
    }

    addExtension(name, request) {
        if (name == null) {
            name = 'all';
        }
        if (typeof name !== 'string' || !/^[A-Za-z0-9_]$/.test(name)) {
            throw new TypeError(`Argument "name" is invalid: must be valid identifier`);
        } 
        if (['enable', 'require', 'disable', 'warn'].indexOf(request) < 0) {
            throw new TypeError('Argument "request" must be one of ["enable", "disable", "require", "warn"]');
        }
        if (name === 'all' && (request === 'enable' || request === 'require')) {
            throw new TypeError('Cannot use "enable" or "require" with "all"');
        }
        this.#extension[name] = request;
    }

    removeExtension(name) {
        if (name == null) {
            name = 'all';
        }
        delete this.#extension[name];
    }

    build() {
        const source = [`#version 300 es`, ``];
        if ('all' in this.#extension) {
            source.push(`#extension all : ${this.#extension.all}`);
        } else {
            for (const name in this.#extension) {
                const behavior = this.#extension[name];
                source.push(`#extension ${name} : ${behavior}`);
            }
        }
    }
}
