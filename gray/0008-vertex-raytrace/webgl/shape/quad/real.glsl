#version 300 es

precision highp float;
precision highp int;

const float positive_infinity = uintBitsToFloat(0x7F800000u);
const float negative_infinity = uintBitsToFloat(0xFF800000u);
const float not_a_number = uintBitsToFloat(0x7fc00000u);

in vec2 position;
layout(location=0) out vec4 normal_depth;
layout(location=1) out vec4 hit_point;
// layout(location=2) out uint id;

uniform vec3 ray_origin;
uniform sampler2D ray_direction_texture;
uniform uint object_id;
uniform vec3 origin;
uniform vec3 direction[2];
uniform float direction_square[2];
uniform vec3 normal;
uniform float dot_normal_origin;

struct Object {
    uint id;
};

struct Texture {
    uint type;
    uint id;
    float points[4];
};

struct Quad {
    Object object;
    vec3 origin;
    vec3 direction[2];
    Texture textures[3];
};

uniform Quad box[6];

void main() {
    vec3 ray_direction = texture(ray_direction_texture, position).xyz;
    float dot_normal_ray_direction = dot(normal, ray_direction);
    float raytrace_depth = (dot_normal_origin - dot(normal, ray_origin)) / dot_normal_ray_direction;
    vec3 raytrace_hit_point = ray_origin + raytrace_depth * ray_direction;
    vec3 hit_point_origin = raytrace_hit_point - origin;
    float x = dot(hit_point_origin, direction[0]) / direction_square[0];
    if (x < 0.0 || x > 1.0) {
        discard;
        return;
    }
    float y = dot(hit_point_origin, direction[1]) / direction_square[1];
    if (y < 0.0 || y > 1.0) {
        discard;
        return;
    }
    normal_depth.xyz = normal;
    normal_depth.w = raytrace_depth;
    hit_point.xyz = raytrace_hit_point;
    // id = object_id;
}