#version 300 es

precision highp float;
precision highp int;

uniform vec3 camera_origin;
uniform vec3 screen_center;
uniform vec3 screen_right;
uniform vec3 screen_up;

in vec2 position;
out vec4 ray_direction;

void main() {
    vec3 screen_point = screen_center + position.x * screen_right + position.y * screen_up;
    ray_direction = vec4(normalize(screen_point - camera_origin), 1.0);
}
