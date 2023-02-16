#version 300 es

precision highp float;
precision highp int;

uniform sampler2D color_texture;

in vec2 position;
out vec4 color;

void main() {
    color = vec4(texture(color_texture, position).xyz * 0.5 + 0.5, 1.0);
}
