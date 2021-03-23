import createProgram from '../../lib/graphics/program.js';
import OpenGLScreen, { OpenGLContext } from '../../lib/screen.js';

const methods = {
    createScreen: Symbol('createScreen'),
    createCanvasTexture: Symbol('createCanvasTexture'),
    createDepthTexture: Symbol('createDepthTexture'),
    updateCanvasTexture: Symbol('updateCanvasTexture'),
    updateDepthTexture: Symbol('updateDepthTexture'),
    stageScreenRayGenerator: Symbol('stageScreenRayGenerator'),
    stageRayTrace: Symbol('stageRayTrace'),
    showTexture: Symbol('showTexture'),
    validateFrameBuffer: Symbol('validateFrameBuffer')
};

class RaytraceContext extends OpenGLContext {
    constructor() {
        super();
        this.screen = {
            type: 'flat',
            fieldOfView: 30 / 180 * Math.PI
        };
        this.scene = {
            object: {
                sphere: [
                    {
                        "position": [-0.55, 1.0, 0.5],
                        "color": [0, 0, 1, 1],
                        "material": {
                            "ambient": 0.2,
                            "diffuse": 0.7,
                            "specular": 0.5,
                            "specularExponent": 64
                        },
                        "radius": 0.25
                    },
                    {
                        "position": [0.05, 0.35, 1.5],
                        "color": [0, 1, 0, 1],
                        "material": {
                            "ambient": 0.2,
                            "diffuse": 0.3,
                            "specular": 0.5,
                            "specularExponent": 8
                        },
                        "radius": 0.25
                    },
                    {
                        "position": [
                            0.44999999999999996,
                            -0.15000000000000002,
                            0.75
                        ],
                        "color": [
                            1,
                            0,
                            0,
                            1
                        ],
                        "material": {
                            "ambient": 0.2,
                            "diffuse": 0.7,
                            "specular": 0.8,
                            "specularExponent": 32
                        },
                        "radius": 0.25
                    },
                    {
                        "position": [
                            -0.30000000000000004,
                            0.10000000000000009,
                            2
                        ],
                        "color": [
                            1,
                            0.8,
                            0,
                            1
                        ],
                        "material": {
                            "ambient": 0.2,
                            "diffuse": 0.8,
                            "specular": 0,
                            "specularExponent": 1
                        },
                        "radius": 0.25
                    },
                    {
                        "position": [
                            -0.44999999999999996,
                            -0.35,
                            1
                        ],
                        "color": [
                            1,
                            0.5,
                            0,
                            1
                        ],
                        "material": {
                            "ambient": 0.2,
                            "diffuse": 0.8,
                            "specular": 0.5,
                            "specularExponent": 32
                        },
                        "radius": 0.25
                    },
                    {
                        "position": [
                            0,
                            0,
                            -5
                        ],
                        "color": [
                            0.4,
                            0.4,
                            0.4,
                            1
                        ],
                        "material": {
                            "ambient": 0.2,
                            "diffuse": 0.8,
                            "specular": 0,
                            "specularExponent": 1
                        },
                        "radius": 5
                    }
                ]
            },
            light: [
                {
                    position: [-1.0, 2.0, 3.75],
                    color: [1.0, 1.0, 1.0]
                },
                {
                    position: [2.0, 1.0, 2.5],
                    color: [0.0, 0.2, 0.4]
                }
            ]
        };
    }

    onCreate(gl, storage) {
        super.onCreate(gl, storage);

        {
            const ext = gl.getExtension('EXT_color_buffer_float');
            if (ext == null) {
                throw new Error(`The required WebGL extension [EXT_color_buffer_float] is missing`);
            }
        }
        {
            const ext = gl.getExtension('EXT_float_blend');
            if (ext == null) {
                throw new Error(`The required WebGL extension [EXT_float_blend] is missing`);
            }
        }

        storage.program = {
            screen: {
                flat: createProgram(gl, shaders.vertex.screen, shaders.fragment.screen.flat)
            },
            raytrace: {
                sphere: {
                    color: createProgram(gl, shaders.vertex.screen, shaders.fragment.raytrace.sphere.color)
                }
            },
            illumination: {
                ambient: createProgram(gl, shaders.vertex.screen, shaders.fragment.illumination.ambient),
                phong: createProgram(gl, shaders.vertex.screen, shaders.fragment.illumination.phong),
                ray: createProgram(gl, shaders.vertex.screen, shaders.fragment.illumination.ray)
            },
            showTexture: createProgram(gl, shaders.vertex.screen, shaders.fragment.showTexture)
        };

        storage.screenVertexArray = this[methods.createScreen](gl);

        storage.texture = {
            canvas: {
                rayOrigin: this[methods.createCanvasTexture](gl),
                rayDirection: this[methods.createCanvasTexture](gl),
                color: this[methods.createCanvasTexture](gl),
                normal: this[methods.createCanvasTexture](gl),
                hit: this[methods.createCanvasTexture](gl),
                view: this[methods.createCanvasTexture](gl),
                material: this[methods.createCanvasTexture](gl),
                phong: this[methods.createCanvasTexture](gl)
            },
            depth: {
                distance: this[methods.createDepthTexture](gl)
            }
        };

        storage.framebuffer = {
            ray: gl.createFramebuffer(),
            trace: gl.createFramebuffer(),
            phong: gl.createFramebuffer()
        };

        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.ray);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, storage.texture.canvas.rayOrigin, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, storage.texture.canvas.rayDirection, 0);
        this[methods.validateFrameBuffer](gl, gl.FRAMEBUFFER);

        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.trace);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, storage.texture.canvas.color, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, storage.texture.canvas.normal, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, storage.texture.canvas.hit, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT3, gl.TEXTURE_2D, storage.texture.canvas.material, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT4, gl.TEXTURE_2D, storage.texture.canvas.view, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, storage.texture.depth.distance, 0);
        this[methods.validateFrameBuffer](gl, gl.FRAMEBUFFER);

        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.phong);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, storage.texture.canvas.phong, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, storage.texture.depth.distance, 0);
        this[methods.validateFrameBuffer](gl, gl.FRAMEBUFFER);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    [methods.createScreen](gl) {
        const vertexBuffer = gl.createBuffer();
        const indexBuffer = gl.createBuffer();
        const vertexArray = gl.createVertexArray();

        gl.bindVertexArray(vertexArray);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, pseudoVertices, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pseudoIndices, gl.STATIC_DRAW);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return vertexArray;
    }

    [methods.createCanvasTexture](gl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    [methods.updateCanvasTexture](gl, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.FLOAT, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    [methods.createDepthTexture](gl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH32F_STENCIL8, gl.canvas.width, gl.canvas.height, 0, gl.DEPTH_STENCIL, gl.FLOAT_32_UNSIGNED_INT_24_8_REV, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    [methods.updateDepthTexture](gl, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH32F_STENCIL8, gl.canvas.width, gl.canvas.height, 0, gl.DEPTH_STENCIL, gl.FLOAT_32_UNSIGNED_INT_24_8_REV, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    [methods.validateFrameBuffer](gl, target) {
        const status = gl.checkFramebufferStatus(target);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            for (const errorName of [
                'FRAMEBUFFER_UNDEFINED',
                'FRAMEBUFFER_INCOMPLETE_ATTACHMENT',
                'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT',
                'FRAMEBUFFER_UNSUPPORTED',
                'FRAMEBUFFER_INCOMPLETE_MULTISAMPLE'
            ]) {
                if (typeof gl[errorName] === 'number' && status === gl[errorName]) {
                    throw new Error(`Failed to setup framebuffer: ${errorName}`);
                }
            }
        }
    }

    onStart(gl, storage) {
        super.onStart(gl, storage);
        gl.hint(gl.FRAGMENT_SHADER_DERIVATIVE_HINT, gl.NICEST);
    }

    onStop(gl, storage) {
        super.onStop(gl, storage);
    }

    onResize(gl, storage) {
        super.onResize(gl, storage);
        for (const name of Object.keys(storage.texture.canvas)) {
            this[methods.updateCanvasTexture](gl, storage.texture.canvas[name]);
        }
        for (const name of Object.keys(storage.texture.depth)) {
            this[methods.updateDepthTexture](gl, storage.texture.depth[name]);
        }
    }

    onPaint(gl, storage) {
        super.onPaint(gl, storage);

        const now = performance.now();
        const time = [
            wrappedNumber(now, 4920),
            wrappedNumber(now, 7589),
            wrappedNumber(now, 3045),
            wrappedNumber(now, 4102),
            wrappedNumber(now, 6024),
        ];
        for(let i = 0; i < 5; ++i) {
            this.scene.object.sphere[i].position[1] = Math.sin(time[i] * Math.PI * 2) / 2;
        }

        const screen = this[methods.stageScreenRayGenerator](gl, storage);
        this[methods.stageRayTrace](gl, storage, screen);
        this[methods.showTexture](gl, storage, storage.texture.canvas.phong);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     * @param {WebGLTexture} texture
     */
    [methods.showTexture](gl, storage, texture) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Ensure no framebuffer is bound, i.e. draw to screen

        const program = storage.program.showTexture;

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.disable(gl.BLEND);
        gl.stencilMask(0);
        gl.depthMask(0);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        program.uniform.inputTexture.setValue(0);

        gl.bindVertexArray(storage.screenVertexArray);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);

        gl.useProgram(null);
    }

    /**
     * This method perform the actual raytracing.
     * The method reads from `storage.texture.ray` and writes into:
     * 1. storage.texture.canvas.color - the color of the intersected object (possibly from texture);
     * 2. storage.texture.canvas.normal - the normal vector of the intersected object;
     * 3. storage.texture.canvas.hit - the hit point of the intersection;
     * 4. storage.texture.canvas.material - the material of the intersected object (this will be the same for all pixels of the object).
     * 5. storage.texture.depth.distance - a depth buffer will contain the distance to the object; the stencil buffer bit 1 would be set if intersection occurs.
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     * @param {object} screen
     */
    [methods.stageRayTrace](gl, storage, screen) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.trace);

        /* Part 1: Raytracing
         *
         * Inputs:
         * 1. A texture containing ray directions for each pixel/sample;
         * 2. The ray origin.
         * 3. Object data (shader dependent, one shader program for each type of object).
         *
         * Output:
         * 1. A texture containing object colors.
         * 2. A texture containing object normals.
         * 3. A texture containing object hit points.
         * 4. A texture containing object materials.
         * 5. A depth/stencil texture, with stencil bit 0 set to 1 for all pixels that has intersection.
         *
         * The stencil texture here will help to drop pixels that do not have intersection earlier.
         */

        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2, gl.COLOR_ATTACHMENT3, gl.COLOR_ATTACHMENT4]);

        gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]);
        gl.clearBufferfv(gl.COLOR, 1, [0, 0, 0, 0]);
        gl.clearBufferfv(gl.COLOR, 2, [0, 0, 0, 0]);
        gl.clearBufferfv(gl.COLOR, 3, [0, 0, 0, 1]);
        gl.clearBufferfv(gl.COLOR, 4, [0, 0, 0, 0]);

        gl.depthMask(true);
        gl.stencilMask(0xFF);
        gl.clearBufferfi(gl.DEPTH_STENCIL, 0, 1, 0);

        // If multiple spheres match the same pixel, depth test will ensure only spheres with distance <= write to the pixel.
        // Since we iterate through all the spheres, eventually the pixel will be determined by the closest sphere (possibly intersects).
        gl.enable(gl.DEPTH_TEST);
        // LEQUAL passes for infinity (+Infinity <= +Infinity)
        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(true);

        // We do not enable stencil test here, but we will update the stencil buffer with flag 0.
        // This will set 1 to flag 0 on the stencil buffer if depth test passes.
        gl.enable(gl.STENCIL_TEST);
        gl.stencilMask(1);
        gl.stencilFunc(gl.ALWAYS, 1, 1);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        // Later we can use that bit to cut out any pixel processing for pixels that do not intersect anything.

        gl.bindVertexArray(storage.screenVertexArray);

        let program = storage.program.raytrace.sphere.color;

        gl.useProgram(program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.rayOrigin);
        program.uniform.rayOriginImage.setValue(0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.rayDirection);
        program.uniform.rayDirectionImage.setValue(1);

        for (const sphere of this.scene.object.sphere) {
            program.uniform.spherePosition.setArray(sphere.position);
            program.uniform.sphereRadius.setValue(sphere.radius);
            program.uniform.sphereColor.setArray(sphere.color);
            program.uniform.sphereMaterial.setValue(
                sphere.material.ambient,
                sphere.material.diffuse,
                sphere.material.specular,
                sphere.material.specularExponent
            );

            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        }

        /**
         * Part 2: Illumination
         *
         * In the illumination we use stencil buffer to drop pixels that are not intersecting anything.
         */

        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.phong);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]);

        gl.disable(gl.DEPTH_TEST);
        gl.depthMask(false);
        gl.stencilMask(0);
        gl.stencilFunc(gl.EQUAL, 1, 1);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        gl.enable(gl.STENCIL_TEST);

        /**
         * Part 2.1: Ambient Illumination
         *
         * Input:
         * 1. The material texture from part 1;
         * 2. The color texture from part 1;
         *
         * Output:
         * 1. The initial phong texture;
         */

        program = storage.program.illumination.ambient;
        gl.useProgram(program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.material);
        program.uniform.materialImage.setValue(0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.color);
        program.uniform.colorImage.setValue(1);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

        /**
         * Part 2.2: Diffuse + Specular
         *
         * Diffuse + Specular are added on top of the ambient, for final color:
         *
         * ambient + diffuse[light[0]] + specular[light[0]] + diffuse[light[1]] + specular[light[1]] + ...
         *
         * We cannot directly add the color to the shader, but we can use blending.
         * When blending is enabled, the final color written is determined by the previous color on that location and the fragment incoming color.
         * There is limited set of equations in OpenGL, but sum is one of them.
         *
         * The floating point values are clamped between 0.0 and 1.0 (that's exactly what we want) and are defined as:
         * C = S * s + D * d
         * where C is the color written to the frame buffer,
         * S is the color coming from the fragment shader,
         * D is the color already in the framebuffer,
         * s and d are constants that can be set to limited number of values.
         *
         * Note that there are 4 equations for each color component, r, g, b and a.
         * The a can be set separately from r, g, b.
         * Factor can also be defined from constant r, g, b, a, or it can come from the source color itself.
         *
         * For the current sum, we will define it as follows:
         * (C_r, C_g, C_b) = 1 * (S_r, S_g, S_b) + 1 * (D_r, D_g, D_b);
         * this will add the colors and clamp them if necessary.
         *
         * For alpha we will set it to
         * C_a = 0 * S_a + 1 * D_a;
         *
         * In other words, the alpha will never be changed from the fragment shader at this stage.
         */

        for (const light of this.scene.light) {
            gl.disable(gl.DEPTH_TEST);
            gl.depthMask(false);
            gl.stencilMask(0);
            gl.stencilFunc(gl.EQUAL, 1, 1);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            gl.enable(gl.STENCIL_TEST);
            gl.disable(gl.BLEND);

            gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.ray);
            program = storage.program.illumination.ray;
            gl.useProgram(program);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.hit);
            program.uniform.hitImage.setValue(0);

            program.uniform.lightPosition.setArray(light.position);

            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(true);
            gl.stencilMask(2);
            gl.stencilFunc(gl.EQUAL, 3, 1);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
            gl.enable(gl.STENCIL_TEST);

            gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.trace);
            gl.drawBuffers([gl.NONE, gl.NONE, gl.NONE, gl.NONE, gl.NONE]);
            gl.clearBufferfi(gl.DEPTH_STENCIL, 0, 1, 1);

            program = storage.program.raytrace.sphere.color;
            gl.useProgram(program);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.rayOrigin);
            program.uniform.rayOriginImage.setValue(0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.rayDirection);
            program.uniform.rayOriginImage.setValue(0);

            for (const sphere of this.scene.object.sphere) {
                program.uniform.spherePosition.setArray(sphere.position);
                program.uniform.sphereRadius.setValue(sphere.radius);

                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
            }

            gl.disable(gl.DEPTH_TEST);
            gl.depthMask(false);
            gl.stencilMask(0);
            gl.stencilFunc(gl.EQUAL, 1, 3);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            gl.enable(gl.STENCIL_TEST);
            gl.enable(gl.BLEND);
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ZERO, gl.ONE);

            gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.phong);
            program = storage.program.illumination.phong;
            gl.useProgram(program);

            program.uniform.lightPosition.setArray(light.position);
            program.uniform.lightColor.setArray(light.color);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.color);
            program.uniform.texColor.setValue(0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.normal);
            program.uniform.texNormal.setValue(1);

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.hit);
            program.uniform.texHitPoint.setValue(2);

            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.material);
            program.uniform.texMaterial.setValue(3);

            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D, storage.texture.canvas.view);
            program.uniform.texViewVector.setValue(4);

            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        }
        gl.disable(gl.BLEND);

        gl.useProgram(null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /**
     * This method compute the ray direction for every pixel of the screen.
     * The ray information is written in `storage.texture.canvas.rayDirection`.
     * @param {WebGL2RenderingContext} gl
     * @param {object} storage
     * @returns {object}
     */
    [methods.stageScreenRayGenerator](gl, storage) {
        let program = storage.program.screen[this.screen.type];

        gl.useProgram(program);

        const minSize = Math.min(gl.canvas.width, gl.canvas.height);
        const viewSize = [gl.canvas.width / minSize, gl.canvas.height / minSize];
        const viewSizeLength = Math.sqrt(viewSize[0] * viewSize[0] + viewSize[1] * viewSize[1]);
        const radius = storage.screenRadius = viewSizeLength / Math.tan(this.screen.fieldOfView * 0.5);

        program.uniform.screenSize.setValue(gl.canvas.width, gl.canvas.height);
        program.uniform.viewSize.setArray(viewSize);
        program.uniform.screenRadius.setValue(radius);

        gl.bindFramebuffer(gl.FRAMEBUFFER, storage.framebuffer.ray);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
        gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]);
        gl.clearBufferfv(gl.COLOR, 1, [0, 0, 0, 0]);

        gl.bindVertexArray(storage.screenVertexArray);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        gl.bindVertexArray(null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(null);

        return {
            origin: [0, 0, radius],
            viewSize,
            viewSizeLength,
            minSize,
            fieldOfView: this.screen.fieldOfView
        };
    }

    onRelease(gl, storage) {
        super.onRelease(gl, storage);
    }
}

const pseudoVertices = Float32Array.from([
    -1, +1,
    -1, -1,
    +1, -1,
    +1, +1
]);
const pseudoIndices = Uint8Array.from([
    // 0 3
    // 1 2
    0, 1, 2,
    0, 2, 3
]);

async function main() {
    shaders = {
        vertex: {
            screen: await fetchTextFile(new URL('shader/screen/vertex.glsl', import.meta.url))
        },
        fragment: {
            screen: {
                flat: await fetchTextFile(new URL('shader/screen/flat.glsl', import.meta.url))
            },
            raytrace: {
                sphere: {
                    color: await fetchTextFile(new URL('shader/raytrace/sphere.color.glsl', import.meta.url))
                }
            },
            illumination: {
                ambient: await fetchTextFile(new URL('shader/illumination/ambient.glsl', import.meta.url)),
                phong: await fetchTextFile(new URL('shader/illumination/phong.glsl', import.meta.url)),
                ray: await fetchTextFile(new URL('shader/illumination/ray.glsl', import.meta.url)),
            },
            showTexture: await fetchTextFile(new URL('shader/show-texture.glsl', import.meta.url))
        }
    };
    const context = new RaytraceContext();
    const screen = document.getElementById('screen');
    if (screen instanceof OpenGLScreen) {
        // screen.autoResize = false;
        // screen.canvas.width = 400;
        // screen.canvas.height = 400;
        screen.context = context;
        // screenResizeObserver.observe(screen);
        // doResize(screen);
        screen.passive = false;
    }
}

function doResize(screen) {
    const min = Math.min(screen.clientWidth, screen.clientHeight);
    screen.canvas.style.width = min + 'px';
    screen.canvas.style.height = min + 'px';
}

function onResize(entries) {
    for (const entry of entries) {
        if (entry instanceof OpenGLScreen) {
            doResize(entry);
        }
    }
}

const screenResizeObserver = new ResizeObserver(onResize);

function onStart() {
    main().catch(onError);
}

function onError(error) {
    console.error(error);
}

let shaders;

async function fetchTextFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const error = new Error(`Unable to fetch file: ${url}`);
        error.response = response;
        error.url = url;
        throw error;
    }
    return response.text();
}

function wrappedNumber(number, wrap) {
    return (number % wrap) / wrap;
}

customElements.whenDefined('opengl-screen').then(onStart, onError);
