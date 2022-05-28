struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec3<f32>
};

struct UniformData {
    color: vec3<f32>
};

@group(0)
@binding(0)
var<uniform> uniforms: UniformData;

@vertex
fn vertex_main(
    @location(0) position: vec2<f32>
) -> VertexOutput {
    var vertex_output: VertexOutput;
    vertex_output.position = vec4<f32>(position, 0.0, 1.0);
    vertex_output.color = uniforms.color;
    return vertex_output;
}

@fragment
fn fragment_main (
    @location(0) color: vec3<f32>
) -> @location(0) vec4<f32> {
    return vec4<f32>(color, 1.0);
}
