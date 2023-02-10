#version 300 es

precision highp float;
precision highp int;

/* Camera settings */
uniform vec3 world_screen_center;
uniform vec3 world_screen_right;
uniform vec3 world_screen_up;
uniform vec3 camera_position;

/* 3D Data to render */
uniform sampler2D box_data;

out vec4 color;
in vec2 position;

const float positive_infinity = uintBitsToFloat(0x7F800000u);
const float negative_infinity = uintBitsToFloat(0xFF800000u);
const float not_a_number = uintBitsToFloat(0x7fc00000u);

struct RaytraceResult {
    int id;
    float depth;
    vec3 hit_point;
    vec3 normal;
};

struct Ray {
    vec3 origin;
    vec3 direction;
    float limit;
};

struct Box {
    vec3 origin;
    vec3 direction[3];
};

const ivec2 box_side_select[3] = ivec2[3](
    ivec2(1, 2),
    ivec2(0, 2),
    ivec2(0, 1)
);

struct Quad {
    vec3 origin;
    vec3 direction[2];
};

const RaytraceResult miss = RaytraceResult(-1, positive_infinity, vec3(not_a_number, not_a_number, not_a_number), vec3(0.0, 0.0, 0.0));

RaytraceResult quad_raytrace(Quad quad, Ray ray, RaytraceResult previous) {
    // Determine the plane normal vector
    vec3 normal = normalize(cross(quad.direction[0], quad.direction[1]));
    if (dot(normal, ray.direction) >= 0.0) {
        normal = -normal;
    }

    float depth = (dot(normal, quad.origin) - dot(normal, ray.origin)) / dot(normal, ray.direction);
    if (isinf(depth) || depth < 0.0 || depth >= previous.depth) {
        // The view vector is parallel to the plane,
        // or the view vector intersects the plane "behind" the camera,
        // or the intersection happens behind another object.
        return miss;
    }

    // While ray intersects the plane, we only count it if intesection is within the quad.
    vec3 hit_point = ray.origin + depth * ray.direction;
    vec3 quad_vector = hit_point - quad.origin;
    // [x, y] are quad coordinates in range [0, 1] if within the quad (otherwise outside the quad).
    float x = dot(quad_vector, quad.direction[0]) / dot(quad.direction[0], quad.direction[0]);
    float y = dot(quad_vector, quad.direction[1]) / dot(quad.direction[1], quad.direction[1]);

    if (x < 0.0 || x > 1.0 || y < 0.0 || y > 1.0) {
        return miss;
    }
    RaytraceResult result = RaytraceResult(
        1, depth, hit_point, normal
    );
    return result;
}

RaytraceResult box_raytrace(Box box, Ray ray, RaytraceResult previous) {
    RaytraceResult result = previous;
    for (int i = 0; i < 3; ++i) {
        for (int m = 0; m < 2; ++m) {
            ivec2 direction_index = box_side_select[i];
            Quad quad = Quad(
                box.origin + float(m) * box.direction[i],
                vec3[2](
                    box.direction[direction_index.x],
                    box.direction[direction_index.y]
                )
            );
            RaytraceResult quad_result = quad_raytrace(quad, ray, result);
            if (quad_result.id >= 0) {
                result = quad_result;
            }
        }
    }
    if (result.id >= 0 && result.depth < previous.depth) {
        return result;
    }
    return miss;
}

void main() {
    vec2 pixel_position = position * 2.0 - 1.0;
    vec3 world_screen_point = world_screen_center + pixel_position.x * world_screen_right + pixel_position.y * world_screen_up;
    Ray screen_ray = Ray(
        camera_position,
        normalize(world_screen_point - camera_position),
        positive_infinity
    );
    RaytraceResult state = miss;

    ivec2 box_data_length = textureSize(box_data, 0);
    for (int i = 0; i < box_data_length.x / 4; ++i) {
        Box box = Box(
            texelFetch(box_data, ivec2(i * 4 + 0, 0), 0).xyz,
            vec3[3](
                texelFetch(box_data, ivec2(i * 4 + 1, 0), 0).xyz,
                texelFetch(box_data, ivec2(i * 4 + 2, 0), 0).xyz,
                texelFetch(box_data, ivec2(i * 4 + 3, 0), 0).xyz
            )
        );
        RaytraceResult result = box_raytrace(box, screen_ray, state);
        if (result.id >= 0 && result.depth >= 0.0 && result.depth < state.depth) {
            state = result;
        }
    }
    
    if (state.id < 0) {
        discard;
        return;
    }
    color = vec4(state.normal * 0.5 + 0.5, 1.0);
    // // Box direction are not necessarily perpendicular, so we use cross product to determine a normal vector;
    // vec3 quad_normal = normalize(cross(box_direction[0], box_direction[2]));
    // // The normal points toward the screen:
    // if (dot(box_direction[1], screen_ray.direction) >= 0.0) {
    //     quad_normal = -quad_normal;
    // }
    // // Raytrace a plane: notice that quad_normal is both in numerator/denominator, so the normal vector direction sign is canceled.
    // float ray_distance = (dot(quad_normal, box_origin) - dot(quad_normal, screen_ray.origin)) / dot(quad_normal, screen_ray.direction);
    // if (isinf(ray_distance)) {
    //     // miss
    //     color = vec4(0.0, 0.0, 0.0, 1.0);
    // }
    // vec3 hit_point = screen_ray.origin + ray_distance * screen_ray.direction;
    // vec3 box_vector = hit_point - box_origin;
    // float x = dot(box_vector, box_direction[0]) / dot(box_direction[0], box_direction[0]);
    // float y = dot(box_vector, box_direction[2]) / dot(box_direction[2], box_direction[2]);
    // if (x >= 0.0 && x <= 1.0 && y >= 0.0 && y <= 1.0) {
    //     // hit
    //     color = vec4(quad_normal * 0.5 + 0.5, 1.0);
    // } else {
    //     // miss
    //     color = vec4(0.0, 0.0, 0.0, 1.0);
    // }
}