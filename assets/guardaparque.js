// Herramienta del guardaparque: escanea el QR del ticket y lo valida sin conexión.
// 1) Firma: comprueba que el ticket lo emitió el parque y que no fue alterado (assets/boleto.js).
// 2) Cancelaciones: lista descargada en la última sincronización, más las marcadas a mano (aviso por radio).
// 3) Fecha: la de control debe estar dentro de la reserva (llegada a salida).
// 4) Repetidos: los ingresos quedan guardados en el teléfono; un ticket usado avisa la hora del primer ingreso.
// En producción los ingresos se envían al servidor cuando vuelve la señal.
(() => {
  const $ = id => document.getElementById(id);
  const store = {
    get: (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  };
  const clp = n => '$' + Math.round(n).toLocaleString('es-CL');
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const day = d => d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
  const hour = t => new Date(t).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const STAY = { day: 'Solo el día', hornitos: 'Camping Los Hornitos', morrenas: 'Camping Las Morrenas', refugio: 'Refugio del Arriero' };
  const METHOD = { webpay: 'Webpay', mercadopago: 'Mercado Pago', flow: 'Flow', khipu: 'Khipu' };

  // ── Acceso: cada guardaparque entra con su RUT y su clave ──
  // En producción: cuentas individuales en el servidor. El primer ingreso se hace con señal y deja la sesión
  // guardada en el teléfono; la clave la desbloquea sin conexión, y la administración puede revocar el equipo.
  // En esta maqueta la clave se compara en el teléfono, solo para mostrar el flujo.
  const EQUIPO = [{ rut: '11111111-1', nombre: 'Guardaparque de turno', clave: '1911' }];
  const limpiarRut = v => v.replace(/[^0-9kK]/g, '').toUpperCase();
  const formatoRut = v => {
    const c = limpiarRut(v);
    if (c.length < 2) return c;
    return c.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + c.slice(-1);
  };
  // Dígito verificador (módulo 11).
  const rutValido = v => {
    const c = limpiarRut(v), cuerpo = c.slice(0, -1);
    if (!/^\d{7,8}$/.test(cuerpo)) return false;
    let suma = 0, m = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) { suma += cuerpo[i] * m; m = m === 7 ? 2 : m + 1; }
    const dv = 11 - (suma % 11);
    return c.slice(-1) === (dv === 11 ? '0' : dv === 10 ? 'K' : String(dv));
  };
  let sesion = store.get('paj-sesion', null), alEntrar = null;
  function pedirAcceso() {
    $('gate').hidden = false;
    $('gateClave').value = '';
    $('gateError').textContent = '';
    setTimeout(() => ($('gateRut').value ? $('gateClave') : $('gateRut')).focus(), 50);
  }
  $('gateRut').addEventListener('input', e => { e.target.value = formatoRut(e.target.value); $('gateError').textContent = ''; });
  $('gateForm').addEventListener('submit', e => {
    e.preventDefault();
    const rut = limpiarRut($('gateRut').value);
    const fallar = texto => { $('gateError').textContent = texto; navigator.vibrate?.([80, 60, 80]); };
    if (!rutValido(rut)) return fallar('Revisa el RUT: el dígito verificador no calza.');
    const p = EQUIPO.find(x => limpiarRut(x.rut) === rut);
    if (!p || $('gateClave').value !== p.clave) { $('gateClave').value = ''; return fallar('RUT o clave incorrectos.'); }
    sesion = { nombre: p.nombre, rut: formatoRut(rut), desde: Date.now() };
    store.set('paj-sesion', sesion);
    $('gate').hidden = true;
    $('who').textContent = sesion.nombre;
    alEntrar?.();
    alEntrar = null;
  });
  $('logout').addEventListener('click', () => { sesion = null; store.set('paj-sesion', null); pedirAcceso(); });
  if (sesion) $('who').textContent = sesion.nombre; else pedirAcceso();

  let ingresos = store.get('paj-ingresos', {});       // código → { t, por, personas, residencia, cobro: { monto, medio } }
  let sync = store.get('paj-cancelaciones', { lista: [], actualizado: null, sincronizado: null });
  let manuales = store.get('paj-canceladas-manual', []);
  $('fecha').value = iso(new Date());

  // ── Conexión y sincronización ──
  function net() {
    const on = navigator.onLine;
    $('net').textContent = on ? 'En línea' : 'Sin señal';
    $('net').classList.toggle('off', !on);
  }
  function syncInfo() {
    $('syncInfo').textContent = sync.sincronizado
      ? `Última sincronización: ${day(new Date(sync.sincronizado))}, ${hour(sync.sincronizado)} · ${sync.lista.length + manuales.length} cancelada(s)`
      : 'Sin sincronizar todavía';
  }
  async function sincronizar() {
    try {
      const res = await fetch('assets/cancelaciones.json', { cache: 'no-store' });
      const data = await res.json();
      sync = { lista: data.canceladas || [], actualizado: data.actualizado, sincronizado: Date.now() };
      store.set('paj-cancelaciones', sync);
      // Aquí, en producción, también se enviarían los ingresos registrados sin señal.
    } catch { /* sin señal: se conserva la última lista */ }
    syncInfo();
  }
  addEventListener('online', () => { net(); sincronizar(); });
  addEventListener('offline', net);
  $('syncBtn').addEventListener('click', sincronizar);
  net(); syncInfo();
  if (navigator.onLine) sincronizar();

  // ── Validación ──
  let actual = null;
  async function validar(texto) {
    const res = await window.Boleto.verificar(texto);
    if (!res.ok) return mostrar({ estado: 'bad', titulo: 'Ticket no válido', detalle: res.motivo });
    const r = res.datos;
    const llegada = parse(r.d), salida = addDays(llegada, r.n || 0), control = parse($('fecha').value);
    const enFecha = control >= llegada && control <= salida;
    const cancelada = sync.lista.includes(r.c) || manuales.includes(r.c);
    const previo = ingresos[r.c];
    actual = r;
    if (cancelada) return mostrar({ estado: 'bad', titulo: 'Reserva cancelada', detalle: `El ticket ${r.c} es auténtico, pero la reserva fue cancelada.`, r });
    if (previo) return mostrar({ estado: 'warn', titulo: 'Ya ingresó', detalle: `Este ticket se registró hoy, a las ${hour(previo.t)}${previo.por ? `, por ${previo.por}` : ''}`, r });
    if (!enFecha) return mostrar({ estado: 'warn', titulo: 'Fecha distinta', detalle: `La reserva es para ${r.n ? `${day(llegada)} → ${day(salida)}` : day(llegada)}.`, r, permitir: true });
    mostrar({ estado: 'ok', titulo: 'Ticket válido', detalle: 'Firma verificada en el teléfono.', r, permitir: true });
  }

  function mostrar({ estado, titulo, detalle, r, permitir }) {
    const box = $('result');
    box.className = `result ${estado}`;
    box.hidden = false;
    const icon = { ok: '✓', warn: '!', bad: '✕' }[estado];
    let html = `<div class="verdict"><i>${icon}</i><div>${titulo}<small>${detalle}</small></div></div>`;
    if (r) {
      const personas = `${r.a} adulto${r.a > 1 ? 's' : ''}${r.k ? ` y ${r.k} niño${r.k > 1 ? 's' : ''}` : ''}`;
      const llegada = parse(r.d), salida = addDays(llegada, r.n || 0);
      const pago = r.p ? `${clp(r.p)} con ${METHOD[r.m] || 'pago en línea'}` : 'Nada en línea';
      html += `<div class="details"><dl>
        <dt>Código</dt><dd>${r.c}</dd>
        <dt>Visitantes</dt><dd>${personas}</dd>
        <dt>Alojamiento</dt><dd>${STAY[r.s] || r.s}${r.n ? ` · ${r.n} noche${r.n > 1 ? 's' : ''}` : ''}</dd>
        <dt>Fechas</dt><dd>${r.n ? `${day(llegada)} → ${day(salida)}` : day(llegada)}</dd>
        <dt>Pagado</dt><dd>${pago}</dd>
        ${r.g ? `<dt>Cobrar en la entrada</dt><dd>${clp(r.g[0])} con residencia · ${clp(r.g[1])} sin</dd>` : ''}
      </dl>
      ${r.r ? '<p class="flag">Pagó con descuento de residente: revisa su carnet y su documento de domicilio.</p>' : ''}
      ${r.g ? '<p class="flag">Acredita residencia aquí: carnet y documento con domicilio en San Felipe o Los Andes.</p>' : ''}`;
      if (permitir) {
        html += `<div class="actions">
          ${r.r || r.g ? '<label class="check"><input type="checkbox" id="resOk"> Residencia acreditada</label>' : ''}
          ${r.g ? `<div class="charge" id="charge"><span>Cobrar <b id="chargeAmount">${clp(r.g[1])}</b></span><select id="chargeMethod"><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta (POS)</option></select></div>` : ''}
          <button class="btn primary" type="button" id="registrar">Registrar ingreso</button>
          <button class="link" type="button" id="cancelarManual">Marcar como cancelada (aviso por radio)</button>
        </div>`;
      }
      html += '</div>';
    }
    box.innerHTML = html;
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    navigator.vibrate?.(estado === 'ok' ? 60 : [80, 60, 80]);
    if (!r || !permitir) return;
    const resOk = $('resOk');
    resOk?.addEventListener('change', () => { if (r.g) $('chargeAmount').textContent = clp(resOk.checked ? r.g[0] : r.g[1]); });
    $('registrar').addEventListener('click', () => registrar(r));
    $('cancelarManual').addEventListener('click', () => {
      if (!confirm(`¿Marcar ${r.c} como cancelada en este teléfono?`)) return;
      manuales = [...new Set([...manuales, r.c])];
      store.set('paj-canceladas-manual', manuales);
      syncInfo();
      validar(textoActual);
    });
  }

  function registrar(r) {
    const resOk = $('resOk')?.checked || false;
    ingresos[r.c] = {
      t: Date.now(), por: sesion?.nombre, personas: r.a + r.k, residencia: resOk,
      cobro: r.g ? { monto: resOk ? r.g[0] : r.g[1], medio: $('chargeMethod').value } : null
    };
    store.set('paj-ingresos', ingresos);
    mostrar({ estado: 'ok', titulo: 'Ingreso registrado', detalle: `${r.c} · ${hour(Date.now())}${navigator.onLine ? '' : ' · se enviará al volver la señal'}` });
    dibujarRegistro();
  }

  function dibujarRegistro() {
    const hoy = iso(new Date());
    const items = Object.entries(ingresos).filter(([, v]) => iso(new Date(v.t)) === hoy).sort((a, b) => b[1].t - a[1].t);
    $('log').innerHTML = items.map(([c, v]) => `<li><time>${hour(v.t)}</time><span>${c} · ${v.personas} persona${v.personas > 1 ? 's' : ''}${v.residencia ? ' · residente' : ''}</span><b>${v.cobro ? clp(v.cobro.monto) : ''}</b></li>`).join('')
      || '<li><span></span><span class="muted">Todavía no hay ingresos hoy.</span><span></span></li>';
    const sum = medio => items.reduce((s, [, v]) => s + (v.cobro?.medio === medio ? v.cobro.monto : 0), 0);
    $('tPersonas').textContent = items.reduce((s, [, v]) => s + v.personas, 0);
    $('tEfectivo').textContent = clp(sum('efectivo'));
    $('tTarjeta').textContent = clp(sum('tarjeta'));
  }
  dibujarRegistro();

  // ── Lectura del QR: BarcodeDetector si existe; si no, jsQR cuadro a cuadro ──
  let stream = null, textoActual = '';
  const detector = 'BarcodeDetector' in window ? new BarcodeDetector({ formats: ['qr_code'] }) : null;
  async function leer(texto) { textoActual = texto; await detener(); validar(texto); }
  async function escanear() {
    if (stream) return detener();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    } catch {
      return mostrar({ estado: 'warn', titulo: 'Sin acceso a la cámara', detalle: 'Permite el uso de la cámara o ingresa el código a mano.' });
    }
    const video = $('video'), canvas = $('frame'), ctx = canvas.getContext('2d', { willReadFrequently: true });
    video.srcObject = stream;
    await video.play();
    $('scanBox').hidden = false;
    $('scanBtn').textContent = 'Cancelar';
    (async function tick() {
      if (!stream) return;
      if (video.readyState >= 2) {
        if (detector) {
          const codes = await detector.detect(video).catch(() => []);
          if (codes[0]) return leer(codes[0].rawValue);
        } else {
          canvas.width = video.videoWidth; canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const code = window.jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
          if (code) return leer(code.data);
        }
      }
      requestAnimationFrame(tick);
    })();
  }
  async function detener() {
    stream?.getTracks().forEach(t => t.stop());
    stream = null;
    $('scanBox').hidden = true;
    $('scanBtn').textContent = 'Escanear ticket';
  }
  $('scanBtn').addEventListener('click', escanear);
  $('manualBtn').addEventListener('click', () => leer($('manual').value));

  // Demo: el enlace del ticket trae el código en la URL y fija la fecha de control en la de la reserva.
  const desdeEnlace = new URLSearchParams(location.hash.slice(1)).get('t');
  if (desdeEnlace) {
    history.replaceState(null, '', location.pathname);
    // Sin sesión, la validación espera a que el guardaparque ingrese su PIN.
    const run = () => window.Boleto.verificar(desdeEnlace).then(res => {
      if (res.ok) {
        $('fecha').value = res.datos.d;
        $('demoNote').hidden = false;
        $('demoNote').textContent = 'Demo: abriste el ticket desde la página de reserva, así que la fecha de control quedó en la de la reserva. En terreno es la fecha de hoy.';
      }
      leer(desdeEnlace);
    });
    if (sesion) run(); else alEntrar = run;
  }

  // Instalación y uso sin conexión.
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('guardaparque-sw.js').catch(() => {});
})();
