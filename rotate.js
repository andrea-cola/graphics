var flag = false;
var currentLat;
var currentLong;

function rotate(){
    currentLat = angle;
    currentLong = elevation;

    var lat = 40.718655;
    var long = 74.004589;

    // generate interpolation points for long.
    var pLong = [];
    for(var i = 0; i < 4; i++)
        pLong[i] = currentLong + i * (long - currentLong) / 3;

    // generate interpolation points for lat.
    var pLat = [];
    for(var i = 0; i < 4; i++)
        pLat[i] = currentLat + i * (lat - currentLat) / 3;

    bezierLoop(0, pLat, pLong)
}

/**
 * Animated rotation of the earth. 
 */
function bezierLoop(alpha, pLat, pLong){
    angle = bezier(alpha, pLong);
    elevation = bezier(alpha, pLat);
    
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