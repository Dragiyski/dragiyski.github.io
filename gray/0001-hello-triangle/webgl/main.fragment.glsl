#version 300 es

precision highp float;
precision highp int;

out vec4 color_out;

in vec3 color;

void main()
{
    color_out = vec4(color, 1.0);
}
