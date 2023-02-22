let support = false;

{
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');

    const vertexSource = `#version 300 es
precision highp float;
precision highp int;
const float POSITIVE_INFINITY = uintBitsToFloat(0x7F800000u);
void main() {
    gl_Position = vec4(POSITIVE_INFINITY, POSITIVE_INFINITY, POSITIVE_INFINITY, 1.0);
}`;
    const fragmentSource = `#version 300 es
precision highp float;
precision highp int;
out vec4 color;
void main() {
    color = vec4(gl_FragCoord.xyz * 0.5 + 0.5, 1.0);
}`;

    const program = gl.createProgram();
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.shaderSource(fragmentShader, fragmentSource);

    try {
        do {
            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(vertexShader));
                break;
            }
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(fragmentShader));
                break;
            }
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error(gl.getProgramInfoLog(program));
                break;
            }
            gl.validateProgram(program);
            if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
                console.error(gl.getProgramInfoLog(program));
                break;
            }
            support = true;
        } while (false);
    } finally {
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteProgram(program);
    }
}

export default support;
