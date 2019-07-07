var glPointCanvas = null;
var array;
var index = 0;

function initPointCanvas() {
    var pointCanvas = document.getElementById("point-canvas");
    glPointCanvas = pointCanvas.getContext("webgl2");

    // optional: set width/height, default is 300/150
    pointCanvas.width = window.innerWidth;
    pointCanvas.height = window.innerHeight;

    var w = pointCanvas.clientWidth;
    var h = pointCanvas.clientHeight;

    //glPointCanvas.clearColor(0.3, 0.4, 0.2, 1.0);
    glPointCanvas.viewport(0.0, 0.0, w, h);

    const vertexShaderSource = `
				uniform vec2 screenSize;        // width/height of screen
				attribute vec2 spritePosition;  // position of sprite

				void main() {
				vec4 screenTransform = 
					vec4(2.0 / screenSize.x, -2.0 / screenSize.y, -1.0, 1.0);
				gl_Position =
					vec4(spritePosition * screenTransform.xy + screenTransform.zw, 0.0, 1.0);
				gl_PointSize = 30.0;
				}
				`;

    const fragmentShaderSource = `
				uniform sampler2D spriteTexture;  // texture we are drawing

				void main() {
				gl_FragColor = texture2D(spriteTexture, gl_PointCoord);
				}
				`;


    const vertexShader = loadShader(glPointCanvas, glPointCanvas.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = loadShader(glPointCanvas, glPointCanvas.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = glPointCanvas.createProgram();
    glPointCanvas.attachShader(shaderProgram, vertexShader);
    glPointCanvas.attachShader(shaderProgram, fragmentShader);
    glPointCanvas.linkProgram(shaderProgram);
    glPointCanvas.useProgram(shaderProgram);

    const status = glPointCanvas.getProgramParameter(shaderProgram, glPointCanvas.LINK_STATUS);
    if (!status) {
        throw new TypeError(`couldn't link shader program (status=${status}): ${glPointCanvas.getProgramInfoLog(shaderProgram)}`);
    }

    glPointCanvas.useProgram(shaderProgram);
    glPointCanvas.uniform2f(glPointCanvas.getUniformLocation(shaderProgram, 'screenSize'), pointCanvas.width, pointCanvas.height);

    array = new Float32Array(1000);

    const glBuffer = glPointCanvas.createBuffer();
    glPointCanvas.bindBuffer(glPointCanvas.ARRAY_BUFFER, glBuffer);
    glPointCanvas.bufferData(glPointCanvas.ARRAY_BUFFER, array, glPointCanvas.DYNAMIC_DRAW);  // upload data


    const loc = glPointCanvas.getAttribLocation(shaderProgram, 'spritePosition');
    glPointCanvas.enableVertexAttribArray(loc);
    glPointCanvas.vertexAttribPointer(loc,
        2,  // because it was a vec2
        glPointCanvas.FLOAT,  // vec2 contains floats
        false,  // ignored
        0,   // each value is next to each other
        0);  // starts at start of array


    const icon = document.getElementById('icon');
    const glTexture = glPointCanvas.createTexture();
    glPointCanvas.bindTexture(glPointCanvas.TEXTURE_2D, glTexture);
    glPointCanvas.texImage2D(glPointCanvas.TEXTURE_2D, 0, glPointCanvas.RGBA, glPointCanvas.RGBA, glPointCanvas.UNSIGNED_BYTE, icon);
    glPointCanvas.generateMipmap(glPointCanvas.TEXTURE_2D);


    // sneakily enable blending alpha
    glPointCanvas.enable(glPointCanvas.BLEND);
    glPointCanvas.blendFunc(glPointCanvas.SRC_ALPHA, glPointCanvas.ONE_MINUS_SRC_ALPHA);

    // pointCanvas.addEventListener('click', (ev) => {
    //     array[index] = ev.offsetX;
    //     array[index + 1] = ev.offsetY;

    //     glPointCanvas.bufferData(glPointCanvas.ARRAY_BUFFER, array, glPointCanvas.DYNAMIC_DRAW);  // upload data

    //     index += 2;
    //     draw(index / 2);
    // });
}

function loadShader(glPointCanvas, type, source) {
    const shader = glPointCanvas.createShader(type);
    glPointCanvas.shaderSource(shader, source);
    glPointCanvas.compileShader(shader);

    const status = glPointCanvas.getShaderParameter(shader, glPointCanvas.COMPILE_STATUS);
    if (!status) {
        throw new TypeError(`couldn't compile shader:\n${glPointCanvas.getShaderInfoLog(shader)}`);
    }
    return shader;
}


function draw(points = 1) {
    glPointCanvas.clear(glPointCanvas.COLOR_BUFFER_BIT);
    glPointCanvas.drawArrays(glPointCanvas.POINTS, 0, points);
    console.info('drawn');
}

function resetCanvas() {
    points = [];
    index = 0;
    glPointCanvas.clear(vbuffer);
}

function placeMarker(x, y) {
    array[index] = x;
    array[index + 1] = y;

    glPointCanvas.bufferData(glPointCanvas.ARRAY_BUFFER, array, glPointCanvas.DYNAMIC_DRAW);  // upload data

    index += 2;
    draw(index / 2);
}