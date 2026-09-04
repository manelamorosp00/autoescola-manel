/* =========================================================
   Banc de preguntes i lògica d'examens — Autoescola Manel
   Preguntes d'elaboració pròpia seguint l'estil i la
   normativa general de trànsit (RGC/DGT). No és el banc
   oficial de la DGT.
   ========================================================= */

export const CATS = {

  senyals_reglament:"Senyals de reglamentació",
  senyals_perill:"Senyals de perill",
  senyals_indicacio:"Senyals d'indicació",
  marques_vials:"Marques vials",
  normes_general:"Normes generals de circulació",
  alcohol_drogues:"Alcohol i drogues",
  seguretat_passiva:"Seguretat passiva",
  llums:"Enllumenat i llums",
  autopista:"Autopistes i autovies",
  documentacio:"Documentació i assegurança",
  mecanica:"Manteniment i mecànica",
  primers_auxilis:"Primers auxilis",
  factor_humans:"Factor humà",
  sancions:"Sancions i carnet per punts",
  estacionament:"Aturada i estacionament",
  usuaris_vulnerables:"Vianants, ciclistes i VMP",
  prioritat:"Prioritat de pas"
};

export const Q = [

// ---- senyals_reglament ----
{c:"senyals_reglament",q:"Un senyal circular de fons blanc i vora vermella, sense cap altre dibuix, indica:",o:["Prohibit el pas a tot vehicle","Direcció obligatòria","Final de totes les prohibicions","Cediu el pas"],a:0,e:"El cercle blanc amb vora vermella i sense símbol és el senyal de prohibició d'entrada a tot vehicle."},
{c:"senyals_reglament",q:"Un senyal circular de fons blau amb una fletxa blanca indica:",o:["Direcció prohibida","Sentit obligatori en la direcció indicada","Carrer sense sortida","Zona de vianants"],a:1,e:"Els senyals blaus circulars marquen obligacions, en aquest cas seguir la direcció de la fletxa."},
{c:"senyals_reglament",q:"El senyal de STOP obliga a:",o:["Reduir la velocitat sense aturar-se si no ve ningú","Aturar-se completament encara que no vingui cap vehicle","Aturar-se només de nit","Tocar el clàxon abans de creuar"],a:1,e:"El STOP obliga sempre a una aturada total abans de la línia de detenció, hi hagi trànsit o no."},
{c:"senyals_reglament",q:"Un triangle invertit de vora vermella significa:",o:["Perill genèric","Cediu el pas","Prohibit avançar","Intersecció amb prioritat"],a:1,e:"El triangle invertit és el senyal de Cediu el pas."},
{c:"senyals_reglament",q:"El senyal circular blau amb una bicicleta blanca indica:",o:["Prohibit circular en bicicleta","Via reservada a ciclistes","Perill per presència de ciclistes","Zona de lloguer de bicicletes"],a:1,e:"Els senyals blaus d'obligació amb un símbol indiquen la via o carril reservat a aquest tipus d'usuari."},
{c:"senyals_reglament",q:"Un senyal circular de fons blanc amb el número 50 dins una vora vermella significa:",o:["Velocitat mínima de 50 km/h","Fi de la limitació de 50 km/h","Velocitat màxima autoritzada 50 km/h","Distància mínima de 50 m entre vehicles"],a:2,e:"El cercle amb vora vermella i un número indica la velocitat màxima permesa en aquell tram."},
{c:"senyals_reglament",q:"Quan un senyal de limitació de velocitat va acompanyat d'una banda diagonal negra sobre el mateix número, significa:",o:["Que la limitació és només per a camions","Fi de la prohibició o restricció indicada","Que cal reduir encara més la velocitat","Que la velocitat mínima és la indicada"],a:1,e:"La banda diagonal negra sobre el senyal n'indica el final de la restricció."},
{c:"senyals_reglament",q:"El senyal circular blanc amb una vora vermella i la silueta d'un camió significa:",o:["Prohibit l'avançament a camions","Prohibida l'entrada a vehicles de mercaderies del tipus indicat","Zona de càrrega i descàrrega","Pas obligatori per a camions"],a:1,e:"És un senyal de prohibició d'entrada específic per al tipus de vehicle representat."},
{c:"senyals_reglament",q:"Un senyal rectangular blau amb una 'P' blanca indica:",o:["Prioritat de pas","Zona d'estacionament permès","Prohibit aturar-se","Perill de pendent"],a:1,e:"La 'P' blanca sobre fons blau senyalitza una zona on es permet estacionar."},

// ---- senyals_perill ----
{c:"senyals_perill",q:"Els senyals de perill (triangle groc/vermell) s'han de col·locar, en carretera convencional, a una distància del perill de:",o:["Just al costat del perill","Entre 150 i 250 m abans","No cal cap distància fixa","Només després del perill"],a:1,e:"En vies convencionals el senyal de perill sol situar-se uns 150-250 m abans per donar temps de reacció."},
{c:"senyals_perill",q:"Un triangle amb el dibuix d'una fletxa que es corba bruscament indica:",o:["Revolt perillós","Carretera amb doble sentit","Final de l'autopista","Zona escolar"],a:0,e:"Adverteix de la proximitat d'un revolt o successió de revolts perillosos."},
{c:"senyals_perill",q:"Un triangle amb el dibuix de dos infants indica:",o:["Zona de joc infantil llunyana","Proximitat d'un centre escolar o zona amb presència d'infants","Obligació de portar infants amb cinturó","Prohibit el pas a infants sols"],a:1,e:"Adverteix de la proximitat d'una zona amb possible presència d'infants, com escoles."},
{c:"senyals_perill",q:"Un triangle amb una creu (aspa) indica:",o:["Perill per encreuament amb via sense prioritat","Pas a nivell sense barreres","Fi de tota prohibició","Zona d'obres"],a:1,e:"Aquest senyal avisa d'un pas a nivell de ferrocarril sense barreres."},
{c:"senyals_perill",q:"El senyal de perill amb el dibuix d'una calçada llenegant significa:",o:["Ferm en mal estat només en cas de pluja","Calçada relliscosa; cal reduir velocitat i evitar frenades brusques","Prohibit circular amb pneumàtics llisos","Zona de rentat de vehicles"],a:1,e:"Indica risc de pèrdua d'adherència; cal moderar la velocitat i evitar maniobres brusques."},
{c:"senyals_perill",q:"Un triangle amb el dibuix d'animals domèstics indica:",o:["Zona de pastura obligatòria","Possible presència d'animals a la calçada","Prohibit el transport d'animals","Servei veterinari proper"],a:1,e:"Adverteix que hi pot haver bestiar o animals travessant o a prop de la via."},
{c:"senyals_perill",q:"El senyal de perill que mostra un encreuament en forma de creu simple indica:",o:["Intersecció amb una via de característiques similars, sense prioritat clara","Prohibit girar","Rotonda propera","Final de l'autovia"],a:0,e:"Avisa d'una intersecció on cap de les vies té preferència marcada per senyal."},
{c:"senyals_perill",q:"Un triangle amb un signe d'exclamació dins significa:",o:["Perill indefinit, sovint acompanyat d'un rètol explicatiu","Prohibit tot tipus de vehicle","Zona de silenci","Obligació de parar a totes les interseccions"],a:0,e:"S'utilitza per a perills que no tenen un pictograma específic; sol portar un panell addicional."},

// ---- senyals_indicacio ----
{c:"senyals_indicacio",q:"Un rètol rectangular blau amb una 'H' blanca indica:",o:["Hotel proper","Hospital","Autopista d'accés lliure","Zona d'aparcament per a discapacitats"],a:1,e:"La 'H' sobre fons blau indica la proximitat o direcció a un hospital."},
{c:"senyals_indicacio",q:"Un senyal quadrat blau amb una figura de vianant caminant indica:",o:["Pas de vianants elevat","Camí o zona reservada per a vianants","Prohibit el pas a vianants","Zona escolar"],a:1,e:"Els senyals quadrats/rectangulars blaus solen indicar informació o serveis, en aquest cas via per a vianants."},
{c:"senyals_indicacio",q:"El senyal que indica 'Autopista' (rectangle blau amb el dibuix esquemàtic d'una via ràpida) marca:",o:["El començament del tram d'autopista","Àrea de descans","Peatge obligatori a 500 m","Fi del límit de velocitat"],a:0,e:"Aquest panell senyalitza l'inici d'un tram d'autopista, amb les seves normes específiques."},
{c:"senyals_indicacio",q:"Un rètol amb fons verd i lletres blanques normalment s'utilitza per indicar:",o:["Direccions dins de nucli urbà","Direccions a través de vies ràpides o autovies","Zones de perill permanent","Prohibicions temporals"],a:1,e:"El fons verd s'associa a itineraris per autovia o carretera de doble calçada."},
{c:"senyals_indicacio",q:"Un panell blanc amb lletres negres, situat en direccions, sol indicar:",o:["Itinerari per carreteres convencionals","Només zones industrials","Prohibicions de circulació","Límits de velocitat variables"],a:0,e:"El fons blanc s'usa habitualment per a itineraris per carretera convencional."},

// ---- marques_vials ----
{c:"marques_vials",q:"Una línia contínua groga vora la vorera significa:",o:["Prohibida l'aturada i l'estacionament","Prohibit només l'estacionament, es pot aturar","Zona de càrrega lliure","Pas de vianants"],a:0,e:"La línia groga contínua a la vorada prohibeix tant l'aturada com l'estacionament."},
{c:"marques_vials",q:"Una línia longitudinal contínua a la calçada significa:",o:["Es pot avançar si hi ha visibilitat suficient","Prohibit creuar-la o circular-hi per sobre per avançar o girar a l'esquerra","Només s'aplica a camions","Marca merament informativa"],a:1,e:"La línia contínua no es pot traspassar, ni per avançar ni per canviar de carril, tret d'excepcions molt concretes."},
{c:"marques_vials",q:"Quan la línia longitudinal és discontínua, això significa:",o:["Es pot avançar o canviar de carril amb precaució si les condicions ho permeten","Està prohibit avançar sempre","Indica el centre exacte de la calçada sense cap altre efecte","Només es pot circular per un carril"],a:0,e:"La línia discontínua permet creuar-la per avançar o canviar de carril quan és segur fer-ho."},
{c:"marques_vials",q:"Una fletxa blanca pintada al terra dins d'un carril indica:",o:["Una simple decoració sense valor normatiu","La direcció o direccions obligatòries que ha de seguir el vehicle en aquell carril","Zona de gir prohibit","Límit de velocitat del carril"],a:1,e:"Les fletxes de selecció de carrils marquen les direccions que s'han de seguir obligatòriament des d'aquell carril."},
{c:"marques_vials",q:"Un pas de vianants es marca amb:",o:["Línies transversals contínues formant bandes","Una sola línia discontínua","Un triangle groc al terra","Cercles blancs"],a:0,e:"El pas de vianants es representa amb bandes blanques transversals a la calçada."},
{c:"marques_vials",q:"Les marques en zigzag grogues a la vorera indiquen:",o:["Zona d'estacionament reservat a taxis","Prohibició d'aturada, sovint davant de parades de bus o sortides d'emergència","Carril bici","Zona de velocitat reduïda obligatòria"],a:1,e:"El zigzag groc marca zones on cal mantenir l'accés lliure, com parades de transport públic."},

// ---- normes_general ----
{c:"normes_general",q:"La distància de seguretat amb el vehicle del davant s'ha de calcular tenint en compte, entre altres factors:",o:["Només el color del vehicle propi","La velocitat, l'estat de la via i el temps de reacció","La marca del vehicle del davant","El nombre de persones al vehicle"],a:1,e:"La distància de seguretat depèn de la velocitat, les condicions de la via i el temps de reacció del conductor."},
{c:"normes_general",q:"En un avançament, un cop finalitzat, el conductor ha de:",o:["Mantenir-se al carril esquerre indefinidament","Reincorporar-se al seu carril tan aviat com sigui possible sense entorpir","Frenar bruscament per avisar","Fer llums llargues contínuament"],a:1,e:"Un cop completat l'avançament amb seguretat, cal tornar al carril de circulació habitual."},
{c:"normes_general",q:"Circular per l'esquerra en una via de doble sentit sense necessitat és:",o:["Permès si no hi ha trànsit","Una infracció, ja que s'ha de circular per la dreta","Obligatori en revolts","Només prohibit de nit"],a:1,e:"La norma general obliga a circular el més a la dreta possible, llevat de maniobres com l'avançament."},
{c:"normes_general",q:"En una rotonda, en general, té prioritat:",o:["El vehicle que hi entra","El vehicle que ja circula dins la rotonda","El vehicle més gran","El que fa més soroll de clàxon"],a:1,e:"Amb caràcter general, els vehicles que ja circulen dins la rotonda tenen preferència sobre els que hi volen entrar."},
{c:"normes_general",q:"Quan dos vehicles arriben simultàniament a una intersecció sense senyalització de prioritat, té preferència:",o:["El que ve per la dreta","El que ve per l'esquerra","El vehicle més ràpid","El que toca el clàxon primer"],a:0,e:"A falta de senyalització, s'aplica la regla general de prioritat del vehicle que ve per la dreta."},
{c:"normes_general",q:"El canvi de sentit (mitja volta) es pot fer:",o:["En qualsevol punt de la via sense restriccions","Només quan estigui permès i sense crear perill ni entorpiment","Únicament de nit","Sempre que hi hagi un altre vehicle al darrere"],a:1,e:"Cal assegurar-se que la maniobra estigui permesa en aquell punt i que no comporti risc."},
{c:"normes_general",q:"En cas de boira densa, s'ha de circular amb:",o:["Llums de creuament o antiboira i velocitat reduïda","Llums llargues sempre","Sense llums per no enlluernar","Llums d'emergència en marxa normal"],a:0,e:"Amb boira és recomanable l'ús de llums de creuament o antiboira i reduir la velocitat, augmentant la distància de seguretat."},
{c:"normes_general",q:"L'ús del telèfon mòbil sense sistema de mans lliures mentre es condueix és:",o:["Permès si el vehicle està aturat en un semàfor en vermell","Prohibit en general mentre el vehicle circula","Permès sempre que sigui breu","Només prohibit en autopista"],a:1,e:"Manipular el mòbil sense mans lliures mentre es condueix està prohibit i és una distracció greu."},
{c:"normes_general",q:"En cas de creuar-se amb un vehicle prioritari amb senyals lluminosos i acústics en marxa, el conductor ha de:",o:["Ignorar-lo si va per un altre carril","Facilitar-li el pas i, si cal, aturar-se o desviar-se","Accelerar per avançar-lo abans","Seguir-lo per aprofitar el pas lliure"],a:1,e:"Cal facilitar el pas als vehicles prioritaris en servei, apartant-se o aturant-se si és necessari."},
{c:"normes_general",q:"La velocitat s'ha d'adaptar sempre a:",o:["Únicament el límit legal del tram","Les condicions de la via, el trànsit, la visibilitat i el vehicle","La velocitat dels altres conductors","El que indiqui el copilot"],a:1,e:"El límit legal és un màxim, però la velocitat adequada depèn també de les condicions reals de circulació."},

// ---- alcohol_drogues ----
{c:"alcohol_drogues",q:"La taxa màxima d'alcohol en sang permesa per a conductors amb menys de dos anys d'experiència és:",o:["0,5 g/l","0,3 g/l","0,8 g/l","No hi ha límit diferenciat"],a:1,e:"Els conductors novells (menys de 2 anys de carnet) tenen un límit més restrictiu de 0,3 g/l en sang."},
{c:"alcohol_drogues",q:"El consum d'alcohol afecta principalment:",o:["Només la vista a curt termini","La percepció, els reflexos i la capacitat de judici","Únicament la resistència física","No té cap efecte en la conducció si és poca quantitat"],a:1,e:"L'alcohol altera la percepció del risc, alenteix els reflexos i redueix la capacitat de prendre decisions."},
{c:"alcohol_drogues",q:"Negar-se a fer la prova d'alcoholèmia quan ho requereix l'agent és:",o:["Un dret del conductor sense conseqüències","Una infracció greu, equiparable a donar positiu","Només recomanable evitar-ho","Legal si el conductor no ha begut"],a:1,e:"La negativa a sotmetre's a la prova és en si mateixa una infracció, amb sancions importants."},
{c:"alcohol_drogues",q:"Els efectes de les drogues i certs medicaments sobre la conducció:",o:["Són sempre menors que els de l'alcohol","Poden alterar els reflexos i la percepció igual o més que l'alcohol","Només afecten si es prenen abans de dormir","No tenen relació amb la conducció"],a:1,e:"Moltes substàncies i medicaments poden alterar greument la capacitat de conduir amb seguretat."},
{c:"alcohol_drogues",q:"Si un medicament indica al prospecte que pot afectar la capacitat de conduir, el conductor ha de:",o:["Prendre'l igualment si la dosi és baixa","Valorar-ne l'efecte i evitar conduir si es veu afectat","Conduir només de dia","Ignorar l'advertència"],a:1,e:"Cal seguir les indicacions del prospecte i abstenir-se de conduir si el medicament afecta les capacitats."},

// ---- seguretat_passiva ----
{c:"seguretat_passiva",q:"L'ús del cinturó de seguretat és obligatori:",o:["Només en carretera, no en ciutat","Per a tots els ocupants, davant i darrere, sempre que el vehicle en disposi","Només per al conductor","Només en trajectes llargs"],a:1,e:"Tots els ocupants han de portar cinturó sempre que el seient en disposi, tant a davant com a darrere."},
{c:"seguretat_passiva",q:"Els infants han de viatjar amb un sistema de retenció infantil:",o:["Fins als 12 anys si no arriben a l'alçada mínima requerida","Només fins als 3 anys","Mai, si van al seient del darrere","Només en trajectes d'autopista"],a:0,e:"S'ha d'utilitzar el sistema de retenció adequat mentre l'infant no compleixi els requisits d'alçada/pes fixats."},
{c:"seguretat_passiva",q:"Un airbag frontal actiu combinat amb un cadiret infantil orientat cap enrere al seient davanter és:",o:["Sempre recomanable","Perillós, per això cal desactivar l'airbag en aquest cas","Indiferent per a la seguretat","Obligatori per llei"],a:1,e:"Amb un cadiret orientat cap enrere al davant, l'airbag frontal ha d'estar desactivat pel risc que suposa."},
{c:"seguretat_passiva",q:"El reposacaps del seient té com a funció principal:",o:["Millorar l'estètica del vehicle","Reduir el risc de lesions cervicals en cas de xoc","Servir de suport per dormir","No té cap funció de seguretat"],a:1,e:"El reposacaps ben ajustat redueix el risc de lesió cervical (whiplash) en col·lisions."},
{c:"seguretat_passiva",q:"En cas d'accident, portar el cinturó cordat redueix principalment:",o:["El consum de combustible","El risc de sortir despedit de l'habitacle","El desgast dels pneumàtics","La necessitat d'assegurança"],a:1,e:"El cinturó evita que l'ocupant sigui llançat contra l'interior del vehicle o expulsat en cas d'impacte."},

// ---- llums ----
{c:"llums",q:"Les llums de creuament s'han d'utilitzar:",o:["Només de nit en ciutat","Sempre que la visibilitat sigui reduïda o de nit, i en túnels","Mai en carretera convencional","Només quan plou molt fort"],a:1,e:"Cal portar-les enceses de nit, en condicions de baixa visibilitat i sempre en túnels, encara que estiguin il·luminats."},
{c:"llums",q:"Les llums llargues s'han de canviar a curtes:",o:["Quan un altre vehicle circula en sentit contrari o el precedeix a curta distància","Només si un agent ho indica","Mai, sempre s'han de mantenir enceses de nit","Només en autopista"],a:0,e:"Per evitar enlluernar altres conductors, cal passar a llums de creuament davant vehicles que vénen de cara o que es circula darrere."},
{c:"llums",q:"Les llums antiboira posteriors s'han d'utilitzar:",o:["Sempre que faci fosc","Únicament amb boira densa, pluja intensa o neu que redueixin molt la visibilitat","Amb qualsevol condició de pluja lleu","Mai, estan prohibides"],a:1,e:"Aquestes llums, molt intenses, només s'han d'usar quan la visibilitat es redueix greument, per no enlluernar innecessàriament."},
{c:"llums",q:"Els llums d'emergència (warning) s'han d'activar:",o:["Mentre es circula normalment per autopista","En situacions de perill per a altres usuaris, com una aturada d'emergència","Per aparcar en doble filera de manera habitual","Sempre que plogui"],a:1,e:"Serveixen per alertar altres conductors d'una situació de risc puntual, no per a ús habitual."},
{c:"llums",q:"Circular amb un fanal (llum) fos:",o:["No té cap conseqüència","És una infracció i redueix la visibilitat i la seguretat pròpia i aliena","Només és problema en zones rurals","Es pot compensar accelerant"],a:1,e:"Un fanal fos redueix la visibilitat i la capacitat dels altres usuaris de detectar el vehicle, i és sancionable."},

// ---- autopista ----
{c:"autopista",q:"En autopista, el voral (voral dret) es pot utilitzar per circular:",o:["Amb normalitat quan hi ha molt trànsit","Únicament en cas d'emergència o avaria, no per circular-hi habitualment","Sempre que es vagi a poca velocitat","Per fer un avançament ràpid"],a:1,e:"El voral està reservat per a emergències, avaries o vehicles autoritzats, no per a circulació normal."},
{c:"autopista",q:"L'accés a una autopista es fa normalment per:",o:["Un carril d'incorporació que permet agafar velocitat abans d'unir-se al trànsit","Directament des de qualsevol punt del voral","Marxa enrere si t'has passat la sortida","Aturant-te al carril dret abans d'entrar"],a:0,e:"El carril d'incorporació o acceleració permet adaptar la velocitat abans d'unir-se al trànsit principal."},
{c:"autopista",q:"En autopista, si et passes la sortida que volies prendre, cal:",o:["Fer marxa enrere pel voral fins a la sortida","Continuar fins a la següent sortida disponible","Aturar-te i esperar indicacions","Creuar la mitjana per tornar enrere"],a:1,e:"Mai s'ha de circular en sentit contrari o fer marxa enrere en autopista; cal continuar fins a la propera sortida."},
{c:"autopista",q:"En autopista o autovia, la velocitat mínima estableix, en general, l'objectiu de:",o:["Evitar circular massa lentament i entorpir el trànsit fluid","No té cap sentit una velocitat mínima","Obligar a anar sempre al límit màxim","Només aplica a camions"],a:0,e:"Existeix una velocitat mínima per evitar que vehicles molt lents entorpeixin la fluïdesa del trànsit ràpid."},
{c:"autopista",q:"Els vehicles que no poden circular per autopista o autovia inclouen, entre altres:",o:["Motocicletes de qualsevol cilindrada","Bicicletes, ciclomotors i vianants","Turismes amb remolc lleuger","Autocars"],a:1,e:"Bicicletes, ciclomotors, vianants i altres vehicles lents tenen prohibit l'accés a autopistes i autovies."},

// ---- documentacio ----
{c:"documentacio",q:"L'assegurança obligatòria d'un vehicle cobreix principalment:",o:["Els danys que el vehicle pugui causar a tercers","Únicament els danys al propi vehicle","Només robatoris","Res, és merament informativa"],a:0,e:"L'assegurança obligatòria cobreix la responsabilitat civil davant de danys causats a tercers."},
{c:"documentacio",q:"Circular sense la ITV (Inspecció Tècnica de Vehicles) en vigor és:",o:["Legal si el vehicle és nou","Una infracció, ja que la ITV certifica que el vehicle compleix les condicions tècniques exigides","Només problema si hi ha un accident","Opcional per a vehicles particulars"],a:1,e:"Circular sense la ITV en vigor és sancionable, i en alguns casos comporta la immobilització del vehicle."},
{c:"documentacio",q:"El permís de conduir s'ha de portar:",o:["Físicament sempre, obligatòriament, al vehicle","És recomanable poder-lo acreditar, encara que hi ha mitjans electrònics per fer-ho","No cal portar-lo mai","Només en trajectes internacionals"],a:1,e:"Cal poder acreditar que es disposa del permís vigent; existeixen sistemes digitals per fer-ho."},
{c:"documentacio",q:"En cas d'accident amb danys materials, és recomanable:",o:["Marxar del lloc per no perdre temps","Omplir el comunicat amistós d'accident i intercanviar dades amb l'altra part","No fer res si els danys són petits","Trucar només a la grua"],a:1,e:"El comunicat amistós facilita la gestió posterior amb les asseguradores i deixa constància dels fets."},

// ---- mecanica ----
{c:"mecanica",q:"Una pressió incorrecta dels pneumàtics pot provocar:",o:["Millor adherència sempre","Major desgast, pitjor frenada i risc de rebentada","Cap efecte notable","Menor consum de combustible sempre"],a:1,e:"Una pressió inadequada afecta l'adherència, la distància de frenada i pot provocar avaries greus com una rebentada."},
{c:"mecanica",q:"El dibuix (banda de rodament) mínim legal dels pneumàtics ha de ser, com a norma general:",o:["1,6 mm","0,5 mm","5 mm","No hi ha mínim legal"],a:0,e:"La profunditat mínima legal del dibuix del pneumàtic és d'1,6 mm en la major part de la banda de rodament."},
{c:"mecanica",q:"Un líquid de frens en mal estat o insuficient pot provocar:",o:["Millor resposta dels frens","Pèrdua d'eficàcia o fallada del sistema de frenada","No té relació amb els frens","Només afecta la direcció"],a:1,e:"El líquid de frens és essencial per transmetre la força al sistema; el seu mal estat compromet la frenada."},
{c:"mecanica",q:"Els retrovisors s'han de revisar i ajustar:",o:["Un cop l'any al taller","Abans d'iniciar la marxa, cada vegada que canviï el conductor o la càrrega","Mai, es queden fixos de fàbrica","Només en vehicles nous"],a:1,e:"Cal ajustar els retrovisors sempre que hi hagi un canvi de conductor o de condicions que afectin la visió posterior."},

// ---- primers_auxilis ----
{c:"primers_auxilis",q:"Davant d'un accident, la primera actuació recomanada és:",o:["Moure sempre els ferits immediatament","Senyalitzar el lloc i protegir la zona per evitar més accidents","Marxar a buscar ajuda sense avisar ningú","Treure el casc a un motorista ferit sempre"],a:1,e:"La seqüència PAS (Protegir, Avisar, Socórrer) comença per protegir la zona i evitar nous accidents."},
{c:"primers_auxilis",q:"A un ferit inconscient que respira, en principi se l'ha de col·locar:",o:["Assegut amb el cap cap avall","En posició lateral de seguretat","Bocaterrosa sense moure'l","Dret, si és possible"],a:1,e:"La posició lateral de seguretat ajuda a mantenir la via aèria lliure en persones inconscients que respiren."},
{c:"primers_auxilis",q:"En general, a un motorista ferit després d'una caiguda, el casc:",o:["S'ha de treure sempre immediatament","Només s'ha de treure si és imprescindible i per personal format, per evitar agreujar lesions cervicals","És irrellevant per a la seva seguretat","S'ha de trencar amb qualsevol eina"],a:1,e:"Retirar el casc de manera incorrecta pot agreujar possibles lesions cervicals; només ho ha de fer personal preparat si és estrictament necessari."},
{c:"primers_auxilis",q:"El número de telèfon d'emergències general a Europa és:",o:["091","112","061 exclusivament","080"],a:1,e:"El 112 és el número únic d'emergències vàlid a tota la Unió Europea."},

// ---- factor_humans ----
{c:"factor_humans",q:"La fatiga al volant afecta principalment:",o:["Només la resistència muscular","El temps de reacció, l'atenció i la capacitat de decisió","La velocitat màxima del vehicle","No afecta si el trajecte és curt"],a:1,e:"El cansament redueix la capacitat d'atenció i alenteix els reflexos, augmentant el risc d'accident."},
{c:"factor_humans",q:"En trajectes llargs, es recomana fer una pausa:",o:["Cada 8 hores de conducció seguida","Cada 2 hores aproximadament o al notar símptomes de cansament","Només si el copilot ho demana","Mai, per no perdre temps"],a:1,e:"És recomanable descansar periòdicament, aproximadament cada dues hores, per mantenir l'atenció."},
{c:"factor_humans",q:"Les distraccions més freqüents en la conducció inclouen:",o:["Mirar pel retrovisor","L'ús del mòbil, menjar o manipular el navegador mentre es circula","Portar el cinturó cordat","Mantenir les mans al volant"],a:1,e:"Manipular dispositius, menjar o altres activitats que desvien l'atenció de la via són causes freqüents d'accidents."},
{c:"factor_humans",q:"L'estat emocional del conductor (ràbia, estrès, ansietat):",o:["No influeix en la conducció","Pot alterar la capacitat de judici i afavorir conductes de risc","Només afecta si es condueix de nit","Millora la concentració"],a:1,e:"Els estats emocionals intensos poden portar a conduir de manera més agressiva o menys atenta."},

// ---- sancions ----
{c:"sancions",q:"El sistema de permís per punts:",o:["No té relació amb les infraccions comeses","Resta punts del saldo del conductor segons la gravetat de la infracció comesa","Només afecta conductors professionals","Suma punts per cada quilòmetre recorregut"],a:1,e:"Cada infracció greu o molt greu comporta la pèrdua d'un nombre determinat de punts del permís."},
{c:"sancions",q:"Un conductor novell, durant els primers anys amb el permís, sol tenir:",o:["Més punts inicials que un conductor experimentat","Menys punts inicials en el seu saldo, com a mesura de prevenció","Els mateixos punts sense diferències","Cap límit de punts"],a:1,e:"Els conductors novells tenen un saldo de punts inicial inferior fins a consolidar l'experiència."},
{c:"sancions",q:"Superar el límit de velocitat en un tram determinat:",o:["Mai comporta pèrdua de punts, només multa econòmica","Pot comportar sanció econòmica i, segons l'excés, pèrdua de punts","És irrellevant si no hi ha radar","Només es sanciona en autopista"],a:1,e:"Segons el percentatge d'excés de velocitat, la infracció pot comportar multa i pèrdua de punts."},

// ---- estacionament ----
{c:"estacionament",q:"S'entén per 'aturada' la immobilització del vehicle:",o:["Durant més de dues hores","Durant un temps breu, sense que el conductor l'abandoni, per exemple per pujar o baixar algú","Sempre amb el motor apagat i les claus tretes","Només en zones senyalitzades"],a:1,e:"L'aturada és una immobilització breu en què el conductor resta al vehicle o a prop, llest per moure'l."},
{c:"estacionament",q:"S'entén per 'estacionament' la immobilització del vehicle:",o:["Que dura més que el temps necessari per pujar o baixar persones o carregar coses, i el conductor pot allunyar-se'n","Només quan el motor està engegat","Únicament en pàrquings privats","Quan el vehicle porta les llums enceses"],a:0,e:"L'estacionament implica deixar el vehicle immobilitzat per un temps més llarg, sense necessitat que el conductor hi romangui."},
{c:"estacionament",q:"Estacionar davant d'una sortida d'emergència o boca d'incendis és:",o:["Permès si és per poca estona","Prohibit sempre, per no entorpir un servei d'emergència","Només prohibit de nit","Permès amb autorització verbal d'un veí"],a:1,e:"Aquestes zones han de romandre sempre lliures per garantir l'accés en cas d'emergència."},
{c:"estacionament",q:"En una via amb pendent, en estacionar sense marxa engegada, es recomana:",o:["No cal fer res especial","Girar les rodes cap a la vorera i posar una marxa o el fre de mà","Deixar el vehicle en punt mort sempre","Treure el fre de mà per evitar desgast"],a:1,e:"Girar les rodes i deixar una marxa posada (o el fre de mà accionat) evita que el vehicle rellisqui pendent avall."},

// ---- usuaris_vulnerables ----
{c:"usuaris_vulnerables",q:"Davant d'un pas de vianants sense semàfor on hi ha vianants esperant per creuar, el conductor ha de:",o:["Passar ràpidament abans que comencin a creuar","Cedir el pas i, si cal, aturar-se per deixar-los creuar amb seguretat","Tocar el clàxon perquè s'esperin","Avançar només si no hi ha cap vianant al mig de la calçada"],a:1,e:"Cal cedir el pas als vianants que esperen o ja estan creuant per un pas senyalitzat."},
{c:"usuaris_vulnerables",q:"Per avançar un ciclista, el conductor d'un turisme ha de:",o:["Passar el més a prop possible per estalviar temps","Deixar una distància lateral de seguretat suficient","No cal reduir la velocitat en cap cas","Fer-ho només si el ciclista s'aparta"],a:1,e:"Cal deixar una distància lateral mínima de seguretat en avançar ciclistes, reduint la velocitat si escau."},
{c:"usuaris_vulnerables",q:"Els vehicles de mobilitat personal (VMP, com els patinets elèctrics):",o:["Poden circular sempre per la vorera a qualsevol velocitat","Estan sotmesos a normes específiques i, en general, no poden circular per voreres ni autopistes","No tenen cap normativa aplicable","Tenen sempre prioritat sobre els vianants"],a:1,e:"Els VMP tenen normativa pròpia que en regula l'ús, restringint la circulació per voreres i vies ràpides."},
{c:"usuaris_vulnerables",q:"En apropar-se a un autobús escolar aturat amb els llums d'advertència encesos, el conductor ha de:",o:["Avançar-lo sense reduir velocitat","Extremar la precaució per la possible presència d'infants creuant","Tocar el clàxon per avisar que passa","Ignorar-lo si no hi ha infants visibles"],a:1,e:"Cal extremar precaucions davant transports escolars, ja que poden creuar infants de manera inesperada."},

// ---- prioritat ----
{c:"prioritat",q:"En una intersecció, un senyal de 'Cediu el pas' obliga a:",o:["Aturar-se sempre, hi hagi trànsit o no","Deixar passar els vehicles que circulen per la via a la qual s'incorpora, aturant-se si cal","Avançar sense mirar si no hi ha semàfor","Tocar el clàxon abans d'entrar"],a:1,e:"Cediu el pas obliga a deixar circular els vehicles de la via preferent, aturant-se si és necessari per fer-ho amb seguretat."},
{c:"prioritat",q:"Un vehicle que surt d'un aparcament o d'una via privada per incorporar-se a la calçada:",o:["Té sempre prioritat sobre els vehicles de la via","Ha de cedir el pas als vehicles que ja circulen per la via principal","Pot incorporar-se sense mirar","Té prioritat només si va més ràpid"],a:1,e:"Els vehicles que surten de zones com aparcaments o vies privades han de cedir el pas a la circulació normal."},
{c:"prioritat",q:"En absència de senyals, en una cruïlla entre una via normal i una altra clarament secundària o de sortida d'una finca, en general:",o:["Sempre té prioritat el vehicle més gran","Té preferència el vehicle que circula per la via principal","No hi ha cap norma aplicable","Té preferència qui arriba primer sigui com sigui"],a:1,e:"Amb caràcter general la via de característiques principals té preferència sobre una via clarament secundària."},
{c:"prioritat",q:"Un vehicle en maniobra de marxa enrere respecte a un altre que circula normalment:",o:["Té sempre preferència perquè va més lent","Ha de cedir el pas, ja que les maniobres com la marxa enrere perden la prioritat","No hi ha regla, depèn del clàxon","Té preferència si és més gran"],a:1,e:"Els vehicles que fan maniobres com la marxa enrere han de cedir el pas a la resta de la circulació."},
{c:"prioritat",q:"En un carril d'un únic sentit que es divideix en dos per un obstacle, quan dos vehicles hi arriben alhora en sentits oposats:",o:["Té preferència el que circula pel costat en què l'obstacle no li obliga a envair l'altre carril","Sempre passa primer el més ràpid","Han d'aturar-se tots dos indefinidament","Té preferència el vehicle de més tonatge"],a:0,e:"Té preferència de pas el vehicle que no ha d'ocupar part del carril contrari per esquivar l'obstacle."},

// ---- més senyals_reglament ----
{c:"senyals_reglament",q:"Un senyal circular blanc amb una vora vermella i el dibuix de dues fletxes, una amunt i una avall, indica:",o:["Prohibit avançar","Doble sentit de circulació","Sentit únic en aquell carril","Prohibit el gir en U"],a:1,e:"Aquest senyal adverteix que la via passa a tenir doble sentit de circulació."},
{c:"senyals_reglament",q:"El senyal circular blau amb el dibuix d'un vianant indica:",o:["Pas de vianants obligatori 100 m endavant","Camí obligatori per a vianants (via o zona reservada)","Prohibit el pas de vianants","Zona de joc"],a:1,e:"És un senyal d'obligació que indica una via o zona reservada exclusivament a vianants."},
{c:"senyals_reglament",q:"Un senyal circular blanc amb vora vermella i la silueta d'una motocicleta significa:",o:["Aparcament reservat per a motos","Prohibida l'entrada a motocicletes","Zona de rentat de motos","Velocitat mínima per a motos"],a:1,e:"És un senyal de prohibició d'entrada específic per al tipus de vehicle representat, en aquest cas motocicletes."},
{c:"senyals_reglament",q:"El senyal 'Cediu el pas' es diferencia del 'STOP' en el fet que:",o:["Són exactament equivalents","Amb 'Cediu el pas' només cal aturar-se si és necessari per no interrompre el trànsit preferent","El 'Cediu el pas' obliga sempre a aturada total","El 'STOP' només aplica de nit"],a:1,e:"A diferència del STOP, en el 'Cediu el pas' l'aturada només és obligatòria si cal per no interferir el trànsit de la via preferent."},
{c:"senyals_reglament",q:"Un senyal circular blanc amb vora vermella que mostra dos vehicles un al costat de l'altre significa:",o:["Prohibit avançar","Carretera de doble carril obligatori","Zona d'avançament permès únicament","Obligatori circular en fila"],a:0,e:"Aquest senyal indica la prohibició d'avançament per a determinats vehicles."},

// ---- més senyals_perill ----
{c:"senyals_perill",q:"Un triangle amb el dibuix d'un ferrocarril indica:",o:["Estació de tren propera","Proximitat d'un pas a nivell amb barreres","Prohibit circular a prop de vies fèrries","Zona de metro"],a:1,e:"Adverteix de la proximitat d'un pas a nivell, en aquest cas normalment amb barreres."},
{c:"senyals_perill",q:"Un triangle amb el dibuix d'un semàfor indica:",o:["Proximitat d'una instal·lació semafòrica","Prohibit instal·lar semàfors","Zona sense semàfors","Semàfor espatllat permanentment"],a:0,e:"Avisa de la proximitat d'un semàfor, sobretot en trams on no s'esperaria."},
{c:"senyals_perill",q:"Un triangle amb el dibuix d'una fletxa que s'estreny indica:",o:["Ampliació de carrils imminent","Estrenyiment de calçada; cal moderar la velocitat","Final de l'obra","Carril bici a la dreta"],a:1,e:"Adverteix que la calçada s'estreny, cosa que pot requerir reduir la velocitat i extremar precaució."},
{c:"senyals_perill",q:"El senyal de perill amb el dibuix d'un munt de pedres o despreniments indica:",o:["Zona de pícnic","Perill de despreniments a la calçada","Obligació de portar cadenes","Prohibit aturar-se per l'estat del terreny"],a:1,e:"Adverteix del risc de caiguda de pedres o materials sobre la via, freqüent en zones de muntanya."},

// ---- més normes_general ----
{c:"normes_general",q:"Quan un vehicle circula per un carril d'acceleració per incorporar-se a una via principal, els vehicles que ja hi circulen:",o:["Han de facilitar la incorporació sempre que sigui possible amb seguretat","Han d'aturar-se completament sempre","No tenen cap obligació","Han d'accelerar per impedir el pas"],a:0,e:"Encara que el vehicle que s'incorpora ha de cedir el pas, els que ja circulen han de facilitar la maniobra quan sigui segur fer-ho."},
{c:"normes_general",q:"En circular per una rotonda, la senyalització dels intermitents s'ha d'utilitzar:",o:["Mai, no cal senyalitzar dins d'una rotonda","Per indicar la sortida que es prendrà","Només en entrar-hi","Només si hi ha un agent regulant"],a:1,e:"Cal indicar amb l'intermitent dret la intenció de sortir de la rotonda per avisar la resta d'usuaris."},
{c:"normes_general",q:"Circular massa a prop del vehicle del davant (conducció temerària per proximitat) es coneix popularment com:",o:["Zigzaguejar","Anar 'enganxat' o fer 'aquaplaning'","Fer 'assetjament vial'","Res, no té nom específic"],a:1,e:"Circular molt a prop, sense distància de seguretat, s'anomena col·loquialment anar 'enganxat' al vehicle del davant."},
{c:"normes_general",q:"En cas de pluja, la distància de seguretat respecte a condicions seques s'ha de:",o:["Reduir, ja que el fre funciona millor mullat","Mantenir igual sempre","Augmentar, ja que la distància de frenada creix","És irrellevant"],a:2,e:"Amb calçada mullada la distància de frenada augmenta, per la qual cosa cal ampliar la distància de seguretat."},
{c:"normes_general",q:"Un conductor que vol girar a l'esquerra en una intersecció sense marques específiques ha de situar-se:",o:["El més a la dreta possible del seu carril","El més a l'esquerra possible del seu sentit de circulació, sense envair el sentit contrari","Al centre exacte de la calçada","És indiferent la posició"],a:1,e:"Per girar a l'esquerra cal situar-se prop de l'eix de la calçada o al carril esquerre corresponent, sense envair el sentit contrari."},
{c:"normes_general",q:"El fet de circular en 'zigzag' entre carrils sense necessitat és:",o:["Una maniobra esportiva permesa en vies ràpides","Una infracció perillosa que redueix la previsibilitat per als altres conductors","Obligatori en cas de trànsit dens","Només prohibit en autopista"],a:1,e:"Aquest tipus de conducció és perillós i sancionable perquè trenca la previsibilitat necessària per a la seguretat viària."},
{c:"normes_general",q:"En arribar a un pas a nivell sense barreres amb el senyal lluminós vermell intermitent actiu, el conductor ha de:",o:["Passar ràpidament abans que arribi el tren","Aturar-se i no creuar fins que s'apagui el senyal","Tocar el clàxon i continuar","Reduir només una mica la velocitat"],a:1,e:"El senyal lluminós vermell intermitent en un pas a nivell obliga a aturar-se completament."},
{c:"normes_general",q:"Quan es condueix per una via amb gel a la calçada, es recomana:",o:["Frenades brusques per aturar-se abans","Moviments suaus al volant, frens i accelerador, evitant maniobres brusques","Accelerar per travessar-la ràpidament","Circular amb les llums llargues sempre"],a:1,e:"Sobre gel cal evitar qualsevol maniobra brusca que pugui provocar la pèrdua de control del vehicle."},

// ---- més autopista ----
{c:"autopista",q:"En autopista, el carril esquerre (de més a l'esquerra) s'ha d'utilitzar:",o:["Per circular-hi de manera habitual a qualsevol velocitat","Preferentment per avançar, tornant després als carrils de la dreta","Únicament per a vehicles d'emergència","Per estacionar en cas de trencament"],a:1,e:"El carril esquerre es reserva bàsicament per a l'avançament, no per a la circulació continuada."},
{c:"autopista",q:"Si un vehicle avaria en un carril d'autopista i no es pot moure, els ocupants han de:",o:["Quedar-se dins del vehicle sempre","Sortir per la porta del costat de la via i posar-se en un lloc segur, fora de la calçada si és possible","Empènyer el vehicle entre el trànsit","Fer autostop al mig de la calçada"],a:1,e:"Per seguretat, cal sortir del vehicle per la banda no exposada al trànsit i situar-se en una zona segura."},
{c:"autopista",q:"Els peatges d'autopista s'han d'abordar:",o:["A la velocitat que es portava a la via","Reduint la velocitat amb prou antelació segons la senyalització del carril triat","Accelerant per no perdre temps","Sense necessitat de reduir mai la velocitat"],a:1,e:"Cal adaptar la velocitat al tipus de carril de peatge (manual, telepeatge, etc.) amb prou antelació."},

// ---- més documentacio ----
{c:"documentacio",q:"Conduir sense el permís de conduir corresponent a la categoria del vehicle és:",o:["Una simple recomanació incomplerta","Una infracció greu, ja que cal l'habilitació legal per a cada tipus de vehicle","Permès si es té experiència","Només problema per a menors de 18 anys"],a:1,e:"Cada categoria de vehicle requereix el permís corresponent; conduir sense ell és una infracció greu."},
{c:"documentacio",q:"El certificat de la ITV s'ha de portar:",o:["Al vehicle o poder-lo acreditar quan es requereixi","Mai, no cal portar-lo enlloc","Només en trajectes internacionals","Únicament els caps de setmana"],a:0,e:"Cal poder acreditar que el vehicle té la ITV en vigor quan un agent ho requereixi."},
{c:"documentacio",q:"En cas de canvi de titularitat d'un vehicle, cal:",o:["No fer res, el tràmit és automàtic sempre","Notificar el canvi a l'organisme corresponent en el termini establert","Esperar a la propera ITV per notificar-ho","Notificar-ho només si hi ha un accident"],a:1,e:"El canvi de titularitat s'ha de comunicar dins el termini legal establert per a la seva validesa administrativa."},
{c:"documentacio",q:"L'assegurança 'a tot risc' es diferencia de la obligatòria en què:",o:["Són exactament el mateix","Amplia la cobertura, incloent per exemple danys propis, més enllà del mínim legal","És més barata sempre","No cobreix danys a tercers"],a:1,e:"L'assegurança a tot risc ofereix cobertures addicionals a les mínimes exigides per llei, com els danys propis."},

// ---- més mecanica ----
{c:"mecanica",q:"Els frens de disc, en general, en comparació amb els de tambor:",o:["Dissipen pitjor la calor","Solen oferir millor rendiment i dissipació de calor en frenades intenses","No influeixen en el rendiment","Són sempre menys segurs"],a:1,e:"Els frens de disc solen refredar-se millor i mantenir el rendiment en frenades repetides o intenses."},
{c:"mecanica",q:"Un nivell d'oli del motor massa baix pot provocar:",o:["Millor rendiment del motor","Un desgast prematur i possibles avaries greus del motor","Cap efecte notable","Menys consum de combustible"],a:1,e:"L'oli lubrica i refreda el motor; un nivell insuficient pot provocar danys greus i costosos."},
{c:"mecanica",q:"La comprovació de la pressió dels pneumàtics s'ha de fer:",o:["Amb els pneumàtics calents, després d'un trajecte llarg","Preferiblement amb els pneumàtics freds, abans d'un trajecte llarg","Un cop l'any","Només si sembla que estan baixos a simple vista"],a:1,e:"La pressió és més precisa amb els pneumàtics freds, ja que la calor n'altera la lectura."},
{c:"mecanica",q:"El desgast irregular dels pneumàtics pot indicar:",o:["Res rellevant, és normal","Un problema d'alineació, equilibratge o pressió incorrecta","Que el vehicle és massa nou","Que cal canviar només d'oli"],a:1,e:"Un desgast irregular sol ser senyal d'un problema mecànic que convé revisar per seguretat."},

// ---- més primers_auxilis ----
{c:"primers_auxilis",q:"L'acrònim PAS en primers auxilis de trànsit fa referència a:",o:["Parar, Avançar, Seguir","Protegir, Avisar, Socórrer","Prevenir, Actuar, Salvar","Pujar, Ajudar, Sortir"],a:1,e:"PAS resumeix l'ordre d'actuació davant un accident: Protegir la zona, Avisar els serveis d'emergència i Socórrer els ferits."},
{c:"primers_auxilis",q:"Davant d'una hemorràgia externa important, la primera mesura recomanada sol ser:",o:["Aplicar un torniquet immediatament sempre","Fer pressió directa sobre la ferida amb un teixit net","No tocar la ferida en cap cas","Rentar la ferida amb aigua freda abundant"],a:1,e:"La pressió directa amb un teixit net sol ser la primera mesura per controlar una hemorràgia externa."},
{c:"primers_auxilis",q:"En senyalitzar un accident a la carretera de nit, és recomanable:",o:["Utilitzar l'armilla reflectora i col·locar-se darrere de la barrera de seguretat si n'hi ha","Quedar-se al mig de la calçada per avisar amb els braços","Apagar tots els llums del vehicle per no enlluernar","Fer servir només el clàxon per avisar"],a:0,e:"Cal fer-se visible amb l'armilla i situar-se en un lloc segur, protegit si és possible, mentre s'avisa del perill."},

// ---- més factor_humans ----
{c:"factor_humans",q:"Conduir sota els efectes d'una son excessiva té un efecte comparable a:",o:["No té cap efecte apreciable","Conduir sota els efectes de l'alcohol, per la pèrdua de reflexos i atenció","Millorar la concentració","Només afecta la temperatura corporal"],a:1,e:"La son excessiva pot alterar els reflexos i l'atenció d'una manera similar a la intoxicació alcohòlica."},
{c:"factor_humans",q:"Escoltar música a un volum molt alt mentre es condueix pot:",o:["Millorar la concentració sempre","Dificultar sentir senyals acústics importants, com sirenes","No tenir cap efecte","Ser obligatori per mantenir-se despert"],a:1,e:"Un volum excessiu pot impedir sentir avisos sonors rellevants, com sirenes de vehicles d'emergència."},

// ---- més sancions ----
{c:"sancions",q:"No portar el cinturó de seguretat cordat estant obligat a fer-ho és:",o:["Una infracció lleu sense conseqüències en punts","Una infracció que pot comportar multa i pèrdua de punts","Una recomanació, no una obligació legal","Només aplicable al conductor, mai als passatgers"],a:1,e:"No portar el cinturó quan és obligatori comporta sanció econòmica i pèrdua de punts del carnet."},
{c:"sancions",q:"Utilitzar el mòbil sense mans lliures mentre es circula:",o:["No té sanció si es fa amb el vehicle aturat en un semàfor","Es considera infracció greu amb pèrdua de punts","Només és sancionable en autopista","És legal si es fa breument"],a:1,e:"L'ús del mòbil sense mans lliures durant la circulació es considera infracció greu."},

// ---- més estacionament ----
{c:"estacionament",q:"Estacionar en un carril reservat per a transport públic (carril bus) fora del seu horari d'ús:",o:["Sempre és correcte","Pot estar permès o no segons la senyalització específica del tram","Mai és permès, en cap circumstància","És obligatori fer-ho per no destorbar altres carrils"],a:1,e:"Depèn de la senyalització concreta del tram; alguns carrils bus permeten estacionar fora de l'horari de servei i altres no."},
{c:"estacionament",q:"Deixar un vehicle estacionat de manera que dificulti la sortida d'un altre vehicle correctament aparcat és:",o:["Permès si és per poca estona","Una infracció, ja que s'ha d'evitar entorpir altres vehicles","Només problema en zones blaves","Legal si es deixen els llums d'emergència"],a:1,e:"No es pot estacionar de manera que impedeixi o dificulti la sortida d'altres vehicles ja estacionats correctament."},

// ---- més usuaris_vulnerables ----
{c:"usuaris_vulnerables",q:"En apropar-se a una parada d'autobús amb un autobús aturat recollint passatgers, cal:",o:["Avançar-lo sense cap precaució especial","Extremar la precaució per la possible presència de vianants creuant per davant o darrere","Tocar el clàxon per fer-lo arrencar","Avançar-lo sempre pel voral"],a:1,e:"Els vianants poden creuar de manera inesperada davant o darrere de l'autobús aturat, per la qual cosa cal extremar la precaució."},
{c:"usuaris_vulnerables",q:"Un ciclista que circula per la calçada, en absència de carril bici:",o:["Ha de circular sempre per la vorera","Té dret a ocupar el carril amb les mateixes normes generals que la resta de vehicles","No té cap dret a circular per la calçada","Ha de circular sempre en sentit contrari al trànsit"],a:1,e:"El ciclista és un usuari més de la via i, en absència de carril bici, pot circular pel carril seguint les normes generals."},
];

/* ---------- PRNG determinista ---------- */
export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithRng(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function passThreshold(n) {
  return Math.max(1, Math.round(n * 0.1)); // errors permesos (10%, com el real 3/30)
}

/* ids (índexs a Q) que formen l'examen numerat `examNum`, sempre els mateixos */
export function buildExamIds(examNum) {
  const rng = mulberry32(1000 + examNum * 97);
  return shuffleWithRng(Q.map((_, i) => i), rng).slice(0, 30);
}

/* construeix la pregunta renderitzable (amb opcions barrejades) a partir d'un id */
export function buildQuestionFromIndex(idx, seed) {
  const item = Q[idx];
  const optOrder = shuffleWithRng([0, 1, 2, 3], mulberry32(idx * 13 + seed * 7));
  return {
    idx,
    cat: item.c,
    text: item.q,
    options: optOrder.map((o) => item.o[o]),
    correct: optOrder.indexOf(item.a),
    exp: item.e,
  };
}

export function buildExamQuestions(ids, seed) {
  return ids.map((idx) => buildQuestionFromIndex(idx, seed));
}

/* barreja estable de les preguntes fallades, per repartir-les en blocs de fins a 30 */
export function shuffledFailedIds(failedIds) {
  const seed = failedIds.reduce((a, b) => a + b, 777);
  return shuffleWithRng(failedIds, mulberry32(seed));
}

export function reviewChunkIds(failedIds, chunkIndex) {
  return shuffledFailedIds(failedIds).slice(chunkIndex * 30, chunkIndex * 30 + 30);
}
