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
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const daysBetween = (a, b) => Math.round((b - a) / 86400000);
  // Con alojamiento se reserva un rango: cada noche (de la llegada al día antes de la salida) necesita cupo.
  const lodging = () => state.stay !== 'day';
  function maxNights(from) {
    let n = 0;
    while (n < limits.nights[1] && available(addDays(from, n))) n++;
    return n;
  }
  const departure = () => addDays(state.day, state.nights);
  let pickingEnd = false, rangeNote = '';
  const fmt = d => `${weekday[d.getDay()]} ${d.getDate()} ${month[d.getMonth()]}`;

  function pick(d) {
    rangeNote = '';
    if (lodging() && pickingEnd && d > state.day) {
      const wanted = daysBetween(state.day, d), max = maxNights(state.day);
      state.nights = Math.min(wanted, max);
      if (wanted > max) rangeNote = `La noche del ${fmt(addDays(state.day, max))} no tiene cupo: tu estadía llega hasta el ${fmt(departure())}.`;
      pickingEnd = false;
    } else {
      state.day = d;
      if (lodging()) {
        state.nights = Math.max(1, Math.min(state.nights, maxNights(d)));
        pickingEnd = true;
      }
    }
    render();
  }

  function drawCalendar() {
    calMonth.textContent = `${monthName[view.getMonth()]} ${view.getFullYear()}`;
    prevBtn.disabled = view <= first;
    nextBtn.disabled = view >= last;
    const offset = (view.getDay() + 6) % 7, total = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    cal.innerHTML = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'].map(d => `<span class="cal-dow">${d}</span>`).join('') + '<span></span>'.repeat(offset);
    const end = lodging() ? departure() : null, reach = lodging() && pickingEnd ? maxNights(state.day) : 0;
    for (let n = 1; n <= total; n++) {
      const d = new Date(view.getFullYear(), view.getMonth(), n);
      const b = document.createElement('button');
      b.type = 'button';
      const inRange = end && d > state.day && d < end, isEnd = end && sameDay(d, end);
      // Al elegir la salida también se puede tocar un día sin cupo: esa mañana solo se sale, no se duerme.
      const canEnd = reach && d > state.day && daysBetween(state.day, d) <= reach;
      b.className = 'cal-day' + (closedMonth(d) ? ' is-closed' : full(d) ? ' is-full' : '') + (sameDay(d, today) ? ' is-today' : '')
        + (inRange ? ' is-range' : '') + (isEnd ? ' is-end' : '') + (end && sameDay(d, state.day) ? ' is-start' : '');
      b.textContent = n;
      b.disabled = !available(d) && !canEnd;
      b.setAttribute('aria-pressed', sameDay(d, state.day) || !!isEnd);
      b.setAttribute('aria-label', `${weekday[d.getDay()]} ${n} de ${monthName[d.getMonth()]}${sameDay(d, state.day) && end ? ', llegada' : ''}${isEnd ? ', salida' : ''}${full(d) && !closedMonth(d) ? ', sin cupo' : ''}`);
      b.addEventListener('click', () => pick(d));
      cal.append(b);
    }
    document.getElementById('bkDateLabel').textContent = lodging() ? 'Llegada y salida' : 'Día';
    calNote.textContent = closedMonth(view)
      ? 'El parque está cerrado de junio a septiembre: la nieve cubre el valle y el camino queda sin mantención.'
      : rangeNote || (lodging()
        ? (pickingEnd ? `Llegada el ${fmt(state.day)}. Ahora toca el día de salida.` : `Llegada ${fmt(state.day)} · salida ${fmt(departure())}. Toca otro día para cambiar la llegada.`)
        : 'De viernes a domingo se ingresa solo con reserva.');
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
    const wanted = Math.min(max, Math.max(min, state[key] + Number(delta)));
    rangeNote = '';
    if (key === 'nights') {
      // Las noches siguen el rango del calendario: no se puede sumar una noche sin cupo.
      const fit = maxNights(state.day);
      state.nights = Math.min(wanted, fit);
      pickingEnd = false;
      if (wanted > fit) rangeNote = `La noche del ${fmt(addDays(state.day, fit))} no tiene cupo: tu estadía llega hasta el ${fmt(departure())}.`;
    } else state[key] = wanted;
    render();
  }));
  form.querySelectorAll('[data-stay]').forEach(b => b.addEventListener('click', () => {
    state.stay = b.dataset.stay;
    form.querySelectorAll('[data-stay]').forEach(x => x.setAttribute('aria-pressed', x === b));
    rangeNote = '';
    pickingEnd = false;
    if (lodging()) state.nights = Math.max(1, Math.min(state.nights, maxNights(state.day)));
    render();
  }));
  // Residentes: el descuento se aplica cuando el comprobante queda pre-validado; el guardaparque lo confirma al llegar.
  const proof = document.getElementById('bkProof');
  const proofCheck = checkResidence(ok => {
    state.proofOk = ok;
    render();
  });
  document.getElementById('bkResident').addEventListener('change', e => {
    state.resident = e.target.checked;
    proof.hidden = !state.resident;
    if (!state.resident) proofCheck?.reset();
    render();
  });
  // Dos caminos para el descuento: subir el comprobante ahora, o acreditarlo en la entrada y pagar allá las entradas.
  state.proofMode = 'online';
  form.querySelectorAll('[data-proof-mode]').forEach(b => b.addEventListener('click', () => {
    state.proofMode = b.dataset.proofMode;
    form.querySelectorAll('[data-proof-mode]').forEach(x => x.setAttribute('aria-checked', x === b));
    document.getElementById('proofGate').hidden = state.proofMode !== 'gate';
    document.getElementById('proofOnline').hidden = state.proofMode === 'gate';
    if (state.proofMode === 'gate') proofCheck?.reset();
    render();
  }));

  // Montos separados: entradas y alojamiento. En modo "en la entrada", las entradas se pagan en el parque.
  function amounts() {
    const { adults, kids, nights, stay } = state;
    let lodging = 0;
    if (stay === 'hornitos') lodging = (adults * 5000 + kids * 2500) * nights;
    if (stay === 'morrenas') lodging = (adults * 3500 + kids * 2500) * nights;
    if (stay === 'refugio') lodging = Math.ceil((adults + kids) / 3) * 50000 * nights;
    const gate = state.resident && state.proofMode === 'gate';
    const discount = state.resident && state.proofMode === 'online' && state.proofOk;
    const entries = adults * 8000 * (discount ? .75 : 1) + kids * 4000;
    return {
      gate, discount, lodging,
      payNow: gate ? lodging : entries + lodging,
      atGateResident: adults * 6000 + kids * 4000,
      atGateFull: adults * 8000 + kids * 4000
    };
  }

  function render() {
    const { adults, kids, nights, stay } = state;
    const a = amounts();
    drawCalendar();
    document.getElementById('bkAdults').textContent = adults;
    document.getElementById('bkKids').textContent = kids;
    document.getElementById('bkNightsOut').textContent = nights;
    document.getElementById('bkNights').hidden = stay === 'day';
    const people = `${adults} adulto${adults > 1 ? 's' : ''}` + (kids ? ` y ${kids} niño${kids > 1 ? 's' : ''}` : '');
    const when = stay === 'day' ? fmt(state.day) : `${fmt(state.day)} → ${fmt(departure())}`;
    const sleep = stay === 'day' ? 'Sin alojamiento' : `${names[stay]} · ${nights} noche${nights > 1 ? 's' : ''}`;
    document.getElementById('bkSummary').textContent = `${when} · ${people} · ${sleep}${a.discount ? ' · 25% residente' : ''}`;
    document.getElementById('bkPayLabel').textContent = a.gate ? 'Pagas hoy' : 'Total';
    document.getElementById('bkTotal').textContent = clp(a.payNow);
    const gateLine = document.getElementById('bkGate');
    gateLine.hidden = !a.gate;
    gateLine.innerHTML = `En la entrada: <b>${clp(a.atGateResident)}</b> acreditando residencia, o ${clp(a.atGateFull)} sin acreditar.`;
    document.querySelector('#bkSubmit .magnetic-label').textContent = a.payNow ? 'Continuar al pago' : 'Reservar y recibir ticket';
    return { when, people, sleep };
  }
  render();

  // Al confirmar se emite el ticket de reserva. El pago en línea está simulado hasta conectar Webpay o Mercado Pago.
  const dialog = document.getElementById('ticketDialog'), ticket = document.getElementById('ticket');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const a = amounts(), { people, sleep } = render();
    const code = 'PAJ-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + String(state.day.getDate()).padStart(2, '0') + String(state.day.getMonth() + 1).padStart(2, '0');
    const long = d => `${['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][d.getDay()]} ${d.getDate()} de ${monthName[d.getMonth()]}`;
    const fullDate = state.stay === 'day'
      ? `${long(state.day)} de ${state.day.getFullYear()}`
      : `${long(state.day)} al ${long(departure())}`;
    const paid = a.payNow ? `<div class="t-row"><span>Pagado en línea</span><b>${clp(a.payNow)}</b></div>` : '';
    const atGate = a.gate
      ? `<div class="t-row t-gate"><span>A pagar en la entrada</span><b>${clp(a.atGateResident)}</b></div><p class="t-small">Con 25% en la entrada adulto si acreditas residencia. Sin acreditar: ${clp(a.atGateFull)}.</p>`
      : '';
    const bring = a.gate
      ? '<li>Tu carnet y un documento con tu domicilio: certificado de residencia, cuenta de luz o agua, o cartola del Registro Social de Hogares.</li>'
      : a.discount ? '<li>Tu carnet, para confirmar el descuento de residente.</li>' : '';
    ticket.innerHTML = `
      <header class="t-head"><img src="assets/logo-juncal-negro.svg" alt="Parque Andino Juncal"><span>Ticket de reserva</span></header>
      <h3 id="ticketTitle">${fullDate}</h3>
      <div class="t-body">
        <div class="t-info">
          <div class="t-row"><span>Visitantes</span><b>${people}</b></div>
          <div class="t-row"><span>Alojamiento</span><b>${sleep}</b></div>
          ${paid}${atGate}
        </div>
        <div class="t-qr"><div id="ticketQr"></div><code>${code}</code></div>
      </div>
      <div class="t-cut" aria-hidden="true"></div>
      <h4>Para entrar</h4>
      <ul class="t-list"><li>Presenta este código en la barrera de Los Hornitos.</li>${bring}<li>Horario: lunes a viernes de 8:00 a 20:00; sábado y domingo de 7:00 a 20:00.</li></ul>
      <p class="t-small">Maqueta: el pago en línea y el envío por correo todavía no están conectados.</p>`;
    dialog.showModal();
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js');
      const qr = window.qrcode(0, 'M');
      qr.addData(code);
      qr.make();
      document.getElementById('ticketQr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    } catch { document.getElementById('ticketQr').textContent = code; }
  });
  document.getElementById('ticketClose').addEventListener('click', () => dialog.close());
  document.getElementById('ticketPrint').addEventListener('click', () => window.print());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
})();

function loadScript(src) {
  return new Promise((ok, fail) => {
    if ([...document.scripts].some(s => s.src === src)) return ok();
    document.head.append(Object.assign(document.createElement('script'), { src, onload: ok, onerror: fail }));
  });
}

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

  // Ley 21.719: sin consentimiento no se puede subir; al terminar se borran la foto y el texto leído.
  const consent = document.getElementById('proofConsent'), drop = document.getElementById('proofDrop'), del = document.getElementById('proofDelete');
  let run = 0, objectUrl = null;
  consent.addEventListener('change', () => {
    input.disabled = !consent.checked;
    drop.setAttribute('aria-disabled', !consent.checked);
    if (!consent.checked) reset();
  });

  // Borra la imagen de la memoria de la página: vista previa, archivo seleccionado y enlace temporal.
  function wipeImage() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    preview.removeAttribute('src');
    preview.hidden = true;
    input.value = '';
  }
  // Borra además el resultado y quita el descuento.
  function reset() {
    run++;
    wipeImage();
    checks.hidden = true;
    status.textContent = '';
    status.dataset.state = '';
    del.hidden = true;
    onResult(false);
  }
  del.addEventListener('click', reset);

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file || !consent.checked) return;
    const current = ++run;
    onResult(false);
    checks.hidden = false;
    del.hidden = false;
    del.textContent = 'Cancelar y eliminar la foto';
    checks.querySelectorAll('li').forEach(li => { li.dataset.state = 'wait'; li.dataset.note = ''; });
    status.dataset.state = '';
    status.textContent = 'Revisando la foto…';
    try {
      await analyze(file, current);
    } finally {
      // Pase lo que pase, la foto no queda en la página.
      if (current === run) {
        wipeImage();
        del.textContent = 'Eliminar resultado';
        status.insertAdjacentHTML('beforeend', '<span class="proof-wiped">La foto y el texto leído ya se eliminaron de esta página.</span>');
      }
    }
  });

  async function analyze(file, current) {
    await new Promise(done => {
      preview.onload = preview.onerror = done;
      preview.src = objectUrl = URL.createObjectURL(file);
      preview.hidden = false;
    });
    if (current !== run) return;

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
        logger: m => { if (m.status === 'recognizing text' && current === run) status.textContent = `Leyendo el documento… ${Math.round(m.progress * 100)}%`; }
      });
      if (current !== run) return;
      // El texto leído solo vive dentro de esta función: se busca la comuna y se descarta.
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
      if (current !== run) return;
      mark('comuna', 'skip'); mark('doc', 'skip');
      status.dataset.state = 'warn';
      status.textContent = 'No pudimos leer el documento ahora. Puedes acreditar tu residencia al llegar.';
    }
  }
  return { reset };
}

// Noticias: carrusel circular. La actual al centro y dos a cada lado, más chicas y hacia atrás.
// Clic en una lateral la trae al centro; clic en la del centro abre la noticia. Avanza solo mientras se ve.
// Los datos vienen de assets/noticias-data.js (noticias reales y prensa del sitio original).
(() => {
  const track = document.getElementById('newsStack');
  if (!track || !window.NOTICIAS) return;
  const items = window.NOTICIAS;
  const info = document.getElementById('newsCurrent'), count = document.getElementById('newsCount');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0, visible = false, hovering = false, timer = null;

  const cards = items.map((n, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'news-card';
    card.style.backgroundImage = `url('${n.foto}')`;
    card.style.backgroundPosition = n.pos || 'center';
    card.innerHTML = `<span>${n.fecha}</span>`;
    card.addEventListener('click', () => (i === current ? window.irA(n.href) : go(i)));
    track.append(card);
    return card;
  });

  function layout() {
    const total = items.length;
    cards.forEach((card, i) => {
      // Distancia circular al centro: -4..3 con 8 noticias.
      const k = ((i - current + total + Math.floor(total / 2)) % total) - Math.floor(total / 2);
      const d = Math.abs(k), shown = d <= 2;
      card.style.transform = `translate(-50%, -50%) translateX(${k * 58}%) scale(${1 - d * .17}) rotateY(${-Math.sign(k) * Math.min(d, 2) * 9}deg)`;
      card.style.zIndex = 10 - d;
      card.style.opacity = shown ? 1 : 0;
      card.style.filter = `brightness(${1 - Math.min(d, 2) * .2}) saturate(${d ? .85 : 1})`;
      card.style.pointerEvents = shown ? 'auto' : 'none';
      card.tabIndex = shown ? 0 : -1;
      card.setAttribute('aria-label', i === current ? `Abrir: ${items[i].titulo}` : `Ver noticia: ${items[i].titulo}`);
      card.classList.toggle('is-current', i === current);
    });
    const n = items[current];
    info.innerHTML = `<time>${n.fecha}</time><h3>${n.titulo}</h3><p>${n.resumen}</p><a class="text-link" href="${n.href}">Leer más →</a>`;
    info.classList.remove('swap'); void info.offsetWidth; info.classList.add('swap');
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  }
  function go(i) {
    current = (i + items.length) % items.length;
    layout();
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (visible && !hovering && !reduced) timer = setTimeout(() => go(current + 1), 4800);
  }

  document.getElementById('newsNext').addEventListener('click', () => go(current + 1));
  document.getElementById('newsPrev').addEventListener('click', () => go(current - 1));
  const carousel = track.closest('.news-carousel');
  carousel.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovering = true; schedule(); } });
  carousel.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go(current + 1);
    if (e.key === 'ArrowLeft') go(current - 1);
  });
  // Deslizar con el dedo en pantallas táctiles.
  let startX = null;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .35 }).observe(track);
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
  const controls = hero.querySelector('.hero-controls'), dots = hero.querySelector('.hero-dots'), caption = document.getElementById('caption');
  const toggle = hero.querySelector('.hero-motion-toggle');
  const hold = 6500, fade = 1800;
  controls.style.setProperty('--slide', hold + fade + 'ms');
  // Un segmento por foto: el activo se llena mientras dura; al hacer clic se muestra esa foto y queda fija.
  photos.forEach((photo, i) => {
    const b = Object.assign(document.createElement('button'), { type: 'button' });
    b.setAttribute('aria-label', `Ver foto ${i + 1}: ${photo.dataset.caption}`);
    b.addEventListener('click', () => {
      if (i !== index) show(i);
      setPaused(true);
    });
    dots.append(b);
  });
  let index = 0, paused = false, timer = null;
  const zooms = photos.map(p => p.animate([{ transform: 'scale(1.005)' }, { transform: 'scale(1.025)' }],
    { duration: 33000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }));
  function mark() {
    [...dots.children].forEach((d, i) => {
      d.classList.remove('on');
      d.setAttribute('aria-current', i === index);
    });
    void dots.offsetWidth; // reinicia la barra de progreso del segmento activo
    dots.children[index].classList.add('on');
  }
  function show(next) {
    photos[index].animate([{ opacity: 1 }, { opacity: 0 }], { duration: fade, easing: 'ease-in-out', fill: 'forwards' });
    photos[next].animate([{ opacity: 0 }, { opacity: 1 }], { duration: fade, easing: 'ease-in-out', fill: 'forwards' });
    index = next;
    caption.textContent = photos[index].dataset.caption;
    mark();
  }
  function schedule() { clearTimeout(timer); if (!paused) timer = setTimeout(() => { show((index + 1) % photos.length); schedule(); }, hold + fade); }
  function setPaused(value) {
    paused = value;
    controls.classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-pressed', paused);
    toggle.setAttribute('aria-label', paused ? 'Reanudar fotos' : 'Pausar fotos');
    zooms.forEach(a => paused ? a.pause() : a.play());
    if (!paused) mark();
    schedule();
  }
  mark();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { zooms.forEach(a => a.cancel()); setPaused(true); return; }
  toggle.addEventListener('click', () => setPaused(!paused));
  schedule();
})();
