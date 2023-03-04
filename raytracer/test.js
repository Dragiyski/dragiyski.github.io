import { load } from "./lib/webgl/shader-source.js";

const { source, files } = await load(new URL('src/shader/raytacer.fragment.glsl', import.meta.url));
console.log(source);
