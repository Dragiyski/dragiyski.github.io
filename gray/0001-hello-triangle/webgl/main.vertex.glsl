#version 300 es

precision highp float;
precision highp int;

layout (location = 0) in vec2 position_in;
layout (location = 1) in vec3 color_in;

uniform uvec2 screenSize;

out vec3 color;

void main() {
    color = color_in;
    gl_Position = vec4(position_in, 0.0, 1.0);
}
