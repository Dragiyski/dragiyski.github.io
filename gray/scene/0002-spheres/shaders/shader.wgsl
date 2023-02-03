@group(0) @binding(0)
var<storage, read_write> output: array<vec4<f32>>;

@compute @workgroup_size(1)
fn main(@builtin(local_invocation_id) local_id: vec3<u32>) {

}