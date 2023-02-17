#version 300 es

precision highp float;
precision highp int;

layout(location=0) in vec3 position;

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
    vec3 ray_direction = ray / ray_depth;
    float screen_depth = (dot_camera_direction_screen_center - dot_camera_direction_camera_origin) / dot(camera_direction, ray_direction);
    vec3 screen_point = camera_origin + screen_depth * ray_direction;
    vec3 screen_direction = screen_point - screen_center;
    float screen_x = dot(screen_direction, screen_right) / screen_right_square;
    float screen_y = dot(screen_direction, screen_up) / screen_up_square;
    gl_Position = vec4(screen_x, screen_y, (1.0 - 1.0 / (1.0 + ray_depth)) * 2.0 - 1.0, 1.0);
}
