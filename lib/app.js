var canvas;
var object_color = 0;
var gl = null,
	program = null,
	labelMesh = null,
	worldMesh = null,
	pinMesh = null,
	skybox = null,
	imgtx = null,
	imgtx2 = null,
	imgtx3 = [],
	skyboxLattx = null,
	flag = null,
	skyboxTbtx = null
positionDictionary = {};

var current_fov = 60;

var projectionMatrix,
	perspectiveMatrix,
	viewMatrix,
	worldMatrix,
	gLightDir;

var worldScale;

//Parameters for Camera
var cx = 0.0;
var cy = 0.0;
var cz = 6.5;
var cameraDistance = 0;
var cameraDistanceX = 0;
var cameraDistanceZ = 0;
var cdi = 0;
var cdx = 0;
var cdz = 0;


var lookRadius = 10.0;
var curr_Shader = 0;

var keys = [];
var rvx = 0.0;
var rvy = 0.0;
var rvz = 0.0;

function doResize() {
	var canvas = document.getElementById("my-canvas");
	if ((window.innerWidth > 40) && (window.innerHeight > 340)) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		var w = canvas.clientWidth;
		var h = canvas.clientHeight;

		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.viewport(0.0, 0.0, w, h);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		perspectiveMatrix = utils.MakePerspective(current_fov, w / h, 0.1, 1000.0);
	}
}

function showHideUI(tag, sel) {
	for (var name in UIonOff[tag][sel]) {
		document.getElementById(name).style.display = UIonOff[tag][sel][name] ? "block" : "none";
	}
}

function showLight(sel) {
	document.getElementById("LB").style.display = (sel == "LB") ? "block" : "none";
	document.getElementById("LC").style.display = (sel == "LC") ? "block" : "none";
}

// load meshes of earth and tower.
function setMeshes() {
	worldMesh = new OBJ.Mesh(worldObjStr);
	imgtx = new Image();
	imgtx.txNum = 0;
	imgtx.onload = textureLoaderCallback;
	imgtx.src = WorldTextureData;
	worldScale = 1;

	pinMesh = new OBJ.Mesh(towerObj);
	imgtx2 = new Image();
	imgtx2.txNum = 1;
	imgtx2.onload = textureLoaderCallback;
	imgtx2.src = TowerTextureData;

	OBJ.initMeshBuffers(gl, worldMesh);
	OBJ.initMeshBuffers(gl, pinMesh);

	document.getElementById("diffuseColor").value = "#00ffff";
	document.getElementById("ambientMatColor").value = "#00ffff";
}

// texture loader callback
var textureLoaderCallback = function () {
	var textureId = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0 + this.txNum);

	gl.bindTexture(gl.TEXTURE_2D, textureId);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
	// set the filtering so we don't need mips
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}

// texture label callback
var textureLabelLoaderCallback = function () {
	var textureId = gl.createTexture();
	let city_index = this.txNum - 2;
	let textCanvas = makeTextCanvas(c[city_index].name, 100, 60);
	gl.activeTexture(gl.TEXTURE0 + this.txNum);

	gl.bindTexture(gl.TEXTURE_2D, textureId);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.generateMipmap(gl.TEXTURE_2D);
}

// creates the program and its shaders. Link them e use the program.
function setShader() {
	program = gl.createProgram();

	// create vertex shader
	var v1 = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(v1, vs);
	gl.compileShader(v1);
	if (!gl.getShaderParameter(v1, gl.COMPILE_STATUS)) {
		alert("ERROR IN VS SHADER : " + gl.getShaderInfoLog(v1));
	}

	// creates fragment shader
	var v2 = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(v2, fs1);
	gl.compileShader(v2);
	if (!gl.getShaderParameter(v2, gl.COMPILE_STATUS)) {
		alert("ERROR IN FS SHADER : " + gl.getShaderInfoLog(v2));
	}

	// attach shaders
	gl.attachShader(program, v1);
	gl.attachShader(program, v2);

	// link and use the program
	gl.linkProgram(program);
	gl.useProgram(program);

	// links mesh attributes to shader attributes
	program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
	gl.enableVertexAttribArray(program.vertexPositionAttribute);

	program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
	gl.enableVertexAttribArray(program.vertexNormalAttribute);

	program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
	gl.enableVertexAttribArray(program.textureCoordAttribute);
	flag = gl.getUniformLocation(program, "flag");

	// link all light variables to program
	for (var i = 0; i < unifParArray.length; i++) {
		program[unifParArray[i].pGLSL + "Uniform"] = gl.getUniformLocation(program, unifParArray[i].pGLSL);
	}
}

// main function of the app
function main() {

	// reset all parameters before start.
	resetShaderParams();

	// setup canvas and DOM
	canvas = document.getElementById("my-canvas");
	canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseup", doMouseUp, false);
	canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("wheel", doMouseWheel, false);
	window.addEventListener("keyup", keyFunctionUp, false);
	window.addEventListener("keydown", keyFunctionDown, false);
	window.onresize = doResize;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	canvas.addEventListener("click", handleMouseClick, false);

	// get context of webgl2
	try {
		gl = canvas.getContext("webgl2");
	} catch (e) {
		console.log(e);
	}

	if (gl) {
		setShader(); // create program and its shaders
		setMeshes(); // set meshes
		initBuffersCube(); // init buffers responsible for city names

		for (let index = 0; index < c.length; index++)
			initCubeTexture(index + 2);

		// prepares the world, view and projection matrices.
		var w = canvas.clientWidth;
		var h = canvas.clientHeight;

		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.viewport(0.0, 0.0, w, h);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// create perspective matrix
		perspectiveMatrix = utils.MakePerspective(current_fov, w / h, 0.1, 1000.0);

		// turn on depth testing
		gl.enable(gl.DEPTH_TEST);

		// algin the skybox with the light
		gLightDir = [-1.0, 0.0, 0.0, 0.0];
		skyboxWM = utils.MakeRotateYMatrix(135);
		gLightDir = utils.multiplyMatrixVector(skyboxWM, gLightDir);

		drawScene();
	} else {
		alert("Error: WebGL not supported by your browser!");
	}
}

// iterating function that creates and updates objects in the scene
function drawScene() {
	// draw earth
	drawEarth();

	// draw label texts
	for (let i = 0; i < c.length; i++)
		drawLabel(c[i].lat, c[i].lng, c[i].name, i);

	// draw pins
	for (let i = 0; i < c.length; i++)
		drawPin(c[i].lat, c[i].lng, c[i].name, i);

	window.requestAnimationFrame(drawScene);
}

function drawEarth() {
	angle = angle + rvy;
	elevation = elevation + rvx;
	roll = roll + rvz;
	cameraDistance = cameraDistance + cdi;
	cameraDistanceX = cameraDistanceX + cdx;
	cameraDistanceZ = cameraDistanceZ + cdz;

	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));

	// set the view matrix
	viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle, roll);
	viewMatrix = utils.multiplyMatrices(viewMatrix, utils.MakeTranslateMatrix(cameraDistanceX, cameraDistance, cameraDistanceZ));

	// set the world matrix
	worldMatrix = utils.MakeScaleMatrix(worldScale);
	projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);

	// bind buffers: vertex, texture and normal
	gl.bindBuffer(gl.ARRAY_BUFFER, worldMesh.vertexBuffer);
	gl.vertexAttribPointer(program.vertexPositionAttribute, worldMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, worldMesh.textureBuffer);
	gl.vertexAttribPointer(program.textureCoordAttribute, worldMesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, worldMesh.normalBuffer);
	gl.vertexAttribPointer(program.vertexNormalAttribute, worldMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, worldMesh.indexBuffer);

	gl.uniform1i(program.u_textureUniform, 0);
	gl.uniform3f(program.eyePosUniform, cx, cy, cz);

	// create and set the WVP matrix of the earth
	WVPmatrix = utils.multiplyMatrices(projectionMatrix, worldMatrix);
	gl.uniformMatrix4fv(program.pMatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
	gl.uniformMatrix4fv(program.wMatrixUniform, gl.FALSE, utils.transposeMatrix(worldMatrix));

	let matrixTemp = worldMatrix;

	var inverseTransposeMatrix = [matrixTemp[0], matrixTemp[1], matrixTemp[2],
																matrixTemp[4], matrixTemp[5], matrixTemp[6],
																matrixTemp[8], matrixTemp[9], matrixTemp[10]]

	inverseTransposeMatrix = utils.transpose3Matrix(inverseTransposeMatrix)
	gl.uniformMatrix3fv(program.nMatrixUniform, gl.FALSE, utils.invert3Matrix(inverseTransposeMatrix));

	gl.uniform1f(flag, 1.0);

	for (var i = 0; i < unifParArray.length; i++) {
		unifParArray[i].type(gl);
	}

	// draw the world
	gl.drawElements(gl.TRIANGLES, worldMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function printName(id) {
	alert(id);
}

var earth_distance = 1

function distance(p1, p2)
{
	let d = 0;
	for(let i=0; i<p1.length; i++)
		d += (p1[i]-p2[i])*(p1[i]-p2[i])
	return Math.sqrt(d);
}


// todo artoni
function handleMouseClick(event) {
	x = event.clientX - canvas.width / 2;
	y = -(event.clientY - canvas.height / 2);

	earth_distance = lookRadius + lookRadius*Math.cos(45);

	var tollerance = 15;
	for (const [key, value] of Object.entries(positionDictionary)) {
		// todo use distance instead of square
		console.log(x - tollerance, x + tollerance);
		var flagX = x - tollerance <= value.screenX && value.screenX <= x + tollerance;
		var flagY = y - tollerance <= value.screenY && value.screenY <= y + tollerance;
		if(flagX && flagY){

			let dist = distance([cx, cy, cz], [value.worldX, value.worldY ,value.worldZ]);
			// alert("cx" + cx+"cy" + cy+"cz" + cz+"wx" + value.worldX+"wy" + value.worldY+"wz" + value.worldZ)
			// if(earth_distance < dist){
			// 	alert("I don't display it" + key + " ed " +  earth_distance + " dist "+ dist);
			// }
			// else{
			// 	alert(key + " ed " +  earth_distance + " dist "+ dist);
			// }
			chooseCity(key);
			console.log(key, value.screenX, value.screenY, dist, cx, cy, cz, earth_distance);
		}
	}
}

// setup the text for the city name
function makeTextCanvas(text, width, height) {
	var canvasEl = document.createElement("canvas");
	canvasEl.id = 'canvas-' + text;
	canvasEl.className = 'canvas-text-class';

	textCtx = canvasEl.getContext("2d");

	textCtx.canvas.width = width;
	textCtx.canvas.height = height;
	font_dim = width / text.length + 1;
	textCtx.font = font_dim + "px monospace";
	textCtx.textAlign = "center";
	textCtx.textBaseline = "middle";

	textCtx.fillStyle = "rgba(150, 0, 0, 0)";
	textCtx.fillRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);

	textCtx.fillStyle = "white";
	textCtx.fillText(text, width / 2, height / 2);

	return canvasEl;
}

function drawLabel(lat, long, name, index) {
	let currentZoom = lookRadius - 2;
	let scaleFactor = currentZoom / 10;

	if (lat == 90)
		lat = 89;
	var x = parseFloat(fromSphToX(lat, long, 3.5));
	var y = parseFloat(fromSphToY(lat, long, 3.5));
	var z = parseFloat(fromSphToZ(lat, long, 3.5));

	var r = utils.MakeRotateYMatrix(0);

	var t = utils.MakeTranslateMatrix(-y, z, x);
	var r_y = utils.MakeRotateYMatrix(-angle);
	var r_x = utils.MakeRotateXMatrix(elevation);

	var s = utils.MakeScaleMatrix(scaleFactor);

	var labelMatrix = utils.multiplyMatrices(utils.multiplyMatrices(
		utils.multiplyMatrices(t, s), r_y), r_x);

	WVPmatrix = utils.multiplyMatrices(projectionMatrix, labelMatrix);
	gl.uniformMatrix4fv(program.pMatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
	gl.uniformMatrix4fv(program.wMatrixUniform, gl.FALSE, utils.transposeMatrix(worldMatrix));
	gl.uniformMatrix3fv(program.nMatrixUniform, gl.FALSE, utils.identity3Matrix());

	gl.uniform1f(flag, 0.0);

	// render the plane with the text
	renderCube(index + 2);
}

var zanx = 0;

function drawPin(lat, long, name, index) {
	lat = parseFloat(lat);
	long = parseFloat(long);
	let numAbitanti = parseInputAbitanti(c[index].desc.abitanti);
	let numPalazzi = 1;
	let lats = []
	let longs = []


	if (numAbitanti > 500000)
		numPalazzi = 2;
	if (numAbitanti > 5000000)
		numPalazzi = 3;

	lats[0] = lat;
	longs[0] = long;

	if (numPalazzi > 1) {
		lats[0] = lat;
		longs[0] = long + 1;
		lats[1] = lat;
		longs[1] = long - 1;
	}
	if (numPalazzi > 2) {
		lats[2] = lat + 1;
		longs[2] = long;
	}

	for (let iterPalazzi = 0; iterPalazzi < numPalazzi; iterPalazzi++) {
		lat = lats[iterPalazzi];
		long = longs[iterPalazzi];

		var x = parseFloat(fromSphToX(lat, long, 3.15));
		var y = parseFloat(fromSphToY(lat, long, 3.15));
		var z = parseFloat(fromSphToZ(lat, long, 3.15));

		let rescaleFactor = (lookRadius - 2) / 10;
		if (rescaleFactor < 0.2)
			rescaleFactor = 0.3;
		var t = utils.MakeTranslateMatrix(-y - 0.02, z, x);
		var s = utils.MakeScaleMatrix(0.0004 * rescaleFactor);
		var ry = utils.MakeRotateYMatrix(-long);
		var rx = utils.MakeRotateXMatrix(-lat);
		var rz = utils.MakeRotateZMatrix(0);

		pinMatrix = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(
			utils.multiplyMatrices(t, s), ry), rz), rx);

		// rendering the point
		gl.bindBuffer(gl.ARRAY_BUFFER, pinMesh.vertexBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, pinMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, pinMesh.textureBuffer);
		gl.vertexAttribPointer(program.textureCoordAttribute, pinMesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, pinMesh.normalBuffer);
		gl.vertexAttribPointer(program.vertexNormalAttribute, pinMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pinMesh.indexBuffer);
		gl.uniform1i(program.u_textureUniform, 1);
		WVPmatrix = utils.multiplyMatrices(projectionMatrix, pinMatrix);

		gl.uniformMatrix4fv(program.pMatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.wMatrixUniform, gl.FALSE, utils.transposeMatrix(pinMatrix));

		let matrixTemp = pinMatrix;

		var inverseTransposeMatrix = [matrixTemp[0], matrixTemp[1], matrixTemp[2],
																	matrixTemp[4], matrixTemp[5], matrixTemp[6],
																  matrixTemp[8], matrixTemp[9], matrixTemp[10]]
		inverseTransposeMatrix = utils.invert3Matrix(inverseTransposeMatrix)
		gl.uniformMatrix3fv(program.nMatrixUniform, gl.FALSE, inverseTransposeMatrix);

		gl.uniform1f(flag, 0.5);

		for (var i = 0; i < unifParArray.length; i++) {
			unifParArray[i].type(gl);
		}

		gl.drawElements(gl.TRIANGLES, pinMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		// get the screen position of the city
		var screenX = (WVPmatrix[3] / WVPmatrix[15] + 1) * 0.5 * canvas.width - (canvas.width / 2);
		var screenY = (WVPmatrix[7] / WVPmatrix[15] + 1) * 0.5 * canvas.height - (canvas.height / 2);
		positionDictionary[name] = {screenX: screenX, screenY: screenY, worldX: x, worldY:y, worldZ:z, lat:lat, long:long};
	}
}

function parseInputAbitanti(stringAbitanti) {
	let final = stringAbitanti;
	for (i = 0; i < 3; i++)
		final = final.replace('.', '');
	final = final.replace(' ', '');
	return parseInt(final);
}

function radToDeg(rad) {
	return rad * 180 / Math.PI;
}

function fromGeoToSph(lat, long) {
	var a = 6378137;
	var e2 = 6.6943799901377997e-3;
	lat = utils.degToRad(lat);
	var n = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
	var alt = 64;
	lon = utils.degToRad(long)
	ecef_x = (n + alt) * Math.cos(lat) * Math.cos(lon);    //ECEF x
	ecef_y = (n + alt) * Math.cos(lat) * Math.sin(lon);    //ECEF y
	ecef_z = (n * (1 - e2) + alt) * Math.sin(lat);          //ECEF z
	var ray_sphere = Math.sqrt(ecef_x * ecef_x + ecef_y * ecef_y + ecef_z * ecef_z);
	return [radToDeg(Math.acos(ecef_z / ray_sphere)), radToDeg(Math.atan(ecef_y / ecef_x))]
}

function fromSphToX(lat, lng, ray) {
	return ray * Math.cos(utils.degToRad(lat)) * Math.cos(utils.degToRad(lng));
}

function fromSphToY(lat, lng, ray) {
	return ray * Math.cos(utils.degToRad(lat)) * Math.sin(utils.degToRad(lng));
}

function fromSphToZ(lat, lng, ray) {
	return ray * Math.sin(utils.degToRad(lat));
}
