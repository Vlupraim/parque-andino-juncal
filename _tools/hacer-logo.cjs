// Calca los 8 fotogramas de Gemini a vectores y compone el logo (pájaro sobre la J de JUNCAL).
const fs = require('fs'), path = require('path');
const Jimp = require('jimp');
const potrace = require('potrace');
const opentype = require('opentype.js');

const ROOT = path.resolve(__dirname, '..');
const SHEET = path.join(ROOT, 'referencias/fotogramas-gemini.jpg');
const NAMES = ['perch', 'crouch', 'lift', 'upBack', 'level', 'mid', 'level2', 'up'];
const r1 = n => Math.round(n * 10) / 10;

const trace = buffer => new Promise((ok, fail) =>
  potrace.trace(buffer, { threshold: 140, turdSize: 20, optTolerance: .3 }, (err, svg) => err ? fail(err) : ok(svg.match(/ d="([^"]+)"/)[1])));

async function frames() {
  const sheet = await Jimp.read(SHEET);
  const rows = [[0, 580], [580, sheet.bitmap.height]];
  const out = [];
  for (let i = 0; i < 8; i++) {
    const [y0, y1] = rows[Math.floor(i / 4)], x0 = (i % 4) * 500;
    const cell = sheet.clone().crop(x0, y0, 500, y1 - y0).greyscale();
    const { width, height, data } = cell.bitmap;
    const dark = (x, y) => data[(y * width + x) * 4] < 128;
    let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
    const rowsMax = new Map();
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (dark(x, y)) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      rowsMax.set(y, Math.max(rowsMax.get(y) ?? -1, x));
    }
    // Punta del pico: el píxel oscuro más a la derecha (el pájaro mira a la derecha en todos).
    const tipYs = [...rowsMax].filter(([, x]) => x >= maxX - 1).map(([y]) => y);
    const tip = [maxX, tipYs.reduce((a, b) => a + b, 0) / tipYs.length];
    // Patas: centro de los píxeles oscuros en las 4 filas inferiores.
    let fx = 0, n = 0;
    for (let y = maxY - 3; y <= maxY; y++) for (let x = 0; x < width; x++) if (dark(x, y)) { fx += x; n++; }
    const d = await trace(await cell.getBufferAsync(Jimp.MIME_PNG));
    out.push({ name: NAMES[i], d, box: [minX, minY, maxX, maxY], tip, feet: [fx / n, maxY], rowsMax });
  }
  return out;
}

function glyphRun(font, text, x, baseline, size, tracking = 0) {
  let d = '', cx = x;
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    d += glyph.getPath(cx, baseline, size).toPathData(1);
    cx += glyph.advanceWidth / font.unitsPerEm * size + tracking;
  }
  return { d, width: cx - x - tracking };
}

(async () => {
  const list = await frames();

  // Fotogramas alineados por la punta del pico: así el cuerpo no salta entre dibujos.
  let U = [1e9, 1e9, -1e9, -1e9];
  for (const f of list) {
    f.shift = [-f.tip[0], -f.tip[1]];
    const [a, b, c, d] = f.box;
    U = [Math.min(U[0], a + f.shift[0]), Math.min(U[1], b + f.shift[1]), Math.max(U[2], c + f.shift[0]), Math.max(U[3], d + f.shift[1])];
  }
  U = [Math.floor(U[0]) - 4, Math.floor(U[1]) - 4, Math.ceil(U[2]) + 4, Math.ceil(U[3]) + 4];
  const frameView = [U[0], U[1], U[2] - U[0], U[3] - U[1]];

  // Logo: JUNCAL en EB Garamond SemiBold, PARQUE ANDINO en Montserrat Medium espaciada.
  const serif = opentype.loadSync(path.join(__dirname, 'fonts/garamond-600.woff'));
  const sans = opentype.loadSync(path.join(__dirname, 'fonts/montserrat-500.woff'));
  const size = 200, base = 0;
  const juncal = glyphRun(serif, 'JUNCAL', 0, base, size, size * .02);
  const J = serif.charToGlyph('J').getPath(0, base, size).getBoundingBox();
  const Ubox = serif.charToGlyph('U').getPath(0, base, size).getBoundingBox();
  const cap = base - Ubox.y1;

  const perch = list[0];
  const birdH = perch.box[3] - perch.box[1];
  const k = 1.6 * cap / birdH;
  // Las patas se apoyan en el centro superior de la J.
  const T = [(J.x1 + J.x2) / 2 + size * .015 - perch.feet[0] * k, J.y1 + size * .004 - perch.feet[1] * k];
  const toLogo = ([x, y]) => [x * k + T[0], y * k + T[1]];

  const sansSize = .25 * cap / (sans.tables.os2.sCapHeight / sans.unitsPerEm);
  const sansCap = sans.tables.os2.sCapHeight / sans.unitsPerEm * sansSize;
  const parqueBase = J.y1 - cap * .2;
  // PARQUE ANDINO arranca a la derecha del pecho del pájaro en esa altura.
  let chest = -1e9;
  for (const [y, x] of perch.rowsMax) {
    const ly = y * k + T[1];
    if (ly >= parqueBase - sansCap && ly <= parqueBase) chest = Math.max(chest, x * k + T[0]);
  }
  const startX = Math.max(Ubox.x1, chest + cap * .16);
  const endX = juncal.width * .94;
  const plain = glyphRun(sans, 'PARQUE ANDINO', 0, 0, sansSize).width;
  const tracking = (endX - startX - plain) / ('PARQUE ANDINO'.length - 1);
  const parque = glyphRun(sans, 'PARQUE ANDINO', startX, parqueBase, sansSize, tracking);

  const [bx0, by0] = toLogo([perch.box[0], perch.box[1]]);
  const [bx1, by1] = toLogo([perch.box[2], perch.box[3]]);
  const textBox = serif.charToGlyph('J').getPath(0, base, size).getBoundingBox();
  const pad = cap * .12;
  const vb = [Math.min(bx0, 0) - pad, by0 - pad, 0, 0];
  vb[2] = Math.max(juncal.width, bx1) + pad - vb[0];
  vb[3] = Math.max(textBox.y2, by1) + pad - vb[1];
  const view = vb.map(r1).join(' ');
  const birdLogo = `<path transform="matrix(${r1(k * 1000) / 1000} 0 0 ${r1(k * 1000) / 1000} ${r1(T[0])} ${r1(T[1])})" d="${perch.d}" fill-rule="evenodd"/>`;
  const text = `<path d="${juncal.d}"/><path d="${parque.d}"/>`;

  const logo = fill => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" role="img" aria-label="Parque Andino Juncal"><title>Parque Andino Juncal</title><g fill="${fill}">${birdLogo}${text}</g></svg>\n`;
  fs.writeFileSync(path.join(ROOT, 'assets/logo-juncal-negro.svg'), logo('#000'));
  fs.writeFileSync(path.join(ROOT, 'assets/logo-juncal-blanco.svg'), logo('#fff'));

  // Datos para la web: el texto se dibuja aparte y el pájaro animado ocupa una caja sobre la J.
  const [hx, hy] = toLogo([U[0] - perch.shift[0], U[1] - perch.shift[1]]);
  const pct = (v, o, s) => r1((v - o) / s * 1000) / 10;
  const data = {
    viewBox: view,
    text,
    birdBox: { left: pct(hx, vb[0], vb[2]), top: pct(hy, vb[1], vb[3]), width: r1(frameView[2] * k / vb[2] * 1000) / 10 },
    frameViewBox: frameView.join(' '),
    frames: Object.fromEntries(list.map(f => [f.name, `<path transform="translate(${r1(f.shift[0])} ${r1(f.shift[1])})" d="${f.d}" fill-rule="evenodd"/>`]))
  };
  fs.writeFileSync(path.join(ROOT, 'assets/logo-juncal-data.js'),
    '// Generado por _tools/hacer-logo.cjs a partir de referencias/fotogramas-gemini.jpg. No editar a mano.\nwindow.LOGO_JUNCAL = ' + JSON.stringify(data) + ';\n');
  console.log({ view, k: r1(k * 100) / 100, birdBox: data.birdBox, frameView, tracking: r1(tracking) });
})();
