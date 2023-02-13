#version 300 es

precision highp float;
precision highp int;

/* Camera settings */
uniform vec3 world_screen_center;
uniform vec3 world_screen_right;
uniform vec3 world_screen_up;
uniform vec3 camera_position;

out vec4 color;
in vec2 position;

const float positive_infinity = uintBitsToFloat(0x7F800000u);
const float negative_infinity = uintBitsToFloat(0xFF800000u);
const float not_a_number = uintBitsToFloat(0x7fc00000u);

void main() {
    vec2 pixel_position = position * 2.0 - 1.0;
    vec3 world_screen_point = world_screen_center + pixel_position.x * world_screen_right + pixel_position.y * world_screen_up;
    vec3 ray_direction = normalize(world_screen_point - world_screen_center);
    color = vec4(ray_direction, 1.0);
}