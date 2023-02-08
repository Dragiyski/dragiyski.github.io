#version 300 es

precision highp float;
precision highp int;
// No in attributes, as camera values requires no input

// Computed as world coordinates:
uniform vec3 world_screen_center; // Point
uniform vec3 world_screen_right; // Vector (length = screen_width / 2)
uniform vec3 world_screen_up; // Vector (length = screen_height / 2)
uniform vec3 camera_position;

uniform uvec2 screen_size;

out vec4 ray_direction;

void main() {
    vec2 half_screen = vec2(screen_size) * 0.5;
    vec2 screen_coords = vec2(gl_FragCoord.xy) - half_screen;
    vec2 normal_screen_coords = screen_coords / vec2(screen_size);
    vec3 screen_point = world_screen_center + normal_screen_coords.x * world_screen_right + normal_screen_coords.y * world_screen_up;
    ray_direction = vec4(normalize(screen_point - camera_position), 1.0);
}
