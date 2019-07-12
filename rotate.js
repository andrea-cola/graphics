var flag = false;
var oldLat = 0;
var oldLong = 0;
var lat = 0;
var long = 0;
var semaforo_old = 1;
var semaforo_new = 0;
// var current_fov = 60;

var c = [
    {
      "country": "AD",
      "name": "New York",
      // "lat": "40.7128",
      // "lng": "74.0060",
      "lat": "36.7128",
      "lng": "67.0060",
      "fov": "15",
      "zoom": "4",
      "desc": {"abitanti": '8.622.698',
               "densita": '10.998 ab/km²',
               "sindaco": "Bill de Blasio",
               "testo": "Situata sulla cosiddetta baia di New York (New York Bay), " +
               "in parte sul continente e in parte su isole, è amministrativamente divisa in cinque distretti (borough): Manhattan, The Bronx, Queens, Brooklyn e Staten Island. Di essi, uno è nel continente (il Bronx, situato a nord di Manhattan), tre si trovano su isole: (Staten Island, di fronte al New Jersey; Queens e Brooklyn, rispettivamente nell'estremità nord-occidentale e sud-occidentale dell'isola di Long Island) e uno, Manhattan, sull'appendice inferiore della penisola su cui si trova anche il Bronx e che da esso è separato dall'Harlem River, fiume-canale che collega l'Hudson all'East River."}
    },
    {
      "country": "IT",
      "name": "Ospedaletto Lodigiano",
      "lat": "43.16877",
      "lng": "-12.87866",
      // "lat": "45.1660", //45.1660
      // "lng": "-9.5825", //9.5825
      "fov": "5",
      "zoom": "3.5",
      "desc": {"abitanti": '1.989',
               "densita": '230 ab/km²',
               "sindaco": "Lucia Mizzi",
               "testo": "Ospedaletto è un centro agricolo di origine medievale. Nel 1863 Ospedaletto assunse il nome ufficiale di Ospedaletto Lodigiano, per distinguersi da altre località omonime.\n" +
                        "La città diede i natali al musicista Ambrogio Minoja (1752-1825). "}

    },
    {
        "country": "IT",
        "name": "PoloNord",
        "lat": "90",
        "lng": "0",
        "fov": "10",
        "zoom": "3.5",
        "desc": {"abitanti": '1.989',
                 "densita": '230 ab/km²',
                 "sindaco": "Lucia Mizzi",
                 "testo": "Ospedaletto è un centro agricolo di origine medievale. Nel 1863 Ospedaletto assunse il nome ufficiale di Ospedaletto Lodigiano, per distinguersi da altre località omonime.\n" +
                          "La città diede i natali al musicista Ambrogio Minoja (1752-1825). "}

      },
      {
        "country": "IT",
        "name": "Cape Town",
        "lat": "-34.0",
        "lng": "-18.4",
        "fov": "5",
        "desc": {"abitanti": '1.989',
                 "densita": '230 ab/km²',
                 "sindaco": "Lucia Mizzi",
                 "testo": "Ospedaletto è un centro agricolo di origine medievale. Nel 1863 Ospedaletto assunse il nome ufficiale di Ospedaletto Lodigiano, per distinguersi da altre località omonime.\n" +
                          "La città diede i natali al musicista Ambrogio Minoja (1752-1825). "}

      }
        ,
        {
          "country": "IT",
          "name": "RioDeJaneiro",
          "lat": "-22.3",
          "lng": "43.0",
          "fov": "15",
          "desc": {"abitanti": '1.989',
                   "densita": '230 ab/km²',
                   "sindaco": "Lucia Mizzi",
                   "testo": "Ospedaletto è un centro agricolo di origine medievale. Nel 1863 Ospedaletto assunse il nome ufficiale di Ospedaletto Lodigiano, per distinguersi da altre località omonime.\n" +
                            "La città diede i natali al musicista Ambrogio Minoja (1752-1825). "}

        }
];

function rotate(latitudine, longitudine, callback){
    semaforo_old = 1;
    lat = latitudine;
    long = longitudine;

    // generate interpolation points for long.
    var pLong = [];
    for(var i = 0; i < 4; i++){
        pLong[i] = parseFloat(oldLong) + parseFloat(i) * parseFloat((long - oldLong) / 3);
        // console.log(pLong[i]);
    }

    // generate interpolation points for lat.
    var pLat = [];
    for(var i = 0; i < 4; i++){
        pLat[i] = parseFloat(oldLat) + parseFloat(i) * parseFloat((lat - oldLat) / 3); // animate rotation using Bezier curve
        // console.log(pLat[i]);
    }

    bezierLoop(0, pLat, pLong);
    // todo: mostrare informazioni alla fine dell'animazione
    callback();



}

/**
 * Animated rotation of the earth.
 */
function bezierLoop(alpha, pLat, pLong){
    var oldElevation = elevation;
    angle = bezier(alpha, pLong);
    elevation = -bezier(alpha, pLat);
    // console.log(elevation/2)
    adjustLight(angle, elevation/2);

    if(alpha <= 1)
        setTimeout(function() {
            bezierLoop(alpha + 0.01, pLat, pLong)
        }, 10);
    else{
        var w = $("#my-canvas").width();
        var h = $("#my-canvas").height();

        oldLat = lat;
        oldLong = long;

        // console.log("END");
        // console.log(oldLong, angle);
        // console.log(oldLat, elevation);
    }
}

 /**
  * Bezier curve interpolation.
  */
function bezier(a, p){
    return Math.pow(1-a, 3) * p[0] + 3 * Math.pow(1-a, 2) * a * p[1] + 3 * (1-a) * Math.pow(a, 2) * p[2] + Math.pow(a, 3) * p[3];
}


function bezierLoop_zoom(zoom_s, zoom_t, beta){
  console.log(zoom_s, zoom_t, beta, semaforo_old);
  zoom_s = bezier_2_values(zoom_s, zoom_t, beta);
  lookRadius = zoom_s;
  if((beta <= 1)&&(semaforo_old==1)){
    setTimeout(function() {
        bezierLoop_zoom(zoom_s, zoom_t, beta+0.001)
        return;
      }, 10)
  }
  else{
      // semaforo_old = 0;
      // console.log("sema", semaforo_old);
      lookRadius = zoom_t;
      return 1;
  }
  // console.log("end", lookRadius, beta);
}


function bezierLoop_perspective(fov_s, fov_t, w,h, beta){
  fov_s = bezier_2_values(fov_s, fov_t, beta)
  // console.log(fov_s)
  // lookRadius = fov_s;
  // perspectiveMatrix = utils.MakePerspective(fov_s, w / h, 0.1, 1000.0);

  if(beta <= 1)
      setTimeout(function() {
          bezierLoop_perspective(fov_s, fov_t, w,h, beta+0.001)
      }, 10);

  // console.log(b_fov)
}

function bezier_2_values(x, y, beta){
  return (1-beta)*x + beta*y;
}

/**
 * Reset the view to the primar meridian.
 */
function reset(){

    $("#cityDescription").css('visibility',"hidden");

    var w = window.innerWidth;
    var h = window.innerHeight;

    // bazier looping to original position
    // angle = 0.01;
    // elevation = 0.01;
    // bezierLoop(0, 0, 0);
    rotate(0,0, function(){
      return;
    });

    // bezierLoop_perspective(current_fov, 60, w,h, 0);
    // current_fov = 60;
    bezierLoop_zoom(lookRadius, 10, 0);
    // console.log("Going back", lookRadius);
    adjustLight(angle, elevation/2);
    // lookRadius = 10.0;

    // perspectiveMatrix = utils.MakePerspective(current_fov, w / h, 0.1, 1000.0);
}

function adjustLight(a, e){
    // console.log(a, e);
    document.getElementById("LADirPhi").value = -a;
    document.getElementById("LADirTheta").value = 80 + e;
    // console.log(document.getElementById("LADirPhi").value, document.getElementById("LADirTheta").value);
}

function populate(){
    c.forEach(element => {
        $("#cities").append("<li class='city'>" + element.name + "</li>");
    });
}

function chooseCity(city){
    c.forEach(ci => {
        if(city == ci.name){
            rotate(ci.lat, ci.lng, function(){
              //TODO close active windows..
              var w = window.innerWidth;
              var h = window.innerHeight;
              var city_look = ci.zoom;
              // smoothing the zoom
              bezierLoop_zoom(lookRadius, city_look, 0);
              // semaforo_old = temp;
              setTimeout(function() {
                show_description(ci);
                semaforo_old = 0;
              }, 1600);

              // lookRadius = city_look;
              // perspectiveMatrix = utils.MakePerspective(60, 16 / h, 0.1, 1000.0);
            });
        }
    });
}

function select(mouse_x, mouse_y)
{
  gl.useProgram(selector_program);
  var pixel = new window.Uint8Array(4); // A single RGBA value
  gl.readPixels(mouse_x, mouse_y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  console.log(mouse_x, mouse_y, pixel);
  // unproject(mouse_x, mouse_y, 0);
  // let pixel = new window.Uint8Array(4); // A single RGBA value
  //
  // // Render the scene to put each object's ID number into the color buffer.
  // gl.useProgram(selector_program);
  // // render(gl, selector_program);
  //
  // // Convert the canvas coordinate system into an image coordinate system.
  // let canvas = document.getElementById("my-canvas");
  // mouse_y = canvas.clientHeight - mouse_y;
  //
  // // Get the color value from the rendered color buffer.
  // gl.readPixels(mouse_x, mouse_y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  // //gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  // console.log(mouse_y, mouse_x, pixel)
  // // Convert the RGBA color array into a single integer
  // // selected_object_id = convertColor.getID(pixel[0], pixel[1], pixel[2], pixel[3]);
  //
  setTimeout(function(){
    gl.useProgram(program);
    console.log(program);
    // render(gl, program);
  }, 3000);
  return;
}

function unproject(winx,winy,winz){
     // winz is either 0 (near plane), 1 (far plane) or somewhere in between.
      // if it's not given a value we'll produce coords for both.
      if (typeof(winz) == "number") {
        winx = parseFloat(winx);
        winy = parseFloat(winy);
        winz = parseFloat(winz);

        var inf = [];

        var mm = viewMatrix;

        var pm = projectionMatrix;
        // var viewport = [0, 0, pm.width, pm.height];
        var viewport = [0, 0, 16, 9];

        //Calculation for inverting a matrix, compute projection x modelview; then compute the inverse
        // var m = mat4.set(mm, mat4.create());
        // mat4.inverse(m, m);
        // mat4.multiply(pm, m, m);
        // mat4.inverse(m, m);
        var m = utils.invertMatrix(utils.multiplyMatrices(pm, utils.invertMatrix(mm)));
        // Transformation of normalized coordinates between -1 and 1
        inf[0]=(winx-viewport[0])/viewport[2]*2.0-1.0;
        inf[1]=(winy-viewport[1])/viewport[3]*2.0-1.0;
        inf[2]=2.0*winz-1.0;
        inf[3]=1.0;

        //Objects coordinates
        var out = utils.multiplyMatrixVector(m, inf);
        // mat4.multiplyVec4(m, inf, out);
        if(out[3]==0.0)
           return null;

        out[3]=1.0/out[3];
        console.log(out[0]*out[3], out[1]*out[3], out[2]*out[3]);
        return [out[0]*out[3], out[1]*out[3], out[2]*out[3]];
      }
      else
        return [unproject(winx, winy, 0), unproject(winx, winy, 1)];
}

function show_description(element){
  el = $("#cityDescription");
  el.css('visibility',"visible");
  el.html('<button type="button" class="close right" onclick="reset()">&times;</button>' +
          "<h1 class='city'>" + element.name + "</h1>"+
          "<p><b>Abitanti: </b>" + element.desc.abitanti + "</p>"+
          "<p><b>Densità: </b>" + element.desc.densita + "</p>" +
          "<p><b>Sindaco: </b>" + element.desc.sindaco + "</p>"+
          "<h3>Descrizione: </h3><p>" + element.desc.testo + "</p>");
}
