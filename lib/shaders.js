
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
uniform mat3 nMatrix;

out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;

void main() {
	fs_pos = (wMatrix * vec4(in_pos, 1.0)).xyz;
	fs_norm = (nMatrix * vec3(in_norm)).xyz;
	fs_uv = vec2(in_uv.x, 1.0-in_uv.y);

	gl_Position = pMatrix * vec4(in_pos, 1.0);
}`;


// Fragment shader
var fs1 = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform float flag;
uniform float select_flag;


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

	if(select_flag == 1.0) {
		emit = vec4(0.6, 0.8, 0.2, 0.7);
	}

	vec4 out_color = clamp(ambient + diffuse + specular + emit, 0.0, 1.0);

	// final steps
	if(flag == 0.0) {
		if(ambient.a < 1.0)
			discard;
		out_color = clamp(vec4(1.0, 1.0, 1.0, 1.0), 0.0, 1.0);
	}



	color = vec4(out_color.rgb, 1.0);
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
	LADirTheta: 90,
	LADirPhi: 0,
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
	new unifPar("", "nMatrix", noAutoSet),
	new unifPar("", "eyePos", noAutoSet),
];
