#version 300 es

precision highp float;
precision highp int;

out vec4 color;

uniform sampler2D color_texture;
in vec2 position;

void main() {
    vec4 tex_color = texture(color_texture, position * 0.5 + 0.5);
    // float x = mod(tex_color.x, 0.2) < 0.1 ? 1.0 : 0.0;
    color = vec4(tex_color.xyz * 0.5 + 0.5, 1.0);
}
