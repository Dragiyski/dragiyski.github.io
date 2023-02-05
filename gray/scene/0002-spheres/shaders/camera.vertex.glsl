#version 300 es

precision highp float;
precision highp int;

// No in attributes, as camera values requires no input

// Computed as world coordinates:
uniform vec3 world_screen_center; // Point
uniform vec3 world_screen_right; // Vector (length = screen_width / 2)
uniform vec3 world_screen_up; // Vector (length = screen_height / 2)

// Size of screen in pixels (used by gl_VertexID) to compute x,y;
uniform uvec2 screen_size;

flat out vec3 ray_direction;

void main() {
    // Compute the pixel coordinates for this invocation of the vertex shader;
    uvec2 pixel_position = uvec2(uint(gl_VertexID) % screen_size.y, uint(gl_VertexID) / screen_size.y);
    pixel_position.y = screen_size.y - pixel_position.y; // y-coordinate increase in up direction, screen coordinate increase in down direction.
    vec2 normalizer = vec2(screen_size) - vec2(1.0, 1.0);
    ivec2 half_screen = ivec2(screen_size) / int(2);
    ivec2 pixel_coords = ivec2(pixel_position) - half_screen;
    vec2 pixel_normal_coords = vec2(pixel_coords) / normalizer; // Now x,y is in range [-1, 1]
    ray_direction = world_screen_center + pixel_normal_coords.x * world_screen_right + pixel_normal_coords.y * world_screen_up;
}
