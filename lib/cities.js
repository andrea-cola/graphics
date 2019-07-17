
var c = [
    {
      "country": "US",
      "name": "New York",
      "lat": "36.7128",
      "lng": "67.0060",
      "fov": "15",
      "zoom": "4.3",
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
      "zoom": "3.8",
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
        "zoom": "3.7",
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
        "zoom": "3.9",
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
        "zoom": "4.3",
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
        "zoom": "4.7",
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
        "zoom": "4.1",
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
        "zoom": "4.7",
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
        "zoom": "4.8",
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
        "zoom": "3.8",
        "desc": {"abitanti": '5.200.000',
                 "densita": '415 ab/km²',
                 "sindaco": "Clover Moore",
                 "testo": `L'area che circonda il Sydney Harbour è stata abitata, per almeno 45 000 anni, da diverse tribù aborigene, che la chiamavano Warrane; le principali tribù della zona erano gli Eora e i Cadigal. Benché l'urbanizzazione abbia cancellato la maggior parte delle tracce di questi insediamenti, si trovano ancora dipinti rupestri in alcune zone. Gli europei iniziarono a interessarsi della zona a partire dal 1770, anno in cui il capitano James Cook avvistò Botany Bay (oggi un sobborgo meridionale di Sydney). Per ordine del governo britannico, nel 1788 Arthur Phillip fondò in questa zona un insediamento carcerario. Phillip sbarcò inizialmente a Botany Bay, ma decise poi di far vela verso nord e fondò l'insediamento definitivo a Sydney Cove, presso Port Jackson. `}

      }
];
