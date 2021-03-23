#version 300 es

#if GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

layout (location = 0) out vec4 fragmentColor;
layout (location = 1) out vec4 fragmentNormal;
layout (location = 2) out vec4 fragmentHit;
layout (location = 3) out vec4 fragmentMaterial;
layout (location = 4) out vec4 fragmentViewVector;

uniform sampler2D rayOriginImage;
uniform sampler2D rayDirectionImage;
uniform vec3 spherePosition;
uniform float sphereRadius;
uniform vec4 sphereColor;
uniform vec4 sphereMaterial;

void main() {
    // Get the ray direction for this pixel.
    vec2 size = vec2(textureSize(rayDirectionImage, 0));
    vec3 rayOrigin = textureLod(rayOriginImage, gl_FragCoord.xy / size, 0.0).xyz;
    vec3 rayDirection = textureLod(rayDirectionImage, gl_FragCoord.xy / size, 0.0).xyz;

    vec3 s = rayOrigin - spherePosition;
    float a = dot(rayDirection, rayDirection);
    float b = 2.0 * dot(rayDirection, s);
    float c = dot(s, s) - sphereRadius * sphereRadius;
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
    float pi = acos(-1.0);
    gl_FragDepth = atan(x) / acos(-1.0) * 2.0;
    fragmentHit = vec4(rayOrigin + x * rayDirection, x);
    fragmentNormal = vec4(normalize(fragmentHit.xyz - spherePosition), 1.0);
    fragmentColor = sphereColor;
    fragmentMaterial = sphereMaterial;
    fragmentViewVector = vec4(-rayDirection, 1.0);
}
