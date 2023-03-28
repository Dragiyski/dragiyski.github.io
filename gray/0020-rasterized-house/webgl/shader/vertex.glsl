#version 300 es

precision highp float;
precision highp int;

layout (location = 0) in vec3 input_position;
layout (location = 1) in vec3 input_normal;
layout (location = 2) in vec2 input_texture;

uniform mat4 transform_matrix;
uniform mat3 normal_matrix;

out vec3 interp_position;
out vec3 interp_normal;
out vec2 interp_texture;

void main() {
    interp_position = input_position;
    interp_normal = normal_matrix * input_normal;
    interp_texture = interp_texture;
    gl_Position = transform_matrix * vec4(input_position, 1.0);
}
