#version 300 es

precision highp float;
precision highp int;

in vec2 position;
layout(location=0) out vec4 normal_depth;
layout(location=1) out vec4 hit_point;
layout(location=2) out uint id;

struct Object {
    uint id;
};

struct Texture {
    uint type;
    uint id;
    float points[4];
};

struct Quad {
    Object object;
    vec3 origin;
    vec3 direction[2];
    Texture textures[3];
};

uniform Quad box[6];

void main() {
    normal_depth = vec4(box[3].textures[2].points[1], 0.0, 1.0, 1.0);
    hit_point = vec4(1.1, 1.2, 1.3, 1.4);
    id = 13u;
    gl_FragDepth = 0.0;
}