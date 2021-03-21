#version 300 es

#if GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

layout (location = 0) out vec4 fragmentColor;
layout (location = 1) out vec4 fragmentNormal;
layout (location = 2) out vec4 fragmentHitPoint;
layout (location = 3) out vec4 fragmentMaterial;
layout (location = 4) out vec4 fragmentPhong;

uniform vec3 rayOrigin;
uniform sampler2D rayDirectionArray;
uniform vec3 spherePosition;
uniform float sphereRadius;
uniform vec4 sphereColor;
uniform vec4 sphereMaterial;

void main() {
    vec2 rayDirectionSize = vec2(textureSize(rayDirectionArray, 0));
    vec3 rayDirection = textureLod(rayDirectionArray, gl_FragCoord.xy / rayDirectionSize, 0.0).xyz;
    float a = dot(rayDirection, rayDirection);
    float b = 2.0 * (dot(rayDirection, rayOrigin) - dot(rayDirection, spherePosition));
    vec3 sphereVector = rayOrigin - spherePosition;
    float c = dot(sphereVector, sphereVector) - sphereRadius * sphereRadius;
    float D = b * b - 4.0 * a * c;
    if (D < 0.0) {
        discard;
    }
    float x = (-b - sqrt(D)) / (2.0 * a);
    if (x < 0.0) {
        x = (-b + sqrt(D)) / (2.0 * a);
        if (x < 0.0) {
            discard;
        }
    }
    vec3 hitPoint = rayOrigin + x * rayDirection;
    vec3 normal = normalize(hitPoint - spherePosition);
    gl_FragDepth = x;
    fragmentColor = sphereColor;
    fragmentNormal = vec4(normal, 1.0);
    fragmentHitPoint = vec4(hitPoint, 1.0);
    fragmentMaterial = sphereMaterial;
    fragmentPhong = vec4(sphereMaterial.x * sphereColor.xyz, sphereColor.w);
}
