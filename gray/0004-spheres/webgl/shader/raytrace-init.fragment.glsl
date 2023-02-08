#version 300 es

precision highp float;
precision highp int;

out vec4 normal_depth;

void main() {
    float zero = +0.0;
    float positive_infinity = +1.0 / zero;
    normal_depth = vec4(0.0, 0.0, 0.0, positive_infinity);
}