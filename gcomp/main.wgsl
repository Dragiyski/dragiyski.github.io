override grid_x = 1u;
override grid_y = 1u;
override grid_z = 1u;

@group(0)
@binding(0)
var<storage, read_write> memory : array<atomic<u32>>;

@compute
@workgroup_size(grid_x, grid_y, grid_z)
fn main() {
    let width = atomicLoad(&memory[8]);
    let height = atomicLoad(&memory[9]);
    let total = width * height;
    while (true) {
        let id = atomicAdd(&memory[12], 1);
        if (id >= total) {
            break;
        }
        let this_y = id / width;
        let this_x = id % width;
        let row_size = (width / 64 + u32(width % 64 > 0)) * 64;
        let red = f32(this_x) / f32(width);
        let green = f32(this_y) / f32(height);
        let color = pack4x8unorm(vec4<f32>(red, green, 0.0, 1.0));
        atomicStore(&memory[256 + this_y * row_size + this_x], color);
    }
}