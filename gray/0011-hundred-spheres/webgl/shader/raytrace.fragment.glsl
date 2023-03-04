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

uniform vec3 perspective_origin;
uniform vec3 perspective_center;
uniform vec3 perspective_right;
uniform vec3 perspective_up;

uniform sampler2D instruction_float;
uniform isampler2D instruction_int;
uniform isampler2D instruction_object;
uniform isampler2D instruction_tree;

uniform ivec2 size_instruction_float;
uniform ivec2 size_instruction_int;
uniform ivec2 size_instruction_object;
uniform ivec2 size_instruction_tree;

uniform sampler2DArray image_6;
uniform sampler2DArray image_7;
uniform sampler2DArray image_8;
uniform sampler2DArray image_9;
uniform sampler2DArray image_10;
uniform sampler2DArray image_11;
uniform sampler2DArray image_12;
uniform sampler2DArray image_13;
uniform sampler2DArray image_14;
uniform sampler2DArray image_15;
uniform sampler2DArray image_16;

uniform int start_instruction_object;
uniform int start_instruction_light;

struct TraceState {
    vec3 hit_point;
    float depth;
    vec3 normal;
    int id;
    int primitive_id;
};

struct RaytraceState {
    TraceState trace;
    vec2 texture_coordinates;
    vec3 tangent;
    vec3 cotangent;
    vec4 object_color;
    vec4 material;
    vec3 view;
};

in vec2 position;
out vec4 color_out;

ivec4 getObjectData(int index) {
    ivec2 coords = ivec2(index % size_instruction_object.x, index / size_instruction_object.x);
    return texelFetch(instruction_object, coords, 0);
}

vec4 getFloatData(int index) {
    ivec2 coords = ivec2(index % size_instruction_float.x, index / size_instruction_float.x);
    return texelFetch(instruction_float, coords, 0);
}

ivec4 getIntData(int index) {
    ivec2 coords = ivec2(index % size_instruction_int.x, index / size_instruction_int.x);
    return texelFetch(instruction_int, coords, 0);
}

bool raytracing_sphere(inout float depth_out, const in Ray ray, vec3 sphere_origin, float sphere_radius) {
    vec3 sphere_vector = ray.origin - sphere_origin;
    float b = 2.0 * (dot(ray.direction, ray.origin) - dot(ray.direction, sphere_origin));
    float c = dot(sphere_vector, sphere_vector) - sphere_radius * sphere_radius;

    float D = b * b - 4.0 * c;
    if (D < 0.0) {
        return false;
    }

    float depth = (-b - sqrt(D)) * 0.5;
    if (depth < 0.0 || depth > depth_out) {
        depth = (-b + sqrt(D)) * 0.5;
        if (depth < 0.0 || depth > depth_out) {
            return false;
        }
    }

    depth_out = depth;
    return true;
}

/* ColorRaytraceState raytraceDrawableSphere(ColorRaytraceState state, Ray ray, int index, ivec4 object_data) {
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
} */

/* bool light_trace(inout TraceState light_state, const in Ray light_ray) {
    for (int id = start_instruction_object;; ++id) {
        ivec4 instruction = getObjectData(id);
        int float_offset = instruction[2];
        int int_offset = instruction[3];
        uint flags = uint(instruction[1]);
        if (instruction[0] == 0) {
            break;
        }
        if ((flags & 1u) == 0u) {
            continue;
        }
        switch (instruction[0]) {
            case 1: // Sphere
            {
                vec3 sphere_origin;
                float sphere_radius;
                {
                    vec4 data = getFloatData(float_offset++);
                    sphere_origin = data.xyz;
                    sphere_radius = data.w;
                }
                if (raytracing_sphere(state.trace.depth, ray, sphere_origin, sphere_radius)) {
                    return true;
                }
            }
            break;
        }
    }
    return false;
}

void illumination(inout RaytraceState state) {
    vec3 color = state.material.x * state.object_color;

    for (int light_id = start_instruction_light;; ++light_id) {
        ivec4 instruction = getObjectData(id);
        int float_offset = instruction[2];
        int int_offset = instruction[3];
        uint flags = uint(instruction[1]);
        if (instruction[0] == 0) {
            break;
        }
        if ((flags & 1u) == 0u) {
            continue;
        }
        vec3 light_position = getFloatData(float_offset++).xyz;
        vec3 light_color = getFloatData(float_offset++).xyz;
        vec3 light_vector = light_position - state.trace.hit_point;
        TraceState light_state;
        light_state.depth = length(light_vector);
        Ray light_ray;
        light_ray.origin = state.trace.hit_point;
        light_ray.direction = normalize(light_vector);
        if (!light_trace(light_state, light_ray)) {
            vec3 N = state.trace.normal;
            vec3 V = state.view;
            if (dot(N, V) < 0.0) {
                N = -N;
            }
            vec3 L = light_ray.direction;
            vec3 R = reflect(-L, N);

            color += state.material.y * max(0.0, dot(N, L)) * state.object_color * light_color;
            color += state.material.z * pow(max(0.0, dot(R, V)), state.material.w) * light_color;
        }
    }

    state.object_color = vec4(color, 1.0);
} */

bool raytrace(inout RaytraceState state, const in Ray ray) {
    state.trace.depth = positive_infinity;
    state.trace.id = -1;
    state.trace.primitive_id = -1;
    ivec4 object_instruction;

    for (int id = start_instruction_object;; ++id) {
        ivec4 instruction = getObjectData(id);
        int float_offset = instruction[2];
        int int_offset = instruction[3];
        uint flags = uint(instruction[1]);
        if (instruction[0] == 0) {
            break;
        }
        switch (instruction[0]) {
            case 1: // Sphere
            {
                vec3 sphere_origin;
                float sphere_radius;
                {
                    vec4 data = getFloatData(float_offset++);
                    sphere_origin = data.xyz;
                    sphere_radius = data.w;
                }
                if (raytracing_sphere(state.trace.depth, ray, sphere_origin, sphere_radius)) {
                    state.trace.id = id;
                    object_instruction = instruction;
                }
            }
            break;
        }
    }

    if (state.trace.id < 0) {
        return false;
    }

    state.trace.hit_point = ray.origin + state.trace.depth * ray.direction;
    state.view = -ray.direction;
    {
        uint flags = uint(object_instruction[1]);
        int float_offset = object_instruction[2];
        int int_offset = object_instruction[3];
        switch (object_instruction[0]) {
            case 1: // Sphere
            {
                vec3 sphere_origin;
                {
                    vec4 data = getFloatData(float_offset++);
                    sphere_origin = data.xyz;
                }
                state.trace.normal = normalize(state.trace.hit_point - sphere_origin);
                state.object_color = getFloatData(float_offset++);
            }
            break;
        }
    }

    return true;
}

void main() {
    // Step 1: Prepare for screen raytracing:
    vec3 perspective_pixel = perspective_center + position.x * perspective_right + position.y * perspective_up;
    Ray perspective_ray = Ray(perspective_origin, normalize(perspective_pixel - perspective_origin));
    RaytraceState screen_state;
    
    if (raytrace(screen_state, perspective_ray)) {
        // illumination(screen_state);
        color_out = screen_state.object_color;
    } else {
        color_out = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
