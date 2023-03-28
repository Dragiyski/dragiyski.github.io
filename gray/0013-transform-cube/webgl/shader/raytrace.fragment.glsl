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
const float epsilon = 1.1920928955078125e-7;
const ivec2 quad_indices[3] = ivec2[3](
    ivec2(1, 2),
    ivec2(0, 2),
    ivec2(0, 1)
);

// const vec3 skylight = normalize(vec3(-1.0, -2.0, 3.0));
const vec3 skylight = normalize(vec3(-0.4297816742523425, 0.24052419514936438, 0.8703078903609939));
const vec4 material = vec4(0.2, 0.7, 0.4, 3.0);
const vec3 light_color = vec3(1.0);

in vec2 position;
out vec4 color_out;

struct Ray {
    vec3 origin;
    vec3 direction;
};

uniform vec3 perspective_origin;
uniform vec3 perspective_center;
uniform vec3 perspective_right;
uniform vec3 perspective_up;

uniform mat4 model_transform;
uniform mat4 inverse_model_transform;

uniform sampler2D color_texture;
uniform sampler2D normal_texture;

const vec3 sphere_origin = vec3(0.0, 0.0, 0.0);
const float sphere_radius = 1.0;

vec3 reduce(vec4 value) {
    return value.xyz / value.w;
}

vec2 reduce(vec3 value) {
    return value.xy / value.z;
}

void main() {
    // Step 1: Prepare for screen raytracing:
    vec3 perspective_pixel = perspective_center + position.x * perspective_right + position.y * perspective_up;
    vec3 model_perspective_origin = reduce(inverse_model_transform * vec4(perspective_origin, 1.0));
    vec3 model_perspective_direction = normalize(vec3(inverse_model_transform * vec4(perspective_pixel - perspective_origin, 0.0)));
    vec3 model_skylight = normalize(vec3(inverse_model_transform * vec4(skylight, 0.0)));

    Ray ray = Ray(
        model_perspective_origin,
        model_perspective_direction
    );

    /*
    Cube will be with coordinates (±1, ±1, ±1) = 8 points in 6 quads.
    A quad intersection with origin O and normal N will have plane equation: dot(O, N) = free_coeff
    A quad with a ray with origin C and direction D will be dot(N, C + t * D) = free_coeff
    Then: t = (dot(N, O) - dot(N, C)) / dot(N, D)
    If a normal N = (1, 0, 0), dot(N, O) = O.x which will be either -1 or +1
    dot(N, C) = C.x
    dot(N, D) = D.x
    Thus all 3 t values can be computed at once for ((+1, +1, +1) - C) / D
    */

    float depth = positive_infinity;
    vec3 hit_point;
    vec3 normal;
    vec2 tex_coord;
    vec3 tangent;
    vec3 cotangent;
    for(int i = -1; i <= +1; i += 2) {
        vec3 rt = (vec3(float(i)) - ray.origin) / ray.direction;
        for (int d = 0; d < 3; ++d) {
            float t = rt[d];
            if (t > 0.0 && t < depth) {
                vec3 hp = ray.origin + t * ray.direction;
                if (hp[quad_indices[d][0]] >= -1.0 && hp[quad_indices[d][0]] <= +1.0 && hp[quad_indices[d][1]] >= -1.0 && hp[quad_indices[d][1]] <= +1.0) {
                    depth = t;
                    hit_point = hp;
                    normal = vec3(0.0);
                    normal[d] = float(i);
                    tex_coord = vec2(hp[quad_indices[d][0]], hp[quad_indices[d][1]]) * 0.5 + 0.5;
                    tangent = vec3(0.0);
                    tangent[quad_indices[d][0]] = 1.0;
                    cotangent = vec3(0.0);
                    cotangent[quad_indices[d][1]] = 1.0;
                }
            }
        }
    }

    if (isinf(depth)) {
        discard;
    }

    mat3 normal_transform = mat3(tangent, cotangent, normal);
    vec3 tex_normal = texture(normal_texture, tex_coord).xyz;
    vec3 modified_normal = normalize(normal_transform * tex_normal);

    vec3 material_color = texture(color_texture, tex_coord).rgb;
    vec3 ambient_color = material.x * material_color;
    vec3 diffuse_color = material.y * max(0.0, dot(modified_normal, model_skylight)) * material_color * light_color;
    
    vec3 reflect_skylight = reflect(-model_skylight, modified_normal);
    vec3 specular_color = material.z * pow(max(0.0, dot(reflect_skylight, -ray.direction)), material.w) * light_color;

    vec3 color = ambient_color + diffuse_color + specular_color;
    
    color_out = vec4(color, 1.0);
}
