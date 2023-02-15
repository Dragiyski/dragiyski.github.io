#version 300 es

precision highp float;
precision highp int;

in vec2 position;
layout(location=0) out vec4 normal_depth;
layout(location=1) out vec4 hit_point;
layout(location=2) out uint id;

uniform vec3 ray_origin;
uniform sampler2D ray_direction_texture;
uniform uint object_id;
uniform vec3 origin;
uniform vec3 direction[2];
uniform float direction_square[2];
uniform vec3 normal;
uniform float dot_normal_origin;

void main() {
    id = object_id;
    vec3 ray_direction = texture(ray_direction_texture, position).xyz;
    float dot_normal_ray_direction = dot(normal, ray_direction);
    normal_depth.xyz = normal;
    float raytrace_depth = (dot_normal_origin - dot(normal, ray_origin)) / dot_normal_ray_direction;
    normal_depth.w = raytrace_depth;
    vec3 raytrace_hit_point = ray_origin + raytrace_depth * ray_direction;
    hit_point.xyz = raytrace_hit_point;
    vec3 hit_point_origin = raytrace_hit_point - origin;
    float x = dot(hit_point_origin, direction[0]) / direction_square[0];
    if (x < 0.0 || x > 1.0) {
        gl_FragDepth = -1.0;
        return;
    }
    float y = dot(hit_point_origin, direction[1]) / direction_square[1];
    if (y < 0.0 || y > 1.0) {
        gl_FragDepth = -1.0;
        return;
    }
    gl_FragDepth = 1.0 - 1.0 / (1.0 + raytrace_depth);
}