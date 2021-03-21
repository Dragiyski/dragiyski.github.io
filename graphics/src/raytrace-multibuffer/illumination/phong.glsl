#version 300 es

#if GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

out vec4 phongColor;

uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform sampler2D texNormal;
uniform sampler2D texHitPoint;
uniform sampler2D texColor;
uniform sampler2D texMaterial;
uniform sampler2D texPhong;
uniform sampler2D texRayDirection;

void main() {
    vec2 texNormalSize = vec2(textureSize(texNormal, 0));
    vec2 texHitPointSize = vec2(textureSize(texNormal, 0));
    vec2 texColorSize = vec2(textureSize(texNormal, 0));
    vec2 texRayDirectionSize = vec2(textureSize(texRayDirection, 0));
    vec2 texMaterialSize = vec2(textureSize(texRayDirection, 0));
    vec2 texPhongSize = vec2(textureSize(texPhong, 0));

    vec3 normal = textureLod(texNormal, gl_FragCoord.xy / texNormalSize, 0.0).xyz;
    vec3 hitPoint = textureLod(texHitPoint, gl_FragCoord.xy / texHitPointSize, 0.0).xyz;
    vec4 materialColor = textureLod(texColor, gl_FragCoord.xy / texColorSize, 0.0);
    vec3 rayDirection = textureLod(texRayDirection, gl_FragCoord.xy / texRayDirectionSize, 0.0).xyz;
    vec4 material = textureLod(texMaterial, gl_FragCoord.xy / texMaterialSize, 0.0);
    vec4 phong = textureLod(texPhong, gl_FragCoord.xy / texPhongSize, 0.0);

    vec3 L = normalize(lightPosition - hitPoint);
    vec3 N = normalize(normal);
    vec3 R = reflect(-L, N);
    vec3 V = normalize(-rayDirection);
    float Id = max(0.0, dot(L, N)) * material.y;
    float Is = pow(max(0.0, dot(R, V)), material.w) * material.z;
    vec3 color = Id * materialColor.rgb * lightColor.rgb + Is * lightColor.rgb;
    phongColor = vec4(phong.xyz + color, phong.a);
}
