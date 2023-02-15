export default function createProgram(gl, vertexSource, fragmentSource, options) {
    options = Object.assign(Object.create(null), options ?? {});
    // Step 0: Argument validation
    if (!(gl instanceof WebGL2RenderingContext)) {
        throw new TypeError(`Invalid arguments[0]: expected [object WebGL2RenderingContext], got ${getType(gl)}`);
    }
    if (typeof vertexSource !== 'string') {
        throw new TypeError(`Invalid arguments[1]: expected [string], got ${getType(vertexSource)}`);
    }
    if (fragmentSource == null) {
        fragmentSource = `#version 300 es
        precision highp float;
        void main() {
        }`;
    }
    if (typeof fragmentSource !== 'string') {
        throw new TypeError(`Invalid arguments[1]: expected [string], got ${getType(fragmentSource)}`);
    }
    // Step 1: Try to create the program
    let vertexShader, fragmentShader, program;
    try {
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        if (typeof options.beforeSource === 'function') {
            vertexSource = (0, options.beforeSource)(vertexSource);
        }
        if (typeof options.beforeVertexSource === 'function') {
            vertexSource = (0, options.beforeVertexSource)(vertexSource);
        }
        if (vertexSource != null) {
            gl.shaderSource(vertexShader, vertexSource);
        }
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw new ShaderCompileError(gl.getShaderInfoLog(vertexShader), { context: gl, shaderSource: vertexSource, shaderType: 'VERTEX_SHADER' });
        }
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (typeof options.beforeSource === 'function') {
            fragmentSource = (0, options.beforeSource)(fragmentSource);
        }
        if (typeof options.beforeFragmentSource === 'function') {
            fragmentSource = (0, options.beforeFragmentSource)(fragmentSource);
        }
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw new ShaderCompileError(gl.getShaderInfoLog(fragmentShader), { context: gl, shaderSource: fragmentSource, shaderType: 'FRAGMENT_SHADER' });
        }
        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        if (typeof options.beforeLink === 'function') {
            (0, options.beforeLink)(program);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new ShaderProgramLinkError(gl.getProgramInfoLog(program), { context: gl, source: { vertex: vertexSource, fragment: fragmentSource } });
        }
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            throw new ShaderProgramValidateError(gl.getProgramInfoLog(program), { context: gl, source: { vertex: vertexSource, fragment: fragmentSource } });
        }

        Object.defineProperties(program, {
            attribute: {
                value: programAttribParse(gl, program)
            },
            uniform: {
                value: programUniformParse(gl, program)
            }
        });
    } catch (e) {
        // Failure at any stage can still create some OpenGL (not necessarily GPU) resources.
        // We should release then if there was a failure.
        if (gl.isShader(vertexShader)) {
            gl.deleteShader(vertexShader);
        }
        if (gl.isShader(fragmentShader)) {
            gl.deleteShader(fragmentShader);
        }
        if (gl.isProgram(program)) {
            gl.deleteProgram(program);
        }
        throw e;
    }
    return program;
}

function programInfoFactory(getInfoName, getLocationName, countPropertyName, typeInfoMap, objectName) {
    return main;
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {WebGLProgram} program
     */
    function main(gl, program) {
        const target = Object.create(null);
        const length = gl.getProgramParameter(program, gl[countPropertyName]);
        for (let i = 0; i < length; ++i) {
            parse(gl, target, program, i);
        }
        return target;
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} target
     * @param {WebGLProgram} program
     * @param {number} index
     */
    function parse(gl, target, program, index) {
        const info = gl[getInfoName](program, index);
        let name = info.name;
        let is_array = false;
        if (/\[[0-9]*\]$/.test(name)) {
            name = /^(.*)\[[0-9]*\]$/.exec(name)[1];
            is_array = true;
        }
        if (!is_array) {
            generate(gl, target, program, index, name, info.type);
        } else {
            const array = [];
            Object.defineProperty(target, name, {
                value: array
            });
            for (let i = 0; i < info.size; ++i) {
                generate(gl, array, program, index, `${name}[${i}]`, info.type, i);
            }
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} target
     * @param {WebGLProgram} program
     * @param {number} index
     * @param {string} name
     * @param {number} type
     */
    function generate(gl, target, program, index, name, type, arrayIndex = null) {
        const location = gl[getLocationName](program, name);
        if (location == null) {
            throw new Error(`Runtime error: failed to determine the location of program ${objectName} [${name}]`);
        }
        const typeName = Object.keys(typeInfoMap).find(name => name in gl && gl[name] === type);
        if (typeName == null) {
            throw new Error(`Runtime error: failed to determine the type of program ${objectName} [${name}]: unknown type ${type}`);
        }
        const typeInfo = typeInfoMap[typeName];
        let itemTypeInfo = typeInfo;
        let itemTypeName = typeName;
        while (itemTypeInfo.itemType !== itemTypeName) {
            itemTypeName = itemTypeInfo.itemType;
            itemTypeInfo = typeInfoMap[itemTypeName];
        }
        const accessor = Object.create(null, {
            name: {
                value: name
            },
            index: {
                value: index
            },
            type: {
                value: type
            },
            location: {
                value: location
            },
            alignBy: {
                value: typeInfo.alignBy
            },
            alignSize: {
                value: typeInfo.alignSize
            },
            itemType: {
                value: typeInfo.itemType
            },
            glslType: {
                value: typeInfo.glslType
            },
            itemLength: {
                value: typeInfo.itemLength
            },
            primitiveType: {
                value: itemTypeInfo.itemType
            },
            primitiveSize: {
                value: itemTypeInfo.itemSize
            },
            byteLength: {
                value: typeInfo.itemLength * typeInfo.itemSize
            },
            typeName: {
                value: typeName
            }
        });
        if (objectName === 'uniform') {
            if (typeInfo.uniformValue != null) {
                Object.defineProperty(accessor, 'setValue', {
                    value: setUniformValueFactory(typeInfo.uniformValue).bind(accessor, gl)
                });
            }
            if (typeInfo.uniformArray != null) {
                Object.defineProperty(accessor, 'setArray', {
                    value: setUniformArrayFactory(typeInfo.uniformArray).bind(accessor, gl)
                });
            }
        }
        if (arrayIndex == null) {
            Object.defineProperty(target, name, {
                value: accessor
            });
        } else {
            target[arrayIndex] = accessor;
        }
    }
}

function setUniformValueFactory(method) {
    return function setUniformValue(gl, ...args) {
        return gl[method](this.location, ...args);
    };
}

function setUniformArrayFactory(method) {
    if (method.startsWith('uniformMatrix')) {
        return function setUniformArray(gl, array, transpose = false) {
            gl[method](this.location, transpose, array);
        };
    }
    return function setUniformArray(gl, array) {
        return gl[method](this.location, array);
    };
}

const attribTypeInfo = {
    FLOAT: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'float', itemType: 'FLOAT', uniformValue: 'uniform1f', uniformArray: 'uniform1fv' },
    FLOAT_VEC2: { itemSize: 4, itemLength: 2, alignBy: 8, alignSize: 8, glslType: 'vec2', itemType: 'FLOAT', uniformValue: 'uniform2f', uniformArray: 'uniform2fv' },
    FLOAT_VEC3: { itemSize: 4, itemLength: 3, alignBy: 16, alignSize: 12, glslType: 'vec3', itemType: 'FLOAT', uniformValue: 'uniform3f', uniformArray: 'uniform3fv' },
    FLOAT_VEC4: { itemSize: 4, itemLength: 4, alignBy: 16, alignSize: 16, glslType: 'vec4', itemType: 'FLOAT', uniformValue: 'uniform4f', uniformArray: 'uniform4fv' },
    FLOAT_MAT2: { itemSize: 8, itemLength: 2, alignBy: 8, alignSize: 16, glslType: 'mat2', itemType: 'FLOAT_VEC2', uniformArray: 'uniformMatrix2fv' },
    FLOAT_MAT3: { itemSize: 12, itemLength: 3, alignBy: 16, alignSize: 44, glslType: 'mat3', itemType: 'FLOAT_VEC3', uniformArray: 'uniformMatrix3fv' },
    FLOAT_MAT4: { itemSize: 16, itemLength: 4, alignBy: 16, alignSize: 64, glslType: 'mat4', itemType: 'FLOAT_VEC4', uniformArray: 'uniformMatrix4fv' },
    FLOAT_MAT2x3: { itemSize: 12, itemLength: 2, alignBy: 16, alignSize: 28, glslType: 'mat2x3', itemType: 'FLOAT_VEC3', uniformArray: 'uniformMatrix2x3fv' },
    FLOAT_MAT2x4: { itemSize: 16, itemLength: 2, alignBy: 16, alignSize: 32, glslType: 'mat2x4', itemType: 'FLOAT_VEC4', uniformArray: 'uniformMatrix2x4fv' },
    FLOAT_MAT3x2: { itemSize: 8, itemLength: 3, alignBy: 8, alignSize: 24, glslType: 'mat3x2', itemType: 'FLOAT_VEC2', uniformArray: 'uniformMatrix3x2fv' },
    FLOAT_MAT3x4: { itemSize: 16, itemLength: 3, alignBy: 16, alignSize: 48, glslType: 'mat3x4', itemType: 'FLOAT_VEC4', uniformArray: 'uniformMatrix3x4fv' },
    FLOAT_MAT4x2: { itemSize: 8, itemLength: 4, alignBy: 8, alignSize: 32, glslType: 'mat4x2', itemType: 'FLOAT_VEC2', uniformArray: 'uniformMatrix4x2fv' },
    FLOAT_MAT4x3: { itemSize: 12, itemLength: 4, alignBy: 16, alignSize: 60, glslType: 'mat4x3', itemType: 'FLOAT_VEC3', uniformArray: 'uniformMatrix4x3fv' },
    INT: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'int', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    INT_VEC2: { itemSize: 4, itemLength: 2, alignBy: 8, alignSize: 8, glslType: 'ivec2', itemType: 'INT', uniformValue: 'uniform2i', uniformArray: 'uniform2iv' },
    INT_VEC3: { itemSize: 4, itemLength: 3, alignBy: 16, alignSize: 12, glslType: 'ivec3', itemType: 'INT', uniformValue: 'uniform3i', uniformArray: 'uniform3iv' },
    INT_VEC4: { itemSize: 4, itemLength: 4, alignBy: 16, alignSize: 16, glslType: 'ivec4', itemType: 'INT', uniformValue: 'uniform4i', uniformArray: 'uniform4iv' },
    UNSIGNED_INT: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'uint', itemType: 'UNSIGNED_INT', uniformValue: 'uniform1ui', uniformArray: 'uniform1uiv' },
    UNSIGNED_INT_VEC2: { itemSize: 4, itemLength: 2, alignBy: 8, alignSize: 8, glslType: 'uvec2', itemType: 'UNSIGNED_INT', uniformValue: 'uniform2ui', uniformArray: 'uniform2uiv' },
    UNSIGNED_INT_VEC3: { itemSize: 4, itemLength: 3, alignBy: 16, alignSize: 12, glslType: 'uvec3', itemType: 'UNSIGNED_INT', uniformValue: 'uniform3ui', uniformArray: 'uniform3uiv' },
    UNSIGNED_INT_VEC4: { itemSize: 4, itemLength: 4, alignBy: 16, alignSize: 16, glslType: 'uvec4', itemType: 'UNSIGNED_INT', uniformValue: 'uniform4ui', uniformArray: 'uniform4uiv' }
};

const uniformTypeInfo = {
    ...attribTypeInfo,
    BOOL: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'bool', itemType: 'BOOL', uniformValue: 'uniform1ui', uniformArray: 'uniform1uiv' },
    BOOL_VEC2: { itemSize: 4, itemLength: 2, alignBy: 8, alignSize: 8, glslType: 'bvec2', itemType: 'BOOL', uniformValue: 'uniform2ui', uniformArray: 'uniform2uiv' },
    BOOL_VEC3: { itemSize: 4, itemLength: 3, alignBy: 16, alignSize: 12, glslType: 'bvec3', itemType: 'BOOL', uniformValue: 'uniform3ui', uniformArray: 'uniform3uiv' },
    BOOL_VEC4: { itemSize: 4, itemLength: 4, alignBy: 16, alignSize: 16, glslType: 'bvec4', itemType: 'BOOL', uniformValue: 'uniform4ui', uniformArray: 'uniform4uiv' },
    SAMPLER_2D: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'sampler2D', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_3D: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'sampler3D', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_CUBE: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'samplerCube', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_2D_SHADOW: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'sampler2DShadow', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_2D_ARRAY: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'sampler2DArray', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_2D_ARRAY_SHADOW: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'sampler2DArrayShadow', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_CUBE_SHADOW: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'samplerCubeShadow', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    INT_SAMPLER_2D: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'isampler2D', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    INT_SAMPLER_3D: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'isampler3D', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    INT_SAMPLER_CUBE: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'isamplerCube', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    INT_SAMPLER_2D_ARRAY: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'isampler2DArray', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    UNSIGNED_INT_SAMPLER_2D: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'usampler2D', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    UNSIGNED_INT_SAMPLER_3D: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'usampler3D', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    UNSIGNED_INT_SAMPLER_CUBE: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'usamplerCube', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    UNSIGNED_INT_SAMPLER_2D_ARRAY: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'usampler2DArray', itemType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' }
};

function getType(value) {
    if (value === Object(value)) {
        return Object.prototype.toString.call(value);
    } else {
        return `[${typeof value}]`;
    }
}

const programAttribParse = programInfoFactory('getActiveAttrib', 'getAttribLocation', 'ACTIVE_ATTRIBUTES', attribTypeInfo, 'attribute');
const programUniformParse = programInfoFactory('getActiveUniform', 'getUniformLocation', 'ACTIVE_UNIFORMS', uniformTypeInfo, 'uniform');

export class ShaderProgramError extends Error {
    constructor(message, properties = {}) {
        super();
        Object.defineProperty(this, 'message', {
            configurable: true,
            writable: true,
            value: message
        });
        if (properties === Object(properties)) {
            for (const key of Object.keys(properties)) {
                Object.defineProperty(this, key, {
                    configurable: true,
                    writable: true,
                    value: properties[key]
                });
            }
        }
    }
}

export class ShaderCompileError extends ShaderProgramError { }

export class ShaderProgramLinkError extends ShaderProgramError { }

export class ShaderProgramValidateError extends ShaderProgramError { }
