#version 300 es

precision highp float;
precision highp int;

const float positive_infinity = uintBitsToFloat(0x7F800000u);
const float negative_infinity = uintBitsToFloat(0xFF800000u);
const float not_a_number = uintBitsToFloat(0x7fc00000u);

in vec2 position;
out vec4 color;

uniform sampler2D texture_in;

void main() {
    color = texture(texture_in, position);
}