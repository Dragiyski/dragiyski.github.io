#version 300 es

#if GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

out vec4 fragmentColor;

uniform sampler2D inputTexture;

void main() {
    vec2 texSize = vec2(textureSize(inputTexture, 0));
    fragmentColor = textureLod(inputTexture, gl_FragCoord.xy / texSize, 0.0);
}
