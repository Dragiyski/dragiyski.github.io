#version 300 es

#if GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

out vec4 rayDirection;

uniform uvec2 screenSize;
uniform vec2 halfDiagonal;
uniform float screenRadius;

void main() {
    vec2 screenRelativeCoord = gl_FragCoord.xy / vec2(screenSize);
    vec2 screenRectCoord = screenRelativeCoord * halfDiagonal * 2.0 - halfDiagonal;
    vec3 screenFlatCoord = vec3(screenRectCoord, 0.0);
    vec3 origin = vec3(0.0, 0.0, screenRadius);
    vec3 direction = normalize(screenFlatCoord - origin);

    rayDirection = vec4(direction, 1.0);
}
