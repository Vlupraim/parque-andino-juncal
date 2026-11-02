// Logo del Parque Andino Juncal con su pájaro animado cuadro a cuadro, como stop motion.
// Los fotogramas vienen calcados de la hoja de Gemini (assets/logo-juncal-data.js).
(() => {
  const DATA = window.LOGO_JUNCAL;
  // Ciclo de aleteo de 8 pasos con los 5 dibujos de vuelo (antes 6 pasos).
  const FLAP = ['up', 'upBack', 'mid', 'level', 'level2', 'level', 'mid', 'upBack'];

  function mount(host, start = 'perch') {
    host.insertAdjacentHTML('beforeend', `<svg class="ave" viewBox="${DATA.frameViewBox}" aria-hidden="true" focusable="false" overflow="visible">${
      Object.entries(DATA.frames).map(([name, art]) => `<g data-frame="${name}">${art}</g>`).join('')}</svg>`);
    const svg = host.querySelector('.ave');
    const groups = Object.fromEntries([...svg.querySelectorAll('[data-frame]')].map(g => [g.dataset.frame, g]));
    let cycle = null;
    const wait = ms => new Promise(r => setTimeout(r, ms));

    function show(name) { for (const [key, g] of Object.entries(groups)) g.style.display = key === name ? '' : 'none'; }
    function flap(fps) {
      clearInterval(cycle);
      let i = 0;
      cycle = setInterval(() => show(FLAP[i++ % FLAP.length]), 1000 / fps);
    }
    function stop(name) { clearInterval(cycle); cycle = null; show(name); }

    // El desplazamiento también avanza a saltos (24 cuadros/s). Puntos: [x, y, escala].
    const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    function move(points, duration, fps = 24) {
      return new Promise(resolve => {
        const start = performance.now();
        const place = ([x, y, s]) => { svg.style.transform = `translate(${x}px,${y}px) scale(${s})`; };
        const tick = setInterval(() => {
          const t = Math.min(1, (performance.now() - start) / duration);
          const p = ease(t) * (points.length - 1), i = Math.min(points.length - 2, Math.floor(p)), k = p - i;
          place(points[i].map((v, j) => v + (points[i + 1][j] - v) * k));
          if (t === 1) { clearInterval(tick); resolve(); }
        }, 1000 / fps);
        place(points[0]);
      });
    }

    // Levanta las alas y sale volando hacia arriba, sin cruzar la página; vuelve desde la izquierda y se posa en la J.
    async function play({ stage = null, away = 2400 } = {}) {
      const box = svg.getBoundingClientRect();
      const area = stage ? stage.getBoundingClientRect() : { left: 0, top: 0, right: innerWidth };
      const enterX = -(box.right - area.left);
      const w = box.width, h = box.height;
      const exitY = -(box.bottom - area.top) - h * .2;

      show('crouch'); await wait(90);
      show('lift'); await wait(110);
      flap(18);
      await move([[0, 0, 1], [w * .15, -h * .3, 1], [w * .45, exitY * .65, .95], [w * .7, exitY, .9]], 950);

      stop('level');
      svg.style.visibility = 'hidden';
      await wait(away);
      svg.style.visibility = '';

      flap(16);
      setTimeout(() => stop('level'), 900);
      await move([[enterX, h * 1.1, .9], [enterX * .4, h * .8, 1], [0, -h * .15, 1]], 1500);

      show('upBack'); await move([[0, -h * .15, 1], [0, 0, 1]], 250);
      show('lift'); await wait(180);
      show('crouch'); await wait(160);
      svg.style.transform = '';
      show('perch');
    }

    show(start);
    return { svg, play, show };
  }

  // Dibuja el logo completo: el texto fijo y el pájaro en su caja sobre la J.
  function logo(container) {
    const b = DATA.birdBox;
    container.insertAdjacentHTML('beforeend',
      `<svg class="logo-text" viewBox="${DATA.viewBox}" role="img" aria-label="Parque Andino Juncal"><g fill="currentColor">${DATA.text}</g></svg>`
      + `<span class="ave-host" style="left:${b.left}%;top:${b.top}%;width:${b.width}%"></span>`);
    return mount(container.querySelector('.ave-host'));
  }

  window.AveJuncal = { mount, logo, frames: Object.keys(DATA.frames) };
})();
