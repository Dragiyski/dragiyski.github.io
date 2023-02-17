#version 300 es

precision highp float;
precision highp int;

in vec3 position;
in vec3 normal;
out vec4 color;

uniform vec3 camera_origin;
uniform vec3 camera_direction;
uniform vec3 screen_center;
uniform vec3 screen_right;
uniform vec3 screen_up;
uniform float dot_camera_direction_screen_center;
uniform float dot_camera_direction_camera_origin;
uniform float screen_right_square;
uniform float screen_up_square;

void main() {
    vec3 ray = position - camera_origin;
    float ray_depth = length(ray);
    gl_FragDepth = 1.0 / ray_depth;
    vec3 ray_direction = ray / ray_depth;
    float screen_depth = (dot_camera_direction_screen_center - dot_camera_direction_camera_origin) / dot(camera_direction, ray_direction);
    if (screen_depth < 0.0) {
        discard;
        return;
    }
    color = vec4(normal * 0.5 + 0.5, 1.0);
}
