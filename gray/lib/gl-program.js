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
        if (fragmentSource != null) {
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
                value: Object.create(null)
            },
            uniform: {
                value: Object.create(null)
            }
        });
        {
            const length = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
            for (let i = 0; i < length; ++i) {
                const info = gl.getActiveAttrib(program, i);
                const accessor = Object.create(null, {
                    size: {
                        value: info.size
                    },
                    type: {
                        value: info.type
                    },
                    index: {
                        value: i
                    }
                });
                const location = gl.getAttribLocation(program, info.name);
                if (location == null) {
                    throw new Error(`Runtime error: failed to determine the location of program attribute [${info.name}]`);
                }
                const typeName = Object.keys(attribTypeInfo).find(name => name in gl && gl[name] === info.type);
                if (typeName == null) {
                    throw new Error(`Runtime error: failed to determine the type of program attribute [${info.name}]: unknown type ${info.type}`);
                }
                const typeInfo = attribTypeInfo[typeName];
                Object.defineProperties(accessor, {
                    location: {
                        value: location
                    },
                    typeName: {
                        value: typeName
                    },
                    itemSize: {
                        value: typeInfo.itemSize
                    },
                    locationSize: {
                        value: typeInfo.locationSize
                    },
                    primitiveSize: {
                        value: typeInfo.primitiveSize
                    },
                    primitiveTypeName: {
                        value: typeInfo.primitiveType
                    },
                    byteSize: {
                        value: typeInfo.primitiveSize * typeInfo.itemSize * typeInfo.locationSize
                    }
                });
                if (typeof gl[typeInfo.primitiveType] === 'number') {
                    Object.defineProperty(accessor, 'primitiveType', {
                        value: gl[typeInfo.primitiveType]
                    });
                }
                Object.defineProperty(program.attribute, info.name, {
                    value: accessor
                });
            }
        }
        {
            const length = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < length; ++i) {
                const info = gl.getActiveUniform(program, i);
                const accessor = Object.create(null, {
                    size: {
                        value: info.size
                    },
                    type: {
                        value: info.type
                    },
                    index: {
                        value: i
                    }
                });
                const location = gl.getUniformLocation(program, info.name);
                if (location == null) {
                    // throw new Error(`Runtime error: failed to determine the location of program uniform [${info.name}]`);
                    continue;
                }
                const typeName = Object.keys(uniformTypeInfo).find(name => name in gl && gl[name] === info.type);
                if (typeName == null) {
                    throw new Error(`Runtime error: failed to determine the type of program uniform [${info.name}]: unknown type ${info.type}`);
                }
                const typeInfo = uniformTypeInfo[typeName];
                Object.defineProperties(accessor, {
                    location: {
                        value: location
                    },
                    typeName: {
                        value: typeName
                    }
                });
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
                Object.defineProperty(program.uniform, info.name, {
                    value: accessor
                });
            }
        }
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
    FLOAT: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'FLOAT', uniformValue: 'uniform1f', uniformArray: 'uniform1fv' },
    FLOAT_VEC2: { primitiveSize: 4, itemSize: 2, locationSize: 1, primitiveType: 'FLOAT', uniformValue: 'uniform2f', uniformArray: 'uniform2fv' },
    FLOAT_VEC3: { primitiveSize: 4, itemSize: 3, locationSize: 1, primitiveType: 'FLOAT', uniformValue: 'uniform3f', uniformArray: 'uniform3fv' },
    FLOAT_VEC4: { primitiveSize: 4, itemSize: 4, locationSize: 1, primitiveType: 'FLOAT', uniformValue: 'uniform4f', uniformArray: 'uniform4fv' },
    FLOAT_MAT2: { primitiveSize: 4, itemSize: 2, locationSize: 2, primitiveType: 'FLOAT', uniformArray: 'uniformMatrix2fv' },
    FLOAT_MAT3: { primitiveSize: 4, itemSize: 3, locationSize: 3, primitiveType: 'FLOAT', uniformArray: 'uniformMatrix3fv' },
    FLOAT_MAT4: { primitiveSize: 4, itemSize: 4, locationSize: 4, primitiveType: 'FLOAT', uniformArray: 'uniformMatrix4fv' },
    FLOAT_MAT2x3: { primitiveSize: 4, itemSize: 2, locationSize: 3, primitiveType: 'FLOAT', uniformArray: 'uniformMatrix2x3fv' },
    FLOAT_MAT2x4: { primitiveSize: 4, itemSize: 2, locationSize: 4, primitiveType: 'FLOAT', uniformArray: 'uniformMatrix2x4fv' },
    FLOAT_MAT3x2: { primitiveSize: 4, itemSize: 3, locationSize: 2, primitiveType: 'FLOAT', uniformArray: 'uniformMatrix3x2fv' },
    FLOAT_MAT3x4: { primitiveSize: 4, itemSize: 3, locationSize: 4, primitiveType: 'FLOAT', uniformArray: 'uniformMatrix3x4fv' },
    FLOAT_MAT4x2: { primitiveSize: 4, itemSize: 4, locationSize: 3, primitiveType: 'FLOAT', uniformArray: 'uniformMatrix4x2fv' },
    FLOAT_MAT4x3: { primitiveSize: 4, itemSize: 4, locationSize: 4, primitiveType: 'FLOAT', uniformArray: 'uniformMatrix4x3fv' },
    INT: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    INT_VEC2: { primitiveSize: 4, itemSize: 2, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform2i', uniformArray: 'uniform2iv' },
    INT_VEC3: { primitiveSize: 4, itemSize: 3, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform3i', uniformArray: 'uniform3iv' },
    INT_VEC4: { primitiveSize: 4, itemSize: 4, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform4i', uniformArray: 'uniform4iv' },
    UNSIGNED_INT: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'UNSIGNED_INT', uniformValue: 'uniform1ui', uniformArray: 'uniform1uiv' },
    UNSIGNED_INT_VEC2: {
        primitiveSize: 4,
        itemSize: 2,
        locationSize: 1,
        primitiveType: 'UNSIGNED_INT',
        uniformValue: 'uniform2ui',
        uniformArray: 'uniform2uiv'
    },
    UNSIGNED_INT_VEC3: {
        primitiveSize: 4,
        itemSize: 3,
        locationSize: 1,
        primitiveType: 'UNSIGNED_INT',
        uniformValue: 'uniform3ui',
        uniformArray: 'uniform3uiv'
    },
    UNSIGNED_INT_VEC4: {
        primitiveSize: 4,
        itemSize: 4,
        locationSize: 1,
        primitiveType: 'UNSIGNED_INT',
        uniformValue: 'uniform4ui',
        uniformArray: 'uniform4uiv'
    }
};

const uniformTypeInfo = {
    ...attribTypeInfo,
    BOOL: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'BOOL', uniformValue: 'uniform1ui', uniformArray: 'uniform1uiv' },
    BOOL_VEC2: { primitiveSize: 4, itemSize: 2, locationSize: 1, primitiveType: 'BOOL', uniformValue: 'uniform2ui', uniformArray: 'uniform2uiv' },
    BOOL_VEC3: { primitiveSize: 4, itemSize: 3, locationSize: 1, primitiveType: 'BOOL', uniformValue: 'uniform3ui', uniformArray: 'uniform3uiv' },
    BOOL_VEC4: { primitiveSize: 4, itemSize: 4, locationSize: 1, primitiveType: 'BOOL', uniformValue: 'uniform4ui', uniformArray: 'uniform4uiv' },
    SAMPLER_2D: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_3D: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_CUBE: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_2D_SHADOW: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_2D_ARRAY: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_2D_ARRAY_SHADOW: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    SAMPLER_CUBE_SHADOW: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    INT_SAMPLER_2D: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    INT_SAMPLER_3D: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    INT_SAMPLER_CUBE: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    INT_SAMPLER_2D_ARRAY: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    UNSIGNED_INT_SAMPLER_2D: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    UNSIGNED_INT_SAMPLER_3D: { primitiveSize: 4, itemSize: 1, locationSize: 1, primitiveType: 'INT', uniformValue: 'uniform1i', uniformArray: 'uniform1iv' },
    UNSIGNED_INT_SAMPLER_CUBE: {
        primitiveSize: 4,
        itemSize: 1,
        locationSize: 1,
        primitiveType: 'INT',
        uniformValue: 'uniform1i',
        uniformArray: 'uniform1iv'
    },
    UNSIGNED_INT_SAMPLER_2D_ARRAY: {
        primitiveSize: 4,
        itemSize: 1,
        locationSize: 1,
        primitiveType: 'INT',
        uniformValue: 'uniform1i',
        uniformArray: 'uniform1iv'
    }
};

function getType(value) {
    if (value === Object(value)) {
        return Object.prototype.toString.call(value);
    } else {
        return `[${typeof value}]`;
    }
}

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
