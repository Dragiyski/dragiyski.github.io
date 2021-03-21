#version 300 es

#if GL_ES
precision highp float;
precision highp int;
precision highp sampler2DArray;
#endif

out vec4 fragmentColor;

uniform sampler2D inputTexture;

void main() {
    vec2 texSize = vec2(textureSize(inputTexture, 0));
    vec2 texCoord = gl_FragCoord.xy / texSize;
    vec4 c1 = textureLod(inputTexture, texCoord, 0.0);
    fragmentColor = c1;
}
