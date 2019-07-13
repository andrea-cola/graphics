// event handler
var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
	console.log("pressed");
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
	var nLookRadius = parseFloat(lookRadius) + event.deltaY / 50.0;
	// console.log("deltaY", event.deltaY);
	// console.log("Nlookradius", nLookRadius);

	if ((nLookRadius > 3.1) && (nLookRadius < 12.0)) {
		lookRadius = nLookRadius;
	}
}

var keyFunctionDown = function (e) {
	if (!keys[e.keyCode]) {
		keys[e.keyCode] = true;
		switch (e.keyCode) {
			case 37:
				//console.log("KeyUp   - Dir LEFT");
				rvy = rvy - 1.0;
				break;
			case 39:
				//console.log("KeyUp   - Dir RIGHT");
				rvy = rvy + 1.0;
				break;
			case 38:
				//console.log("KeyUp   - Dir UP");
				rvx = rvx + 1.0;
				break;
			case 40:
				//console.log("KeyUp   - Dir DOWN");
				rvx = rvx - 1.0;
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
				rvy = rvy + 1.0;
				break;
			case 39:
				//console.log("KeyDown - Dir RIGHT");
				rvy = rvy - 1.0;
				break;
			case 38:
				//console.log("KeyDown - Dir UP");
				rvx = rvx - 1.0;
				break;
			case 40:
				//console.log("KeyDown - Dir DOWN");
				rvx = rvx + 1.0;
				break;
			case 81:
		}
	}
}
