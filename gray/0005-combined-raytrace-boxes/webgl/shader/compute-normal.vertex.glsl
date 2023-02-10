#version 300 es

precision highp float;
precision highp int;

layout (location = 0) in vec2 position_in;

out vec2 position;

void main() {
    position = position_in * 0.5 + 0.5;
    gl_Position = vec4(position_in, 0.0, 1.0);
}
