#version 300 es

#if GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

layout (location = 0) out vec4 rayOrigin;
layout (location = 1) out vec4 rayDirection;

uniform uvec2 screenSize;
uniform vec2 viewSize;
uniform float screenRadius;

void main() {
    vec2 relCoord = gl_FragCoord.xy / vec2(screenSize);
    vec2 rectCoord = relCoord * viewSize * 2.0 - viewSize;
    vec3 flatCoord = vec3(rectCoord, 0.0);
    vec3 origin = vec3(0.0, 0.0, screenRadius);
    vec3 direction = normalize(flatCoord - origin);

    rayOrigin = vec4(origin, 1.0);
    rayDirection = vec4(direction, 1.0);
}
