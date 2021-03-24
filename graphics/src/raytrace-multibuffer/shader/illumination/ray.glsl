#version 300 es

#if GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

layout (location = 0) out vec4 rayOrigin;
layout (location = 1) out vec4 rayDirection;

uniform vec3 lightPosition;
uniform sampler2D hitImage;

void main() {
    vec2 size = vec2(textureSize(hitImage, 0));
    vec4 hitPoint = textureLod(hitImage, gl_FragCoord.xy / size, 0.0);

    vec3 lightVector = normalize(lightPosition - hitPoint.xyz);
    float minSize = min(size.x, size.y);
    rayOrigin = vec4(hitPoint.xyz + (hitPoint.w / minSize) * lightVector, 1.0);
    rayDirection = vec4(lightVector, 1.0);
}
