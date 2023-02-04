#version 300 es

precision highp float;
precision highp int;

out vec4 color;

in vec3 interpolatedColor;

void main()
{
    color = vec4(interpolatedColor, 1.0F);
}
