#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;
precision highp isampler2D;

const float positive_infinity = uintBitsToFloat(0x7F800000u);
const float negative_infinity = uintBitsToFloat(0xFF800000u);
const float not_a_number = uintBitsToFloat(0x7fc00000u);

#define TYPE_NULL (0)
#define TYPE_DRAWABLE_SPHERE (1)

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct ColorRaytraceState {
    vec3 normal;
    float depth;
    vec4 color;
    int id;
};

uniform vec3 camera_origin;
uniform vec3 screen_origin;
uniform vec3 screen_right;
uniform vec3 screen_up;

uniform sampler2D data_float;
uniform isampler2D data_uint;
uniform isampler2D data_object;
uniform isampler2D data_children;

in vec2 position;
out vec4 color_out;

ColorRaytraceState raytraceDrawableSphere(ColorRaytraceState state, Ray ray, int index, ivec4 object_data) {
    vec4 float_data_1 = texelFetch(data_float, ivec2(object_data.z, 0), 0);
    vec3 sphere_center = float_data_1.xyz;
    float radius = float_data_1.w;
    
    float b = 2.0 * (dot(ray.direction, ray.origin) - dot(ray.direction, sphere_center));
    vec3 sphere_vector = ray.origin - sphere_center;
    float c = dot(sphere_vector, sphere_vector) - radius * radius;

    float D = b * b - 4.0 * c;
    if (D < 0.0) {
        return state;
    }

    float depth = (-b - sqrt(D)) * 0.5;
    if (depth < 0.0 || depth > state.depth) {
        depth = (-b + sqrt(D)) * 0.5;
        if (depth < 0.0 || depth > state.depth) {
            return state;
        }
    }

    vec3 hit_point = ray.origin + depth * ray.direction;
    vec3 normal = normalize(hit_point - sphere_center);
    float dot_normal_view = dot(normal, -ray.direction);
    dot_normal_view = dot_normal_view / abs(dot_normal_view);
    normal = dot_normal_view * normal;
    vec4 color = texelFetch(data_float, ivec2(object_data.z + 1, 0), 0);
    return ColorRaytraceState(
        normal,
        depth,
        color,
        index
    );
}

void main() {
    // Step 1: Prepare for screen raytracing:
    vec3 screen_point = screen_origin + position.x * screen_right + position.y * screen_up;
    Ray screen_ray = Ray(camera_origin, normalize(screen_point - camera_origin));
    ColorRaytraceState screen_state = ColorRaytraceState(
        vec3(0.0, 0.0, 0.0),
        positive_infinity,
        vec4(0.0, 0.0, 0.0, 0.0),
        0
    );

    int object_size = textureSize(data_object, 0).x;

    for (int i = 1; i < object_size; ++i) {
        ivec4 object_data = texelFetch(data_object, ivec2(i, 0), 0);
        if (object_data.x == TYPE_DRAWABLE_SPHERE) {
            screen_state = raytraceDrawableSphere(screen_state, screen_ray, i, object_data);
        }
    }

    color_out = screen_state.color;
}
