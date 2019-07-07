var reqData = [
	{
		text: "Single directional light, Lambert diffuse only: no specular, no ambient, no emission",
		sel: {
			ambientType: "none",
			diffuseType: "lambert",
			specularType: "none",
			LAlightType: "direct",
			LBlightType: "none",
			LClightType: "none",
			emissionType: "No"
		}
	},
	{
		text: "Single point light with decay, Lambert diffuse, Blinn specular, no ambient and no emission",
		sel: {
			ambientType: "none",
			diffuseType: "lambert",
			specularType: "blinn",
			LAlightType: "point",
			LBlightType: "none",
			LClightType: "none",
			emissionType: "No"
		}
	},
	{
		text: "Single directional light, Lambert diffuse, Phong specular, constant ambient and emission",
		sel: {
			ambientType: "ambient",
			diffuseType: "lambert",
			specularType: "phong",
			LAlightType: "direct",
			LBlightType: "none",
			LClightType: "none",
			emissionType: "Yes"
		}
	},
	{
		text: "Single spot light, Lambert diffuse, Blinn specular, no ambient and no emission",
		sel: {
			ambientType: "none",
			diffuseType: "lambert",
			specularType: "blinn",
			LAlightType: "spot",
			LBlightType: "none",
			LClightType: "none",
			emissionType: "No"
		}
	},
	{
		text: "Single directional light, Cartoon diffuse, Cartoon specular, no ambient but emission",
		sel: {
			ambientType: "none",
			diffuseType: "toon",
			specularType: "toonP",
			LAlightType: "direct",
			LBlightType: "none",
			LClightType: "none",
			emissionType: "Yes"
		}
	},
	{
		text: "Single directional light, no diffuse, phong specular, hemispheric ambient and no emission",
		sel: {
			ambientType: "hemispheric",
			diffuseType: "none",
			specularType: "phong",
			LAlightType: "direct",
			LBlightType: "none",
			LClightType: "none",
			emissionType: "No"
		}
	},
	{
		text: "Three lights: a directional, a point and a spot. Lambert diffuse, phong specular, constant ambient and no emission",
		sel: {
			ambientType: "ambient",
			diffuseType: "lambert",
			specularType: "phong",
			LAlightType: "direct",
			LBlightType: "point",
			LClightType: "spot",
			emissionType: "No"
		}
	}
];

function ChangeShader(delta) {
	curr_Shader = (curr_Shader + delta) % reqData.length;

	if (curr_Shader == 0) {
		document.getElementById("nextButton").style.display = "";
		document.getElementById("prevButton").style.display = "none";
	} else if (curr_Shader == reqData.length - 1) {
		document.getElementById("nextButton").style.display = "none";
		document.getElementById("prevButton").style.display = "";
	} else {
		document.getElementById("nextButton").style.display = "";
		document.getElementById("prevButton").style.display = "";
	}

	document.getElementById("p1").innerHTML = reqData[curr_Shader].text;

	for (var name in reqData[curr_Shader].sel) {
		value = reqData[curr_Shader].sel[name];
		document.getElementById(name).value = value;
		showHideUI(name, value);
	}

	setShader();
}