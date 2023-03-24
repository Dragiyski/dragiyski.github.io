#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;
precision highp isampler2D;
precision highp sampler2DArray;

const float positive_infinity = uintBitsToFloat(0x7F800000u);
const float negative_infinity = uintBitsToFloat(0xFF800000u);
const float not_a_number = uintBitsToFloat(0x7fc00000u);
const float pi = acos(-1.0);

in vec2 position;
out vec4 color_out;

struct Ray {
    vec3 origin;
    vec3 direction;
};

uniform vec3 perspective_origin;
uniform vec3 perspective_center;
uniform vec3 perspective_right;
uniform vec3 perspective_up;

uniform mat4 model_transform;
uniform mat4 inverse_model_transform;

const vec3 sphere_origin = vec3(0.0, 0.0, 0.0);
const float sphere_radius = 1.0;

vec3 reduce(vec4 value) {
    return value.xyz / value.w;
}

vec2 reduce(vec3 value) {
    return value.xy / value.z;
}

void main() {
    // Step 1: Prepare for screen raytracing:
    vec3 perspective_pixel = perspective_center + position.x * perspective_right + position.y * perspective_up;
    vec3 model_perspective_origin = reduce(inverse_model_transform * vec4(perspective_origin, 1.0));
    vec3 model_perspective_pixel = reduce(inverse_model_transform * vec4(perspective_pixel, 1.0));

    Ray ray = Ray(
        model_perspective_origin,
        normalize(model_perspective_pixel - model_perspective_origin)
    );

    vec3 sphere_vector = ray.origin - sphere_origin;
    float b = 2.0 * (dot(ray.direction, ray.origin) - dot(ray.direction, sphere_origin));
    float c = dot(sphere_vector, sphere_vector) - sphere_radius * sphere_radius;

    float D = b * b - 4.0 * c;
    if (D < 0.0) {
        discard;
    }

    float depth = (-b - sqrt(D)) * 0.5;
    if (depth < 0.0) {
        depth = (-b + sqrt(D)) * 0.5;
        if (depth < 0.0) {
            discard;
        }
    }

    vec3 model_hit_point = ray.origin + depth * ray.direction;
    vec3 normal = normalize(model_hit_point - sphere_origin);
    
    color_out = vec4(normal * 0.5 + 0.5, 0.5);
}
