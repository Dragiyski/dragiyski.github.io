#version 300 es

#if GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

out vec4 fragmentColor;

uniform sampler2D inputTexture;

void main() {
    vec4 c1 = texelFetch(inputTexture, ivec2(round(gl_FragCoord.xy)), 0);
    if (isinf(c1.w)) {
        discard;
    }
    fragmentColor = vec4(c1.xyz * 0.5 + 0.5, 1.0);
}
