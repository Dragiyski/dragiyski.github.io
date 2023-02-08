#version 300 es

precision highp float;
precision highp int;

uniform vec3 world_screen_center; // Point
uniform vec3 world_screen_right; // Vector (length = screen_width / 2)
uniform vec3 world_screen_up; // Vector (length = screen_height / 2)
uniform vec3 camera_position;

uniform sampler2D ray_direction_texture;
uniform sampler2D sphere_data;
uniform sampler2D light_data;

out vec4 color;
in vec2 position;

struct RaytraceResult {
    bool hit;
    float depth;
    vec3 normal;
    vec3 hit_point;
    int object_id;
};

struct Ray {
    vec3 origin;
    vec3 direction;
    float limit;
};

struct Sphere {
    vec3 origin;
    float radius;
    int object_id;
};

float zero = +0.0;

const RaytraceResult miss = RaytraceResult(false, uintBitsToFloat(0x7F800000u), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), -1);


float length2(vec3 value) {
    return value.x * value.x + value.y * value.y + value.z * value.z;
}

RaytraceResult raytraceSphere(Sphere sphere, Ray ray, RaytraceResult previous) {
    float a = length2(ray.direction);
    float b = 2.0 * (dot(ray.direction, ray.origin) - dot(ray.direction, sphere.origin));
    float c = length2(ray.origin - sphere.origin) - sphere.radius * sphere.radius;
    float D = b * b - 4.0 * a * c;
    if (D < 0.0) {
        return miss;
    }
    float x = (-b - sqrt(D)) * (0.5 * a);
    if (x < 0.0 || x >= ray.limit) {
        x = (-b + sqrt(D)) * (0.5 * a);
        if (x < 0.0 || x >= ray.limit) {
            return miss;
        }
    }
    if (previous.hit) {
        if (x >= previous.depth) {
            return miss;
        }
    }
    RaytraceResult result;
    result.hit = true;
    result.depth = x;
    result.hit_point = ray.origin + x * ray.direction;
    result.normal = normalize(result.hit_point - sphere.origin);
    if (dot(result.normal, ray.direction) >= 0.0) {
        result.normal = -result.normal;
    }
    result.object_id = sphere.object_id;
    return result;
}

void main() {
    vec2 screen_coords = (position - 0.5) * 2.0;
    vec3 screen_point = world_screen_center + screen_coords.x * world_screen_right + screen_coords.y * world_screen_up;
    vec3 screen_color = vec3(0.0, 0.5, 0.0);
    RaytraceResult screen_state = miss;
    Ray screen_ray = Ray(camera_position, normalize(screen_point - camera_position), uintBitsToFloat(0x7F800000u));

    int sphere_count = textureSize(sphere_data, 0).x / 2;
    for (int i = 0; i < sphere_count; i ++) {
        vec4 data = texelFetch(sphere_data, ivec2(i * 2, 0), 0);
        Sphere sphere = Sphere(data.xyz, data.w, i);
        RaytraceResult state = raytraceSphere(sphere, screen_ray, screen_state);
        if (state.hit) {
            screen_state = state;
            screen_color = texelFetch(sphere_data, ivec2(i * 2 + 1, 0), 0).xyz;
        }
    }
    if (!screen_state.hit) {
        discard;
        return;
    }

    vec3 n = screen_state.normal;
    vec3 pixel_color = vec3(0.0, 0.0, 0.0);
    vec3 light_color = vec3(1.0, 1.0, 1.0);

    int light_count = textureSize(light_data, 0).x;
    for (int l = 0; l < light_count; ++l) {
        vec3 light_position = texelFetch(light_data, ivec2(l, 0), 0).xyz;
        vec3 light_vector_full = light_position - screen_state.hit_point;
        vec3 light_vector = normalize(light_vector_full);
        float light_distance = length(light_vector_full);
        vec3 sphere_color = vec3(1.0, 0.0, 0.0);

        Ray light_ray = Ray(screen_state.hit_point + 0.0001 * light_distance * light_vector, light_vector, light_distance);
        RaytraceResult light_state = miss;
        for (int i = 0; i < sphere_count; ++i) {
            if (screen_state.object_id == i) {
                continue;
            }
            vec4 data = texelFetch(sphere_data, ivec2(i * 2, 0), 0);
            Sphere sphere = Sphere(data.xyz, data.w, i);
            RaytraceResult state = raytraceSphere(sphere, light_ray, light_state);
            if (state.hit) {
                light_state = state;
            }
        }
        if (!light_state.hit) {
            float NL = dot(screen_state.normal, light_ray.direction);
            float intesity = max(0.0, min(1.0, NL));
            pixel_color += intesity * light_color * screen_color;
        }
    }

    color = vec4(pixel_color, 1.0);
}