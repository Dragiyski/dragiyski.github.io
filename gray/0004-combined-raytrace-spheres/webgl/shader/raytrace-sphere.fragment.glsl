#version 300 es

precision highp float;
precision highp int;

uniform sampler2D ray_direction_texture;
uniform vec3 ray_origin;
uniform vec3 sphere_origin;
uniform float sphere_radius;

in vec2 position;

out vec4 normal_depth;

float length2(vec3 value) {
    return value.x * value.x + value.y * value.y + value.z * value.z;
}

void main() {
    vec3 ray_direction = texture(ray_direction_texture, position).xyz;
    float a = length2(ray_direction);
    float b = 2.0 * (dot(ray_direction, ray_origin) - dot(ray_direction, sphere_origin));
    float c = length2(ray_origin - sphere_origin) - sphere_radius * sphere_radius;
    float D = b * b - 4.0 * a * c;
    if (D < 0.0) {
        normal_depth = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    float x = (-b - sqrt(D)) / (2.0 * a);
    if (x < 0.0) {
        x = (-b + sqrt(D)) / (2.0 * a);
        if (x < 0.0) {
            normal_depth = vec4(0.0, 0.0, 0.0, 1.0);
            return;
        }
    }
    gl_FragDepth = x;
    vec3 hit_point = ray_origin + x * ray_direction;
    vec3 normal = normalize(hit_point - sphere_origin);
    normal_depth = vec4(normal * 0.5 + 0.5, x);
}