#version 300 es

precision highp float;
precision highp int;

const float positive_infinity = uintBitsToFloat(0x7F800000u);
const float negative_infinity = uintBitsToFloat(0xFF800000u);
const float not_a_number = uintBitsToFloat(0x7fc00000u);

layout(location=0) in vec3 position_in;

out vec3 position;

uniform vec3 camera_origin;
uniform vec3 screen_normal;
uniform vec3 screen_origin;
uniform vec3 screen_right;
uniform vec3 screen_up;
uniform float dot_screen_normal_screen_origin;
uniform float dot_screen_normal_camera_origin;
uniform float screen_right_2;
uniform float screen_up_2;

void main() {
    vec3 ray_vector = position_in - camera_origin;
    float ray_depth = length(ray_vector);
    vec3 ray_direction = ray_vector / ray_depth;
    float dot_screen_normal_ray_direction = dot(screen_normal, ray_direction);
    float abs_dot_screen_normal_ray_direction = abs(dot_screen_normal_ray_direction);
    float screen_depth = (dot_screen_normal_screen_origin - dot_screen_normal_camera_origin) / abs_dot_screen_normal_ray_direction;
    vec3 screen_point = camera_origin + screen_depth * ray_direction;
    vec3 screen_direction = screen_point - screen_origin;
    float screen_x = dot(screen_direction, screen_right) / screen_right_2;
    float screen_y = dot(screen_direction, screen_up) / screen_up_2;
    float screen_factor = dot_screen_normal_ray_direction / abs_dot_screen_normal_ray_direction;
    float screen_z = screen_factor * ray_depth;
    position = position_in;
    gl_Position = vec4(screen_x, screen_y, 0.0, 1.0);
}
