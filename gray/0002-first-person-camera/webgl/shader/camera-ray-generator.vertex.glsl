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

out vec4 ray_direction;

void main() {
    // Compute the pixel coordinates for this invocation of the vertex shader;
    vec2 pixel_position = vec2(mod(float(gl_VertexID), float(screen_size.x)), float(gl_VertexID) / float(screen_size.x));
    vec2 pixel_normal_coords = vec2(pixel_position) / vec2(screen_size); // Now x,y is in range [0, 1]
    pixel_normal_coords = pixel_normal_coords * 2.0 - 1.0;
    vec3 screen_point = world_screen_center + pixel_normal_coords.x * world_screen_right + pixel_normal_coords.y * world_screen_up;
    ray_direction = vec4(normalize(screen_point - camera_position), 1.0);
}
