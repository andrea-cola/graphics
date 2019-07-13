var canvas;
var object_color = 0;
var gl = null,
	program = null,
	labelMesh = null,
	worldMesh = null,
	carMesh = null,
	skybox = null,
	imgtx = null,
	imgtx2 = null,
	imgtx3 = [],
	skyboxLattx = null,
	skyboxTbtx = null;

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
var elevation = 0.01;
var angle = 0.01;
var roll = 0.01;

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

// Vertex shader
var vs = `#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define UV_LOCATION 2

layout(location = POSITION_LOCATION) in vec3 in_pos;
layout(location = NORMAL_LOCATION) in vec3 in_norm;
layout(location = UV_LOCATION) in vec2 in_uv;

// in vec4 a_position;

uniform mat4 pMatrix;
uniform mat4 wMatrix;

out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;

void main() {
	fs_pos = (wMatrix * vec4(in_pos, 1.0)).xyz;
	fs_norm = in_norm;
	fs_uv = vec2(in_uv.x, 1.0-in_uv.y);

	gl_Position = pMatrix * vec4(in_pos, 1.0);
}`;


// Fragment shader
var fs1 = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform sampler2D u_texture;
uniform vec3 eyePos;

uniform vec4 ambientType;
uniform vec4 diffuseType;
uniform vec4 specularType;
uniform vec4 emissionType;

uniform vec4 LAlightType;
uniform vec3 LAPos;
uniform vec3 LADir;
uniform float LAConeOut;
uniform float LAConeIn;
uniform float LADecay;
uniform float LATarget;
uniform vec4 LAlightColor;

uniform vec4 LBlightType;
uniform vec3 LBPos;
uniform vec3 LBDir;
uniform float LBConeOut;
uniform float LBConeIn;
uniform float LBDecay;
uniform float LBTarget;
uniform vec4 LBlightColor;

uniform vec4 LClightType;
uniform vec3 LCPos;
uniform vec3 LCDir;
uniform float LCConeOut;
uniform float LCConeIn;
uniform float LCDecay;
uniform float LCTarget;
uniform vec4 LClightColor;

uniform vec4 ambientLightColor;
uniform vec4 ambientLightLowColor;
uniform vec3 ADir;
uniform vec4 diffuseColor;
uniform float DTexMix;
uniform vec4 specularColor;
uniform float SpecShine;
uniform float DToonTh;
uniform float SToonTh;
uniform vec4 ambientMatColor;
uniform vec4 emitColor;

out vec4 color;

vec3 compLightDir(vec3 LPos, vec3 LDir, vec4 lightType) {
	//lights
	// -> Point
	vec3 pointLightDir = normalize(LPos - fs_pos);
	// -> Direct
	vec3 directLightDir = LDir;
	// -> Spot
	vec3 spotLightDir = normalize(LPos - fs_pos);

	return            directLightDir * lightType.x +
					  pointLightDir * lightType.y +
					  spotLightDir * lightType.z;
}

vec4 compLightColor(vec4 lightColor, float LTarget, float LDecay, vec3 LPos, vec3 LDir,
					float LConeOut, float LConeIn, vec4 lightType) {
	float LCosOut = cos(radians(LConeOut / 2.0));
	float LCosIn = cos(radians(LConeOut * LConeIn / 2.0));

	//lights
	// -> Point
	vec4 pointLightCol = lightColor * pow(LTarget / length(LPos - fs_pos), LDecay);
	// -> Direct
	vec4 directLightCol = lightColor;
	// -> Spot
	vec3 spotLightDir = normalize(LPos - fs_pos);
	float CosAngle = dot(spotLightDir, LDir);
	vec4 spotLightCol = lightColor * pow(LTarget / length(LPos - fs_pos), LDecay) *
						clamp((CosAngle - LCosOut) / (LCosIn - LCosOut), 0.0, 1.0);
	// ----> Select final component
	return          directLightCol * lightType.x +
					pointLightCol * lightType.y +
					spotLightCol * lightType.z;
}

vec4 compDiffuse(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec4 diffColor) {
	// Diffuse
	// --> Lambert
	vec4 diffuseLambert = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0) * diffColor;
	// --> Toon
	vec4 ToonCol;
	if(dot(normalVec, lightDir) > DToonTh) {
		ToonCol = diffColor;
	} else {
		ToonCol = vec4(0.0, 0.0, 0.0, 1.0);
	}
	vec4 diffuseToon = lightCol * ToonCol;
	// ----> Select final component
	return         diffuseLambert * diffuseType.x +
				   diffuseToon * diffuseType.y;
}

vec4 compSpecular(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec3 eyedirVec) {
	// Specular
	// --> Phong
	vec3 reflection = -reflect(lightDir, normalVec);
	vec4 specularPhong = lightCol * pow(max(dot(reflection, eyedirVec), 0.0), SpecShine) * specularColor;
	// --> Blinn
	vec3 halfVec = normalize(lightDir + eyedirVec);
	vec4 specularBlinn = lightCol * pow(max(dot(normalVec, halfVec), 0.0), SpecShine) * specularColor;
	// --> Toon Phong
	vec4 ToonSpecPCol;
	if(dot(reflection, eyedirVec) > SToonTh) {
		ToonSpecPCol = specularColor;
	} else {
		ToonSpecPCol = vec4(0.0, 0.0, 0.0, 1.0);
	}
	vec4 specularToonP = lightCol * ToonSpecPCol;
	// --> Toon Blinn
	vec4 ToonSpecBCol;
	if(dot(normalVec, halfVec) > SToonTh) {
		ToonSpecBCol = specularColor;
	} else {
		ToonSpecBCol = vec4(0.0, 0.0, 0.0, 1.0);
	}
	vec4 specularToonB = lightCol * ToonSpecBCol;
	// ----> Select final component
	return          specularPhong * specularType.x +
					specularBlinn * specularType.y +
					specularToonP * specularType.z +
					specularToonB * specularType.w;
}

void main() {
	vec4 texcol = texture(u_texture, fs_uv);
	vec4 diffColor = diffuseColor * (1.0-DTexMix) + texcol * DTexMix;
	vec4 ambColor = ambientMatColor * (1.0-DTexMix) + texcol * DTexMix;
	vec4 emit = (emitColor * (1.0-DTexMix) +
				    texcol * DTexMix *
				   			max(max(emitColor.r, emitColor.g), emitColor.b)) * emissionType.r;

	vec3 normalVec = normalize(fs_norm);
	vec3 eyedirVec = normalize(eyePos - fs_pos);

	//lights
	vec3 LAlightDir = compLightDir(LAPos, LADir, LAlightType);
	vec4 LAlightCol = compLightColor(LAlightColor, LATarget, LADecay, LAPos, LADir,
								     LAConeOut, LAConeIn, LAlightType);

	vec3 LBlightDir = compLightDir(LBPos, LBDir, LBlightType);
	vec4 LBlightCol = compLightColor(LBlightColor, LBTarget, LBDecay, LBPos, LBDir,
								     LBConeOut, LBConeIn, LBlightType);

	vec3 LClightDir = compLightDir(LCPos, LCDir, LClightType);
	vec4 LClightCol = compLightColor(LClightColor, LCTarget, LCDecay, LCPos, LCDir,
								     LCConeOut, LCConeIn, LClightType);

	// Ambient
	// --> Ambient
	vec4 ambientAmbient = ambientLightColor * ambColor;
	// --> Hemispheric
	float amBlend = (dot(normalVec, ADir) + 1.0) / 2.0;
	vec4 ambientHemi = (ambientLightColor * amBlend + ambientLightLowColor * (1.0 - amBlend)) * ambColor;
	// ----> Select final component
	vec4 ambient = ambientAmbient * ambientType.x +
				   ambientHemi * ambientType.y;

	// Diffuse
	vec4 diffuse = compDiffuse(LAlightDir, LAlightCol, normalVec, diffColor) +
				   compDiffuse(LBlightDir, LBlightCol, normalVec, diffColor) +
				   compDiffuse(LClightDir, LClightCol, normalVec, diffColor);

	// Specular
	// --> Phong
	vec4 specular = compSpecular(LAlightDir, LAlightCol, normalVec, eyedirVec) +
					compSpecular(LBlightDir, LBlightCol, normalVec, eyedirVec) +
					compSpecular(LClightDir, LClightCol, normalVec, eyedirVec);


	// final steps
	vec4 out_color = clamp(ambient + diffuse + specular + emit, 0.0, 1.0);

	color = vec4(out_color.rgb, 1.0);

	if(out_color.a < 0.001)
  	discard;
}`;

var fs3 = `
	color = vec4(0.7,0.8,0.9, 1.0);
}`;

// UI helper arrays
UIonOff = {
	LAlightType: {
		none: {
			LA13: false, LA14: false,
			LA21: false, LA22: false, LA23: false, LA24: false,
			LA31: false, LA32: false, LA33: false, LA34: false,
			LA41: false, LA42: false, LA43: false, LA44: false,
			LA51: false, LA52: false, LA53: false, LA54: false,
			LA61: false, LA62: false
		},
		direct: {
			LA13: true, LA14: true,
			LA21: false, LA22: false, LA23: false, LA24: false,
			LA31: false, LA32: false, LA33: false, LA34: false,
			LA41: false, LA42: false, LA43: false, LA44: false,
			LA51: true, LA52: true, LA53: false, LA54: false,
			LA61: true, LA62: true
		},
		point: {
			LA13: true, LA14: true,
			LA21: true, LA22: true, LA23: true, LA24: true,
			LA31: true, LA32: true, LA33: true, LA34: true,
			LA41: true, LA42: true, LA43: false, LA44: false,
			LA51: false, LA52: false, LA53: false, LA54: false,
			LA61: false, LA62: false
		},
		spot: {
			LA13: true, LA14: true,
			LA21: true, LA22: true, LA23: true, LA24: true,
			LA31: true, LA32: true, LA33: true, LA34: true,
			LA41: true, LA42: true, LA43: true, LA44: true,
			LA51: true, LA52: true, LA53: true, LA54: true,
			LA61: true, LA62: true
		}
	},
	LBlightType: {
		none: {
			LB13: false, LB14: false,
			LB21: false, LB22: false, LB23: false, LB24: false,
			LB31: false, LB32: false, LB33: false, LB34: false,
			LB41: false, LB42: false, LB43: false, LB44: false,
			LB51: false, LB52: false, LB53: false, LB54: false,
			LB61: false, LB62: false
		},
		direct: {
			LB13: true, LB14: true,
			LB21: false, LB22: false, LB23: false, LB24: false,
			LB31: false, LB32: false, LB33: false, LB34: false,
			LB41: false, LB42: false, LB43: false, LB44: false,
			LB51: true, LB52: true, LB53: false, LB54: false,
			LB61: true, LB62: true
		},
		point: {
			LB13: true, LB14: true,
			LB21: true, LB22: true, LB23: true, LB24: true,
			LB31: true, LB32: true, LB33: true, LB34: true,
			LB41: true, LB42: true, LB43: false, LB44: false,
			LB51: false, LB52: false, LB53: false, LB54: false,
			LB61: false, LB62: false
		},
		spot: {
			LB13: true, LB14: true,
			LB21: true, LB22: true, LB23: true, LB24: true,
			LB31: true, LB32: true, LB33: true, LB34: true,
			LB41: true, LB42: true, LB43: true, LB44: true,
			LB51: true, LB52: true, LB53: true, LB54: true,
			LB61: true, LB62: true
		}
	},
	LClightType: {
		none: {
			LC13: false, LC14: false,
			LC21: false, LC22: false, LC23: false, LC24: false,
			LC31: false, LC32: false, LC33: false, LC34: false,
			LC41: false, LC42: false, LC43: false, LC44: false,
			LC51: false, LC52: false, LC53: false, LC54: false,
			LC61: false, LC62: false
		},
		direct: {
			LC13: true, LC14: true,
			LC21: false, LC22: false, LC23: false, LC24: false,
			LC31: false, LC32: false, LC33: false, LC34: false,
			LC41: false, LC42: false, LC43: false, LC44: false,
			LC51: true, LC52: true, LC53: false, LC54: false,
			LC61: true, LC62: true
		},
		point: {
			LC13: true, LC14: true,
			LC21: true, LC22: true, LC23: true, LC24: true,
			LC31: true, LC32: true, LC33: true, LC34: true,
			LC41: true, LC42: true, LC43: false, LC44: false,
			LC51: false, LC52: false, LC53: false, LC54: false,
			LC61: false, LC62: false
		},
		spot: {
			LC13: true, LC14: true,
			LC21: true, LC22: true, LC23: true, LC24: true,
			LC31: true, LC32: true, LC33: true, LC34: true,
			LC41: true, LC42: true, LC43: true, LC44: true,
			LC51: true, LC52: true, LC53: true, LC54: true,
			LC61: true, LC62: true
		}
	},
	ambientType: {
		none: {
			A20: false, A21: false, A22: false,
			A31: false, A32: false,
			A41: false, A42: false,
			A51: false, A52: false,
			MA0: false, MA1: false, MA2: false
		},
		ambient: {
			A20: false, A21: true, A22: true,
			A31: false, A32: false,
			A41: false, A42: false,
			A51: false, A52: false,
			MA0: true, MA1: true, MA2: true
		},
		hemispheric: {
			A20: true, A21: false, A22: true,
			A31: true, A32: true,
			A41: true, A42: true,
			A51: true, A52: true,
			MA0: true, MA1: true, MA2: true
		}
	},
	diffuseType: {
		none: {
			D21: false, D22: false,
			D41: false, D42: false
		},
		lambert: {
			D21: true, D22: true,
			D41: false, D42: false
		},
		toon: {
			D21: true, D22: true,
			D41: true, D42: true
		}
	},
	specularType: {
		none: {
			S21: false, S22: false,
			S31: false, S32: false,
			S41: false, S42: false
		},
		phong: {
			S21: true, S22: true,
			S31: true, S32: true,
			S41: false, S42: false
		},
		blinn: {
			S21: true, S22: true,
			S31: true, S32: true,
			S41: false, S42: false
		},
		toonP: {
			S21: true, S22: true,
			S31: false, S32: false,
			S41: true, S42: true
		},
		toonB: {
			S21: true, S22: true,
			S31: false, S32: false,
			S41: true, S42: true
		}
	},
	emissionType: {
		Yes: { ME1: true, ME2: true },
		No: { ME1: false, ME2: false }
	}
}

function showHideUI(tag, sel) {
	for (var name in UIonOff[tag][sel]) {
		document.getElementById(name).style.display = UIonOff[tag][sel][name] ? "block" : "none";
	}
}

function showLight(sel) {
	// document.getElementById("LA").style.display = (sel == "LA") ? "block" : "none";
	document.getElementById("LB").style.display = (sel == "LB") ? "block" : "none";
	document.getElementById("LC").style.display = (sel == "LC") ? "block" : "none";
}

defShaderParams = {
	ambientType: "ambient",
	diffuseType: "lambert",
	specularType: "none",
	ambientLightColor: "#222222",
	diffuseColor: "#00ffff",
	specularColor: "#ffffff",
	ambientLightLowColor: "#002200",
	ambientMatColor: "#00ffff",
	emitColor: "#000000",

	LAlightType: "direct",
	LAlightColor: "#ffffff",
	LAPosX: 20,
	LAPosY: 30,
	LAPosZ: 50,
	LADirTheta: 60,
	LADirPhi: 45,
	LAConeOut: 30,
	LAConeIn: 80,
	LADecay: 0,
	LATarget: 61,

	LBlightType: "none",
	LBlightColor: "#ffffff",
	LBPosX: -40,
	LBPosY: 30,
	LBPosZ: 50,
	LBDirTheta: 60,
	LBDirPhi: 135,
	LBConeOut: 30,
	LBConeIn: 80,
	LBDecay: 0,
	LBTarget: 61,

	LClightType: "none",
	LClightColor: "#ffffff",
	LCPosX: 60,
	LCPosY: 30,
	LCPosZ: 50,
	LCDirTheta: 60,
	LCDirPhi: -45,
	LCConeOut: 30,
	LCConeIn: 80,
	LCDecay: 0,
	LCTarget: 61,

	ADirTheta: 0,
	ADirPhi: 0,
	DTexMix: 100,
	SpecShine: 100,
	DToonTh: 50,
	SToonTh: 90,

	emissionType: "No"
}

function resetShaderParams() {
	for (var name in defShaderParams) {
		value = defShaderParams[name];
		document.getElementById(name).value = value;
		if (document.getElementById(name).type == "select-one") {
			showHideUI(name, value);
		}
	}

	cx = 0.0;
	cy = 0.0;
	cz = 6.5;
	elevation = 0.01;
	angle = 0.01;
	roll = 0.01;
	lookRadius = 10.0;

	if (gl) {
		setWorldMesh();
	}
}

function unifPar(pHTML, pGLSL, type) {
	this.pHTML = pHTML;
	this.pGLSL = pGLSL;
	this.type = type;
}

function noAutoSet(gl) {
}

function val(gl) {
	gl.uniform1f(program[this.pGLSL + "Uniform"], document.getElementById(this.pHTML).value);
}

function valD10(gl) {
	gl.uniform1f(program[this.pGLSL + "Uniform"], document.getElementById(this.pHTML).value / 10);
}

function valD100(gl) {
	gl.uniform1f(program[this.pGLSL + "Uniform"], document.getElementById(this.pHTML).value / 100);
}

function valCol(gl) {
	col = document.getElementById(this.pHTML).value.substring(1, 7);
	R = parseInt(col.substring(0, 2), 16) / 255;
	G = parseInt(col.substring(2, 4), 16) / 255;
	B = parseInt(col.substring(4, 6), 16) / 255;
	gl.uniform4f(program[this.pGLSL + "Uniform"], R, G, B, 1);
}

function valVec3(gl) {
	gl.uniform3f(program[this.pGLSL + "Uniform"],
		document.getElementById(this.pHTML + "X").value / 10,
		document.getElementById(this.pHTML + "Y").value / 10,
		document.getElementById(this.pHTML + "Z").value / 10);
}

function valDir(gl) {
	var t = utils.degToRad(document.getElementById(this.pHTML + "Theta").value);
	var p = utils.degToRad(document.getElementById(this.pHTML + "Phi").value);
	gl.uniform3f(program[this.pGLSL + "Uniform"], Math.sin(t) * Math.sin(p), Math.cos(t), Math.sin(t) * Math.cos(p));
}

valTypeDecoder = {
	LAlightType: {
		none: [0, 0, 0, 0],
		direct: [1, 0, 0, 0],
		point: [0, 1, 0, 0],
		spot: [0, 0, 1, 0]
	},
	LBlightType: {
		none: [0, 0, 0, 0],
		direct: [1, 0, 0, 0],
		point: [0, 1, 0, 0],
		spot: [0, 0, 1, 0]
	},
	LClightType: {
		none: [0, 0, 0, 0],
		direct: [1, 0, 0, 0],
		point: [0, 1, 0, 0],
		spot: [0, 0, 1, 0]
	},
	ambientType: {
		none: [0, 0, 0, 0],
		ambient: [1, 0, 0, 0],
		hemispheric: [0, 1, 0, 0]
	},
	diffuseType: {
		none: [0, 0, 0, 0],
		lambert: [1, 0, 0, 0],
		toon: [0, 1, 0, 0]
	},
	specularType: {
		none: [0, 0, 0, 0],
		phong: [1, 0, 0, 0],
		blinn: [0, 1, 0, 0],
		toonP: [0, 0, 1, 0],
		toonB: [0, 0, 0, 1]
	}
}

function valType(gl) {
	var v = valTypeDecoder[this.pHTML][document.getElementById(this.pHTML).value];
	gl.uniform4f(program[this.pGLSL + "Uniform"], v[0], v[1], v[2], v[3]);
}

unifParArray = [
	new unifPar("ambientType", "ambientType", valType),
	new unifPar("diffuseType", "diffuseType", valType),
	new unifPar("specularType", "specularType", valType),

	new unifPar("LAlightType", "LAlightType", valType),
	new unifPar("LAPos", "LAPos", valVec3),
	new unifPar("LADir", "LADir", valDir),
	new unifPar("LAConeOut", "LAConeOut", val),
	new unifPar("LAConeIn", "LAConeIn", valD100),
	new unifPar("LADecay", "LADecay", val),
	new unifPar("LATarget", "LATarget", valD10),
	new unifPar("LAlightColor", "LAlightColor", valCol),

	new unifPar("LBlightType", "LBlightType", valType),
	new unifPar("LBPos", "LBPos", valVec3),
	new unifPar("LBDir", "LBDir", valDir),
	new unifPar("LBConeOut", "LBConeOut", val),
	new unifPar("LBConeIn", "LBConeIn", valD100),
	new unifPar("LBDecay", "LBDecay", val),
	new unifPar("LBTarget", "LBTarget", valD10),
	new unifPar("LBlightColor", "LBlightColor", valCol),

	new unifPar("LClightType", "LClightType", valType),
	new unifPar("LCPos", "LCPos", valVec3),
	new unifPar("LCDir", "LCDir", valDir),
	new unifPar("LCConeOut", "LCConeOut", val),
	new unifPar("LCConeIn", "LCConeIn", valD100),
	new unifPar("LCDecay", "LCDecay", val),
	new unifPar("LCTarget", "LCTarget", valD10),
	new unifPar("LClightColor", "LClightColor", valCol),

	new unifPar("ambientLightColor", "ambientLightColor", valCol),
	new unifPar("ambientLightLowColor", "ambientLightLowColor", valCol),
	new unifPar("ADir", "ADir", valDir),
	new unifPar("diffuseColor", "diffuseColor", valCol),
	new unifPar("DTexMix", "DTexMix", valD100),
	new unifPar("specularColor", "specularColor", valCol),
	new unifPar("SpecShine", "SpecShine", val),
	new unifPar("DToonTh", "DToonTh", valD100),
	new unifPar("SToonTh", "SToonTh", valD100),
	new unifPar("ambientMatColor", "ambientMatColor", valCol),
	new unifPar("emitColor", "emitColor", valCol),
	new unifPar("", "u_texture", noAutoSet),
	new unifPar("", "pMatrix", noAutoSet),
	new unifPar("", "wMatrix", noAutoSet),
	new unifPar("", "eyePos", noAutoSet)
];



function setWorldMesh() {
	// Load mesh using the webgl-obj-loader library
	worldMesh = new OBJ.Mesh(worldObjStr);
	imgtx = new Image();
	imgtx.txNum = 0;
	imgtx.onload = textureLoaderCallback;
	imgtx.src = WorldTextureData;

	worldScale = 1;
	// var objStr = document.getElementById('my_cube.obj').innerHTML;
	// console.log(cubeObjStr)
	// console.log(worldObjStr)
	// console.log(carObjStr)
	carMesh = new OBJ.Mesh(worldObjStr);
	imgtx2 = new Image();
	imgtx2.txNum = 1;
	imgtx2.onload = textureLoaderCallback;
	imgtx2.src = CarTextureData;

	// labelMesh = new OBJ.Mesh(cubeObjStr);

	OBJ.initMeshBuffers(gl, worldMesh);
	OBJ.initMeshBuffers(gl, carMesh);
	// OBJ.initMeshBuffers(gl, labelMesh);



	document.getElementById("diffuseColor").value = "#00ffff";
	document.getElementById("ambientMatColor").value = "#00ffff";
}

// texture loader callback
var textureLoaderCallback = function () {
	console.log("Loading texture in textureLoaderCallback")
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

var textureLabelLoaderCallback = function () {
	console.log("Loading texture in textureLabelLoaderCallback")
	console.log(this);
	var textureId = gl.createTexture();
	let city_index = this.txNum - 2;
	// console.log(carMatrix);
	// var canvas_2d = document.getElementById("text");
	let textCanvas = makeTextCanvas(c[city_index].name, 100, 60);
	console.log(textCanvas, c[city_index].name, this.txNum);
	// console.log(this)
	gl.activeTexture(gl.TEXTURE0 + this.txNum);

	gl.bindTexture(gl.TEXTURE_2D, textureId);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	// gl.bindTexture(gl.TEXTURE_2D, null);
	gl.generateMipmap(gl.TEXTURE_2D);
	// fill texture with 3x2 pixels
// 	var texture = gl.createTexture();
// gl.bindTexture(gl.TEXTURE_2D, texture);
// 	const level = 0;
// 	const internalFormat = gl.LUMINANCE;
// 	const width = 3;
// 	const height = 2;
// 	const border = 0;
// 	const format = gl.LUMINANCE;
// 	const type = gl.UNSIGNED_BYTE;
// 	const data = new Uint8Array([
// 	  128,  64, 128,
// 	    0, 192,   0,
// 	]);
// 	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
// 	              format, type, data);
//
// 	// set the filtering so we don't need mips and it's not filtered
// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

function setShader() {

	// Compile and link shaders
	program = gl.createProgram();
	var v1 = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(v1, vs);
	gl.compileShader(v1);
	if (!gl.getShaderParameter(v1, gl.COMPILE_STATUS)) {
		alert("ERROR IN VS SHADER : " + gl.getShaderInfoLog(v1));
	}
	var v2 = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(v2, fs1);
	gl.compileShader(v2);
	if (!gl.getShaderParameter(v2, gl.COMPILE_STATUS)) {
		alert("ERROR IN FS SHADER : " + gl.getShaderInfoLog(v2));
	}
	gl.attachShader(program, v1);
	gl.attachShader(program, v2);

	gl.linkProgram(program);
	gl.useProgram(program);
	console.log(program);
	// links mesh attributes to shader attributes
	program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
	gl.enableVertexAttribArray(program.vertexPositionAttribute);

	program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
	gl.enableVertexAttribArray(program.vertexNormalAttribute);

	program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
	gl.enableVertexAttribArray(program.textureCoordAttribute);

	for (var i = 0; i < unifParArray.length; i++) {
		program[unifParArray[i].pGLSL + "Uniform"] = gl.getUniformLocation(program, unifParArray[i].pGLSL);
	}
}

function initSquareBuffer() {
  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();
  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Now create an array of positions for the square.
  const positions = [
    -1.0,  1.0,
     1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer.position);
	gl.vertexAttribPointer(
			program.vertexPositionAttribute,
			2,
			gl.FLOAT,
			false,
			0,
			0);
	gl.enableVertexAttribArray(
	program.vertexPositionAttribute);
  return {
    position: positionBuffer,
  };
}

// The real app starts here
function main() {
	resetShaderParams();
	// setup everything else
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

	try {
		gl = canvas.getContext("webgl2");
	} catch (e) {
		console.log(e);
	}

	if (gl) {
		curr_Shader = -1;


		setShader();
		// gl.disable(gl.BLEND);
		// gl.depthMask(true);
		setWorldMesh();
		// gl.enable(gl.BLEND);
		// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		// gl.depthMask(false);

		initBuffersCube();

		for(let index=0; index<c.length; index++)
			initCubeTexture(index+2);

		// initSquareBuffer();
		// prepares the world, view and projection matrices.
		var w = canvas.clientWidth;
		var h = canvas.clientHeight;

		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.viewport(0.0, 0.0, w, h);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

function drawScene() {
	// update WV matrix
	angle = angle + rvy;
	elevation = elevation + rvx;

	// set the camera view
	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);

	// Magic for moving the car
	worldMatrix = utils.MakeScaleMatrix(worldScale);
	projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);

	gl.bindBuffer(gl.ARRAY_BUFFER, worldMesh.vertexBuffer);
	gl.vertexAttribPointer(program.vertexPositionAttribute, worldMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, worldMesh.textureBuffer);
	gl.vertexAttribPointer(program.textureCoordAttribute, worldMesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, worldMesh.normalBuffer);
	gl.vertexAttribPointer(program.vertexNormalAttribute, worldMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, worldMesh.indexBuffer);

	gl.uniform1i(program.u_textureUniform, 0);
	gl.uniform3f(program.eyePosUniform, cx, cy, cz);
	WVPmatrix = utils.multiplyMatrices(projectionMatrix, worldMatrix);
	gl.uniformMatrix4fv(program.pMatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
	gl.uniformMatrix4fv(program.wMatrixUniform, gl.FALSE, utils.transposeMatrix(worldMatrix));

	for (var i = 0; i < unifParArray.length; i++) {
		unifParArray[i].type(gl);
	}

	gl.drawElements(gl.TRIANGLES, worldMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);



	//create a texture per each text
	// for(let i=0; i<c.length, i++){
	//
	// }

	for(let i=0; i<c.length; i++){
		drawLabel(c[i].lat, c[i].lng, c[i].name, i);
	}


	for(let i=0; i<c.length; i++){
		drawPin(c[i].lat, c[i].lng, c[i].name, i);
	}



	window.requestAnimationFrame(drawScene);
}


function makeTextCanvas(text, width, height) {
	var canvasEl = document.createElement("canvas");
	canvasEl.id = 'canvas-'+text;
	canvasEl.className = 'canvas-text-class';
	// console.log(canvasEl)
	textCtx = canvasEl.getContext("2d");

	textCtx.canvas.width  = width;
	textCtx.canvas.height = height;
	font_dim = width/text.length +1;
	// console.log(font_dim)
	textCtx.font = font_dim +"px monospace";
	textCtx.textAlign = "center";
	textCtx.textBaseline = "middle";

	textCtx.fillStyle = "rgba(150, 0, 0, 0)";
	textCtx.fillRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);


	textCtx.fillStyle = "white";
	textCtx.fillText(text, width / 2, height / 2);
	console.log(text);
	return canvasEl;
}

function placeObjectOnPlanet(object, lat, lon, radius) {
    var latRad = lat * (Math.PI / 180);
    var lonRad = -lon * (Math.PI / 180);
}

function drawLabel(lat,long,name, index){
	// console.log(name, index, index-2)
	var increment_lat = 0;
	let currentZoom = lookRadius-2;
	let scaleFactor = currentZoom/10;
	//
	// if(currentZoom < 4 && lat >0)
	// 	increment_lat = 0.03;
	// 	scaleFactor = 1;
	// if(currentZoom < 4 && lat >0)
	// 	increment_lat = -0.03;
	// if(lat<0)
	// 	increment_lat = -1;
	if(lat==90)
		lat = 89;
	var x = parseFloat(fromSphToX(lat, long, 3.3));
	var y = parseFloat(fromSphToY(lat, long, 3.3));
	var z = parseFloat(fromSphToZ(lat, long, 3.3));

	var r = utils.MakeRotateYMatrix(0);

	var t = utils.MakeTranslateMatrix(-y, z, x);
	var r_y = utils.MakeRotateYMatrix(-angle);
	var r_x = utils.MakeRotateXMatrix(elevation);

	var s = utils.MakeScaleMatrix(scaleFactor);

	var labelMatrix = utils.multiplyMatrices(utils.multiplyMatrices(
		utils.multiplyMatrices(t, s), r_y), r_x);
	// rendering the label
	// gl.bindBuffer(gl.ARRAY_BUFFER, labelMesh.vertexBuffer);
	// gl.vertexAttribPointer(program.vertexPositionAttribute, labelMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// // gl.bindBuffer(gl.ARRAY_BUFFER, labelMesh.textureBuffer);
	// // gl.vertexAttribPointer(program.textureCoordAttribute, labelMesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// gl.bindBuffer(gl.ARRAY_BUFFER, labelMesh.normalBuffer);
	// gl.vertexAttribPointer(program.vertexNormalAttribute, labelMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, labelMesh.indexBuffer);

	// initBuffersCube();
	// initCubeTexture(index+2);


	// gl.uniform1i(program.u_textureUniform, index+2);
	WVPmatrix = utils.multiplyMatrices(projectionMatrix, labelMatrix);
	gl.uniformMatrix4fv(program.pMatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
	gl.uniformMatrix4fv(program.wMatrixUniform, gl.FALSE, utils.transposeMatrix(worldMatrix));

	renderCube(index+2);

	// gl.drawElements(gl.TRIANGLE_STRIP, labelMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	// gl.drawArrays(gl.TRIANGLE_STRIP, labelMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}

function drawPin(lat, long, name, index){
	magic = fromGeoToSph(lat, long);

	var x = parseFloat(fromSphToX(lat, long, 3.2));
	var y = parseFloat(fromSphToY(lat, long, 3.2));
	var z = parseFloat(fromSphToZ(lat, long, 3.2));

	// console.log(lat, long, x, y, z);
	var t = utils.MakeTranslateMatrix(-y-0.02, z, x);
	var s = utils.MakeScaleMatrix(0.05);
	var r = utils.MakeRotateYMatrix(0);
	carMatrix = utils.multiplyMatrices(utils.multiplyMatrices(t, s), r);

	// rendering the point
	gl.bindBuffer(gl.ARRAY_BUFFER, carMesh.vertexBuffer);
	gl.vertexAttribPointer(program.vertexPositionAttribute, carMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, carMesh.textureBuffer);
	gl.vertexAttribPointer(program.textureCoordAttribute, carMesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, carMesh.normalBuffer);
	gl.vertexAttribPointer(program.vertexNormalAttribute, carMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, carMesh.indexBuffer);
	gl.uniform1i(program.u_textureUniform, 1);
	WVPmatrix = utils.multiplyMatrices(projectionMatrix, carMatrix);
	gl.uniformMatrix4fv(program.pMatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
	gl.uniformMatrix4fv(program.wMatrixUniform, gl.FALSE, utils.transposeMatrix(worldMatrix));

	for (var i = 0; i < unifParArray.length; i++) {
		unifParArray[i].type(gl);
	}

	gl.drawElements(gl.TRIANGLES, carMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

var zax = 0;
function radToDeg(rad){
	return rad * 180 / Math.PI;
}

function fromGeoToSph(lat, long){
	// datas are in meters
	// lon = -lon;
	var a = 6378137;
	var e2 = 6.6943799901377997e-3;
	lat = utils.degToRad(lat);
	var n = a/Math.sqrt( 1 - e2*Math.sin( lat )*Math.sin( lat ));
	var alt = 64;
	lon = utils.degToRad(long)
	ecef_x = ( n + alt )*Math.cos( lat )*Math.cos( lon );    //ECEF x
	ecef_y = ( n + alt )*Math.cos( lat )*Math.sin( lon );    //ECEF y
	ecef_z = ( n*(1 - e2 ) + alt )*Math.sin( lat );          //ECEF z
	var ray_sphere = Math.sqrt(ecef_x*ecef_x + ecef_y*ecef_y + ecef_z*ecef_z);
	return [radToDeg(Math.acos(ecef_z/ray_sphere)), radToDeg(Math.atan(ecef_y/ecef_x))]
}

function fromSphToX(lat, lng, ray){
	return ray * Math.cos(utils.degToRad(lat)) * Math.cos(utils.degToRad(lng));
}

function fromSphToY(lat, lng, ray){
	return ray * Math.cos(utils.degToRad(lat)) * Math.sin(utils.degToRad(lng));
}

function fromSphToZ(lat, lng, ray){
	return ray * Math.sin(utils.degToRad(lat));
}
