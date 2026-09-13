/**
 * TribOil · Fluid Stream Canvas (con trail universal)
 * Funciona sobre cualquier color de fondo o fondo transparente
 */
(function () {
  const canvas = document.getElementById('oil-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ---- Config ----
  const COLORS = {
    navy:  [27, 42, 74],   // #1B2A4A
    green: [0, 122, 94],  // #007A5E
  };
  const RATIO_NAVY = 0.7;
  const DENSITY = 18;
  const MAX_ALPHA = 0.55;

  // === AJUSTE DEL RASTRO ===
  // 0.02 = estela larga (ghosting)
  // 0.06 = estela media (recomendado)
  // 0.20 = estela corta (casi sin rastro)
  const TRAIL_ALPHA = 0.06;

  const MOUSE_RADIUS = 140;
  const MOUSE_FORCE = 1.2;
  const FLOW_SCALE = 0.0018;
  const DAMPING = 0.94;
  const FLOW_FORCE = 0.08;
  const BASE_SPEED_Y = 0.1;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  let mouse = { x: -9999, y: -9999 };
  let streams = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * dpr;
    H = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    initStreams();
    ctx.clearRect(0, 0, W, H); // Limpieza inicial
  }

  function initStreams() {
    streams = [];
    const count = Math.floor(Math.min(W, H) / DENSITY);
    for (let i = 0; i < count; i++) streams.push(createStream());
  }

  function createStream() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3 * dpr,
      vy: (Math.random() - 0.5) * 0.3 * dpr + BASE_SPEED_Y * dpr,
      life: 0,
      maxLife: 200 + Math.random() * 300,
      size: (Math.random() * 1.6 + 0.4) * dpr,
      hue: Math.random() < RATIO_NAVY ? 'navy' : 'green',
    };
  }

  function flowAngle(x, y, t) {
    const s = FLOW_SCALE / dpr;
    return (
      Math.sin(x * s + t * 0.0002) * Math.cos(y * s * 1.2 - t * 0.00015) * Math.PI * 2 +
      Math.sin((x + y) * s * 0.6 + t * 0.0001) * Math.PI
    ) * 0.5;
  }

  function step(t) {
    // === TRAIL EFFECT (universal) ===
    // Modo "destination-out" borra píxeles gradualmente sin importar el fondo
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL_ALPHA})`;
    ctx.fillRect(0, 0, W, H);
    // Volver a modo normal para dibujar partículas
    ctx.globalCompositeOperation = 'source-over';

    for (let i = 0; i < streams.length; i++) {
      const s = streams[i];

      const ang = flowAngle(s.x, s.y, t);
      s.vx += Math.cos(ang) * FLOW_FORCE * dpr;
      s.vy += Math.sin(ang) * FLOW_FORCE * dpr;

      const mdx = s.x - mouse.x;
      const mdy = s.y - mouse.y;
      const md = Math.sqrt(mdx * mdx + mdy * mdy);
      const mr = MOUSE_RADIUS * dpr;
      if (md < mr && md > 0) {
        const f = (1 - md / mr) * MOUSE_FORCE * dpr;
        s.vx += (mdx / md) * f;
        s.vy += (mdy / md) * f;
      }

      s.vx *= DAMPING;
      s.vy *= DAMPING;
      s.x += s.vx;
      s.y += s.vy;
      s.life++;

      const lifeRatio = s.life / s.maxLife;
      const alpha = Math.sin(lifeRatio * Math.PI) * MAX_ALPHA;
      const [r, g, b] = COLORS[s.hue];
      ctx.beginPath();
      ctx.arc(s.x, s.y, Math.max(0.5, s.size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();

      if (
        s.life > s.maxLife ||
        s.x < -20 || s.x > W + 20 ||
        s.y < -20 || s.y > H + 20
      ) {
        Object.assign(s, createStream());
      }
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX * dpr;
    mouse.y = e.clientY * dpr;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = -9999; mouse.y = -9999;
  });

  resize();
  requestAnimationFrame(step);
})();
