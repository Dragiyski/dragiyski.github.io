#version 300 es

#if GL_ES
precision highp float;
precision highp int;
#endif

layout (location = 0) in vec2 vertex;

void main() {
    gl_Position = vec4(vertex.xy, 0.0, 1.0);
}
