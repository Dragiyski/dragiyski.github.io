#version 300 es

#include once "header.glsl"

#import if default as SUPPORT_BIT_CAST from <lib/webgl/support/bit-cast.js>
#import float maxValue as FLOAT_MAX_VALUE from <lib/float-32.js>

#ifdef SUPPORT_BIT_CAST
const MAX_RAY_DISTANCE = uintBitsToFloat(0x7F800000u);
#else
const MAX_RAY_DISTANCE = FLOAT_MAX_VALUE;
#endif

#define OBJECT_TYPE_NULL 0

in vec2 position;
out vec4 color;

uniform vec3 camera_origin;
uniform vec3 screen_origin;
uniform vec3 screen_right;
uniform vec3 screen_up;

uniform sampler2D data_float;
uniform isampler2D data_int;
uniform isampler2D data_object;
uniform isampler2D data_children;

struct RaytraceState {
    vec3 normal;
    float depth;
    vec3 hit_point;
    int id;
    int primitive_id;
    int next_index;
};

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Object {
    ivec4 instruction;
    int id;
    int float_offset;
    int int_offset;
};

struct ColorRaytraceState {
    RaytraceState state;
    vec4 color;
    vec3 normal;
}

const default_raytrace_state = RaytraceState(
    vec3(0.0, 0.0, 0.0),
    MAX_RAY_DISTANCE,
    vec3(0.0, 0.0, 0.0),
    -1,
    -1,
    -1
);

vec4 getFloatData(int index) {
    ivec2 size = textureSize(data_float, 0);
    ivec2 point = ivec2(index % size[0], index / size[0]);
    return texelFetch(data_float, point, 0);
}

ivec4 getIntData(int index) {
    ivec2 size = textureSize(data_float, 0);
    ivec2 point = ivec2(index % size[0], index / size[0]);
    return texelFetch(data_int, point, 0);
}

ivec4 getObjectData(int index) {
    ivec2 size = textureSize(data_float, 0);
    ivec2 point = ivec2(index % size[0], index / size[0]);
    return texelFetch(data_object, point, 0);
}

void main() {
    return;
}
