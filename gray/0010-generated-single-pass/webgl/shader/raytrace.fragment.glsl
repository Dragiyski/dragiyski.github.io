#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;
precision highp isampler2D;
precision highp sampler2DArray;

const float positive_infinity = uintBitsToFloat(0x7F800000u);
const float negative_infinity = uintBitsToFloat(0xFF800000u);
const float not_a_number = uintBitsToFloat(0x7fc00000u);
const float pi = acos(-1.0);

#define TYPE_NULL (0)
#define TYPE_DRAWABLE_SPHERE (1)

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct ColorRaytraceState {
    vec3 normal;
    float depth;
    vec3 hit_point;
    vec4 color;
    int id;
};

uniform vec3 camera_origin;
uniform vec3 screen_origin;
uniform vec3 screen_right;
uniform vec3 screen_up;

uniform sampler2D data_float;
uniform isampler2D data_int;
uniform isampler2D data_object;
uniform isampler2D data_children;

uniform sampler2DArray texture_1024;

in vec2 position;
out vec4 color_out;

ColorRaytraceState raytraceDrawableSphere(ColorRaytraceState state, Ray ray, int index, ivec4 object_data) {
    vec4 float_data_1 = texelFetch(data_float, ivec2(object_data.z, 0), 0);
    vec3 sphere_center = float_data_1.xyz;
    float radius = float_data_1.w;
    
    // Raytrace:
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

    // Compute the normal
    vec3 hit_point = ray.origin + depth * ray.direction;
    vec3 normal = normalize(hit_point - sphere_center);
    float dot_normal_view = dot(normal, -ray.direction);
    dot_normal_view = dot_normal_view / abs(dot_normal_view);
    vec3 view_normal = dot_normal_view * normal;

    vec4 color;
    int float_offset = 1;

    if ((object_data.y & 1) != 0) {
        vec3 longitude = texelFetch(data_float, ivec2(object_data.z + float_offset + 0, 0), 0).xyz;
        vec3 latitude = texelFetch(data_float, ivec2(object_data.z + float_offset + 1, 0), 0).xyz;
        int color_texture_id = texelFetch(data_int, ivec2(object_data.w, 0), 0).x;

        vec3 equator_vector = normal - dot(normal, latitude) * latitude;
        vec3 colongitude = cross(latitude, longitude);

        // u = atan(sin(T), cos(T)) / pi * 0.5 + 0.5; Where T is the angle in the counter-clockwise direction
        // Note: length(cross()) does not work here as length is positive: length(cross(A, B)) = |A|*|B|*sin(T) but T in [0, pi] = smaller of the two angles;
        // To resolve that we need perpendicular vector: colongitude (forming 3D system: latitude, longitude, colongitude)
        // Then sin(X) = cos(PI/2 + x) = cos(colongitude)
        // Note: This is not entirely correct... 0.5 = longitude vector
        float u = atan(dot(normal, -colongitude), dot(normal, -longitude)) / pi * 0.5 + 0.5;
        float v = asin(dot(normal, -latitude)) / pi + 0.5;
        color = texture(texture_1024, vec3(u, v, float(color_texture_id)));
    } else {
        color = texelFetch(data_float, ivec2(object_data.z + 1, 0), 0);
    }

    return ColorRaytraceState(
        view_normal,
        depth,
        hit_point,
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
        vec3(not_a_number, not_a_number, not_a_number),
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
