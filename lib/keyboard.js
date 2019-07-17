// event handler
const movementKey = 0.1;
var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;

function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
}
function doMouseUp(event) {
	lastMouseX = -100;
	lastMouseY = -100;
	mouseState = false;
}
function doMouseMove(event) {
	if (mouseState) {
		var dx = event.pageX - lastMouseX;
		var dy = lastMouseY - event.pageY;
		lastMouseX = event.pageX;
		lastMouseY = event.pageY;

		if ((dx != 0) || (dy != 0)) {
			angle = angle + 0.5 * dx;
			elevation = elevation + 0.5 * dy;
		}
	}
}
function doMouseWheel(event) {
	// console.log(lookRadius)
	var nLookRadius = parseFloat(lookRadius) + event.deltaY / 50.0;
	if ((nLookRadius > 3.25) && (nLookRadius < 12.0)) {
		lookRadius = nLookRadius;
	}
}

var keyFunctionDown = function (e) {
	if (!keys[e.keyCode]) {
		keys[e.keyCode] = true;
		switch (e.keyCode) {
			case 37:
				//console.log("KeyUp   - Dir LEFT");
				rvy = rvy - movementKey;
				break;
			case 39:
				//console.log("KeyUp   - Dir RIGHT");
				rvy = rvy + movementKey;
				break;
			case 38:
				//console.log("KeyUp   - Dir UP");
				rvx = rvx + movementKey;
				break;
			case 40:
				//console.log("KeyUp   - Dir DOWN");
				rvx = rvx - movementKey;
				break;
			case 81:
				//console.log("Q   - Dir UP");
				rvz = rvz + movementKey;
				break;
			case 69:
				//console.log("E   - Dir DOWN");
				rvz = rvz - movementKey;
				break;
			case 87:
				cdi = cdi - movementKey*0.1;
				break;
			case 83:
				cdi = cdi + movementKey*0.1;
				break;
			case 65:
				cdx = cdx + movementKey*0.1;
				break;
			case 68:
				cdx = cdx - movementKey*0.1;
				break;
			case 88:
				cdz = cdz + movementKey*0.1;
				break;
			case 90:
				cdz = cdz - movementKey*0.1;
					break;
		}
	}
}

var keyFunctionUp = function (e) {
	if (keys[e.keyCode]) {
		keys[e.keyCode] = false;
		switch (e.keyCode) {
			case 37:
				//console.log("KeyDown  - Dir LEFT");
				rvy = rvy + movementKey;
				break;
			case 39:
				//console.log("KeyDown - Dir RIGHT");
				rvy = rvy - movementKey;
				break;
			case 38:
				//console.log("KeyDown - Dir UP");
				rvx = rvx - movementKey;
				break;
			case 40:
				//console.log("KeyDown - Dir DOWN");
				rvx = rvx + movementKey;
				break;
			case 81:
				//console.log("Q   - Dir UP");
				rvz = rvz - movementKey;
				break;
			case 69:
				//console.log("E   - Dir DOWN");
				rvz = rvz + movementKey;
				break;
			case 87:
				cdi = cdi + movementKey*0.1;
				break;
			case 83:
				cdi = cdi - movementKey*0.1;
				break;
			case 65:
				cdx = cdx - movementKey*0.1;
				break;
			case 68:
				cdx = cdx + movementKey*0.1;
				break;
			case 88:
				cdz = cdz - movementKey*0.1;
				break;
			case 90:
				cdz = cdz + movementKey*0.1;
					break;
		}
	}
}
