function shaders() {
// The shader can find the required informations in the following variables:

//vec3 fs_pos;			// Position of the point in 3D space
//
//vec3 LAPos;			// Position of first (or single) light
//vec3 LADir;			// Direction of first (or single) light
//float LAConeOut;		// Outer cone (in degree) of the light (if spot)
//float LAConeIn;		// Inner cone (in percentage of the outher cone) of the light (if spot)
//float LADecay;		// Decay factor (0, 1 or 2)
//float LATarget;		// Target distance
//vec4 LAlightColor;	// color of the first light
//		
//vec3 LBPos;			// Same as above, but for the second light
//vec3 LBDir;
//float LBConeOut;
//float LBConeIn;
//float LBDecay;
//float LBTarget;
//vec4 LBlightColor;
//
//vec3 LCPos;			// Same as above, but for the third one
//vec3 LCDir;
//float LCConeOut;
//float LCConeIn;
//float LCDecay;
//float LCTarget;
//vec4 LClightColor;
//
//vec4 ambientLightColor;		// Ambient light color. For hemispheric, this is the color on the top
//vec4 ambientLightLowColor;	// For hemispheric ambient, this is the bottom color
//vec3 ADir;					// For hemispheric ambient, this is the up direction
//
//float SpecShine;				// specular coefficient for both blinn and phong
//float DToonTh;				// Threshold for diffuse in a toon shader
//float SToonTh;				// Threshold for specular in a toon shader
//
//vec4 diffColor;				// diffuse color
//vec4 ambColor;				// material ambient color
//vec4 specularColor;			// specular color
//vec4 emit;					// emitted color
//	
//vec3 normalVec;				// direction of the normal vecotr to the surface
//vec3 eyedirVec;				// looking direction
//
//
// Final color is returned into:
//vec4 out_color;

// Single directional light, Lambert diffuse only: no specular, no ambient, no emission
// l * md * clamp

var S1 = `
	out_color = LAlightColor * diffColor * clamp(dot(normalVec, LADir), 0.0, 1.0);
`;

// Single point light with decay, Lambert diffuse, Blinn specular, no ambient and no emission
var S2 = `
	float g = LATarget / distance(LAPos, fs_pos);
	vec3 dist_normalized = normalize(LAPos - fs_pos);
	vec3 h = normalize(dist_normalized + eyedirVec);
	
	vec4 L = LAlightColor * pow(g, LADecay);
	vec4 fr_1 = diffColor * clamp(dot(normalVec, dist_normalized), 0.0, 1.0);
	vec4 fr_2 = specularColor * pow(clamp(dot(normalVec, h), 0.0, 1.0), SpecShine);
	
	out_color = L * (fr_1 + fr_2);
`;

// Single directional light, Lambert diffuse, Phong specular, constant ambient and emission
var S3 = `
	vec3 r = 2.0*(normalVec * dot(LADir, normalVec)) - LADir;

	vec4 L = LAlightColor;
	vec4 fr_1 = diffColor * clamp(dot(normalVec, LADir), 0.0, 1.0);
	vec4 fr_2 = specularColor * pow(clamp(dot(eyedirVec, r), 0.0, 1.0), SpecShine);

	out_color = clamp(L * (fr_1 + fr_2) + ambientLightColor*ambColor + emit, 0.0, 1.0);
`;

// Single spot light (with decay), Lambert diffuse, Blinn specular, no ambient and no emission
var S4 = `
	vec3 lx = normalize(LAPos - fs_pos);
	float cin = cos(radians(LAConeIn * LAConeOut * 0.5));
	float cout = cos(radians(LAConeOut * 0.5));

	float g_decay = pow(LATarget / distance(LAPos, fs_pos), LADecay);
	float cl = clamp((dot(lx, LADir) - cout) / (cin - cout), 0.0, 1.0);

	vec4 L = LAlightColor * g_decay * cl;
	vec4 fr_1 = diffColor * clamp(dot(lx, normalVec), 0.0, 1.0);

	vec3 h = normalize(lx + eyedirVec);
	vec4 fr_2 = specularColor * pow(clamp(dot(normalVec, h), 0.0, 1.0), SpecShine);

	out_color = L * (fr_1 + fr_2);
`;

// Single directional light, Cartoon diffuse, Cartoon specular, no ambient but emission
var S5 = `
	vec4 L = LAlightColor;

	vec3 lx = normalize(LAPos - fs_pos);
	
	vec4 fd;
	if(DToonTh < dot(lx, normalVec))
		fd = diffColor;

	vec3 r = 2.0 * normalVec * dot(lx, normalVec) - lx;
	vec4 fs;
	if(SToonTh < dot(eyedirVec, r))
		fs = specularColor;

	out_color = clamp(L * (fd + fs) + emit, 0.0, 1.0);
`;

// Single directional light, no diffuse, phong specular, hemispheric ambient and no emission
var S6 = `
	vec4 L = LAlightColor;
	
	vec3 r = 2.0*(normalVec * dot(LADir, normalVec)) - LADir;
	vec4 fs = specularColor * pow(clamp(dot(eyedirVec, r), 0.0, 1.0), SpecShine);

	vec4 ambient = ambientLightColor * (dot(normalVec, LADir) + 1.0)/2.0 + ambientLightLowColor * (1.0 - dot(normalVec, ADir))/2.0;

	out_color = clamp(L * fs + ambient * ambColor, 0.0, 1.0);
`;

// Three lights: a directional, a point and a spot. Lambert diffuse, phong specular, constant ambient and no emission
var S7 = `
	float cin = cos(radians(LCConeIn * LCConeOut * 0.5));
	float cout = cos(radians(LCConeOut * 0.5));
	vec3 lx = normalize(LCPos - fs_pos);

	vec3 rA = 2.0*(normalVec * dot(LADir, normalVec)) - LADir;
	vec3 rB = 2.0*(normalVec * dot(normalize(LBPos - fs_pos), normalVec)) - normalize(LBPos - fs_pos);	
	vec3 rC = 2.0*(normalVec * dot(normalize(LCPos - fs_pos), normalVec)) - normalize(LCPos - fs_pos);	

	vec4 fdA = diffColor * clamp(dot(normalVec, LADir), 0.0, 1.0);
	vec4 fdB = diffColor * clamp(dot(normalVec, normalize(LBPos - fs_pos)), 0.0, 1.0);
	vec4 fdC = diffColor * clamp(dot(normalVec, normalize(LCPos - fs_pos)), 0.0, 1.0);

	vec4 fsA = specularColor * pow(clamp(dot(eyedirVec, rA), 0.0, 1.0), SpecShine);
	vec4 fsB = specularColor * pow(clamp(dot(eyedirVec, rB), 0.0, 1.0), SpecShine);
	vec4 fsC = specularColor * pow(clamp(dot(eyedirVec, rC), 0.0, 1.0), SpecShine);

	vec4 la = LAlightColor * (fdA + fsA);
	vec4 lb = LBlightColor * pow(LBTarget / distance(LBPos, fs_pos), LBDecay) * (fdB + fsB);
	vec4 lc = LClightColor * pow(LBTarget / distance(LBPos, fs_pos), LBDecay) * clamp((dot(lx, LCDir) - cout) / (cin - cout), 0.0, 1.0) * (fdC + fsC);

	out_color = clamp(la + lb + lc + ambientLightColor*ambColor, 0.0, 1.0);
`;
	return [S1, S2, S3, S4, S5, S6, S7];
}

function fixCamera() {
	var S2 = `
		float g = LATarget / distance(LAPos, fs_pos);
		vec3 dist_normalized = normalize(LAPos - fs_pos);
		vec3 h = normalize(dist_normalized + eyedirVec);
		
		vec4 L = LAlightColor * pow(g, LADecay);
		vec4 fr_1 = diffColor * clamp(dot(normalVec, dist_normalized), 0.0, 1.0);
		vec4 fr_2 = specularColor * pow(clamp(dot(normalVec, h), 0.0, 1.0), SpecShine);
		
		out_color = L;
	`;
}