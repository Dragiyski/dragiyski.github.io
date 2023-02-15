#version 300 es

precision highp float;
precision highp int;

uniform sampler2D color_texture;

in vec2 position;
out vec4 color;

void main() {
    vec4 tex_color = texture(color_texture, position);
    color = vec4(tex_color.xyz, 1.0);
}
