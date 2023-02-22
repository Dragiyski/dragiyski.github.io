import { load } from "./lib/webgl/shader-source.js";

const source = await load(new URL('test.glsl', import.meta.url));
console.log(source);
