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
            throw new ShaderCompileError('VertexShaderError: ' + gl.getShaderInfoLog(vertexShader), { context: gl, shaderSource: vertexSource, shaderType: 'VERTEX_SHADER' });
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
            throw new ShaderCompileError('FragmentShaderError: ' + gl.getShaderInfoLog(fragmentShader), { context: gl, shaderSource: fragmentSource, shaderType: 'FRAGMENT_SHADER' });
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
        parseAttributes(gl, program);
        parseUniforms(gl, program);
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

export class ProgramAttribute {
    /**
     * @type {WebGL2RenderingContext}
     */
    #gl;
    #program;

    constructor(gl, program, index) {
        this.#gl = gl;
        this.#program = program;
        const info = gl.getActiveAttrib(program, index);
        const typeName = glTypeMap[info.type];
        if (typeName == null) {
            throw new Error(`Unable to find type for variable ${info.name}: type = ${info.type}`);
        }
        const typeInfo = attribTypeInfo[typeName];
        if (typeInfo == null) {
            throw new Error(`Unable to find type for variable ${info.name}: type = ${typeName} not supported for an attribute`);
        }
        Object.defineProperties(this, {
            name: {
                enumerable: true,
                value: info.name
            },
            size: {
                enumerable: true,
                value: info.size
            },
            type: {
                enumerable: true,
                value: info.type
            },
            typeName: {
                enumerable: true,
                value: typeName
            },
            typeInfo: {
                enumerable: true,
                value: typeInfo
            },
            itemType: {
                enumerable: true,
                value: gl[typeInfo.itemType]
            },
            itemTypeName: {
                enumerable: true,
                value: typeInfo.itemType
            },
            location: {
                enumerable: true,
                value: gl.getAttribLocation(program, info.name)
            },
            program: {
                value: program
            }
        });
    }

    enableArray() {
        return this.#gl.enableVertexAttribArray(this.location);
    }

    disableArray() {
        return this.#gl.disableVertexAttribArray(this.location);
    }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 */
function parseAttributes(gl, program) {
    Object.defineProperty(program, 'attribute', {
        value: Object.create(null)
    });
    const length = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let index = 0; index < length; ++index) {
        const attribute = new ProgramAttribute(gl, program, index);
        if (attribute.name in program.attribute) {
            throw new ReferenceError(`Duplicate program attribute name: ${attribute.name}`);
        }
        Object.defineProperty(program.attribute, attribute.name, {
            value: attribute
        });
    }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 */
function parseUniforms(gl, program) {
    Object.defineProperty(program, 'uniform', {
        value: Object.create(null)
    });
    Object.defineProperty(program, 'block', {
        value: Object.create(null)
    });
    {
        const length = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
        for (let index = 0; index < length; ++index) {
            parseUniformBlock(index);
        }
    }
    {
        const length = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let index = 0; index < length; ++index) {
            parseUniform(index);
        }
    }

    function parseUniformBlock(index) {
        const uniformBlock = Object.create(null, {
            name: {
                value: gl.getActiveUniformBlockName(program, index)
            },
            hasVertexReference: {
                value: gl.getActiveUniformBlockParameter(program, index, gl.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER)
            },
            hasFragmentReference: {
                value: gl.getActiveUniformBlockParameter(program, index, gl.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER)
            },
            size: {
                value: gl.getActiveUniformBlockParameter(program, index, gl.UNIFORM_BLOCK_DATA_SIZE)
            },
            binding: {
                get() {
                    return gl.getActiveUniformBlockParameter(program, index, gl.UNIFORM_BLOCK_BINDING);
                },
                set(value) {
                    gl.uniformBlockBinding(program, index, value);
                }
            }
        });
        if (uniformBlock.name in program.block) {
            throw new ReferenceError(`Duplicate (uniform) block name: ${uniformBlock.name}`);
        }
        Object.defineProperty(program.block, uniformBlock.name, {
            value: uniformBlock
        });
        const uniformArrayList = {
            index: gl.getActiveUniformBlockParameter(program, index, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES)
        };
        uniformArrayList.type = gl.getActiveUniforms(program, uniformArrayList.index, gl.UNIFORM_TYPE);
        uniformArrayList.size = gl.getActiveUniforms(program, uniformArrayList.index, gl.UNIFORM_SIZE);
        uniformArrayList.blockIndex = gl.getActiveUniforms(program, uniformArrayList.index, gl.UNIFORM_BLOCK_INDEX);
        uniformArrayList.offset = gl.getActiveUniforms(program, uniformArrayList.index, gl.UNIFORM_OFFSET);
        uniformArrayList.arrayStride = gl.getActiveUniforms(program, uniformArrayList.index, gl.UNIFORM_ARRAY_STRIDE);
        uniformArrayList.matrixStride = gl.getActiveUniforms(program, uniformArrayList.index, gl.UNIFORM_MATRIX_STRIDE);
        uniformArrayList.isRowMajor = gl.getActiveUniforms(program, uniformArrayList.index, gl.UNIFORM_IS_ROW_MAJOR);

        const uniformLength = gl.getActiveUniformBlockParameter(program, index, gl.UNIFORM_BLOCK_ACTIVE_UNIFORMS);
        for (let uniformIndex = 0; uniformIndex < uniformLength; ++uniformIndex) {
            const uniformInfo = gl.getActiveUniform(program, uniformArrayList.index[uniformIndex]);
            const typeName = glTypeMap[uniformInfo.type];
            if (typeName == null) {
                throw new Error(`Cannot find the type name for uniform ${uniformInfo.name} in uniform block ${uniformBlock.name}`);
            }
            const typeInfo = uniformBlockTypeInfo[typeName];
            if (typeInfo == null) {
                throw new Error(`Cannot find the type name for uniform ${uniformInfo.name} in uniform block ${uniformBlock.name}`);
            }
            if (uniformInfo.name in program.uniform) {
                throw new ReferenceError(`Duplicate uniform name: ${uniformInfo.name}`);
            }
            const uniform = Object.create(null, {
                name: {
                    enumerable: true,
                    value: uniformInfo.name
                },
                size: {
                    enumerable: true,
                    value: uniformInfo.size
                },
                type: {
                    enumerable: true,
                    value: uniformInfo.type
                },
                typeName: {
                    enumerable: true,
                    value: typeName
                },
                typeInfo: {
                    enumerable: true,
                    value: typeInfo
                },
                offset: {
                    enumerable: true,
                    value: uniformArrayList.offset[uniformIndex]
                },
                blockIndex: {
                    enumerable: true,
                    value: uniformArrayList.blockIndex[uniformIndex]
                },
                block: {
                    enumerable: true,
                    value: uniformBlock
                },
                blockName: {
                    enumerable: true,
                    value: uniformBlock.name
                },
                arrayStride: {
                    enumerable: true,
                    value: uniformArrayList.arrayStride[uniformIndex]
                },
                matrixStride: {
                    enumerable: true,
                    value: uniformArrayList.arrayStride[uniformIndex]
                }
            });
            Object.defineProperty(program.uniform, uniform.name, {
                enumerable: true,
                value: uniform
            });
        }
    }

    function parseUniform(index) {
        const info = gl.getActiveUniform(program, index);
        if (info.name in program.uniform) {
            return; // Uniforms might be in uniform block
        }
        let array_base_name = null;
        const name = info.name;
        if (/\[[0-9]*\]$/.test(name)) {
            array_base_name = /^(.*)\[[0-9]*\]$/.exec(name)[1];
        }
        const typeName = glTypeMap[info.type];
        if (typeName == null) {
            throw new Error(`Cannot find the type name for uniform ${info.name}`);
        }
        const typeInfo = uniformTypeInfo[typeName];
        if (typeInfo == null) {
            throw new Error(`Cannot find the type name for uniform ${info.name}`);
        }
        if (array_base_name && info.size > 1) {
            for (let i = 0; i < info.size; ++i) {
                const item_name = `${array_base_name}[${i}]`;
                const location = gl.getUniformLocation(program, item_name);
                if (location == null) {
                    continue;
                }
                const uniform = Object.create(null, {
                    name: {
                        enumerable: true,
                        value: item_name
                    },
                    index: {
                        enumerable: true,
                        value: index
                    },
                    baseName: {
                        enumerable: true,
                        value: array_base_name
                    },
                    size: {
                        enumerable: true,
                        value: info.size
                    },
                    type: {
                        enumerable: true,
                        value: info.type
                    },
                    typeName: {
                        enumerable: true,
                        value: typeName
                    },
                    typeInfo: {
                        enumerable: true,
                        value: typeInfo
                    },
                    location: {
                        value: location
                    }
                });
                if (typeInfo.uniformValue != null) {
                    Object.defineProperty(uniform, 'setValue', {
                        value: setUniformValueFactory(typeInfo.uniformValue).bind(uniform, gl)
                    });
                }
                if (typeInfo.uniformArray != null) {
                    Object.defineProperty(uniform, 'setArray', {
                        value: setUniformArrayFactory(typeInfo.uniformArray).bind(uniform, gl)
                    });
                }
                if (item_name in program.uniform) {
                    throw new TypeError(`Duplicate uniform name: ${item_name}`);
                }
                Object.defineProperty(program.uniform, item_name, {
                    enumerable: true,
                    value: uniform
                });
            }
        } else {
            const location = gl.getUniformLocation(program, name);
            if (location == null) {
                return;
            }
            const uniform = Object.create(null, {
                name: {
                    enumerable: true,
                    value: name
                },
                index: {
                    enumerable: true,
                    value: index
                },
                size: {
                    enumerable: true,
                    value: info.size
                },
                type: {
                    enumerable: true,
                    value: info.type
                },
                typeName: {
                    enumerable: true,
                    value: typeName
                },
                typeInfo: {
                    enumerable: true,
                    value: typeInfo
                },
                location: {
                    value: location
                }
            });
            if (typeInfo.uniformValue != null) {
                Object.defineProperty(uniform, 'setValue', {
                    value: setUniformValueFactory(typeInfo.uniformValue).bind(uniform, gl)
                });
            }
            if (typeInfo.uniformArray != null) {
                Object.defineProperty(uniform, 'setArray', {
                    value: setUniformArrayFactory(typeInfo.uniformArray).bind(uniform, gl)
                });
            }
            if (name in program.uniform) {
                throw new TypeError(`Duplicate uniform name: ${name}`);
            }
            Object.defineProperty(program.uniform, name, {
                enumerable: true,
                value: uniform
            });
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

export const attribTypeInfo = Object.freeze({
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
});

const opaqueTypeInfo = {
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

const uniformOnlyTypeInfo = {
    BOOL: { itemSize: 4, itemLength: 1, alignBy: 4, alignSize: 4, glslType: 'bool', itemType: 'BOOL', uniformValue: 'uniform1ui', uniformArray: 'uniform1uiv' },
    BOOL_VEC2: { itemSize: 4, itemLength: 2, alignBy: 8, alignSize: 8, glslType: 'bvec2', itemType: 'BOOL', uniformValue: 'uniform2ui', uniformArray: 'uniform2uiv' },
    BOOL_VEC3: { itemSize: 4, itemLength: 3, alignBy: 16, alignSize: 12, glslType: 'bvec3', itemType: 'BOOL', uniformValue: 'uniform3ui', uniformArray: 'uniform3uiv' },
    BOOL_VEC4: { itemSize: 4, itemLength: 4, alignBy: 16, alignSize: 16, glslType: 'bvec4', itemType: 'BOOL', uniformValue: 'uniform4ui', uniformArray: 'uniform4uiv' }
};

export const uniformTypeInfo = Object.freeze({
    ...attribTypeInfo,
    ...opaqueTypeInfo,
    ...uniformOnlyTypeInfo
});

const allTypeInfo = {
    ...uniformTypeInfo
};

export const uniformBlockTypeInfo = Object.freeze({
    ...attribTypeInfo,
    ...uniformOnlyTypeInfo
});

const glTypeMap = {};

for (const name in allTypeInfo) {
    const value = WebGL2RenderingContext.prototype[name];
    if (!Number.isSafeInteger(value)) {
        throw new ReferenceError(`Cannot find WebGL2 constant: ${name}`);
    }
    Object.freeze(allTypeInfo[name]);
    glTypeMap[value] = name;
}

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
