var flag = false;
var oldLat = 0;
var oldLong = 0;
var lat = 0;
var long = 0;

var c = [
    {
      "country": "AD",
      "name": "New York",
      "lat": "36.7128",
      "lng": "68.0060"
    },
    {
      "country": "IT",
      "name": "Ospedaletto Lodigiano",
      "lat": "43.16877",
      "lng": "-12.87866"
    }
];

function rotate(latitudine, longitudine){
    lat = latitudine;
    long = longitudine;

    // generate interpolation points for long.
    var pLong = [];
    for(var i = 0; i < 4; i++){
        pLong[i] = parseFloat(oldLong) + parseFloat(i) * parseFloat((long - oldLong) / 3);
        console.log(pLong[i]);
    }

    // generate interpolation points for lat.
    var pLat = [];
    for(var i = 0; i < 4; i++){
        pLat[i] = parseFloat(oldLat) + parseFloat(i) * parseFloat((lat - oldLat) / 3); // animate rotation using Bezier curve
        console.log(pLat[i]);
    }

    bezierLoop(0, pLat, pLong);
}

/**
 * Animated rotation of the earth. 
 */
function bezierLoop(alpha, pLat, pLong){
    var oldElevation = elevation;
    angle = bezier(alpha, pLong);
    elevation = -bezier(alpha, pLat);
    console.log(elevation/2)
    adjustLight(angle, elevation/2);
    
    if(alpha <= 1)
        setTimeout(function() {
            bezierLoop(alpha + 0.01, pLat, pLong)
        }, 10);
    else{
        var w = $("#my-canvas").width();
        var h = $("#my-canvas").height();
        //placeMarker(w/2, h/2);

        oldLat = lat;
        oldLong = long;

        console.log("END");
        console.log(oldLong, angle);
        console.log(oldLat, elevation);
    }
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

function adjustLight(a, e){
    console.log(a, e);
    document.getElementById("LADirPhi").value = -a;
    document.getElementById("LADirTheta").value = 80 + e;
    console.log(document.getElementById("LADirPhi").value, document.getElementById("LADirTheta").value);
}

function populate(){
    c.forEach(element => {
        $("#cities").append("<li class='city'>" + element.name + "</li>");
    });
}

function chooseCity(city){
    c.forEach(ci => {
        if(city == ci.name){
            rotate(ci.lat, ci.lng);
        }
    });
}