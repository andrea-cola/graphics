var flag = false;
var currentLat;
var currentLong;

function rotate(){
    currentLat = angle;
    currentLong = elevation;

    var lat = 40.718655;
    var long = 74.004589;

    console.log(flag, angle, elevation);

    var points = [];
    for(var i = 0; i < 4; i++)
        points[i] = currentLong + i * (long - currentLong) / 3;

    bezierLoop(0, points)
}

function bezierLoop(alpha, points){
    angle = bezier(alpha, points);
    console.log(alpha, angle);
    if(alpha <= 1)
        setTimeout(function() {
            bezierLoop(alpha + 0.01, points)
        }, 10);
}

function bezier(a, p){
    return Math.pow(1-a, 3) * p[0] + 3 * Math.pow(1-a, 2) * a * p[1] + 3 * (1-a) * Math.pow(a, 2) * p[2] + Math.pow(a, 3) * p[3]; 
}

function reset(){
    angle = 0.01;
    elevation = 0.01;
}