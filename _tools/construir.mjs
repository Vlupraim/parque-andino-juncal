// Genera las páginas interiores con el mismo header, pie y transiciones que la portada.
// El contenido viene del sitio original (parqueandinojuncal.cl), corregido y ordenado.
// Uso: node _tools/construir.mjs
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = 'https://parqueandinojuncal.cl/wp-content/uploads/';
const foto = {
  valle: W + '2017/02/homecrop.jpg',
  refugio: W + '2019/09/92139729-67af-4659-afbb-ccb74807db4c-768x456.jpg',
  sendero: W + '2017/09/Caminando-en-el-sendero-2017-1024x768.jpg',
  binoculares: W + '2017/05/Copy-of-binoculares-1024x765.jpg',
  afiche: W + '2017/02/16722768_1328415367219228_1943128515241881603_o-754x1024.jpg',
  tallerGrupo: W + '2017/02/16700532_1324908147569950_8132875286998229687_o-1024x774.jpg',
  auxilios: W + '2017/02/16797700_1324911320902966_1261948520781694037_o-768x511.jpg',
  auxiliosSala: W + '2017/02/16819086_1324854874241944_1766864831921445291_o-1024x715.jpg',
  voluntarios: W + '2017/02/16722643_1324911094236322_4750436020150817919_o-768x648.jpg',
  carpa: W + '2017/02/16602329_1324911304236301_5498295649264886293_o-1024x778.jpg',
  caminante: W + '2017/02/DSC_0056-Paris-C-Oct-2016_edit-1024x683.jpg',
  grupo: W + '2017/02/DSC_0113-Paris-C-Oct-2016_edit-1024x683.jpg',
  porton: W + '2017/02/DSC_0123-Paris-C-Oct-2016_edit-1024x683.jpg',
  pajonal: W + '2017/02/DSC_0058-Paris-C-Oct-2016-1024x683.jpg',
  dorado: W + '2017/02/DSC_0094-Paris-C-Oct-2016_edit-1024x683.jpg',
  cumbres: W + '2017/02/DSC_0094-Paris-C-Oct-2016_v3-1024x498.jpg',
  humedal: W + '2017/02/DSC_0057-Paris-C-Oct-2016_edit-1024x683.jpg',
  glaciar: W + '2017/02/DSC_0083-Paris-C-Oct-2016_edit-1024x683.jpg'
};

// ───────── Plantilla común ─────────
const head = (p, title, description) => `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<script>try{if(sessionStorage.getItem('paj-veil'))document.documentElement.classList.add('veil-arrive')}catch(e){}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${p}assets/site.css">
</head>
<body>
`;

export const header = p => `<header class="pillbar nav-anchored" id="mainNav">
  <span class="glass-bg" aria-hidden="true"></span>
  <div class="nav-inner">
    <a class="brand" href="${p}index.html" aria-label="Parque Andino Juncal, inicio">
      <span class="brand-logo" id="navLogo"></span>
    </a>
    <nav class="nav-links" aria-label="Principal">
      <details class="nav-dropdown"><summary>El Parque<span class="nav-chevron"></span></summary><div class="nav-dropdown-panel"><a href="${p}el-parque.html">Historia</a><a href="${p}conservacion.html">Conservación</a><a href="${p}noticias.html">Noticias</a><a href="${p}noticias.html#prensa">En la prensa</a></div></details>
      <details class="nav-dropdown"><summary>Visita<span class="nav-chevron"></span></summary><div class="nav-dropdown-panel"><a href="${p}visita.html#tarifas">Tarifas</a><a href="${p}visita.html#como-llegar">Cómo llegar</a><a href="${p}visita.html#reglamento">Reglamento</a><a href="${p}preguntas-frecuentes.html">Preguntas frecuentes</a></div></details>
      <a href="${p}actividades.html">Actividades</a>
      <details class="nav-dropdown"><summary>Apoya<span class="nav-chevron"></span></summary><div class="nav-dropdown-panel"><a href="${p}apoya.html#donacion">Donación</a><a href="${p}apoya.html#voluntariado">Voluntariado</a></div></details>
    </nav>
    <a href="${p}index.html#reservar" class="nav-cta" data-magnetic><span class="magnetic-label">Reservar visita</span></a>
    <button class="menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span></button>
  </div>
</header>`;

export const footer = p => `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <img class="footer-logo" src="${p}assets/logo-juncal-blanco.svg" alt="Parque Andino Juncal">
        <p>Área Protegida Privada y sitio Ramsar en la cabecera del río Aconcagua. Cuidada por la familia Kenrick desde 1911.</p>
      </div>
      <div><h4>El parque</h4><ul><li><a href="${p}el-parque.html">Historia</a></li><li><a href="${p}conservacion.html">Conservación</a></li><li><a href="${p}actividades.html">Actividades</a></li><li><a href="${p}noticias.html">Noticias y prensa</a></li></ul></div>
      <div><h4>Visita</h4><ul><li><a href="${p}visita.html#tarifas">Tarifas</a></li><li><a href="${p}visita.html#como-llegar">Cómo llegar</a></li><li><a href="${p}visita.html#reglamento">Reglamento</a></li><li><a href="${p}preguntas-frecuentes.html">Preguntas frecuentes</a></li></ul></div>
      <div><h4>Contacto</h4><ul><li><a href="mailto:info@parqueandinojuncal.cl">info@parqueandinojuncal.cl</a></li><li><a href="https://www.instagram.com/parqueandinojuncal/" target="_blank" rel="noopener">Instagram</a></li><li><a href="https://www.facebook.com/parqueandinojuncal" target="_blank" rel="noopener">Facebook</a></li><li><a href="${p}apoya.html">Apoya al parque</a></li></ul></div>
    </div>
    <div class="footer-cta">
      <p>De viernes a domingo se ingresa solo con reserva.</p>
      <a class="button" href="${p}index.html#reservar" data-magnetic><span class="magnetic-label">Reservar visita</span></a>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Parque Andino Juncal · Comunidad Kenrick Lyon</span>
      <span><a href="${p}privacidad.html">Privacidad y datos personales</a> · <a href="${p}terminos.html">Términos y condiciones</a> · Maqueta del rediseño</span>
    </div>
  </div>
</footer>`;

const scripts = (p, extra = '') => `${extra}<script src="${p}assets/logo-juncal-data.js"></script>
<script src="${p}assets/ave-juncal.js"></script>
<script src="${p}assets/site.js"></script>
</body>
</html>
`;

const hero = (p, { photo, pos = 'center', crumbs, title, lead }) => `<section class="hero hero--page">
  <div class="hero-photo is-first" style="background-image:url('${photo}');background-position:${pos}"></div>
  <div class="hero-wash"></div>
  <div class="hero-content">
    <p class="crumbs"><a href="${p}index.html">Inicio</a>${crumbs ? ' · ' + crumbs : ''}</p>
    <h1>${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
  </div>
</section>`;

const next = (p, items) => `<nav class="page-next" aria-label="Seguir explorando">${items.map(([href, label, title, photo]) =>
  `<a href="${p}${href}" style="background-image:url('${photo}')"><small>${label}</small><b>${title}</b></a>`).join('')}</nav>`;

function page(file, { title, description, hero: h, body }) {
  const p = file.includes('/') ? '../' : '';
  const html = head(p, title + ' · Parque Andino Juncal', description) + header(p) + '\n<main>\n' + hero(p, h) +
    `\n<div class="page-body"><div class="wrap">\n${body(p)}\n</div></div>\n</main>\n` + footer(p) + '\n' + scripts(p);
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), html);
  return file;
}

// ───────── Contenido ─────────
const noticias = [
  {
    slug: 'abrimos-temporada-2019-2020', fecha: '14 sep 2019', titulo: 'Abrimos la temporada 2019–2020', foto: foto.refugio,
    resumen: 'Les damos la bienvenida a una nueva temporada en el Valle Juncal, donde la tierra, el agua y el hielo tienen la oportunidad de descansar.',
    cuerpo: `<p class="lede">Bienvenidos a Parque Andino Juncal, un área protegida privada en el Valle de Aconcagua. Trabajamos para proteger la alta cuenca del río Juncal, y la vida silvestre y los recursos naturales que alberga, para las generaciones presentes y futuras.</p>
<p>Les damos la bienvenida a la nueva temporada 2019–2020. La información actualizada sobre senderos, caminos y clima se publica en el Facebook del parque.</p>
<p>La propiedad ha estado en la familia Kenrick desde 1911. En 2003 se decidió no permitir en el predio actividades industriales como la minería o la hidroenergía, y de impedir activamente cualquier intento de desarrollarlas. En el Valle de Juncal la tierra, el agua y el hielo tendrán la oportunidad de descansar, recuperarse y florecer.</p>
<blockquote class="quote">No nos limitemos a “consumir” naturaleza: somos parte de ella. La naturaleza es nuestra mejor amiga, nos sana y nos transforma.</blockquote>
<p>Desde que cuidamos activamente el predio hemos visto un retorno y una expansión de la flora y la fauna. Observamos rastros de guanaco y puma, inéditos en tiempos recientes, y un aumento notorio de pastos y plantas en las vegas y laderas.</p>`
  },
  {
    slug: 'apertura-octubre-2017', fecha: '12 sep 2017', titulo: 'El parque abre en octubre para la temporada 2017–2018', foto: foto.sendero,
    resumen: 'La temporada comenzará a mediados de octubre. Les pedimos respetar la fecha de apertura, que anunciaremos por este medio.',
    cuerpo: `<p class="lede">Les damos la bienvenida a la temporada 2017–2018, que comenzará aproximadamente a mediados de octubre. Les agradecemos respetar la fecha de apertura, que será anunciada por este medio.</p>
<p>Parque Andino Juncal es un área protegida privada ubicada en el Valle de Aconcagua. Trabajamos para proteger la alta cuenca del río Juncal y la vida silvestre que alberga.</p>
<p>Estaremos encantados de recibirlos y los invitamos a sumarse a nuestra iniciativa para proteger esta cuenca, estos cerros y estas vegas, y todas las cuencas, quebradas, lagunas, humedales y costas de Chile. Nosotros tuvimos la suerte y la responsabilidad de recibir en herencia este predio.</p>
<blockquote class="quote">Somos parte de la naturaleza: cuidémosla, gocemos de la belleza de sus paisajes y dejémonos inspirar por ella.</blockquote>`
  },
  {
    slug: 'politica-nacional-de-montana', fecha: '23 mar 2017', titulo: 'Celebramos la participación en la Política Nacional de Montaña', foto: foto.grupo,
    resumen: 'En una semana, la participación en la consulta sobre las montañas creció más de 300%: de 188 a 637 comentarios.',
    cuerpo: `<p class="lede">Gracias a ustedes y a La Voz de la Montaña, en una sola semana la participación en la consulta de las montañas aumentó en más de 300%: de 188 a 637 comentarios.</p>
<p>El Parque Andino Juncal ocupa dos tercios del Valle Juncal, un valle singular. Es la única cuenca importante donde nace agua limpia para el río Aconcagua, y una de solo dos cuencas del valle sin intervención hidroeléctrica ni minera. Ayúdanos a mantenerlo así.</p>
<p>Ahora seguimos trabajando para que las montañas, su flora, su fauna, sus humedales y las personas que conviven con ellas se integren en la educación, la planificación regional y las prioridades municipales.</p>
<figure class="figure"><img src="${foto.afiche}" alt="Afiche sobre la consulta de la Política Nacional de Montaña" loading="lazy" style="max-width:420px;margin:auto"></figure>`
  },
  {
    slug: 'reportaje-mercurio-de-valparaiso', fecha: '23 mar 2017', titulo: 'El Mercurio de Valparaíso publica un reportaje sobre el parque', foto: foto.porton,
    resumen: 'El parque aparece entre las tres iniciativas privadas que conservan la naturaleza en la Región de Valparaíso.',
    cuerpo: `<p class="lede">El Parque Andino Juncal apareció en El Mercurio de Valparaíso el domingo 12 de febrero de 2017, como una de las tres iniciativas privadas que conservan la naturaleza en la Región de Valparaíso.</p>
<p>El reportaje, «La apuesta de privados por conservar la naturaleza», recorre el trabajo de quienes decidieron proteger sus predios de la actividad industrial.</p>
<p><a href="http://www.mercuriovalpo.cl/impresa/2017/02/12/full/cuerpo-reportajes/13/" target="_blank" rel="noopener">Leer el reportaje en El Mercurio de Valparaíso ↗</a></p>`
  },
  {
    slug: 'taller-primeros-auxilios', fecha: '23 mar 2017', titulo: 'Primer taller de primeros auxilios en el parque', foto: foto.auxilios,
    resumen: 'Nuestro equipo de guardaparques se capacitó durante tres días en gestión de riesgo y primeros auxilios en montaña.',
    cuerpo: `<blockquote class="quote">Con este entrenamiento estamos mejor preparados para responder a una emergencia que pueda ocurrir en el parque.</blockquote>
<p>A principios de esta semana nuestro equipo de guardaparques se capacitó en un taller de tres días sobre gestión de riesgo y técnicas de primeros auxilios en montaña. La instancia se compartió con la comunidad de montañistas, con la participación de un integrante del Club de Montaña de Los Andes y un residente de San Felipe.</p>
<p>La capacitación estuvo a cargo de la Academia de Montaña La Cumbre. Agradecemos a José Miguel Iturra Escala, a los guardaparques del parque, al Club de Montaña Los Andes y a los montañistas de Los Andes y San Felipe que hicieron de este taller inicial un éxito.</p>
<figure class="figure"><img src="${foto.auxiliosSala}" alt="Práctica de primeros auxilios durante el taller" loading="lazy"></figure>
<p>Si te interesa participar en estos cursos, revisa los <a href="../actividades/talleres.html">talleres</a> o escríbenos a <a href="mailto:info@parqueandinojuncal.cl">info@parqueandinojuncal.cl</a>.</p>`
  }
];

const prensa = [
  ['La Tercera', '13 sep 2019', 'Radiografía de la filantropía ambiental', 'A una hora y media de Los Andes está el Parque Andino Juncal, justo donde nace el río Aconcagua y donde existen 24 glaciares. “Nuestra filantropía resguarda la fuente de agua para el valle del Aconcagua y la Región de Valparaíso”, dice Catherine Kenrick.', 'https://www.latercera.com/tendencias/noticia/radiografia-de-la-filantropia-ambiental/821710/'],
  ['La Tercera', '13 sep 2019', 'Los actores de la filantropía ambiental', 'Proyectos grandes y consolidados, y otros más pequeños, que aportan en conservación, educación ambiental, ciencia y protección de especies.', 'https://www.latercera.com/canal/tendencias/los-actores-de-la-filantropia-ambiental/'],
  ['Revista Sky', '31 mar 2017', 'Parque Andino Juncal: paraíso cordillerano', 'Paisajes a más de 2.500 metros de altura marcados por cumbres, glaciares, ríos y humedales habitados por flora y fauna de interés mundial.', 'https://issuu.com/revistaskyairline/docs/sky_abril17_web'],
  ['La Segunda', '31 mar 2017', '“No soy ninguna heroína, simplemente me enamoré de las montañas”', '', 'http://impresa.lasegunda.com/2017/03/31/A/EU34P593/all'],
  ['Qué Pasa', '13 abr 2017', 'Los mejores circuitos de trekking cerca de Santiago', '', 'http://www.quepasa.cl/articulo/actualidad/2017/04/los-mejores-circuitos-de-trekking-cerca-de-santiago.shtml/'],
  ['Ladera Sur', '4 abr 2017', '10 imperdibles rutas para hacer trekking cerca de la capital', 'Es una de las reservas ecológicas privadas más importantes del país y se encuentra a menos de tres horas de Santiago.', 'http://www.laderasur.cl/al-aire-libre/10-imperdibles-rutas-para-hacer-trekking-cerca-de-la-capital/'],
  ['WkndHeroes', '4 abr 2017', 'Lo que descubrimos en Parque Andino Juncal', 'Bajando, simplemente admirábamos la naturaleza salvaje, esa naturaleza desbordada e incontrolable que nos daba una pequeña degustación de su inconmensurable fuerza.', 'http://www.wkndheroes.com/lo-que-descubrimos-en-parque-andino-juncal/'],
  ['El Mercurio de Valparaíso', '12 feb 2017', 'La apuesta de privados por conservar la naturaleza', '', 'http://www.mercuriovalpo.cl/impresa/2017/02/12/full/cuerpo-reportajes/13/'],
  ['Revista Domingo, El Mercurio', '8 ene 2017', 'La desconocida historia de los pioneros del andinismo en Chile', 'En diciembre de 1938 alcanzaron el Nevado Juncal (5.965 m), un emblemático cerro en las cercanías de Portillo. Dorly se convirtió en la primera mujer en conseguirlo.', 'http://www.economiaynegocios.cl/noticias/noticias.asp?id=324810'],
  ['Revista Ya, El Mercurio', '2 sep 2016', 'La ilustración botánica vuelve a florecer', 'Es primavera en el Parque Andino Juncal. La botánica Mélica Muñoz Schick, su esposo Sergio Moreira y su hijo Andrés buscan una flor: una Alstroemeria parvula.', 'http://www.economiaynegocios.cl/noticias/noticias.asp?id=285130'],
  ['La Tercera', '18 mar 2016', 'Juncal: hacia el origen del río Aconcagua', 'Humedales y glaciares son algunas de las maravillas que se pueden visitar durante el otoño en el Parque Andino Juncal, vecino a Portillo.', 'http://www.latercera.com/noticia/juncal-hacia-el-origen-del-rio-aconcagua/'],
  ['Revista Capital', '4 nov 2013', 'Alerta húmeda', '', 'http://www.capital.cl/vida-y-estilo/2013/11/04/70115/alerta-humeda'],
  ['El Mercurio de Valparaíso', '27 jul 2010', 'Red ecológica incluye humedal de Parque Juncal', '', 'http://www.mercuriovalpo.cl/prontus4_noticias/site/artic/20100727/pags/20100727000423.html']
];

const faqs = [
  ['¿Qué es el Parque Andino Juncal?', `<p>Un Área Protegida Privada abierta al público que pertenece desde 1911 a la familia Kenrick, hoy la Comunidad Kenrick Lyon. Está en la V Región cordillera, cerca de Portillo.</p><p>Nuestra misión es proteger la cuenca del Juncal, una olla hidrográfica de 220 km² que es la única cuenca del río Aconcagua sin contaminación ni impacto industrial. El parque representa dos tercios de su superficie.</p><p>El terreno va desde los 2.200 a más de 5.000 metros sobre el nivel del mar, con esteros, humedales y glaciares cuya importancia le valió la distinción de sitio Ramsar en 2010.</p>`],
  ['¿Dónde consigo información actualizada del parque?', '<p>Cada semana publicamos en nuestro Facebook las condiciones del parque y del camino, el pronóstico del tiempo y otra información relevante para tu visita.</p>'],
  ['¿Dónde encuentro el pronóstico del tiempo?', '<p>Cada viernes publicamos en Facebook una reseña del pronóstico para el sector. Para más detalle puedes consultar MeteoBlue, AccuWeather, YR o Mountain Forecast.</p><p>Planifica con anticipación y lleva equipo para condiciones cambiantes.</p>'],
  ['¿Qué es No Deje Rastro?', '<p>No son leyes ni reglamentos: son principios que ayudan a tomar la mejor decisión en cada situación para conservar las áreas naturales que visitamos.</p><ul><li>Planifica y prepara tu viaje con anticipación.</li><li>Viaja y acampa en superficies resistentes.</li><li>Dispón de los desechos de la manera más apropiada.</li><li>Respeta la fauna silvestre.</li><li>Minimiza el impacto de las fogatas.</li><li>Considera a los demás visitantes.</li><li>Deja lo que encuentres.</li></ul>'],
  ['¿Dónde se puede acampar?', '<p><b>Los Hornitos:</b> alrededor de la ruina del antiguo edificio llamado Hotel Mil Estrellas. Hay un baño básico pero limpio y un lavadero.</p><p><b>Las Morrenas:</b> en la planicie dentro del roquerío, protegida del viento, cerca del Estero Monos de Agua y después del cerco. Las carpas van a 50 metros al suroeste del sendero. El agua se toma del estero, no del humedal.</p><p><b>Las Canchitas:</b> un pequeño espacio al norte del sendero, al llegar a la ampliación del valle. No acampes cerca del humedal ni lo pises.</p>'],
  ['¿Se pueden hacer fogatas?', '<p>Solo en las zonas habilitadas alrededor del Hotel Mil Estrellas, en Los Hornitos, donde hay bancas rústicas y una mesa compartidas. Debes traer tu propio carbón o leña: no hay en el parque.</p>'],
  ['¿Debo llevar agua?', '<p>En Los Hornitos hay agua para cocinar, beber y lavar. En Las Morrenas se bebe del río Juncal o de las vertientes del sendero. En época de deshielo, entre enero y mediados de marzo, el agua de los esteros arrastra mucho sedimento y conviene traer bidones propios.</p>'],
  ['¿Qué hago con mi basura?', '<p>Llévatela toda, y también la que encuentres. Colillas, papel higiénico, vidrio y envoltorios: todo es basura. Cuida que no se te caigan papeles de los bolsillos.</p>'],
  ['¿Qué senderos hay?', '<p>El Sendero al Mirador del Glaciar, el Sendero del Pastizal, el Sendero hacia la Vega de Canchitas (hoy cerrado, solo para expertos) y el Sendero de la Vega de la Roca. Encontrarás el detalle de cada uno en <a href="actividades/senderismo.html">Senderismo</a>.</p>'],
  ['Si llego a Los Hornitos a las 9:30, ¿alcanzo a ir al glaciar y volver sin problemas con el Estero Monos de Agua?', '<p>Depende del estado físico del grupo, de su experiencia cruzando ríos de montaña y del tiempo que quiera quedarse en el glaciar.</p><p>En época de deshielo lo ideal es salir a las 8:00 desde el refugio para cruzar el estero de vuelta antes de las 14:00. Del estero al glaciar hay cerca de una hora de caminata. Entre mediados de enero y fines de febrero el peligro del estero es 4 de 10 antes de la una de la tarde, y sube a 8 de 10 después de las dos.</p>'],
  ['¿Hay una cuerda para cruzar el Estero Monos de Agua?', '<p>No. El curso del río cambia día a día, así que los puntos seguros de cruce también cambian. Tampoco habrá puente, para preservar la experiencia de montaña.</p>'],
  ['¿Cuándo es la época de mayor caudal del estero?', '<p>Entre enero y febrero.</p>'],
  ['¿Puedo llevar mascotas?', '<p>No. Son una amenaza para la fauna nativa.</p>'],
  ['¿Se puede recorrer el parque en bicicleta?', '<p>Solo por el camino público. Los ciclistas pueden llegar a Los Hornitos, dejar la bicicleta al cuidado del guardaparque y seguir a pie. El objetivo principal del parque es proteger este ecosistema altoandino; agradecemos la comprensión de la comunidad ciclista.</p>'],
  ['¿Cómo está el camino para un vehículo bajo?', '<p>Por lo general los autos bajos llegan a Los Hornitos en verano. El camino es público y su estado depende del clima: las lluvias de verano pueden provocar derrumbes. Revisa nuestro Facebook antes de viajar.</p>'],
  ['¿Cómo llego al parque?', '<p>El refugio de Los Hornitos, sede del parque, está a 9 kilómetros de la ruta CH-60 a Mendoza, camino a Portillo. En transporte público hay que tomar bus o colectivo a Río Blanco, seguir hasta la Curva Cero y caminar los 9 km de ripio. Ver <a href="visita.html#como-llegar">Cómo llegar</a>.</p>'],
  ['¿Está abierto en agosto?', '<p>No. El parque cierra y el camino público queda sin mantención. La nieve lo cubre de junio a septiembre y hay peligro permanente de derrumbes.</p>'],
  ['¿Cuál es el horario del parque?', '<p>De lunes a viernes de 8:00 a 20:00, y sábados y domingos de 7:00 a 20:00. A esas horas se abre y se cierra la barrera sobre el Estero Mardones.</p>']
];

const actividades = [
  ['senderismo', 'Senderismo', 'Cuatro senderos, del paseo de media hora al día completo hasta el Mirador del Glaciar.', foto.sendero],
  ['camping', 'Camping', 'Tres sectores para acampar con los principios de No Deje Rastro.', foto.carpa],
  ['flora-y-fauna', 'Flora y fauna', 'Humedales altoandinos con 45 especies de aves y 68 de flora.', foto.binoculares],
  ['fotografia', 'Fotografía', 'Glaciares, vegas y cielos limpios. La fotografía comercial requiere permiso.', foto.cumbres],
  ['montanismo', 'Montañismo', 'Cumbres entre 4.500 y 6.000 metros, algunas aún sin ascenso.', foto.caminante],
  ['talleres', 'Educación ambiental', 'Talleres de primeros auxilios, mínimo impacto y trekking.', foto.tallerGrupo]
];

// ───────── Páginas ─────────
const out = [];

out.push(page('el-parque.html', {
  title: 'El Parque', description: 'Historia del Parque Andino Juncal, sitio Ramsar cuidado por la familia Kenrick desde 1911.',
  hero: { photo: foto.porton, crumbs: 'El parque', title: 'Un valle que descansa', lead: 'Desde 1911 en manos de la familia Kenrick. Desde 2003, libre de minería e hidroeléctricas.' },
  body: p => `<article class="prose">
<p class="lede" data-reveal>Bienvenidos a Parque Andino Juncal, un área protegida privada en el Valle de Aconcagua, en la V Región. Sus alturas van desde los 2.200 a más de 5.000 metros, con fácil acceso al Glaciar Juncal y a las montañas que lo rodean.</p>
<p data-reveal>Hay numerosos esteros, humedales, glaciares de hielo y roca, y una amplia variedad de especies nativas y endémicas de flora y fauna, propias del clima mediterráneo.</p>
<p data-reveal>La propiedad ha estado en la familia Kenrick desde 1911. En 2003 se tomó la decisión de no permitir actividades industriales como la minería o la hidroenergía en el predio, y de impedir activamente cualquier intento de desarrollarlas. En el Valle Juncal la tierra, el agua y el hielo tendrán la oportunidad de descansar, recuperarse y florecer.</p>
<figure class="figure" data-reveal><img src="${foto.humedal}" alt="Humedal altoandino en el Valle Juncal" loading="lazy"><figcaption>Las vegas del Valle Juncal, protegidas por la Convención Ramsar.</figcaption></figure>
<h2 data-reveal>Sitio Ramsar</h2>
<p data-reveal>En mayo de 2010 el parque fue designado sitio de importancia internacional por la Convención Ramsar. Es el 12.º sitio Ramsar de Chile y el n.º 1909 del mundo; el primero y único en los Andes Centrales, y el primero en manos privadas en toda Latinoamérica y el Caribe.</p>
<p data-reveal>Nos dedicamos a proteger los recursos hídricos de la alta cuenca del río Juncal, que abarca 220 km², y la vida silvestre que alberga, para las generaciones presentes y futuras.</p>
<h2 data-reveal>Recuperación y conservación</h2>
<p data-reveal>Desde que comenzamos a cuidar activamente el predio hemos visto recuperarse la flora y la fauna en todo el territorio: guanacos y pumas, inéditos en tiempos recientes, y mucha más vegetación en las vegas y laderas. La investigación científica y las observaciones de los visitantes seguirán siendo vitales en este trabajo.</p>
<p data-reveal>El predio también está más limpio. En parte por el trabajo constante de la administración y de visitantes que practican No Deje Rastro; en parte porque integrantes de la Escuela de Montaña de Río Blanco han ayudado a retirar la basura dejada por décadas de maniobras militares en el valle, incluidas vainas de municiones.</p>
<p data-reveal>La mayoría de los valles cordilleranos del Aconcagua están marcados por caminos, camiones, sondajes, túneles o rajos mineros. La cuenca del Juncal está mayoritariamente libre de intervenciones. Ayúdanos a mantenerla así.</p>
<h2 data-reveal>Cuidar y visitar</h2>
<blockquote class="quote" data-reveal>Somos parte integral de la naturaleza: cuidémosla, gocemos de sus paisajes y dejémonos inspirar por ella. Nos sana y nos transforma.</blockquote>
<p data-reveal>El Parque Andino Juncal no es una operación de ecoturismo: su misión principal es proteger el valle y la integridad de su ecosistema. Creemos que mantenerlo abierto al público es vital para su conservación, y dependemos de los visitantes y de un grupo creciente de voluntarios para mantenerlo prístino.</p>
<p data-reveal>La apertura depende de la presencia de guardaparques, que además de recibirte se aseguran de que nadie dañe el ecosistema y de que todos disfruten sin correr riesgos innecesarios.</p>
<h2 data-reveal>Vacíos legales</h2>
<p data-reveal>En Chile no hay leyes que protejan la decisión de un propietario de mantener su predio libre de minería o hidroelectricidad. Por eso trabajamos continuamente con abogados, autoridades, empresas, la comunidad y una red de conservacionistas para asegurar la conservación del predio y extenderla a los 220 km² de la cuenca.</p>
</article>
${next(p, [['conservacion.html', 'Sigue con', 'Conservación', foto.pajonal], ['actividades.html', 'Y después', 'Actividades', foto.sendero]])}`
}));

out.push(page('conservacion.html', {
  title: 'Conservación', description: 'Glaciares, humedales y biodiversidad del Parque Andino Juncal.',
  hero: { photo: foto.pajonal, crumbs: 'Conservación', title: 'Agua prístina para el Aconcagua', lead: 'Dos tercios de la cuenca del río Juncal, al pie del glaciar.' },
  body: p => `<article class="prose">
<p class="lede" data-reveal>El parque representa dos tercios de la cuenca del río Juncal y está al pie del Glaciar Juncal. Tiene cerca de 24 glaciares, al menos seis humedales de importancia y numerosas fuentes de agua prístina. Por eso en 2010 recibió la protección Ramsar.</p>
<div class="fact-grid" data-reveal>
  <div><strong data-count="45">45</strong><span>especies de aves</span></div>
  <div><strong data-count="68">68</strong><span>especies de flora</span></div>
  <div><strong data-count="10">10</strong><span>mamíferos</span></div>
  <div><strong data-count="5">5</strong><span>reptiles</span></div>
  <div><strong data-count="24" data-prefix="~">~24</strong><span>glaciares</span></div>
</div>
<p data-reveal>Esta diversidad vale aún más porque el 93% de la flora y el 98% de la fauna son nativas. Siete especies de flora y cinco de fauna son endémicas. También hay dos especies de sapo.</p>
<h2 data-reveal>Los humedales</h2>
<p data-reveal>Los humedales son un foco de conservación porque son fuente de vida para la flora y la fauna en un ambiente tan agreste como el de Juncal. Albergan aves y dan agua a mamíferos como el guanaco y la vizcacha.</p>
<ul data-reveal><li><b>Valle Juncal:</b> Vega la Roca, Vegas la Paz y Vegas de Nacimiento.</li><li><b>Cajón de Mardones:</b> Vega las Mardones.</li><li><b>Cajón de Navarro:</b> Vegas las Canchitas.</li></ul>
<figure class="figure" data-reveal><img src="${foto.humedal}" alt="Vega altoandina con la cordillera de fondo" loading="lazy"></figure>
<p data-reveal>El parque observa un retorno creciente de especies, desde aves hasta fauna clave como el guanaco, y un aumento del área y la densidad de la vegetación en los humedales.</p>
<h2 data-reveal>Los límites</h2>
<p data-reveal>La propiedad tiene 13.796 hectáreas. Al norte, la línea de la Quebrada Barros Negros y la pirca de piedra que une el río Juncal con el Paso de Bermejo. Al oriente, la frontera con Argentina. Al sur, el Estero y la Quebrada de los Monos de Agua. Al poniente, el río Juncal.</p>
</article>
${next(p, [['el-parque.html', 'Conoce', 'La historia del parque', foto.porton], ['actividades/flora-y-fauna.html', 'Sal a ver', 'Flora y fauna', foto.binoculares]])}`
}));

out.push(page('visita.html', {
  title: 'Visita el parque', description: 'Tarifas, cómo llegar, horarios y reglamento del Parque Andino Juncal.',
  hero: { photo: foto.refugio, crumbs: 'Visita', title: 'Planifica tu visita', lead: 'De viernes a domingo se ingresa solo con reserva previa.' },
  body: p => `<section id="tarifas">
  <div class="center-head"><p class="eyebrow" data-reveal>Tarifas</p><h2 data-reveal>Precios por persona</h2><p data-reveal>La entrada al parque se paga aparte del alojamiento.</p></div>
  <div class="price-cols">
    <div class="price-list" data-reveal><h3>Entrada por el día</h3>
      <div class="price-row"><span class="name">Adulto</span><span class="dots"></span><span class="amount">$8.000</span></div>
      <div class="price-row"><span class="name">Niño<small>hasta 12 años</small></span><span class="dots"></span><span class="amount">$4.000</span></div>
      <p class="price-note"><b>Residentes de las 10 comunas de San Felipe y Los Andes:</b> 25% de descuento en la entrada adulto, presentando un documento que acredite residencia.</p></div>
    <div class="price-list" data-reveal style="--d:100ms"><h3>Pernoctar</h3>
      <div class="price-row"><span class="name">Camping Los Hornitos<small>en la entrada del parque</small></span><span class="dots"></span><span class="amount">$5.000 <em>/ noche</em></span></div>
      <div class="price-row"><span class="name">Camping Las Morrenas<small>a 7 km de la entrada</small></span><span class="dots"></span><span class="amount">$3.500 <em>/ noche</em></span></div>
      <div class="price-row"><span class="name">Camping niños<small>hasta 12 años</small></span><span class="dots"></span><span class="amount">$2.500 <em>/ noche</em></span></div>
      <div class="price-row"><span class="name">Backcountry<small>zonas no habilitadas</small></span><span class="dots"></span><span class="amount">$2.000 <em>/ noche</em></span></div>
      <div class="price-row"><span class="name">Refugio del Arriero<small>habitación hasta 3 personas · comedor con cocina, gas y vajilla · check-in 15:00, check-out 12:00</small></span><span class="dots"></span><span class="amount">$50.000</span></div></div>
  </div>
  <div class="prices-cta" data-reveal><a class="button dark" href="${p}index.html#reservar" data-magnetic><span class="magnetic-label">Reservar visita</span></a></div>
</section>
<section id="empresas" class="prose" style="margin-top:100px">
  <h2 data-reveal>Empresas, fotografía comercial y drones</h2>
  <p data-reveal>Toda empresa que visite el parque con fines de lucro, turísticos o audiovisuales, debe avisar con al menos tres días de anticipación. Sin ese aviso, se le puede negar la entrada.</p>
  <div class="callout" data-reveal><b>Drones, filmación y fotografía comercial están prohibidos</b> salvo con un permiso especial de la Administración, solicitado con anticipación a <a href="mailto:info@parqueandinojuncal.cl">info@parqueandinojuncal.cl</a>.</div>
</section>
<section id="como-llegar" class="prose" style="margin-top:100px">
  <h2 data-reveal>Cómo llegar</h2>
  <p data-reveal>El refugio de Los Hornitos, sede del parque, está a 9 kilómetros de la ruta CH-60 a Mendoza, camino a Portillo, en la V Región. Por lo general los autos bajos llegan en verano; el camino es público y su estado depende del clima.</p>
  <p data-reveal>En transporte público: bus o colectivo a Río Blanco, luego hasta la Curva Cero y 9 km a pie por camino de ripio.</p>
  <div class="map-frame" data-reveal style="height:380px"><iframe title="Mapa del Parque Andino Juncal" loading="lazy" src="https://www.google.com/maps?q=Parque+Andino+Juncal&amp;z=11&amp;output=embed"></iframe></div>
  <p data-reveal><a href="https://parqueandinojuncal.cl/wp-content/uploads/2017/03/Como-llegar-al-Parque-Andino-Juncal-2019-2020.pdf" target="_blank" rel="noopener">Descargar la guía «Cómo llegar» (PDF) ↗</a></p>
  <h3 data-reveal>Horarios</h3>
  <p data-reveal>Lunes a viernes de 8:00 a 20:00; sábados y domingos de 7:00 a 20:00, cuando se abre y se cierra la barrera sobre el Estero Mardones. El parque cierra en invierno: la nieve lo cubre de junio a septiembre.</p>
</section>
<section id="reglamento" class="prose" style="margin-top:100px">
  <h2 data-reveal>Reglamento</h2>
  <p data-reveal>Este ecosistema altoandino, en la cabecera del río Aconcagua, es un lugar único. Para que muchas personas puedan disfrutarlo, te pedimos respetar estas normas.</p>
  <ul data-reveal>
    <li><b>No Deje Rastro:</b> practica sus principios y minimiza tu impacto.</li>
    <li><b>Humedales:</b> no camines sobre las vegas ni los humedales. Pisarlos es motivo de expulsión.</li>
    <li><b>Plantas:</b> no saques plantas, pastos, raíces ni palos. No cortes flores.</li>
    <li><b>Basura:</b> llévate toda tu basura y la que encuentres. No la quemes, no la entierres, no la tires al agua.</li>
    <li><b>Fuego:</b> solo en el camping de Los Hornitos, con tu propia leña.</li>
    <li><b>Mascotas:</b> prohibidas; son una amenaza para la fauna nativa.</li>
    <li><b>Caza y pesca:</b> totalmente prohibidas, igual que ingresar armas de fuego.</li>
  </ul>
  <h3 data-reveal>Recomendaciones</h3>
  <ul data-reveal>
    <li>Llena tu ficha con los guardaparques antes de comenzar, avisa cambios de itinerario y despídete al salir.</li>
    <li>Mantente en los senderos, no te separes del grupo y lleva agua, comida, abrigo y linterna.</li>
    <li>Los menores deben ingresar con un adulto responsable. Supervisa de cerca a los niños.</li>
    <li>Entre enero y febrero el Estero Monos de Agua tiene su mayor caudal: sigue las instrucciones de los guardaparques.</li>
    <li>No alimentes ni manipules animales silvestres. Si te encuentras con un puma o un guanaco, mantén la distancia.</li>
    <li>Lava tu vajilla en los lavaplatos del parque y evita el detergente.</li>
    <li>Si necesitas defecar, aléjate 60 metros del sendero y de los cursos de agua, y entierra tus deposiciones.</li>
    <li>El virus hanta está presente en la zona: no entres a las construcciones abandonadas.</li>
    <li>El acceso al glaciar lo otorgan gentilmente los propietarios vecinos: es un privilegio que debemos cuidar.</li>
  </ul>
</section>`
}));

out.push(page('actividades.html', {
  title: 'Actividades', description: 'Senderismo, camping, flora y fauna, fotografía, montañismo y educación ambiental en el Parque Andino Juncal.',
  hero: { photo: foto.sendero, crumbs: 'Actividades', title: 'Qué hacer en el Juncal', lead: 'Todo lo que se vive en el parque, con el mínimo impacto posible.' },
  body: p => `<div class="card-grid">${actividades.map(([slug, nombre, texto, img], i) =>
    `<a class="photo-card" href="${p}actividades/${slug}.html" data-reveal style="--d:${i * 60}ms"><span class="bg" style="background-image:url('${img}')"></span><small>0${i + 1}</small><h3>${nombre}</h3><p>${texto}</p><span class="go">Ver más →</span></a>`).join('')}</div>`
}));

const actividadPagina = (slug, cuerpo, h) => {
  const i = actividades.findIndex(a => a[0] === slug);
  const [, nombre, , img] = actividades[i];
  const sig = actividades[(i + 1) % actividades.length], ant = actividades[(i + actividades.length - 1) % actividades.length];
  return page(`actividades/${slug}.html`, {
    title: nombre, description: `${nombre} en el Parque Andino Juncal.`,
    hero: { photo: img, crumbs: `<a href="../actividades.html">Actividades</a> · ${nombre}`, title: nombre, ...h },
    body: p => `<article class="prose">${cuerpo}</article>
${next(p, [[`actividades/${ant[0]}.html`, '← Anterior', ant[1], ant[3]], [`actividades/${sig[0]}.html`, 'Siguiente →', sig[1], sig[3]]])}`
  });
};

out.push(actividadPagina('senderismo', `
<p class="lede" data-reveal>Cuatro senderos, desde un paseo de media hora hasta un día completo al pie del glaciar.</p>
<div class="trail-list">
  <div class="trail" data-reveal><div class="tags"><span>Dificultad media</span><span>6 a 8 horas</span><span>9 km por tramo</span><span>+500 m</span></div><h3>Mirador del Glaciar</h3>
    <p>Lleva al camping Las Morrenas y al Estero Monos de Agua. Evaluando las condiciones, se cruza el estero y se sigue al Mirador del Glaciar Juncal. Si no te sientes cómodo frente al río, o no tienes la experiencia para cruzarlo en forma segura, no lo cruces: eso también es parte de la experiencia de montaña.</p>
    <p>No habrá puente ni cuerda fija: el río cambia día a día, y queremos intervenir el ambiente lo menos posible.</p></div>
  <div class="trail" data-reveal><div class="tags"><span>Fácil</span><span>30 minutos</span></div><h3>Sendero del Pastizal</h3>
    <p>Un paseo corto y de poco desnivel que parte cerca del refugio, pasa por una cururera y ofrece una vista panorámica de los ríos Juncal y Navarro.</p></div>
  <div class="trail" data-reveal><div class="tags"><span>Fácil</span><span>Corto</span></div><h3>Vega de la Roca</h3>
    <p>Parte a unos 400 metros al norte del refugio, por el camino E-781, y sube a una pequeña laguna y humedal al pie de una roca de 15 metros, con vista panorámica hacia el norte del valle.</p></div>
  <div class="trail" data-reveal><div class="tags"><span class="closed">Cerrado · solo expertos</span><span>Media a difícil</span><span>3 a 8 horas</span></div><h3>Vega de Canchitas</h3>
    <p>Por la exposición y el desmoronamiento del sendero, hoy está cerrado salvo para expertos. Tiene vistas al Glaciar Juncal, al glaciar colgante del Cerro Gemelos y al humedal Las Canchitas, y da acceso a cerros como El Yeso, Puntón Amarillo y Humberto Barrera.</p>
    <p>El primer tramo, hasta el cruce del Estero Navarro, son unas tres horas ida y vuelta; no es apto para principiantes. El segundo, para montañistas con experiencia, son unas ocho horas y 500 metros de desnivel hasta Las Canchitas, a unos 3.000 metros, donde hay un pequeño sitio de camping. Consulta siempre su estado.</p></div>
</div>
<div class="callout" data-reveal><b>Horario del Estero Monos de Agua (enero y febrero):</b> con el deshielo, el caudal crece en la tarde. Lo ideal es salir del refugio a las 8:00 y cruzar de vuelta antes de las 14:00. Antes de la una el peligro es 4 de 10; después de las dos sube a 8 de 10.</div>`,
  { lead: 'Del paseo corto al día completo al pie del Glaciar Juncal.' }));

out.push(actividadPagina('camping', `
<p class="lede" data-reveal>Acampamos con los siete principios de No Deje Rastro: al irte, no debe quedar evidencia de que estuviste aquí.</p>
<div class="trail-list">
  <div class="trail" data-reveal><div class="tags"><span>$5.000 por noche</span><span>Baño y lavadero</span><span>Fogones</span></div><h3>Los Hornitos</h3><p>Sitios alrededor de la ruina del antiguo Hotel Mil Estrellas, en la entrada del parque. Hay un baño básico pero limpio, un lavadero, agua para cocinar y beber, y zonas para fogatas con bancas y una mesa compartidas. Trae tu propia leña o carbón.</p></div>
  <div class="trail" data-reveal><div class="tags"><span>$3.500 por noche</span><span>A 7 km de la entrada</span></div><h3>Las Morrenas</h3><p>En la planicie dentro del roquerío, protegida del viento, cerca del Estero Monos de Agua y después del cerco. Las carpas van a 50 metros al suroeste del sendero. El agua se toma del estero, nunca del humedal.</p></div>
  <div class="trail" data-reveal><div class="tags"><span>Backcountry</span><span>Solo expertos</span></div><h3>Las Canchitas</h3><p>Unas pircas al norte del sendero, al llegar a la ampliación del valle. No acampes cerca del humedal ni lo pises.</p></div>
</div>
<p data-reveal>En época de deshielo, entre enero y mediados de marzo, el agua de los esteros arrastra sedimento: conviene traer bidones. También puedes alojar en el Refugio del Arriero. Revisa las <a href="../visita.html#tarifas">tarifas</a>.</p>`,
  { lead: 'Tres sectores para dormir bajo el cielo de la cordillera.' }));

out.push(actividadPagina('flora-y-fauna', `
<p class="lede" data-reveal>Los humedales altoandinos son focos de biodiversidad. El sendero entre Los Hornitos y la Vega de Nacimiento cruza al menos tres, sin pendientes fuertes: un lugar óptimo para observar.</p>
<h2 data-reveal>Aves</h2>
<p data-reveal>Quebradas, cursos de agua y humedales dan cobijo a aves del ecosistema altoandino: el picaflor cordillerano, el perico cordillerano, el chorlito cordillerano y rapaces como el cernícalo, el águila chilena, el carancho y el cóndor. Puedes revisar los registros del parque en eBird.</p>
<h2 data-reveal>Fauna</h2>
<p data-reveal>Lo más común son las aves, pero también es posible encontrarse con el cururo, el zorro culpeo, la liebre y pequeños ratones. Ha habido avistamientos recientes de guanacos y vizcachas. El parque está dentro del área de desplazamiento del puma, el guanaco, el gato montés, el zorro, la vizcacha y el cururo.</p>
<figure class="figure" data-reveal><img src="${foto.binoculares}" alt="Visitantes observando aves con binoculares" loading="lazy"></figure>
<h2 data-reveal>Flora</h2>
<p data-reveal>El Valle de Juncal atrae a botánicos por su flora nativa y endémica. Nos han visitado grupos como el del Jardín Botánico Chagual y el Royal Botanic Garden Edinburgh. Destacan la <i>Alstroemeria spathulata</i> y la familia de las <i>Rhodophiala</i>; hay cerca de 70 especies identificadas, la mayoría nativas o endémicas.</p>
<div class="callout" data-reveal>Camina en silencio: tendrás más oportunidades de ver fauna. No alimentes ni manipules animales silvestres, y llévate buenos recuerdos, no animales.</div>`,
  { lead: 'Cóndores, guanacos y el chorlito cordillerano, en vegas a más de 2.000 metros.' }));

out.push(actividadPagina('fotografia', `
<p class="lede" data-reveal>Glaciares colgantes, vegas verdes y cielos limpios: el Valle Juncal es un lugar privilegiado para fotografiar la alta montaña.</p>
<p data-reveal>La fotografía recreativa es bienvenida en todo el parque. Camina en silencio y con paciencia: así tendrás más oportunidades de retratar fauna silvestre, siempre a distancia y sin alterar su comportamiento.</p>
<figure class="figure" data-reveal><img src="${foto.dorado}" alt="Luz de tarde sobre las laderas del Valle Juncal" loading="lazy"></figure>
<div class="callout" data-reveal><b>Fotografía y filmación comercial, y uso de drones:</b> prohibidos salvo con un permiso especial de la Administración, solicitado con anticipación a <a href="mailto:info@parqueandinojuncal.cl">info@parqueandinojuncal.cl</a>.</div>
<p data-reveal>Recuerda no pisar vegas ni humedales para conseguir un encuadre: son extremadamente frágiles y pisarlos es motivo de expulsión.</p>`,
  { lead: 'Retrata la alta montaña sin dejar rastro.' }));

out.push(actividadPagina('montanismo', `
<p class="lede" data-reveal>El Valle Juncal abarca cumbres de alta montaña entre los 4.500 y los 6.000 metros, algunas todavía sin ascenso.</p>
<p data-reveal>Hay rutas para todos los desafíos técnicos: campos de hielo, glaciares colgantes y rutas menos técnicas pero igual de exigentes por su altura o pendiente.</p>
<div class="fact-grid" data-reveal>
  <div><strong>5.968</strong><span>Cerro Juncal (m, aprox.)</span></div>
  <div><strong>5.380</strong><span>Alto Los Leones (m)</span></div>
  <div><strong>5.240</strong><span>Cerro Gemelos (m)</span></div>
</div>
<p data-reveal>Estas cumbres son parte de la historia del montañismo chileno: en diciembre de 1938, una cordada alcanzó el Nevado Juncal, y Dorly se convirtió en la primera mujer en lograrlo. Lee la historia completa en la «Monografía de Nevado Juncal» de Ulrich Lorber, y consulta las rutas en Andeshandbook.</p>
<div class="callout" data-reveal>Antes de subir, registra tu ficha y tu itinerario con los guardaparques, y avísales al volver.</div>`,
  { lead: 'Cumbres de hasta 6.000 metros en la cordillera central.' }));

out.push(actividadPagina('talleres', `
<p class="lede" data-reveal>Junto a la Academia de Montaña La Cumbre organizamos talleres para aprender a moverse en la montaña con seguridad y mínimo impacto.</p>
<div class="trail-list">
  <div class="trail" data-reveal><div class="tags"><span>20 horas</span><span>En terreno</span></div><h3>Primeros auxilios en alta montaña</h3><p>Basado en las técnicas clave de la certificación Wilderness First Responder, pensado para guardaparques y guías de alta montaña, y para quien quiera herramientas para evitar y tratar accidentes.</p></div>
  <div class="trail" data-reveal><div class="tags"><span>1 día</span></div><h3>Introducción al senderismo y No Deje Rastro</h3><p>Aprende a observar con respeto la flora y la fauna, a caminar con paso seguro y a minimizar el impacto de tu visita aplicando los principios de No Deje Rastro.</p></div>
  <div class="trail" data-reveal><div class="tags"><span>2 días</span></div><h3>Iniciación al trekking y la vida al aire libre</h3><p>Para quienes dan sus primeros pasos: planificar una travesía, técnicas de campamento, uso de la cocinilla, armar la mochila y definir una ruta, con el parque como sala de clases.</p></div>
</div>
<figure class="figure" data-reveal><img src="${foto.auxilios}" alt="Práctica de primeros auxilios en el parque" loading="lazy"><figcaption>Primer taller de primeros auxilios en el parque.</figcaption></figure>
<p data-reveal>Consulta las próximas fechas y valores a <a href="mailto:info@parqueandinojuncal.cl">info@parqueandinojuncal.cl</a>.</p>`,
  { lead: 'Aprender en la montaña, con la montaña como sala de clases.' }));

out.push(page('noticias.html', {
  title: 'Noticias y prensa', description: 'Noticias del Parque Andino Juncal y lo que dice la prensa sobre el parque.',
  hero: { photo: foto.cumbres, crumbs: 'Noticias', title: 'Noticias y prensa', lead: 'Lo que pasa en el valle y lo que se ha escrito sobre él.' },
  body: p => `<div class="card-grid">${noticias.map((n, i) =>
    `<a class="photo-card" href="${p}noticias/${n.slug}.html" data-reveal style="--d:${i * 60}ms"><span class="bg" style="background-image:url('${n.foto}')"></span><small>${n.fecha}</small><h3>${n.titulo}</h3><p>${n.resumen}</p><span class="go">Leer →</span></a>`).join('')}</div>
<section id="prensa" style="margin-top:110px">
  <div class="center-head"><p class="eyebrow" data-reveal>En la prensa</p><h2 data-reveal>Lo que se ha escrito del parque</h2></div>
  <div class="press">${prensa.map(([medio, fecha, titulo, cita, url]) =>
    `<article class="press-item" data-reveal><div><span class="outlet">${medio}</span><time>${fecha}</time></div><div><h3>${titulo}</h3>${cita ? `<blockquote>${cita}</blockquote>` : ''}<a href="${url}" target="_blank" rel="noopener">Ver publicación ↗</a></div></article>`).join('')}</div>
</section>`
}));

noticias.forEach((n, i) => {
  const sig = noticias[(i + 1) % noticias.length];
  page(`noticias/${n.slug}.html`, {
    title: n.titulo, description: n.resumen,
    hero: { photo: n.foto, crumbs: `<a href="../noticias.html">Noticias</a> · ${n.fecha}`, title: n.titulo },
    body: p => `<article class="prose" data-reveal>${n.cuerpo}</article>
${next(p, [['noticias.html', '← Volver a', 'Todas las noticias', foto.cumbres], [`noticias/${sig.slug}.html`, 'Siguiente noticia →', sig.titulo, sig.foto]])}`
  });
  out.push(`noticias/${n.slug}.html`);
});

out.push(page('apoya.html', {
  title: 'Apoya', description: 'Dona o súmate como voluntario al Parque Andino Juncal.',
  hero: { photo: foto.voluntarios, crumbs: 'Apoya', title: 'Cuidemos juntos el valle', lead: 'El parque depende de sus visitantes, donantes y voluntarios.' },
  body: p => `<div class="support-grid">
  <a class="photo-card" href="#donacion" data-reveal><span class="bg" style="background-image:url('${foto.grupo}')"></span><small>Donación</small><h3>Aporta a su futuro</h3><p>Donaciones en dinero o en bienes.</p></a>
  <a class="photo-card" href="#voluntariado" data-reveal style="--d:80ms"><span class="bg" style="background-image:url('${foto.voluntarios}')"></span><small>Voluntariado</small><h3>Trabaja en el parque</h3><p>En terreno o desde Santiago.</p></a>
</div>
<article class="prose" style="margin-top:80px">
<h2 id="donacion" data-reveal>Donación</h2>
<p data-reveal>Puedes aportar donaciones en dinero o en bienes. Estamos preparando una campaña de recaudación de fondos para asegurar el futuro del parque: si compartes nuestra misión, ayúdanos.</p>
<p data-reveal>Para saber cómo colaborar, escribe a la Administración del parque, Tomás Dinges Kenrick o Catherine Kenrick, a <a href="mailto:info@parqueandinojuncal.cl">info@parqueandinojuncal.cl</a>.</p>
<h2 id="voluntariado" data-reveal>Voluntariado</h2>
<p data-reveal>Hay periodos en que necesitamos voluntarios para todo tipo de tareas, y otros en que buscamos ayuda para tareas específicas. Antes de venir, escríbenos a <a href="mailto:info@parqueandinojuncal.cl">info@parqueandinojuncal.cl</a> con tus fechas, intereses y destrezas.</p>
<h3 data-reveal>Participación general</h3>
<p data-reveal>Estarás disponible para las tareas del día que indique el guardaparque, en el parque o en Santiago apoyando la administración. Desde trabajo pesado, como mantener senderos o mejorar Los Hornitos, hasta tareas más livianas, como erradicar especies invasoras, tallar señalética o acompañar visitantes.</p>
<h3 data-reveal>Tareas específicas</h3>
<p data-reveal>Trabajos que requieren destrezas profesionales, en un plazo definido y con un acta de compromiso: contabilidad, diseño o construcción, materiales de difusión o estrategias de levantamiento de fondos.</p>
<h3 data-reveal>Otras formas de ayudar</h3>
<p data-reveal>Síguenos en <a href="https://www.instagram.com/parqueandinojuncal/" target="_blank" rel="noopener">Instagram</a> y <a href="https://www.facebook.com/parqueandinojuncal" target="_blank" rel="noopener">Facebook</a> y ayúdanos a difundir las metas de conservación del parque.</p>
</article>`
}));

out.push(page('preguntas-frecuentes.html', {
  title: 'Preguntas frecuentes', description: 'Respuestas sobre camping, senderos, horarios y cómo llegar al Parque Andino Juncal.',
  hero: { photo: foto.glaciar, crumbs: 'Preguntas frecuentes', title: 'Preguntas frecuentes', lead: 'Todo lo que conviene saber antes de venir.' },
  body: () => `<div class="faq-list">${faqs.map(([q, a], i) => `<details data-reveal${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="answer">${a}</div></details>`).join('')}</div>`
}));

out.push(page('terminos.html', {
  title: 'Términos y condiciones', description: 'Términos y condiciones de visita del Parque Andino Juncal.',
  hero: { photo: foto.valle, crumbs: 'Términos y condiciones', title: 'Términos y condiciones' },
  body: () => `<article class="prose">
<h2>Notas generales</h2>
<p>El Parque Andino Juncal es un predio privado y se reserva el derecho de no permitir la entrada a visitantes cuyos fines no calcen con los del parque. Somos un sitio de conservación de la naturaleza y priorizamos las actividades relacionadas con ella por sobre el turismo.</p>
<p>Caminar sobre los humedales es motivo de expulsión.</p>
<p>Nos reservamos el derecho de negar la entrada a grupos que lleguen después del cierre: llegar tarde en la noche molesta a otros visitantes y a los guardaparques, y es peligroso.</p>
<p>Toda empresa que realice actividades comerciales en el parque debe presentarse con anticipación ante la Administración.</p>
<h2>Renuncia de responsabilidad</h2>
<p>El Parque Andino Juncal no será responsable por lesiones, daños o costos incurridos por los visitantes. La visita supone riesgos propios de la naturaleza, que todos los visitantes asumen al entrar. El ingreso implica una liberación expresa y anticipada de responsabilidad de los propietarios y funcionarios del parque por lesiones, daños materiales o muerte con motivo de la visita. El cuidado de tu salud e integridad te corresponde total y exclusivamente.</p>
</article>`
}));

// Borrador alineado con la Ley 21.719; los datos marcados como pendientes los completa el parque y lo revisa un abogado.
out.push(page('privacidad.html', {
  title: 'Privacidad y datos personales', description: 'Cómo el Parque Andino Juncal trata los datos personales de sus visitantes, conforme a la Ley 21.719.',
  hero: { photo: foto.pajonal, crumbs: 'Privacidad', title: 'Privacidad y datos personales', lead: 'Qué datos pedimos, para qué y cuánto tiempo los guardamos.' },
  body: () => `<article class="prose">
<p class="legal-meta"><span><b>Versión:</b> borrador de noviembre de 2026</span><span>Pendiente de revisión legal antes de publicarse</span></p>
<p class="lede">Pedimos solo los datos que necesitamos para recibirte en el parque con seguridad, y los tratamos conforme a la Ley 21.719 sobre protección de datos personales.</p>

<h2>Quién es el responsable</h2>
<p><b>Comunidad Kenrick Lyon, Parque Andino Juncal.</b> RUT: [pendiente]. Domicilio: [pendiente]. Contacto para temas de datos personales: <a href="mailto:info@parqueandinojuncal.cl">info@parqueandinojuncal.cl</a>, con el asunto «Datos personales».</p>

<h2>Qué datos tratamos y para qué</h2>
<table>
  <tr><th>Cuándo</th><th>Datos</th><th>Para qué</th><th>Cuánto tiempo</th></tr>
  <tr><td>Reserva</td><td>Nombre, RUT, correo, teléfono, fecha, número de visitantes y alojamiento.</td><td>Gestionar tu reserva, emitir tu entrada y controlar los cupos.</td><td>[pendiente, p. ej. 12 meses]; lo tributario, según exige la ley.</td></tr>
  <tr><td>Ficha del visitante</td><td>Itinerario y contacto de emergencia.</td><td>Tu seguridad en la montaña y la búsqueda en caso de emergencia.</td><td>Hasta el fin de la temporada.</td></tr>
  <tr><td>Pago</td><td>Monto y estado del pago.</td><td>Confirmar tu reserva. Los datos de tu tarjeta o de tu banco los procesa el proveedor de pago que elijas (Webpay, Mercado Pago, Flow o Khipu); nosotros no los vemos ni los guardamos.</td><td>Según la normativa tributaria.</td></tr>
  <tr><td>Formulario de contacto</td><td>Nombre, correo y mensaje.</td><td>Responder tu consulta.</td><td>[pendiente, p. ej. 12 meses].</td></tr>
</table>

<h2 id="residencia">Comprobante de residencia</h2>
<p>Para el descuento de residentes de las provincias de San Felipe y Los Andes puedes subir la foto de un documento con tu domicilio. Ese documento contiene datos personales, como tu nombre y tu dirección, por eso lo tratamos así:</p>
<ul>
  <li><b>Solo con tu consentimiento</b>, que das al marcar la casilla antes de subir la foto y que puedes retirar cuando quieras.</li>
  <li><b>Una sola finalidad:</b> comprobar que vives en una de las 10 comunas con descuento. No la usamos para nada más, no la compartimos y no la usamos con fines comerciales.</li>
  <li><b>Se analiza en tu dispositivo.</b> La foto no se envía a nuestros servidores ni a los de terceros, y no se guarda.</li>
  <li><b>Se elimina al terminar el análisis.</b> La página borra la foto y el texto leído. Solo queda el resultado (sí o no, y la comuna), que se asocia a tu reserva para aplicar el descuento.</li>
  <li><b>No es una decisión definitiva.</b> La revisión automática solo filtra fotos ilegibles. Si no aprueba, puedes acreditar tu residencia en la entrada y una persona lo revisa. En la entrada, el guardaparque mira tu carnet sin fotocopiarlo ni guardarlo.</li>
</ul>
<p>Si prefieres no subir ninguna foto, puedes mostrar el documento al llegar y se aplica igual el descuento.</p>

<h2 id="contacto">Formulario de contacto</h2>
<p>Usamos tu nombre y tu correo solo para responderte. No los agregamos a listas de correo sin tu autorización.</p>

<h2>Navegación por el sitio</h2>
<p>No usamos cookies de seguimiento ni de publicidad. El sitio guarda en tu navegador un único dato temporal, que se borra al cerrar la pestaña, para mostrar la transición entre páginas.</p>
<p>Al cargar algunas partes del sitio, tu navegador se conecta a servicios de terceros, que pueden recibir tu dirección IP: Google Fonts (tipografías), Google Maps (el mapa de cómo llegar) y jsDelivr (la herramienta de lectura de documentos, solo si subes un comprobante).</p>

<h2>Tus derechos</h2>
<p>Puedes pedirnos en cualquier momento <b>acceder</b> a tus datos, <b>rectificarlos</b>, <b>suprimirlos</b>, <b>oponerte</b> a su tratamiento, pedir su <b>portabilidad</b> o su <b>bloqueo temporal</b>, y retirar tu consentimiento. Escríbenos a <a href="mailto:info@parqueandinojuncal.cl">info@parqueandinojuncal.cl</a> con el asunto «Datos personales» y te responderemos dentro del plazo legal.</p>
<p>Si no quedas conforme con nuestra respuesta, puedes reclamar ante la Agencia de Protección de Datos Personales.</p>

<h2>Seguridad y menores de edad</h2>
<p>Aplicamos medidas para proteger tus datos frente a accesos no autorizados, pérdida o alteración, y solo acceden a ellos las personas del parque que los necesitan para su trabajo.</p>
<p>Los datos de niños y niñas los entrega el adulto responsable que hace la reserva, y solo se usan para su ingreso y su seguridad.</p>

<h2>Cambios a esta política</h2>
<p>Si cambiamos esta política, publicaremos la nueva versión en esta página con su fecha.</p>
</article>`
}));

// Datos para la pila de noticias de la portada: noticias reales y lo más reciente de la prensa.
const portada = [
  ...noticias.map(n => ({ fecha: n.fecha, titulo: n.titulo, resumen: n.resumen, foto: n.foto, href: `noticias/${n.slug}.html` })),
  ...prensa.slice(0, 3).map(([medio, fecha, titulo], i) => ({ fecha: `${fecha} · ${medio}`, titulo, resumen: 'El parque en la prensa.', foto: [foto.dorado, foto.pajonal, foto.cumbres][i], href: 'noticias.html#prensa' }))
];
writeFileSync(join(root, 'assets/noticias-data.js'), '// Generado por _tools/construir.mjs. No editar a mano.\nwindow.NOTICIAS = ' + JSON.stringify(portada, null, 1) + ';\n');

// La portada comparte header y pie: se reemplazan entre sus marcadores.
const indexFile = join(root, 'index.html');
let index = readFileSync(indexFile, 'utf8');
index = index.replace(/<!-- header -->[\s\S]*?<!-- \/header -->/, `<!-- header -->\n${header('')}\n<!-- /header -->`)
  .replace(/<!-- footer -->[\s\S]*?<!-- \/footer -->/, `<!-- footer -->\n${footer('')}\n<!-- /footer -->`);
writeFileSync(indexFile, index);

// Huella de versión en los CSS y JS propios (?v=…): cambia con el contenido, así ningún navegador
// mezcla un HTML nuevo con un CSS o JS viejo guardado en caché.
const assetNames = ['site.css', 'site.js', 'ave-juncal.js', 'logo-juncal-data.js', 'noticias-data.js'];
const hashes = Object.fromEntries(assetNames.map(name =>
  [name, createHash('sha1').update(readFileSync(join(root, 'assets', name))).digest('hex').slice(0, 8)]));
for (const file of ['index.html', ...out]) {
  const path = join(root, file);
  const html = readFileSync(path, 'utf8').replace(/(assets\/([\w.-]+\.(?:css|js)))(\?v=\w+)?"/g,
    (all, ref, name) => hashes[name] ? `${ref}?v=${hashes[name]}"` : all);
  writeFileSync(path, html);
}

console.log(out.length + ' páginas:\n' + out.join('\n'));
