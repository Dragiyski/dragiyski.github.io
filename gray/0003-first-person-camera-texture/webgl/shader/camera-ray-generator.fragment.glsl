#version 300 es

precision highp float;
precision highp int;
// No in attributes, as camera values requires no input

// Computed as world coordinates:
uniform vec3 world_screen_center; // Point
uniform vec3 world_screen_right; // Vector (length = screen_width / 2)
uniform vec3 world_screen_up; // Vector (length = screen_height / 2)
uniform vec3 camera_position;

out vec4 ray_direction;
in vec2 position;

void main() {
    vec3 screen_point = world_screen_center + position.x * world_screen_right + position.y * world_screen_up;
    ray_direction = vec4(normalize(screen_point - camera_position), 1.0);
}
