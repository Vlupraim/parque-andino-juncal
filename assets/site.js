// Transición entre páginas: un velo crema con el logo, el pájaro aleteando y un infinito que se dibuja.
// Las páginas se precargan al acercar el mouse (o al tocarlas), así el cambio es casi inmediato.
(() => {
  const KEY = 'paj-veil', reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const veil = document.createElement('div');
  veil.className = 'page-veil';
  veil.setAttribute('aria-hidden', 'true');
  veil.innerHTML = `<div class="veil-logo"></div>
    <svg class="veil-infinity" viewBox="0 0 100 40"><path class="track" d="M50 20C38 6 20 6 20 20s18 14 30 0 30-14 30 0-18 14-30 0Z"/><path class="run" d="M50 20C38 6 20 6 20 20s18 14 30 0 30-14 30 0-18 14-30 0Z" pathLength="100"/></svg>`;
  document.body.append(veil);
  const bird = AveJuncal.logo(veil.querySelector('.veil-logo'));
  let stopFlap = null;

  function cover() {
    veil.classList.add('is-on');
    if (!reduced) stopFlap = bird.hover(12);
  }
  function uncover() {
    veil.classList.remove('is-on');
    document.documentElement.classList.remove('veil-arrive');
    setTimeout(() => { stopFlap?.(); stopFlap = null; }, 600);
  }

  // Llegada: si venimos de otra página del sitio, el velo ya cubre la pantalla y se levanta al cargar.
  if (document.documentElement.classList.contains('veil-arrive')) {
    cover();
    sessionStorage.removeItem(KEY);
    const ready = () => setTimeout(uncover, 420);
    document.readyState === 'complete' ? ready() : addEventListener('load', ready, { once: true });
  }
  addEventListener('pageshow', e => { if (e.persisted) uncover(); });

  const samePage = path => path.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');
  const internal = a => a && a.href && a.origin === location.origin && !a.target && !a.hasAttribute('download')
    && !(samePage(a.pathname) && a.hash);
  window.irA = href => {
    const url = new URL(href, location.href);
    if (url.origin !== location.origin) return void (location.href = url.href);
    try { sessionStorage.setItem(KEY, '1'); } catch {}
    cover();
    setTimeout(() => { location.href = url.href; }, reduced ? 0 : 380);
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!internal(a) || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.irA(a.href);
  });

  const fetched = new Set();
  function prefetch(a) {
    if (!internal(a)) return;
    const url = a.href.split('#')[0];
    if (fetched.has(url) || url === location.href.split('#')[0]) return;
    fetched.add(url);
    const link = Object.assign(document.createElement('link'), { rel: 'prefetch', href: url });
    document.head.append(link);
  }
  ['pointerover', 'focusin', 'touchstart'].forEach(type =>
    document.addEventListener(type, e => prefetch(e.target.closest?.('a')), { passive: true }));
  // En reposo, también se precargan las páginas del menú.
  const prefetchMenu = () => document.querySelectorAll('#mainNav a').forEach(prefetch);
  window.requestIdleCallback ? requestIdleCallback(prefetchMenu, { timeout: 2500 }) : setTimeout(prefetchMenu, 2500);
})();

// Barra: misma histéresis que MZ (se separa a 72px, vuelve bajo 24px).
(() => {
  const nav = document.getElementById('mainNav'), hero = document.querySelector('.hero');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let detached = scrollY > 72, frame = null;
  nav.classList.toggle('nav-detached', detached);
  function update() {
    frame = null;
    nav.classList.toggle('on-light', !hero || hero.getBoundingClientRect().bottom < 50);
    const next = detached ? scrollY > 24 : scrollY > 72;
    if (next === detached) return;
    detached = next;
    nav.classList.toggle('nav-detached', detached);
    nav.classList.toggle('nav-releasing', detached && !motion.matches);
  }
  addEventListener('scroll', () => { if (frame === null) frame = requestAnimationFrame(update); }, { passive: true });
  nav.addEventListener('animationend', e => { if (e.animationName === 'nav-release') nav.classList.remove('nav-releasing'); });
  update();
})();

// Menú en celulares: se arma con los mismos enlaces de la barra; los grupos se abren de a uno.
(() => {
  const nav = document.getElementById('mainNav'), toggle = nav.querySelector('.menu-toggle');
  if (!toggle) return;
  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.id = 'mobileMenu';
  let i = 0;
  for (const item of nav.querySelectorAll('.nav-links > *')) {
    if (item.matches('details')) {
      const group = document.createElement('details');
      group.className = 'mm-group';
      group.name = 'mm';
      group.innerHTML = `<summary>${item.querySelector('summary').textContent}</summary><div class="mm-sub">${
        [...item.querySelectorAll('.nav-dropdown-panel a')].map(a => `<a href="${a.getAttribute('href')}">${a.textContent}</a>`).join('')}</div>`;
      group.style.setProperty('--i', i++);
      menu.append(group);
    } else {
      const link = Object.assign(document.createElement('a'), { className: 'mm-link', href: item.getAttribute('href'), textContent: item.textContent });
      link.style.setProperty('--i', i++);
      menu.append(link);
    }
  }
  const cta = nav.querySelector('.nav-cta');
  menu.insertAdjacentHTML('beforeend', `<a class="button dark mm-cta" href="${cta.getAttribute('href')}" style="--i:${i++}">Reservar visita</a>
    <p class="mm-foot" style="--i:${i}"><a href="mailto:info@parqueandinojuncal.cl">info@parqueandinojuncal.cl</a></p>`);
  nav.after(menu);

  function setOpen(open) {
    if (open) document.documentElement.style.setProperty('--bar-bottom', nav.getBoundingClientRect().bottom + 'px');
    menu.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-locked', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  document.addEventListener('click', e => { if (!menu.contains(e.target) && !nav.contains(e.target)) setOpen(false); });
  matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
})();

// Menús: se abren al pasar el mouse y nunca hay dos abiertos a la vez. El teclado y el toque siguen usando clic.
(() => {
  const menus = [...document.querySelectorAll('.nav-dropdown')];
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let closing = null;
  const closeOthers = keep => menus.forEach(m => { if (m !== keep) m.open = false; });
  menus.forEach(menu => {
    menu.addEventListener('toggle', () => { if (menu.open) closeOthers(menu); });
    menu.addEventListener('pointerenter', () => {
      if (!hover.matches) return;
      clearTimeout(closing);
      menu.open = true;
    });
    menu.addEventListener('pointerleave', () => {
      if (!hover.matches) return;
      closing = setTimeout(() => { menu.open = false; }, 160);
    });
    // Con mouse, el clic no cierra un menú que ya abrió el hover (detail 0 = Enter o Espacio).
    menu.querySelector('summary').addEventListener('click', e => { if (hover.matches && e.detail > 0) e.preventDefault(); });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeOthers(null); });
  addEventListener('click', e => { if (!e.target.closest('.nav-dropdown')) closeOthers(null); });
})();

// Botón magnético: dentro de un radio alrededor del botón, este se desplaza levemente hacia el cursor y el texto un poco más.
// Topes bajos (6 px el botón, 2 px extra el texto) para que siga siendo fácil de apretar.
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const reach = 20, pull = .12, labelPull = .05, maxPull = 6, maxLabel = 2;
  const clamp = (v, max) => Math.max(-max, Math.min(max, v));
  for (const el of document.querySelectorAll('[data-magnetic]')) {
    const label = el.querySelector('.magnetic-label');
    let active = false, offset = [0, 0];
    addEventListener('pointermove', e => {
      // Posición de reposo: el rectángulo actual menos el desplazamiento aplicado.
      const b = el.getBoundingClientRect();
      const r = { left: b.left - offset[0], right: b.right - offset[0], top: b.top - offset[1], bottom: b.bottom - offset[1] };
      const inside = e.clientX > r.left - reach && e.clientX < r.right + reach && e.clientY > r.top - reach && e.clientY < r.bottom + reach;
      if (!inside) {
        if (active) { active = false; offset = [0, 0]; el.classList.remove('is-pulled'); el.style.transform = label.style.transform = ''; }
        return;
      }
      active = true;
      el.classList.add('is-pulled');
      const dx = e.clientX - (r.left + r.right) / 2, dy = e.clientY - (r.top + r.bottom) / 2;
      offset = [clamp(dx * pull, maxPull), clamp(dy * pull, maxPull)];
      el.style.transform = `translate(${offset[0]}px, ${offset[1]}px)`;
      label.style.transform = `translate(${clamp(dx * labelPull, maxLabel)}px, ${clamp(dy * labelPull, maxLabel)}px)`;
    }, { passive: true });
  }
})();

const clp = n => '$' + Math.round(n).toLocaleString('es-CL');

// Cifras que cuentan desde cero (data-count, con data-prefix / data-suffix opcionales).
function countUp(el) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const target = Number(el.dataset.count), prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
  const start = performance.now(), duration = 1600;
  (function step(now) {
    const t = Math.min(1, (now - start) / duration), eased = 1 - (1 - t) ** 3;
    el.textContent = prefix + Math.round(target * eased).toLocaleString('es-CL') + suffix;
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

// Aparición al hacer scroll: una sola vez por elemento.
(() => {
  const seen = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    entry.target.querySelectorAll('[data-count]').forEach(countUp);
    seen.unobserve(entry.target);
  }), { threshold: .2, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => seen.observe(el));
})();

// Conservación: el botón abre y cierra las cifras; cuentan cada vez que se abren.
(() => {
  const button = document.querySelector('.glass-btn[aria-controls="figures"]'), panel = document.getElementById('figures');
  if (!button) return;
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', open);
    panel.hidden = !open;
    if (open) panel.querySelectorAll('[data-count]').forEach(countUp);
  });
})();

// Reservador: elige día, visitantes y alojamiento; el total se recalcula al instante con las tarifas 2026–2027.
(() => {
  const form = document.querySelector('.booker');
  if (!form) return;
  const state = { adults: 2, kids: 0, nights: 1, stay: 'day', resident: false, day: null };
  const limits = { adults: [1, 12], kids: [0, 12], nights: [1, 7] };
  const names = { day: 'solo el día', hornitos: 'Camping Los Hornitos', morrenas: 'Camping Las Morrenas', refugio: 'Refugio del Arriero' };
  const weekday = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'], month = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  // Calendario mensual: hasta 12 meses hacia adelante. El parque cierra de junio a septiembre por la nieve.
  // Los días "sin cupo" son de ejemplo para la maqueta; en producción vendrían del sistema de reservas.
  const monthName = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const cal = document.getElementById('bkCal'), calMonth = document.getElementById('calMonth'), calNote = document.getElementById('calNote');
  const prevBtn = document.getElementById('calPrev'), nextBtn = document.getElementById('calNext');
  const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const first = new Date(today.getFullYear(), today.getMonth(), 1), last = new Date(today.getFullYear(), today.getMonth() + 11, 1);
  let view = new Date(first);
  const closedMonth = d => d.getMonth() >= 5 && d.getMonth() <= 8;
  const full = d => [0, 5, 6].includes(d.getDay()) && (d.getDate() * 7 + d.getMonth()) % 6 === 0;
  const available = d => d > today && !closedMonth(d) && !full(d);
  const sameDay = (a, b) => a && b && a.getTime() === b.getTime();

  function drawCalendar() {
    calMonth.textContent = `${monthName[view.getMonth()]} ${view.getFullYear()}`;
    prevBtn.disabled = view <= first;
    nextBtn.disabled = view >= last;
    const offset = (view.getDay() + 6) % 7, total = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    cal.innerHTML = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'].map(d => `<span class="cal-dow">${d}</span>`).join('') + '<span></span>'.repeat(offset);
    for (let n = 1; n <= total; n++) {
      const d = new Date(view.getFullYear(), view.getMonth(), n);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cal-day' + (closedMonth(d) ? ' is-closed' : full(d) ? ' is-full' : '') + (sameDay(d, today) ? ' is-today' : '');
      b.textContent = n;
      b.disabled = !available(d);
      b.setAttribute('aria-pressed', sameDay(d, state.day));
      b.setAttribute('aria-label', `${weekday[d.getDay()]} ${n} de ${monthName[d.getMonth()]}${full(d) && !closedMonth(d) ? ', sin cupo' : ''}`);
      b.addEventListener('click', () => { state.day = d; drawCalendar(); render(); });
      cal.append(b);
    }
    calNote.textContent = closedMonth(view)
      ? 'El parque está cerrado de junio a septiembre: la nieve cubre el valle y el camino queda sin mantención.'
      : 'De viernes a domingo se ingresa solo con reserva.';
  }
  prevBtn.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); drawCalendar(); });
  nextBtn.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); drawCalendar(); });
  for (let d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); !state.day; d.setDate(d.getDate() + 1))
    if (available(d)) state.day = new Date(d);
  view = new Date(state.day.getFullYear(), state.day.getMonth(), 1);
  drawCalendar();

  form.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => {
    const [key, delta] = b.dataset.step.split(':');
    const [min, max] = limits[key];
    state[key] = Math.min(max, Math.max(min, state[key] + Number(delta)));
    render();
  }));
  form.querySelectorAll('[data-stay]').forEach(b => b.addEventListener('click', () => {
    state.stay = b.dataset.stay;
    form.querySelectorAll('[data-stay]').forEach(x => x.setAttribute('aria-pressed', x === b));
    render();
  }));
  // Residentes: el descuento se aplica cuando el comprobante queda pre-validado; el guardaparque lo confirma al llegar.
  const proof = document.getElementById('bkProof');
  document.getElementById('bkResident').addEventListener('change', e => {
    state.resident = e.target.checked;
    proof.hidden = !state.resident;
    render();
  });
  checkResidence(file => {
    state.proofOk = file;
    render();
  });

  function render() {
    const { adults, kids, nights, stay } = state;
    const resident = state.resident && state.proofOk;
    let total = adults * 8000 * (resident ? .75 : 1) + kids * 4000;
    if (stay === 'hornitos') total += (adults * 5000 + kids * 2500) * nights;
    if (stay === 'morrenas') total += (adults * 3500 + kids * 2500) * nights;
    if (stay === 'refugio') total += Math.ceil((adults + kids) / 3) * 50000 * nights;
    document.getElementById('bkAdults').textContent = adults;
    document.getElementById('bkKids').textContent = kids;
    document.getElementById('bkNightsOut').textContent = nights;
    document.getElementById('bkNights').hidden = stay === 'day';
    const people = `${adults} adulto${adults > 1 ? 's' : ''}` + (kids ? ` y ${kids} niño${kids > 1 ? 's' : ''}` : '');
    const when = state.day ? `${weekday[state.day.getDay()]} ${state.day.getDate()} ${month[state.day.getMonth()]}` : '';
    const sleep = stay === 'day' ? names.day : `${names[stay]} · ${nights} noche${nights > 1 ? 's' : ''}`;
    document.getElementById('bkSummary').textContent = `${when} · ${people} · ${sleep}${resident ? ' · 25% residente' : ''}`;
    document.getElementById('bkTotal').textContent = clp(total);
  }
  render();
})();

// Comprobante de residencia, analizado en el navegador (sin subir la imagen a ningún servidor):
// 1) resolución, 2) nitidez (varianza del laplaciano), 3) iluminación, 4) OCR con Tesseract para encontrar
// una de las 10 comunas de las provincias de San Felipe y Los Andes y el tipo de documento.
// No prueba que el documento sea auténtico: solo filtra fotos ilegibles o de otra comuna antes de la verificación humana.
function checkResidence(onResult) {
  const input = document.getElementById('proofFile');
  if (!input) return;
  const preview = document.getElementById('proofPreview'), checks = document.getElementById('proofChecks'), status = document.getElementById('proofStatus');
  const COMUNAS = ['los andes', 'calle larga', 'rinconada', 'san esteban', 'san felipe', 'llaillay', 'llay llay', 'catemu', 'panquehue', 'putaendo', 'santa maria'];
  const DOCS = ['certificado', 'residencia', 'domicilio', 'registro social', 'hogares', 'cartola', 'boleta', 'factura', 'cliente', 'direccion', 'junta de vecinos', 'consumo'];
  const normal = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
  const mark = (name, state, note) => {
    const li = checks.querySelector(`[data-check="${name}"]`);
    li.dataset.state = state;
    li.dataset.note = note || '';
  };
  let tesseract = null;
  const loadTesseract = () => tesseract ??= new Promise((ok, fail) => {
    const s = Object.assign(document.createElement('script'), { src: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js', onload: () => ok(window.Tesseract), onerror: fail });
    document.head.append(s);
  });

  function measure(img) {
    // Imagen reducida a 700 px de ancho, en escala de grises.
    const w = Math.min(700, img.naturalWidth), h = Math.round(img.naturalHeight * w / img.naturalWidth);
    const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const px = ctx.getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
    let sum = 0, sq = 0;
    for (let i = 0; i < g.length; i++) { g[i] = px[i * 4] * .299 + px[i * 4 + 1] * .587 + px[i * 4 + 2] * .114; sum += g[i]; sq += g[i] * g[i]; }
    let lapSum = 0, lapSq = 0, n = 0;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x, v = g[i - w] + g[i + w] + g[i - 1] + g[i + 1] - 4 * g[i];
      lapSum += v; lapSq += v * v; n++;
    }
    const mean = sum / g.length;
    return { brightness: mean, contrast: Math.sqrt(sq / g.length - mean * mean), sharpness: lapSq / n - (lapSum / n) ** 2 };
  }

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    onResult(false);
    checks.hidden = false;
    checks.querySelectorAll('li').forEach(li => { li.dataset.state = 'wait'; li.dataset.note = ''; });
    status.dataset.state = '';
    status.textContent = 'Revisando la foto…';
    await new Promise(done => {
      preview.onload = preview.onerror = done;
      preview.src = URL.createObjectURL(file);
      preview.hidden = false;
    });

    const longSide = Math.max(preview.naturalWidth, preview.naturalHeight);
    mark('size', longSide >= 1000 ? 'ok' : 'warn', longSide >= 1000 ? '' : `${longSide}px: acércate o usa más resolución`);
    // Un documento es casi todo papel claro: se rechaza solo si está muy oscuro, casi en blanco o sin contraste.
    const { brightness, contrast, sharpness } = measure(preview);
    const sharp = sharpness >= 45, light = brightness >= 60 && brightness <= 250 && contrast >= 22;
    mark('sharp', sharp ? 'ok' : 'fail', sharp ? '' : 'se ve borrosa: apoya el teléfono y vuelve a sacarla');
    mark('light', light ? 'ok' : 'fail', light ? '' : brightness < 60 ? 'muy oscura' : contrast < 22 ? 'el texto no se distingue: evita reflejos' : 'casi en blanco');
    if (!sharp || !light) {
      mark('comuna', 'skip'); mark('doc', 'skip');
      status.dataset.state = 'fail';
      status.textContent = 'La foto no se puede leer bien. Vuelve a sacarla, o muestra el documento al llegar.';
      return;
    }

    try {
      const T = await loadTesseract();
      const { data } = await T.recognize(file, 'spa', {
        logger: m => { if (m.status === 'recognizing text') status.textContent = `Leyendo el documento… ${Math.round(m.progress * 100)}%`; }
      });
      const text = normal(data.text);
      const comuna = COMUNAS.find(c => text.includes(c));
      const doc = DOCS.find(k => text.includes(k));
      mark('comuna', comuna ? 'ok' : 'fail', comuna ? comuna.replace(/\b\w/g, l => l.toUpperCase()) : 'no encontramos una comuna de las provincias');
      mark('doc', doc ? 'ok' : 'warn', doc ? '' : 'no reconocemos el tipo de documento');
      if (comuna) {
        status.dataset.state = 'ok';
        status.textContent = 'Comprobante pre-validado. Aplicamos el 25% en la entrada adulto; el guardaparque lo confirmará con tu carnet.';
        onResult(true);
      } else {
        status.dataset.state = 'fail';
        status.textContent = 'No encontramos una comuna de San Felipe o Los Andes en el documento. Prueba con otra foto, o acredítalo al llegar y se aplica el descuento en la entrada.';
      }
    } catch {
      mark('comuna', 'skip'); mark('doc', 'skip');
      status.dataset.state = 'warn';
      status.textContent = 'No pudimos leer el documento ahora. Puedes acreditar tu residencia al llegar.';
    }
  });
}

// Noticias: pila de fotos que rota sola mientras se ve; con el mouse encima se abre en abanico y se detiene.
// Los datos vienen de assets/noticias-data.js (noticias reales y prensa del sitio original).
(() => {
  const stack = document.getElementById('newsStack');
  if (!stack || !window.NOTICIAS) return;
  const items = window.NOTICIAS.map(n => [n.fecha, n.titulo, n.resumen, n.foto, n.pos || 'center', n.href]);
  const cards = items.map(([date, , , image, pos], i) => {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.style.backgroundImage = `url('${image}')`;
    card.style.backgroundPosition = pos;
    card.innerHTML = `<span>${date}</span>`;
    card.dataset.index = i;
    stack.append(card);
    return card;
  });
  let order = cards.map((_, i) => i), fanned = false, visible = false, timer = null, busy = false;
  const info = document.getElementById('newsCurrent'), count = document.getElementById('newsCount');

  function layout() {
    order.forEach((index, depth) => {
      const card = cards[index];
      // La de adelante mira de frente; las siguientes se apilan hacia la derecha, giradas hacia ella.
      // Con el mouse encima se separan un poco más para dejar ver cada foto.
      const x = depth === 0 ? 0 : (fanned ? 46 : 38) + (depth - 1) * (fanned ? 16 : 12);
      card.style.transform = depth === 0
        ? 'translateX(0) translateZ(0) rotateY(0deg)'
        : `translateX(${x}%) translateZ(${-90 - depth * 70}px) rotateY(${fanned ? -34 : -44}deg)`;
      card.style.zIndex = 20 - depth;
      card.style.opacity = depth > 4 ? 0 : 1;
      card.style.filter = `brightness(${1 - Math.min(depth, 4) * .12}) saturate(${depth ? .85 : 1})`;
    });
    const [date, title, text, , , href] = items[order[0]];
    info.innerHTML = `<time>${date}</time><h3>${title}</h3><p>${text}</p><a class="text-link" href="${href}">Leer más →</a>`;
    info.classList.remove('swap'); void info.offsetWidth; info.classList.add('swap');
    count.textContent = `${String(order[0] + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  }
  function next() {
    if (busy) return;
    busy = true;
    const top = cards[order[0]];
    top.classList.add('leaving');
    setTimeout(() => {
      top.classList.remove('leaving');
      order.push(order.shift());
      layout();
      busy = false;
    }, 520);
  }
  function prev() { order.unshift(order.pop()); layout(); }
  function schedule() {
    clearInterval(timer);
    if (visible && !fanned && !matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(next, 4200);
  }
  stack.addEventListener('pointerenter', () => { if (matchMedia('(hover: hover)').matches) { fanned = true; layout(); schedule(); } });
  stack.addEventListener('pointerleave', () => { fanned = false; layout(); schedule(); });
  stack.addEventListener('click', e => {
    const card = e.target.closest('.news-card');
    if (!card) return;
    const i = Number(card.dataset.index);
    // La foto de arriba abre la noticia; las de atrás pasan al frente.
    if (i === order[0]) return window.irA(items[i][5]);
    order = [...order.slice(order.indexOf(i)), ...order.slice(0, order.indexOf(i))];
    layout();
  });
  document.getElementById('newsNext').addEventListener('click', () => { next(); schedule(); });
  document.getElementById('newsPrev').addEventListener('click', () => { prev(); schedule(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .3 }).observe(stack);
  layout();
})();

// Parallax suave de la foto de conservación (solo mientras la sección está en pantalla).
(() => {
  const section = document.querySelector('.conservation'), photo = section?.querySelector('.conservation-photo');
  if (!photo || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let frame = null;
  function update() {
    frame = null;
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const progress = (innerHeight - r.top) / (innerHeight + r.height) - .5;
    photo.style.transform = `translateY(${progress * -14}%)`;
  }
  addEventListener('scroll', () => { if (frame === null) frame = requestAnimationFrame(update); }, { passive: true });
  update();
})();

// Actividades: el panel bajo el mouse (o con foco) se expande. Si nadie interactúa, avanzan solas cada 6 s mientras se ven.
(() => {
  const gallery = document.querySelector('.act-gallery');
  if (!gallery) return;
  const panels = [...gallery.querySelectorAll('.act')];
  const cycle = 6000, auto = !matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(min-width: 901px)').matches;
  let current = 0, timer = null, visible = false, paused = false;
  gallery.style.setProperty('--cycle', cycle + 'ms');
  function open(i) {
    current = i;
    panels.forEach((p, k) => {
      p.classList.toggle('is-open', k === i);
      const bar = p.querySelector('.act-progress');
      bar.classList.remove('run'); void bar.offsetWidth;
      if (k === i && auto && visible && !paused) bar.classList.add('run');
    });
  }
  function schedule() {
    clearTimeout(timer);
    if (!auto || !visible || paused) return;
    timer = setTimeout(() => { open((current + 1) % panels.length); schedule(); }, cycle);
  }
  panels.forEach((panel, i) => {
    panel.addEventListener('pointerenter', () => { if (matchMedia('(hover: hover)').matches) open(i); });
    panel.addEventListener('focus', () => open(i));
    panel.addEventListener('click', () => open(i));
  });
  gallery.addEventListener('pointerenter', () => { paused = true; schedule(); open(current); });
  gallery.addEventListener('pointerleave', () => { paused = false; open(current); schedule(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; open(current); schedule(); }, { threshold: .4 }).observe(gallery);
})();

// Logo: cada 12–17 s el pájaro despega cuadro a cuadro, sale de la pantalla, vuelve y se posa.
(() => {
  const brand = document.querySelector('.brand');
  const bird = AveJuncal.logo(document.getElementById('navLogo'));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let flying = false, timer = null;
  async function fly() {
    if (flying || document.hidden) return schedule();
    flying = true;
    await bird.play();
    flying = false;
    schedule();
  }
  function schedule(delay = 12000 + Math.random() * 5000) { clearTimeout(timer); timer = setTimeout(fly, delay); }
  brand.addEventListener('mouseenter', () => { if (!flying) { clearTimeout(timer); fly(); } });
  schedule(3000);
})();

// Hero: ritmo de MZ (6,5 s fija + 1,8 s de fundido, zoom 33 s), con pausa y leyenda. Las páginas interiores tienen una sola foto.
(() => {
  const hero = document.querySelector('.hero');
  const photos = hero ? [...hero.querySelectorAll('.hero-photo')] : [];
  if (photos.length < 2) return;
  const dots = hero.querySelector('.hero-dots'), caption = document.getElementById('caption');
  const toggle = hero.querySelector('.hero-motion-toggle');
  const hold = 6500, fade = 1800;
  photos.forEach(() => dots.append(document.createElement('span')));
  let index = 0, paused = false, timer = null;
  const zooms = photos.map(p => p.animate([{ transform: 'scale(1.005)' }, { transform: 'scale(1.025)' }],
    { duration: 33000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }));
  function show(next) {
    photos[index].animate([{ opacity: 1 }, { opacity: 0 }], { duration: fade, easing: 'ease-in-out', fill: 'forwards' });
    photos[next].animate([{ opacity: 0 }, { opacity: 1 }], { duration: fade, easing: 'ease-in-out', fill: 'forwards' });
    index = next;
    caption.textContent = photos[index].dataset.caption;
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === index));
  }
  function schedule() { clearTimeout(timer); if (!paused) timer = setTimeout(() => { show((index + 1) % photos.length); schedule(); }, hold + fade); }
  dots.children[0].classList.add('on');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { zooms.forEach(a => a.cancel()); toggle.hidden = true; return; }
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed', paused);
    zooms.forEach(a => paused ? a.pause() : a.play());
    schedule();
  });
  schedule();
})();
