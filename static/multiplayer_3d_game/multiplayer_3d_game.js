var canvas, gl;

// create shaders ig
function createShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
 
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

// link shaders into a program
function createProgram(vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
 
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

// resize the drawingbuffer to the display size
function resizeDrawingBuffer(canv) {
    const displayWidth  = canv.clientWidth;
    const displayHeight = canv.clientHeight;
 
    // Check if the canvas is not the same size.
    const needResize = canv.width  !== displayWidth ||
                       canv.height !== displayHeight;
 
    if (needResize) {
        // Make the canvas the same size
        canv.width  = displayWidth;
        canv.height = displayHeight;
    }

    return needResize;
}

function drawTriangle() {
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function onLoad() {
    // canvas stuffs
    canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl");

    // S H A D E R S
    var vertexShaderSource = document.getElementById("vertex-shader").innerHTML;
    var fragmentShaderSource = document.getElementById("fragment-shader").innerHTML;

    var vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    // link shader into program
    var program = createProgram(vertexShader, fragmentShader);

    // get the location of the position attribute a_position
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // create a buffer for the position attribute
    var positionBuffer = gl.createBuffer();

    // binding or smth I think
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // putting 3 2d positions into the buffer
    var positions = [
        -1, 1,
        1, -1,
        -1, -1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // // smth about resizing, we'll see later
    // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // convert clip space (from -1 to 1) to canvas coords (whatever your canvas dimensions are)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // tell WebGL to use the shader
    gl.useProgram(program);

    // enable a_position
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer. (even though we already did it already?)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
     
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        /* 0 = move forward size * sizeof(type) (which is 2*32 bits I think)
                              each iteration to get the next position */
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);

}

window.onload = onLoad;

function frame() {
    // resize the drawingbuffer
    resizeDrawingBuffer(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);
    drawTriangle();
}

window.setInterval(100, frame);
