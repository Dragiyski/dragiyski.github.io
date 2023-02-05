#version 300 es

precision highp float;
precision highp int;

// No in attributes, as camera values requires no input

// Camera position and direction are given in world coordinates;
uniform vec3 camera_position;
uniform vec3 camera_direction;
// The size of the screen in pixels;
uniform uvec2 screen_size;
// The diagonal-field-of-view (in radians)
uniform float diagonal_field_of_view;
uniform float near_frame_distance;

void main() {
    // Compute the pixel coordinates for this invocation of the vertex shader;
    uvec2 pixel_position = uvec2(gl_VertexID % screen_size.y, gl_VertexID / screen_size.y);
}
