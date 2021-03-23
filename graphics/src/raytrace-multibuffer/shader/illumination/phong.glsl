#version 300 es

#if GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

out vec4 phongColor;

uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform sampler2D texColor;
uniform sampler2D texNormal;
uniform sampler2D texHitPoint;
uniform sampler2D texMaterial;
uniform sampler2D texViewVector;

void main() {
    vec2 size = vec2(textureSize(texColor, 0));

    vec3 normal = textureLod(texNormal, gl_FragCoord.xy / size, 0.0).xyz;
    vec3 hitPoint = textureLod(texHitPoint, gl_FragCoord.xy / size, 0.0).xyz;
    vec3 materialColor = textureLod(texColor, gl_FragCoord.xy / size, 0.0).rgb;
    vec3 viewVector = textureLod(texViewVector, gl_FragCoord.xy / size, 0.0).xyz;
    vec4 material = textureLod(texMaterial, gl_FragCoord.xy / size, 0.0);

    vec3 L = normalize(lightPosition - hitPoint);
    vec3 N = normalize(normal);
    vec3 R = reflect(-L, N);
    vec3 V = normalize(viewVector);
    float Id = max(0.0, dot(L, N)) * material.y;
    float Is = pow(max(0.0, dot(R, V)), material.w) * material.z;
    vec3 color = Id * materialColor.rgb * lightColor.rgb + Is * lightColor.rgb;
    phongColor = vec4(color, 1.0);
}
