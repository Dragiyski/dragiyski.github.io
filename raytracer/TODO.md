# Requirements

* Ability to `#define` preprocessor value from JavaScript
* Ability to define `case:` statement in a switch
* Ability to define functions and structures, possibly with automated names

# Important notes

* `textureSize` is not a constant function. Using `uniform` for the width of the textures is preferred, as it skips per-pixel calculation.
* `sampler2D` cannot appear inside struct, but can be `in` parameter of a function.
* Any type, including `float` can be `inout` parameter of a function.

# Instruction

Instruction defines action to be taken to draw a pixel; There should be uniform pointing to single instruction telling what to draw.

Most instructions contain data for a shape + additional data determining the color and illumination.

## Scene

The instruction contains the root object to raytrace, a potential null object to handle missed trace, a lighting-set containing one or more lights, etc.

## Container

**Some** (but not necessarily all) shapes can be a container. If raytraced, they do not affect the drawable part of the state. Instead they
descend down and repeat the raytrace for each of their children.

Containers *can* reference material instruction, in which case the material will apply to all children, unless overridden. Because during
traversal of the container tree only the current node is kept, the ID of the node that set the material must be kept. If the traversal
go towards the parent of the node with ID = Material Node ID, then additional loop look through all the parents for parent material.

## Material

* Can apply to any Shape.
* Can be inherited.
* Can contain `color`: a value or texture pointer.
* Can contain texture pointer: `normal`.
* Can contain `ambient`, `diffuse`, `specular`, `specular_exponent`, `reflection` and `refraction` coefficients: either float values or texture pointer;

## Texture pointer

Textures are kept into sample2DArray, one for each size. Sizes are between 1 and 16 (but texture below size 8 are worthless).
A size 11, means texture has `width = height = 1 << 11` pixels. All textures are `gl.RGBA` (4 x 8-bit unsgined integer normalized to float).Only used sizes must be defined.

* byte[0-1] = texture index
* byte[2] = size [8:16]
* byte[3] = flags: unused

A value can be retrieved by `vec4 texel = texture(2d_array_texture, vec3(u, v, k))` where `2d_array_texture` is the `sampler2DArray` for tha size,
`u` and `v` are `float` - the texture coordinates, `k` is `float` cast of the texture index.

## Sphere

* Requires `vec4` for position and radius;
* If texture-enabled, requires `vec3` latitude and `vec3` longitude vectors;
* Can be a container;
* Must raytrace using the position and radius before it reads the latitude/longitude;
