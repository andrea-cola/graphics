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
      "country": "US",
      "name": "New York",
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
      "name": "Milano",
      "lat": "43.16877",
      "lng": "-12.87866",
      "fov": "5",
      "zoom": "3.5",
      "desc": {"abitanti": '1.350.000',
               "densita": '7.600 ab/km²',
               "sindaco": "Giuseppe Sala",
               "testo": `Fondata intorno al 590 a.C., forse con il nome di Medhelan, nei pressi di un santuario da una tribù celtica facente parte del gruppo degli Insubri e appartenente alla cultura di Golasecca, fu conquistata dagli antichi Romani nel 222 a.C. e in seguito da loro ridenominata Mediolanum. Con il passare dei secoli accrebbe la sua importanza sino a divenire capitale dell'Impero romano d'Occidente, nel cui periodo fu promulgato l'editto di Milano, che concesse a tutti i cittadini, quindi anche ai cristiani, la libertà di onorare le proprie divinità.
               `}
    },
    {
        "country": "RU",
        "name": "PoloNord",
        "lat": "90",
        "lng": "0",
        "fov": "10",
        "zoom": "3.4",
        "desc": {"abitanti": '1',
                 "densita": '0 ab/km²',
                 "sindaco": "Santa Claus",
                 "testo": `Il Polo Nord geografico, chiamato anche vero nord, rappresenta il punto immaginario dell'emisfero boreale in cui l'asse di rotazione terrestre incontra la superficie terrestre o per meglio dire la superficie del geoide. Un altro modo per definirlo è dire che è il punto in cui la latitudine è un angolo retto, ossia è di 90° nord. Il Polo Nord geografico è uno dei due punti della superficie terrestre in cui si incontrano i meridiani, questo significa che se ci si trova esattamente sul polo nord geografico, in qualunque direzione si decida di andare, procedendo in linea retta si andrà sempre verso il sud geografico ossia verso il Polo Sud geografico. `}

      },
      {
        "country": "SA",
        "name": "Cape Town",
        "lat": "-31.5",
        "lng": "-22.4",
        "fov": "5",
        "zoom": "3.6",
        "desc": {"abitanti": '3.500.000',
                 "densita": '1450 ab/km²',
                 "sindaco": "Don Plato",
                 "testo": `Fondata nel 1652, Città del Capo fu il primo insediamento europeo del Sudafrica; di qui il suo soprannome di città madre. Capitale della colonia del Capo prima (1652-1910) e capoluogo della provincia del Capo dopo (1910-1994), tutta la storia del Sudafrica moderno, dallo storico sbarco dei primi coloni olandesi al primo discorso di Nelson Mandela dell'era post-apartheid ha qui lasciato indelebili tracce culturali e architettoniche. Antichi edifici in stile coloniale olandese del Capo e di epoca vittoriana coesistono con moderni grattacieli e lussureggianti giardini botanici. `}
      }
      ,
      {
        "country": "BR",
        "name": "RioDeJaneiro",
        "lat": "-25.3",
        "lng": "39.0",
        "fov": "15",
        "zoom": "4.0",
        "desc": {"abitanti": '6.300.000',
                 "densita": '5585 ab/km²',
                 "sindaco": "Marcelo Crivella",
                 "testo": `L'area su cui sorge Rio de Janeiro venne raggiunta il 1º gennaio del 1502 da esploratori portoghesi nel corso di una spedizione, guidata da Gaspar de Lemos, che comprendeva anche l'italiano Amerigo Vespucci. Poiché gli europei inizialmente credettero che la Baia di Guanabara fosse la foce di un fiume, la chiamarono di fatto "Rio de Janeiro"`}
      },
      {
        "country": "JP",
        "name": "Tokyo",
        "lat": "38.5",
        "lng": "-145.0",
        "fov": "15",
        "zoom": "4.4",
        "desc": {"abitanti": '13.857.443',
                 "densita": '6350 ab/km²',
                 "sindaco": "Koike Yuriko",
                 "testo": `Verso la fine del XVI secolo Tokugawa Ieyasu, uno degli artefici della riunificazione del paese, divenuto il daimyo delle otto province del Kantō, iniziò a edificare la città di Edo, che divenne il centro più importante del territorio da lui controllato. Nel 1603 l'imperatore lo investì del titolo di shōgun, titolo ereditario che rappresentava la massima carica militare, con il quale Ieyasu assunse il controllo del Giappone (l'imperatore veniva in pratica esautorato del potere), dando inizio allo shogunato e all'era Tokugawa, detta anche periodo Edo. Trasferì a Edo la sua sede trasformandola nella capitale de facto del Paese, mentre Kyoto restò la capitale ufficiale e la sede dell'imperatore. `
               }
      }
      ,
      {
        "country": "ID",
        "name": "Bali",
        "lat": "-5.4",
        "lng": "-120.0",
        "fov": "15",
        "zoom": "3.8",
        "desc": {"abitanti": '4.300.000',
                 "densita": '456 ab/km²',
                 "sindaco": "Kabupaten Badung",
                 "testo": `Dopo che una nave portoghese aveva sostato presso la costa di Bukit nel 1585, l'esploratore olandese Cornelis de Houtman sbarcò nel 1597 stabilendo il primo contatto con l'occidente. Gli europei non riuscirono però a stabilire una loro presenza come avevano fatto in molte altre isole dell'arcipelago. Negli anni 1620-1630, il principe Blambangan, di fronte alla minaccia del sultano Agung di Mataram, chiese aiuto alla Compagnia olandese delle Indie orientali, ma gli venne rifiutato. Blambangan si rivolse quindi al Dewa Agung (re) di Gelgel di Bali, e le forze balinesi sconfissero il sultano Agung nel 1635. `}
      },
      {
        "country": "RU",
        "name": "Mosca",
        "lat": "55.4",
        "lng": "-37.6",
        "fov": "15",
        "zoom": "4.3",
        "desc": {"abitanti": '12.506.468',
                 "densita": '2671 ab/km²',
                 "sindaco": "Sergej Sobjanin",
                 "testo": `Il primo riferimento storico a Mosca è datato 1147, quando era un'oscura città di una piccola provincia con una tribù finnica (i Merja) e in un'antica cronaca russa si narra che il principe russo Jurij Dolgorukij invitò il principe Svjatoslav di Novgorod-Severskij, nonché suo alleato, a visitare il villaggio: «Vieni da me, fratello, vieni a Mosca!».
                          Nel 1156, il principe Jurij Dolgorukij fortificò la città, cingendola di mura. Dopo il saccheggio del 1237-1238, quando i Mongoli la rasero al suolo uccidendone tutti gli abitanti, Mosca fu ricostruita e divenne la capitale d'un principato indipendente. `}
      },
      {
        "country": "IN",
        "name": "Mumbai",
        "lat": "19",
        "lng": "-77.9",
        "fov": "15",
        "zoom": "4.5",
        "desc": {"abitanti": '18.450.000',
                 "densita": '21.000 ab/km²',
                 "sindaco": "Vishwanath Mahadeshwar",
                 "testo": `Il nome "Mumbai" etimologicamente proviene da Mumba o Maha-Amba, il nome della dea indù Mumbadevi, e da Aai, che significa madre in lingua marathi.[6] Il nome tradizionale "Bombay" ha la sua origine nel XVI secolo, quando i portoghesi arrivati nella zona utilizzarono diversi nomi basandosi sulla forma locale, e così consolidarono l'uso del termine "Bombaim", ancora oggi utilizzato in maniera abituale in portoghese. I britannici, che iniziarono ad arrivare in India nel secolo XVII, adattarono il nome di "Bombay". Durante il dominio britannico sull'India, la pronuncia “Mumbai” o “Mambai" fu utilizzata in marathi e gujarati, mentre la forma “Bambai” lo fu in indostano e in persiano.[7] Il 4 maggio 1995, il governo del Maharashtra approvò la ridenominazione della città in "Mumbai", dopo molti anni di pressioni politiche a questo riguardo. Il vecchio nome è talvolta utilizzato in India su base informale e appare ancora nei nomi di alcune istituzioni ufficiali e organismi privati. `}
      },
      {
        "country": "AU",
        "name": "Sidney",
        "lat": "-34",
        "lng": "-150.9",
        "fov": "15",
        "zoom": "3.5",
        "desc": {"abitanti": '5.200.000',
                 "densita": '415 ab/km²',
                 "sindaco": "Clover Moore",
                 "testo": `L'area che circonda il Sydney Harbour è stata abitata, per almeno 45 000 anni, da diverse tribù aborigene, che la chiamavano Warrane; le principali tribù della zona erano gli Eora e i Cadigal. Benché l'urbanizzazione abbia cancellato la maggior parte delle tracce di questi insediamenti, si trovano ancora dipinti rupestri in alcune zone. Gli europei iniziarono a interessarsi della zona a partire dal 1770, anno in cui il capitano James Cook avvistò Botany Bay (oggi un sobborgo meridionale di Sydney). Per ordine del governo britannico, nel 1788 Arthur Phillip fondò in questa zona un insediamento carcerario. Phillip sbarcò inizialmente a Botany Bay, ma decise poi di far vela verso nord e fondò l'insediamento definitivo a Sydney Cove, presso Port Jackson. `}

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
    }

    // generate interpolation points for lat.
    var pLat = [];
    for(var i = 0; i < 4; i++){
        pLat[i] = parseFloat(oldLat) + parseFloat(i) * parseFloat((lat - oldLat) / 3); // animate rotation using Bezier curve
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
    }
}

 /**
  * Bezier curve interpolation.
  */
function bezier(a, p){
    return Math.pow(1-a, 3) * p[0] + 3 * Math.pow(1-a, 2) * a * p[1] + 3 * (1-a) * Math.pow(a, 2) * p[2] + Math.pow(a, 3) * p[3];
}


function bezierLoop_zoom(zoom_s, zoom_t, beta){
  zoom_s = bezier_2_values(zoom_s, zoom_t, beta);
  lookRadius = zoom_s;
  if((beta <= 1)&&(semaforo_old==1)){
    setTimeout(function() {
        bezierLoop_zoom(zoom_s, zoom_t, beta+0.001)
        return;
      }, 10)
  }
  else{
      lookRadius = zoom_t;
      return 1;
  }
}


function bezierLoop_perspective(fov_s, fov_t, w,h, beta){
  fov_s = bezier_2_values(fov_s, fov_t, beta)
  // lookRadius = fov_s;
  // perspectiveMatrix = utils.MakePerspective(fov_s, w / h, 0.1, 1000.0);

  if(beta <= 1)
      setTimeout(function() {
          bezierLoop_perspective(fov_s, fov_t, w,h, beta+0.001)
      }, 10);
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
      setTimeout(function() {
        semaforo_old = 0;
      }, 1600);
      return;
    });

    // bezierLoop_perspective(current_fov, 60, w,h, 0);
    // current_fov = 60;
    bezierLoop_zoom(lookRadius, 10, 0);
    adjustLight(angle, elevation/2);
    // lookRadius = 10.0;

    // perspectiveMatrix = utils.MakePerspective(current_fov, w / h, 0.1, 1000.0);
}

function adjustLight(a, e){
    document.getElementById("LADirPhi").value = -a;
    document.getElementById("LADirTheta").value = 80 + e;
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
