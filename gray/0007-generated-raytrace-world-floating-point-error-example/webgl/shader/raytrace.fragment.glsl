#version 300 es

precision highp float;
precision highp int;

/* Camera settings */
uniform vec3 world_screen_center;
uniform vec3 world_screen_right;
uniform vec3 world_screen_up;
uniform vec3 camera_position;
uniform uvec2 screen_size;

uniform sampler2D wall_color_texture;
uniform sampler2D wall_normal_texture;
uniform sampler2D crate_color_texture;
uniform sampler2D crate_normal_texture;

out vec4 color;
in vec2 position;

const float positive_infinity = uintBitsToFloat(0x7F800000u);
const float negative_infinity = uintBitsToFloat(0xFF800000u);
const float not_a_number = uintBitsToFloat(0x7fc00000u);

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct RaytraceState {
    int id;
    float depth;
    vec3 hit_point;
    vec3 normal;
    vec2 uv;
    vec3 color;
    vec3 tangent, cotangent;
};

const ivec2 box_side_select[3] = ivec2[3](
    ivec2(1, 2),
    ivec2(0, 2),
    ivec2(0, 1)
);

// vec3 read_vec3(int index) {
//     int data_index = index / 4;
//     int data_offset = index % 4;
//     int result_offset = 0;
//     vec3 result;
//     for (int i = data_offset; i < 4; ++i) {
//         result[result_offset++] = float_data[data_index][i];
//     }
//     for (int i = result_offset; i < 3; ++i) {
//         result[i] = float_data[data_index+1][i - result_offset];
//     }
//     return result;
// }

RaytraceState raytrace_quad(const RaytraceState state, const Ray ray, vec3 origin, vec3 direction1, vec3 direction2, int id) {
    vec3 normal = normalize(cross(direction1, direction2));
    float depth = (dot(normal, origin) - dot(normal, ray.origin)) / dot(normal, ray.direction);
    if (depth < 0.0 || depth > state.depth) {
        return state;
    }
    vec3 hit_point = ray.origin + depth * ray.direction;
    vec3 quad_vector = hit_point - origin;
    float x = dot(quad_vector, direction1) / dot(direction1, direction1);
    float y = dot(quad_vector, direction2) / dot(direction2, direction2);
    if (x < 0.0 || x > 1.0 || y < 0.0 || y > 1.0) {
        return state;
    }
    float nd = dot(normal, ray.direction);
    float ndf = -(nd / abs(nd));
    return RaytraceState(id, depth, hit_point, ndf * normal, vec2(x, y), vec3(1.0, 1.0, 1.0), normalize(direction1), normalize(direction2));
}

RaytraceState raytrace_box(RaytraceState state, const Ray ray, vec3 origin, vec3 direction1, vec3 direction2, vec3 direction3, int id) {
    state = raytrace_quad(state, ray, origin, direction1, direction2, id);
    state = raytrace_quad(state, ray, origin, direction1, direction3, id);
    state = raytrace_quad(state, ray, origin, direction2, direction3, id);
    state = raytrace_quad(state, ray, origin + direction1, direction2, direction3, id);
    state = raytrace_quad(state, ray, origin + direction2, direction1, direction3, id);
    state = raytrace_quad(state, ray, origin + direction3, direction1, direction2, id);
    return state;
}

float length2(vec3 value) {
    return dot(value, value);
}

RaytraceState raytrace_sphere(RaytraceState state, const Ray ray, vec3 origin, float radius, int id) {
    float b = 2.0 * (dot(ray.direction, ray.origin) - dot(ray.direction, origin));
    float c = length2(ray.origin - origin) - radius * radius;
    float D = b * b - 4.0 * c;
    if (D < 0.0) {
        return state;
    }
    float depth = (-b - sqrt(D)) * 0.5;
    if (depth < 0.0) {
        depth = (-b + sqrt(D)) * 0.5;
        if (depth < 0.0) {
            return state;
        }
    }
    if (depth > state.depth) {
        return state;
    }
    vec3 hit_point = ray.origin + depth * ray.direction;
    vec3 normal = normalize(hit_point - origin);
    return RaytraceState(
        id,
        depth,
        hit_point,
        normal,
        vec2(0.0, 0.0),
        vec3(1.0, 1.0, 1.0),
        vec3(0.0, 0.0, 0.0),
        vec3(0.0, 0.0, 0.0)
    );
}

RaytraceState raytrace_scene(RaytraceState state, Ray ray) {
    state = raytrace_quad(state, ray, vec3(-100.0, -100.0, 0.0), vec3(200.0, 0.0, 0.0), vec3(0.0, 200.0, 0.0), vec3(0.0, 0.0, 200.0), 1);
    state = raytrace_quad(state, ray, vec3(-3.0, 50.0, 0.0), vec3(6.0, 0.0, 0.0), vec3(0.0, 5.0, 0.0), vec3(0.0, 0.0, 8.0), 2);
    state = raytrace_quad(state, ray, vec3(-35.0, 55.0, 0.0), vec3(10.0, 0.0, 0.0), vec3(0.0, 10.0, 0.0), vec3(0.0, 0.0, 10.0), 2);
    state = raytrace_quad(state, ray, vec3(-25.0, -55.0, 0.0), vec3(10.0, 0.0, 0.0), vec3(0.0, 10.0, 0.0), vec3(0.0, 0.0, 10.0), 2);
    state = raytrace_sphere(state, ray, vec3(45.0, 30.0, 10.0), 10.0, 3);
    if (state.id == 1) {
        state.color = texture(wall_color_texture, state.uv * 10.0).rgb;
        vec3 tex_normal = texture(wall_normal_texture, state.uv * 10.0).rgb * 2.0 - 1.0;
        tex_normal.xy *= 0.4;
        tex_normal = normalize(tex_normal);
        state.normal = mat3(state.tangent, state.cotangent, state.normal) * tex_normal;
    } else if(state.id == 2) {
        state.color = texture(crate_color_texture, state.uv).rgb;
        vec3 tex_normal = texture(crate_normal_texture, state.uv).rgb * 2.0 - 1.0;
        state.normal = mat3(state.tangent, state.cotangent, state.normal) * tex_normal;
    }
    return state;
}

float saturate(float value) {
    return max(0.0, min(1.0, value));
}

uniform uint antialias;
const vec3 light_position = vec3(-80.0, -80.0, 120.0);
const float ambient_factor = 0.2;
const float diffuse_factor = 0.8;

void main() {
    uint samples = antialias * antialias;
    float sampleWeight = 1.0 / float(samples);
    bool has_sample = false;
    color = vec4(0.0, 0.0, 0.0, 0.0);
    vec2 pixel_size = vec2(1.0, 1.0) / vec2(screen_size);
    for (uint aax = 0u; aax < antialias; ++aax) {
        for (uint aay = 0u; aay < antialias; ++aay) {
            vec2 rel_position = position + vec2(float(aax) / float(antialias), float(aay) / float(antialias)) * pixel_size;
            vec2 pixel_position = rel_position * 2.0 - 1.0;
            vec3 world_screen_point = world_screen_center + pixel_position.x * world_screen_right + pixel_position.y * world_screen_up;
            vec3 ray_direction = normalize(world_screen_point - camera_position);
            RaytraceState screen_state = RaytraceState(-1, positive_infinity, vec3(not_a_number, not_a_number, not_a_number), vec3(0.0, 0.0, 0.0), vec2(not_a_number, not_a_number), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0));
            Ray screen_ray = Ray(
                camera_position,
                ray_direction
            );
            screen_state = raytrace_scene(screen_state, screen_ray);
            if (!isinf(screen_state.depth)) {
                if (screen_state.id == 3) {
                    screen_state.color = vec3(0.0, 0.5, 0.0);
                    RaytraceState reflect_state = RaytraceState(-1, positive_infinity, vec3(not_a_number, not_a_number, not_a_number), vec3(0.0, 0.0, 0.0), vec2(not_a_number, not_a_number), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0));
                    vec3 reflect_direction = normalize(reflect(screen_ray.direction, screen_state.normal));
                    Ray reflect_ray = Ray(
                        screen_state.hit_point + 0.001 * reflect_direction,
                        reflect_direction
                    );
                    reflect_state = raytrace_scene(reflect_state, reflect_ray);
                    if (!isinf(reflect_state.depth)) {
                        vec3 reflect_color = 0.5 * screen_state.color + 0.5 * reflect_state.color;
                        vec3 segment_color = ambient_factor * reflect_color;
                        vec3 reflect_light_vector = light_position - reflect_state.hit_point;
                        float reflect_limit_limit = length(reflect_light_vector);
                        Ray reflect_light_ray = Ray(
                            reflect_state.hit_point + 0.001 * reflect_light_vector,
                            normalize(reflect_light_vector)
                        );
                        RaytraceState light_raytrace = RaytraceState(-1, positive_infinity, vec3(not_a_number, not_a_number, not_a_number), vec3(0.0, 0.0, 0.0), vec2(not_a_number, not_a_number), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0));
                        light_raytrace = raytrace_scene(light_raytrace, reflect_light_ray);
                        if (light_raytrace.depth > reflect_limit_limit) {
                            float intesity = saturate(dot(reflect_state.normal, reflect_light_ray.direction));
                            segment_color += diffuse_factor * intesity * reflect_color;
                        }
                        screen_state.color = segment_color;
                    }
                }
                vec3 segment_color = ambient_factor * screen_state.color;
                vec3 light_vector = light_position - screen_state.hit_point;
                float light_limit = length(light_vector);
                Ray light_ray = Ray(
                    screen_state.hit_point + 0.001 * light_vector,
                    normalize(light_vector)
                );
                RaytraceState light_raytrace = RaytraceState(-1, positive_infinity, vec3(not_a_number, not_a_number, not_a_number), vec3(0.0, 0.0, 0.0), vec2(not_a_number, not_a_number), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0));
                light_raytrace = raytrace_scene(light_raytrace, light_ray);
                if (light_raytrace.depth > light_limit) {
                    float intesity = saturate(dot(screen_state.normal, light_ray.direction));
                    if (screen_state.id == 3) {
                        segment_color += 0.5 * intesity * screen_state.color;
                        float specular_intensity = pow(saturate(dot(screen_state.normal, normalize(light_ray.direction - screen_ray.direction))), 45.0);
                        segment_color += 0.6 * specular_intensity * vec3(1.0, 1.0, 1.0);
                    } else {
                        segment_color += diffuse_factor * intesity * screen_state.color;
                    }
                }
                color += sampleWeight * vec4(segment_color, 1.0);
                has_sample = true;
            }
        }
    }
    if (!has_sample) {
        discard;
    }
    // vec2 pixel_position = position * 2.0 - 1.0;
    // vec3 world_screen_point = world_screen_center + pixel_position.x * world_screen_right + pixel_position.y * world_screen_up;
    // vec3 ray_direction = normalize(world_screen_point - camera_position);
    // screen_ray = Ray(
    //     camera_position,
    //     ray_direction
    // );
    // color = vec4(screen_ray.direction, 1.0);
    // raytrace_quad(vec3(-3.0, 50.0, -4.0), vec3(6.0, 0.0, 0.0), vec3(0.0, 5.0, 0.0), vec3(0.0, 0.0, 8.0));
    // if (isinf(screen_state.depth)) {
    //     discard;
    //     return;
    // }
    // color = vec4(screen_state.normal * 0.5 + 0.5, 1.0);
}