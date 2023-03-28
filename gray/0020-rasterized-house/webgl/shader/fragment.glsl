#version 300 es

precision highp float;
precision highp int;

in vec3 interp_normal;

out vec4 output_color;

uniform vec3 skylight;
const float ambient_intensity = 0.1;

void main() {
    vec3 N = normalize(interp_normal);
    float diffuse_intensity = max(0.0, dot(N, skylight));
    output_color = vec4(vec3(ambient_intensity + diffuse_intensity), 1.0);
}
