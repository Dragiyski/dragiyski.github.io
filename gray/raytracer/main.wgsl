const NODE_TYPE_MESH: i32 = 1;
const NODE_TYPE_CONTAINER: i32 = 2;
const NODE_TYPE_MESH_TRIANGLE: i32 = 3;

const NODE_GEOMETRY_SPHERE: i32 = 1;

const EPSILON: f32 = 1.1920928955078125e-7;

override workgroup_size_x: u32;
override workgroup_size_y: u32;

@group(0) @binding(0)
var<storage, read> scene_float: array<f32>;

@group(0) @binding(1)
var<storage, read> scene_int: array<i32>;

@group(0) @binding(2)
var<storage, read> scene_object: array<vec4<i32>>;

@group(0) @binding(3)
var<storage, read> scene_tree: array<vec4<i32>>;

@group(1) @binding(0)
var color_out: texture_storage_2d<rgba8unorm, write>;

struct Uniform {
    image_size: vec2<u32>,
    start_node_index: i32,
    camera_origin: vec3<f32>,
    screen_center: vec3<f32>,
    screen_right: vec3<f32>,
    screen_up: vec3<f32>
};

struct RayIntersection {
    normal: vec3<f32>,
    depth: f32
};

@group(2) @binding(0)
var<uniform> uniform_data: Uniform;

fn raytracing_sphere(depth_out: ptr<function, f32>, sphere_origin: vec3<f32>, sphere_radius: f32, ray_origin: vec3<f32>, ray_direction: vec3<f32>, dot_ray_origin_ray_direction: f32) -> bool {
    var sphere_vector = sphere_origin - ray_origin;
    var b = 2.0 * (dot_ray_origin_ray_direction - dot(ray_direction, sphere_origin));
    var c = dot(sphere_vector, sphere_vector) - sphere_radius * sphere_radius;

    var D = b * b - 4 * c;
    if (D < 0) {
        return false;
    }

    var depth = (-b - sqrt(D)) * 0.5;
    if (depth < 0.0) {
        depth = (-b + sqrt(D)) * 0.5;
        if (depth < 0.0) {
            return false;
        }
    }
    *depth_out = depth;
    return true;
}

fn raytracing_triangle(depth_out: ptr<function, f32>, barycentric_out: ptr<function, vec3<f32>>, triangle_vertices: array<vec3<f32>, 3>, ray_origin: vec3<f32>, ray_direction: vec3<f32>) -> bool {
    var edge1 = triangle_vertices[1] - triangle_vertices[0];
    var edge2 = triangle_vertices[2] - triangle_vertices[0];
    var h = cross(ray_direction, edge2);
    var a = dot(edge1, h);
    if (abs(a) < EPSILON) {
        return false;
    }
    var f = 1.0 / a;
    var s = ray_origin - triangle_vertices[0];
    var u = f * dot(s, h);
    if (u < 0.0 || u > 1.0) {
        return false;
    }
    var q = cross(s, edge1);
    var v = f * dot(ray_direction, q);
    if (v < 0.0 || (u + v) >= 1.0) {
        return false;
    }
    var depth = f * dot(edge2, q);
    if (depth < 0.0) {
        return false;
    }
    *depth_out = depth;
    *barycentric_out = vec3<f32>(u, v, 1.0 - u - v);
    return true;
}

@compute
@workgroup_size(workgroup_size_x, workgroup_size_y)
fn main(
    @builtin(global_invocation_id) invocation_id: vec3<u32>
) {
    if (invocation_id.x >= uniform_data.image_size.x || invocation_id.y >= uniform_data.image_size.y) {
        return;
    }
    var position = vec2<f32>(f32(invocation_id.x) / f32(uniform_data.image_size.x), f32(invocation_id.y) / f32(uniform_data.image_size.y));
    position = position * 2.0 - 1.0;
    var world_screen_point = uniform_data.screen_center + position.x * uniform_data.screen_right + position.y * uniform_data.screen_up;
    var ray_direction = normalize(world_screen_point - uniform_data.camera_origin);
    var ray_origin = uniform_data.camera_origin;
    var dot_ray_origin_ray_direction = dot(ray_origin, ray_direction);

    var current_node_index = uniform_data.start_node_index;
    var has_intersection: bool = false;
    var intersection: RayIntersection;
    var current_mesh_index: i32 = -1;
    var current_mesh_item_count: i32 = 0;
    var current_mesh_flags: u32 = 0;
    var current_mesh_normal_ptr: i32 = -1;
    var current_mesh_texcoord_ptr: i32 = -1;
    var current_mesh_tangent_ptr: i32 = -1;
    var current_mesh_bitangent_ptr: i32 = -1;
    var current_mesh_vertex_ptr: i32 = -1;
    var current_mesh_triangle_ptr: i32 = -1;

    while (current_node_index != -1) {
        var current_node = scene_tree[current_node_index];
        var current_object = scene_object[current_node[3]];

        switch (current_object[0]) {
            case NODE_TYPE_MESH: {
                /**
                * Mesh Node is:
                * Int:
                * 0: parent_mesh_index
                * 1: root_index
                * 2: vertex_count
                * 3: triangle_count
                * 4..(4 + item_count): normal_count, texcoord_count, tangent_count, bitangent_count
                * (4 + item_count)..(4 + item_count + triangle_count * 3 * item_count): triangle_data
                * Float:
                * 0..16 (if flags & 1): mat4x4 transformation matrix
                * (0 or 16)..((0 or 16) + vertex_count * 3): vertex data
                * if flag & 2: X..(X + normal_count * 3): normal data
                * ...
                */
                current_mesh_index = current_node_index;
                current_node_index = scene_int[current_object[2] + 1];
                current_mesh_flags = u32(current_object[1]);
                var float_offset = current_object[3];
                var int_offset = current_object[2] + 4;
                if ((current_mesh_flags & 1) != 0) {
                    float_offset += 16;
                }
                current_mesh_item_count = 1;
                current_mesh_vertex_ptr = float_offset;
                float_offset += scene_int[current_object[2] + 2] * 3;
                for (var i: u32 = 1; i < 5; i++) {
                    if ((current_mesh_flags & u32(1 << i)) != 0) {
                        current_mesh_item_count += 1;
                        switch (i) {
                            case 1: { current_mesh_normal_ptr = float_offset; break; }
                            case 2: { current_mesh_texcoord_ptr = float_offset; break; }
                            case 3: { current_mesh_tangent_ptr = float_offset; break; }
                            case 4: { current_mesh_bitangent_ptr = float_offset; break; }
                            default: { break; }
                        }
                        switch (i) {
                            case 1: { float_offset += scene_int[int_offset] * 3; break; }
                            case 2: { float_offset += scene_int[int_offset] * 2; break; }
                            case 3: { float_offset += scene_int[int_offset] * 3; break; }
                            case 4: { float_offset += scene_int[int_offset] * 3; break; }
                            default: { break; }
                        }
                        int_offset += 1;
                    }
                }
                current_mesh_triangle_ptr = current_object[2] + 3 + current_mesh_item_count;
                continue;
            }
            case NODE_TYPE_CONTAINER: {
                var relevant: bool = false;
                var depth: f32;
                var geometry = scene_int[current_object[2]];
                if (geometry == NODE_GEOMETRY_SPHERE) {
                    if (raytracing_sphere(
                        &depth,
                        vec3<f32>(scene_float[current_object[3] + 0], scene_float[current_object[3] + 1], scene_float[current_object[3] + 2]),
                        scene_float[current_object[3] + 3],
                        ray_origin,
                        ray_direction,
                        dot_ray_origin_ray_direction
                    )) {
                        relevant = true;
                    }
                }
                if (relevant) {
                    if (has_intersection && depth >= intersection.depth) {
                        relevant = false;
                    }
                }
                if (relevant) {
                    current_node_index = current_object[1];
                    continue;
                }
                break;
            }
            case NODE_TYPE_MESH_TRIANGLE: {
                var relevant: bool = false;
                var depth: f32;
                var barycentric: vec3<f32>;
                var triangle_vertices = array<vec3<f32>, 3>(
                    vec3<f32>(
                        scene_float[current_mesh_vertex_ptr + scene_int[current_mesh_triangle_ptr + current_object[1] * current_mesh_item_count * 3 + 0 * current_mesh_item_count] * 3 + 0],
                        scene_float[current_mesh_vertex_ptr + scene_int[current_mesh_triangle_ptr + current_object[1] * current_mesh_item_count * 3 + 0 * current_mesh_item_count] * 3 + 1],
                        scene_float[current_mesh_vertex_ptr + scene_int[current_mesh_triangle_ptr + current_object[1] * current_mesh_item_count * 3 + 0 * current_mesh_item_count] * 3 + 2],
                    ),
                    vec3<f32>(
                        scene_float[current_mesh_vertex_ptr + scene_int[current_mesh_triangle_ptr + current_object[1] * current_mesh_item_count * 3 + 1 * current_mesh_item_count] * 3 + 0],
                        scene_float[current_mesh_vertex_ptr + scene_int[current_mesh_triangle_ptr + current_object[1] * current_mesh_item_count * 3 + 1 * current_mesh_item_count] * 3 + 1],
                        scene_float[current_mesh_vertex_ptr + scene_int[current_mesh_triangle_ptr + current_object[1] * current_mesh_item_count * 3 + 1 * current_mesh_item_count] * 3 + 2],
                    ),
                    vec3<f32>(
                        scene_float[current_mesh_vertex_ptr + scene_int[current_mesh_triangle_ptr + current_object[1] * current_mesh_item_count * 3 + 2 * current_mesh_item_count] * 3 + 0],
                        scene_float[current_mesh_vertex_ptr + scene_int[current_mesh_triangle_ptr + current_object[1] * current_mesh_item_count * 3 + 2 * current_mesh_item_count] * 3 + 1],
                        scene_float[current_mesh_vertex_ptr + scene_int[current_mesh_triangle_ptr + current_object[1] * current_mesh_item_count * 3 + 2 * current_mesh_item_count] * 3 + 2],
                    )
                );
                if (raytracing_triangle(
                    &depth,
                    &barycentric,
                    triangle_vertices,
                    ray_origin,
                    ray_direction
                )) {
                    relevant = true;
                }
                if (relevant) {
                    if (has_intersection && depth >= intersection.depth) {
                        relevant = false;
                    }
                }
                if (relevant) {
                    has_intersection = true;
                    intersection.depth = depth;
                    intersection.normal = normalize(cross(triangle_vertices[2] - triangle_vertices[0], triangle_vertices[1] - triangle_vertices[0]));
                    if (dot(ray_direction, intersection.normal) > 0.0) {
                        intersection.normal = -intersection.normal;
                    }
                }
                break;
            }
            default: { break; }
        }

        current_node_index = -1;
        while (true) {
            if (current_node[2] != -1) {
                current_node_index = current_node[2];
                break;
            }
            if (current_node[0] == -1) {
                break;
            }
            current_node = scene_tree[current_node[0]];
        }
    }

    if (has_intersection) {
        textureStore(color_out, vec2<u32>(invocation_id.x, invocation_id.y), vec4<f32>(intersection.normal * 0.5 + 0.5, 1.0));
    } else {
        textureStore(color_out, vec2<u32>(invocation_id.x, invocation_id.y), vec4<f32>(0.0, 0.0, 0.0, 1.0));
    }
}