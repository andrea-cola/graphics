var flag = false;
var currentLat;
var currentLong;
var lat;
var long;

function rotate(){
    currentLat = angle;
    currentLong = elevation;

    lat = 10;
    long = 74.004589;

    // generate interpolation points for long.
    var pLong = [];
    for(var i = 0; i < 4; i++)
        pLong[i] = currentLong + i * (long - currentLong) / 3;

    // generate interpolation points for lat.
    var pLat = [];
    for(var i = 0; i < 4; i++)
        pLat[i] = currentLat + i * (lat - currentLat) / 3;

    // animate rotation using Bezier curve
    bezierLoop(0, pLat, pLong);
}

/**
 * Animated rotation of the earth. 
 */
function bezierLoop(alpha, pLat, pLong){
    var oldElevation = elevation;
    angle = bezier(alpha, pLong);
    elevation = -bezier(alpha, pLat);
    adjustLight(angle, elevation - oldElevation);
    
    if(alpha <= 1)
        setTimeout(function() {
            bezierLoop(alpha + 0.01, pLat, pLong)
        }, 10);
}

 /**
  * Bezier curve interpolation.
  */
function bezier(a, p){
    return Math.pow(1-a, 3) * p[0] + 3 * Math.pow(1-a, 2) * a * p[1] + 3 * (1-a) * Math.pow(a, 2) * p[2] + Math.pow(a, 3) * p[3]; 
}

/**
 * Reset the view to the primar meridian.
 */
function reset(){
    angle = 0.01;
    elevation = 0.01;
}

function adjustLight(angle, lat){
    document.getElementById("LADirPhi").value = -angle;
    document.getElementById("LADirTheta").value = document.getElementById("LADirTheta").value - lat;
    console.log(document.getElementById("LADirPhi").value, document.getElementById("LADirTheta").value);
}