#version 300 es

#if GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

out vec4 fragmentColor;

uniform sampler2D materialImage;
uniform sampler2D colorImage;

void main() {
    vec2 size = vec2(textureSize(colorImage, 0));
    vec4 color = textureLod(colorImage, gl_FragCoord.xy / size, 0.0);
    float material = textureLod(materialImage, gl_FragCoord.xy / size, 0.0).x;
    fragmentColor = vec4(material * color.xyz, color.w);
}
