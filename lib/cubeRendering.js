var cubeVertexPositionBuffer;
var cubeVertexNormalBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexIndexBuffer;
var textureCube = [];
function initBuffersCube() {
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    let aspect = 0.01;
    let height = 1;
    let width = 0.5;
    vertices = [
        // Front face
        -1.0*height, -1.0*width,  0.1*aspect,
         1.0*height, -1.0*width,  0.1*aspect,
         1.0*height,  1.0*width,  0.1*aspect,
        -1.0*height,  1.0*width,  0.1*aspect
        //
        // // Back face
        // -1.0*height, -1.0*width, -0.1*aspect,
        // -1.0*height,  1.0*width, -0.1*aspect,
        //  1.0*height,  1.0*width, -0.1*aspect,
        //  1.0*height, -1.0*width, -0.1*aspect,
        //
        // // Top face
        // -1.0*height,  1.0*width, -0.1*aspect,
        // -1.0*height,  1.0*width,  0.1*aspect,
        //  1.0*height,  1.0*width,  0.1*aspect,
        //  1.0*height,  1.0*width, -0.1*aspect,
        //
        // // Bottom face
        // -1.0*height, -1.0*width, -0.1*aspect,
        //  1.0*height, -1.0*width, -0.1*aspect,
        //  1.0*height, -1.0*width,  0.1*aspect,
        // -1.0*height, -1.0*width,  0.1*aspect,
        //
        // // Right face
        //  1.0*height, -1.0*width, -0.1*aspect,
        //  1.0*height,  1.0*width, -0.1*aspect,
        //  1.0*height,  1.0*width,  0.1*aspect,
        //  1.0*height, -1.0*width,  0.1*aspect,
        //
        // // Left face
        // -1.0*height, -1.0*width, -0.1*aspect,
        // -1.0*height, -1.0*width,  0.1*aspect,
        // -1.0*height,  1.0*width,  0.1*aspect,
        // -1.0*height,  1.0*width, -0.1*aspect,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    // cubeVertexPositionBuffer.numItems = 24;
    cubeVertexPositionBuffer.numItems = 4;


    cubeVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    var vertexNormals = [
        // Front face
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0

        // // Back face
        //  0.0,  0.0, -1.0,
        //  0.0,  0.0, -1.0,
        //  0.0,  0.0, -1.0,
        //  0.0,  0.0, -1.0,
        //
        // // Top face
        //  0.0,  1.0,  0.0,
        //  0.0,  1.0,  0.0,
        //  0.0,  1.0,  0.0,
        //  0.0,  1.0,  0.0,
        //
        // // Bottom face
        //  0.0, -1.0,  0.0,
        //  0.0, -1.0,  0.0,
        //  0.0, -1.0,  0.0,
        //  0.0, -1.0,  0.0,
        //
        // // Right face
        //  1.0,  0.0,  0.0,
        //  1.0,  0.0,  0.0,
        //  1.0,  0.0,  0.0,
        //  1.0,  0.0,  0.0,
        //
        // // Left face
        // -1.0,  0.0,  0.0,
        // -1.0,  0.0,  0.0,
        // -1.0,  0.0,  0.0,
        // -1.0,  0.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    cubeVertexNormalBuffer.itemSize = 3;
    // cubeVertexNormalBuffer.numItems = 24;
    cubeVertexNormalBuffer.numItems = 4;

    cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    var textureCoords = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0

        // // Back face
        // 1.0, 0.0,
        // 1.0, 1.0,
        // 0.0, 1.0,
        // 0.0, 0.0,
        //
        // // Top face
        // 0.0, 1.0,
        // 0.0, 0.0,
        // 1.0, 0.0,
        // 1.0, 1.0,
        //
        // // Bottom face
        // 1.0, 1.0,
        // 0.0, 1.0,
        // 0.0, 0.0,
        // 1.0, 0.0,
        //
        // // Right face
        // 1.0, 0.0,
        // 1.0, 1.0,
        // 0.0, 1.0,
        // 0.0, 0.0,
        //
        // // Left face
        // 0.0, 0.0,
        // 1.0, 0.0,
        // 1.0, 1.0,
        // 0.0, 1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer.itemSize = 2;
    // cubeVertexTextureCoordBuffer.numItems = 24;
    cubeVertexTextureCoordBuffer.numItems = 4;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var cubeVertexIndices = [
        0, 1, 2,      0, 2, 3    // Front face
        // 4, 5, 6,      4, 6, 7,    // Back face
        // 8, 9, 10,     8, 10, 11,  // Top face
        // 12, 13, 14,   12, 14, 15, // Bottom face
        // 16, 17, 18,   16, 18, 19, // Right face
        // 20, 21, 22,   20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    // cubeVertexIndexBuffer.numItems = 36;
    cubeVertexIndexBuffer.numItems = 6;
}

function initCubeTexture(index) {
    var city_index = index - 2;
    // console.log("init cube", textureCube[city_index]);

    var textCanvas = makeTextCanvas(c[city_index].name, 1000, 600);
    // console.log(textCanvas, c[city_index].name, index);
    textureCube[city_index] = gl.createTexture();
    // Working with cube
    // console.log(c[city_index].name, index)
    gl.activeTexture(gl.TEXTURE0 + index);

    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, textureCube[city_index]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas); // This is the important line!

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    // console.log(textureCube);
}

function renderCube(index){

  var shaderProgram = program;
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

  // if(zax==0)
  //   console.log("rendering cube", index);
  // if(index>4)
  //   zax = 1;
  gl.uniform1i(program.u_textureUniform, index);

  // console.log(cubeVertexIndexBuffer.numItems)
  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

var zax = 0;
