#version 300 es

precision highp float;
precision highp int;
// No in attributes, as camera values requires no input

// Computed as world coordinates:
uniform vec3 world_screen_center; // Point
uniform vec3 world_screen_right; // Vector (length = screen_width / 2)
uniform vec3 world_screen_up; // Vector (length = screen_height / 2)
uniform vec3 camera_position;

// Size of screen in pixels (used by gl_VertexID) to compute x,y;
uniform uvec2 screen_size;

out vec3 ray_direction;

void main() {
    // Compute the pixel coordinates for this invocation of the vertex shader;
    uvec2 pixel_position = uvec2(uint(gl_VertexID) % screen_size.x, uint(gl_VertexID) / screen_size.x);
    ivec2 half_screen = ivec2(screen_size) / int(2);
    ivec2 pixel_coords = ivec2(pixel_position) - half_screen;
    vec2 pixel_normal_coords = vec2(pixel_coords) / vec2(half_screen); // Now x,y is in range [-1, 1]
    vec3 screen_point = world_screen_center + pixel_normal_coords.x * world_screen_right + pixel_normal_coords.y * world_screen_up;
    ray_direction = normalize(screen_point - camera_position);
}
