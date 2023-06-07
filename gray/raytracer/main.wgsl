const NODE_TYPE_MESH: i32 = 1;
const NODE_TYPE_CONTAINER: i32 = 2;
const NODE_TYPE_MESH_TRIANGLE: i32 = 3;

const NODE_GEOMETRY_SPHERE: i32 = 1;

const EPSILON: f32 = 1.1920928955078125e-7;

const other_dim: array<array<i32, 2>, 3> = array<array<i32, 2>, 3>(
    array<i32, 2>(1, 2),
    array<i32, 2>(0, 2),
    array<i32, 2>(0, 1)
);

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

struct Mesh {
    index: i32,
    item_count: i32,
    flags: u32,
    vertex_ptr: i32,
    triangle_ptr: i32,
    normal_ptr: i32,
    texcoord_ptr: i32,
    tangent_ptr: i32,
    bitangent_ptr: i32
};

@group(2) @binding(0)
var<uniform> uniform_data: Uniform;

fn action_raytracing_triangle(depth_out: ptr<function, f32>, barycentric_out: ptr<function, vec3<f32>>, triangle_vertices: array<vec3<f32>, 3>, ray_origin: vec3<f32>, ray_direction: vec3<f32>) -> bool {
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

fn action_raytracing_container(depth_out: ptr<function, f32>, node_origin: vec3<f32>, node_radius: f32, node_axes: vec3<f32>, ray_origin: vec3<f32>, ray_direction: vec3<f32>, dot_ray_origin_ray_direction: f32) -> bool {
    var s = node_origin - ray_origin;
    var b: f32 = 2.0 * (dot_ray_origin_ray_direction - dot(node_origin, ray_direction));
    var c: f32 = dot(s, s) - node_radius * node_radius;

    var D = b * b - 4 * c;
    if (D < 0.0) {
        return false;
    }
    var depth = (-b - sqrt(D)) * 0.5;
    if (depth < 0.0) {
        depth = (-b + sqrt(D)) * 0.5;
        if (depth < 0.0) {
            return false;
        }
    }

    var has_box_intersection = false;
    for (var dim = 0; dim < 3; dim++) {
        if (abs(ray_direction[dim]) < EPSILON) {
            continue;
        }
        for (var dir = -1.0; dir <= 1.0; dir += 2.0) {
            var plane_factor = node_origin[dim] + dir * node_axes[dim];
            var box_depth = (plane_factor - ray_origin[dim]) / ray_direction[dim];
            if (box_depth < 0.0) {
                continue;
            }
            var hit_point = ray_origin + box_depth * ray_direction;
            var plane_center = node_origin;
            plane_center[dim] = plane_factor;
            var plane_vector = hit_point - plane_center;
            if (abs(plane_vector[other_dim[dim][0]]) <= node_axes[other_dim[dim][0]] && abs(plane_vector[other_dim[dim][1]]) <= node_axes[other_dim[dim][1]]) {
                has_box_intersection = true;
                depth = min(depth, box_depth);
            }
        }
    }
    if (has_box_intersection) {
        *depth_out = depth;
    }
    return has_box_intersection;
}

@compute
@workgroup_size(workgroup_size_x, workgroup_size_y)
fn main(
    @builtin(global_invocation_id) invocation_id: vec3<u32>
) {
    if (invocation_id.x >= uniform_data.image_size.x || invocation_id.y >= uniform_data.image_size.y) {
        return;
    }
    var position = vec2<f32>(
        (f32(invocation_id.x) + 0.5) / f32(uniform_data.image_size.x),
        (f32(invocation_id.y) + 0.5) / f32(uniform_data.image_size.y)
    );
    position = position * 2.0 - 1.0;
    var world_screen_point = uniform_data.screen_center + position.x * uniform_data.screen_right + position.y * uniform_data.screen_up;
    var ray_origin = uniform_data.camera_origin;
    var ray_direction = normalize(world_screen_point - ray_origin);
    var dot_ray_origin_ray_direction = dot(ray_origin, ray_direction);

    var current_node_index = uniform_data.start_node_index;
    var has_intersection: bool = false;
    var intersection: RayIntersection;
    var current_mesh: Mesh;

    while (current_node_index != -1) {
        var current_node = scene_tree[current_node_index];
        var current_object = scene_object[current_node[3]];

        switch (current_object[0]) {
            case NODE_TYPE_MESH: {
                current_mesh.index = current_node_index;
                current_mesh.flags = u32(current_object[1]);
                var float_offset = current_object[3];
                var int_offset = current_object[2] + 4;
                current_mesh.item_count = 1;
                current_mesh.vertex_ptr = float_offset;
                float_offset += scene_int[current_object[2] + 2] * 3;
                for (var i: u32 = 0; i < 4; i++) {
                    if ((current_mesh.flags & u32(1 << i)) != 0) {
                        current_mesh.item_count += 1;
                        switch (i) {
                            case 0: {
                                current_mesh.normal_ptr = float_offset;
                                float_offset += scene_int[int_offset] * 3;
                                break;
                            }
                            case 1: {
                                current_mesh.texcoord_ptr = float_offset;
                                float_offset += scene_int[int_offset] * 2;
                                break;
                            }
                            case 2: {
                                current_mesh.tangent_ptr = float_offset;
                                float_offset += scene_int[int_offset] * 3;
                                break;
                            }
                            case 3: {
                                current_mesh.bitangent_ptr = float_offset;
                                float_offset += scene_int[int_offset] * 3;
                                break;
                            }
                            default: { break; }
                        }
                        int_offset += 1;
                    }
                }
                current_mesh.triangle_ptr = current_object[2] + 3 + current_mesh.item_count;
                current_node_index = scene_int[current_object[2] + 1];
                continue;
            }
            case NODE_TYPE_CONTAINER: {
                var relevant: bool = false;
                var depth: f32;
                if (action_raytracing_container(
                    &depth,
                    vec3<f32>(scene_float[current_object[3] + 0], scene_float[current_object[3] + 1], scene_float[current_object[3] + 2]),
                    scene_float[current_object[3] + 3],
                    vec3<f32>(scene_float[current_object[3] + 4], scene_float[current_object[3] + 5], scene_float[current_object[3] + 6]),
                    ray_origin,
                    ray_direction,
                    dot_ray_origin_ray_direction
                )) {
                    relevant = true;
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
                        scene_float[current_mesh.vertex_ptr + scene_int[current_mesh.triangle_ptr + current_object[1] * current_mesh.item_count * 3 + 0 * current_mesh.item_count] * 3 + 0],
                        scene_float[current_mesh.vertex_ptr + scene_int[current_mesh.triangle_ptr + current_object[1] * current_mesh.item_count * 3 + 0 * current_mesh.item_count] * 3 + 1],
                        scene_float[current_mesh.vertex_ptr + scene_int[current_mesh.triangle_ptr + current_object[1] * current_mesh.item_count * 3 + 0 * current_mesh.item_count] * 3 + 2],
                    ),
                    vec3<f32>(
                        scene_float[current_mesh.vertex_ptr + scene_int[current_mesh.triangle_ptr + current_object[1] * current_mesh.item_count * 3 + 1 * current_mesh.item_count] * 3 + 0],
                        scene_float[current_mesh.vertex_ptr + scene_int[current_mesh.triangle_ptr + current_object[1] * current_mesh.item_count * 3 + 1 * current_mesh.item_count] * 3 + 1],
                        scene_float[current_mesh.vertex_ptr + scene_int[current_mesh.triangle_ptr + current_object[1] * current_mesh.item_count * 3 + 1 * current_mesh.item_count] * 3 + 2],
                    ),
                    vec3<f32>(
                        scene_float[current_mesh.vertex_ptr + scene_int[current_mesh.triangle_ptr + current_object[1] * current_mesh.item_count * 3 + 2 * current_mesh.item_count] * 3 + 0],
                        scene_float[current_mesh.vertex_ptr + scene_int[current_mesh.triangle_ptr + current_object[1] * current_mesh.item_count * 3 + 2 * current_mesh.item_count] * 3 + 1],
                        scene_float[current_mesh.vertex_ptr + scene_int[current_mesh.triangle_ptr + current_object[1] * current_mesh.item_count * 3 + 2 * current_mesh.item_count] * 3 + 2],
                    )
                );
                if (action_raytracing_triangle(
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
                    if (dot(ray_direction, intersection.normal) >= 0.0) {
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