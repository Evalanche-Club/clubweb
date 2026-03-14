/* ===================================
   EVALANCHE CLUB — MAIN JS
   =================================== */

// ===== PARTICLE CANVAS =====
(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  const PARTICLE_COUNT = 80;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : canvas.height + 10;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 400 + 200;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset(false);
    }
    draw() {
      const fade = Math.min(this.life / 60, 1) * Math.min((this.maxLife - this.life) / 60, 1);
      ctx.globalAlpha = this.opacity * fade;
      ctx.fillStyle = '#4df0ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Create connections between close particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.globalAlpha = (1 - dist / 120) * 0.08;
          ctx.strokeStyle = '#4df0ff';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  init();
  animate();
})();

// ===== NAVBAR SCROLL =====
(function () {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });
})();

// ===== MOBILE NAV =====
(function () {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
})();

// ===== COUNTER ANIMATION =====
(function () {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const suffix = target >= 100 ? '+' : '';
      let current = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current) + suffix;
        if (current >= target) clearInterval(timer);
      }, 16);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ===== SCROLL REVEAL =====
(function () {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
})();

// ===== OSCILLOSCOPE CANVAS — multi-waveform =====
(function () {
  const canvas = document.getElementById('oscilloscopeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const freqLabel = document.getElementById('oscFreqLabel');
  const waveLabel = document.getElementById('oscWaveLabel');

  // ── Waveform math functions ──────────────────────────────────────────────
  function sine(p)     { return Math.sin(p * Math.PI * 2); }
  function square(p)   { return Math.sin(p * Math.PI * 2) >= 0 ? 1 : -1; }
  function triangle(p) {
    const x = p % 1;
    return x < 0.25 ? x * 4 : x < 0.75 ? 2 - x * 4 : (x - 1) * 4;
  }
  function sawtooth(p) {
    const x = p % 1;
    return x < 0.5 ? x * 2 : (x - 1) * 2;
  }
  function amMod(p)    {
    // AM modulated: carrier * (1 + 0.6·sin(modulation))
    const carrier    = Math.sin(p * Math.PI * 2 * 5);
    const modulator  = 0.7 + 0.6 * Math.sin(p * Math.PI * 2 * 0.8);
    return carrier * modulator;
  }
  function pwm(p) {
    // Pulse-width modulated — duty cycle oscillates over time
    const duty = 0.3 + 0.25 * Math.sin(p * Math.PI * 0.3);
    return (p % 1) < duty ? 1 : -1;
  }

  const WAVEFORMS = {
    sine:     { fn: sine,     label: 'SINE',      freqs: [1.0, 2.0, 1.5], harmonics: 1 },
    square:   { fn: square,   label: 'SQUARE',    freqs: [0.8, 1.6, 1.2], harmonics: 1 },
    triangle: { fn: triangle, label: 'TRIANGLE',  freqs: [1.2, 2.4, 0.9], harmonics: 1 },
    sawtooth: { fn: sawtooth, label: 'SAWTOOTH',  freqs: [1.0, 2.0, 1.4], harmonics: 1 },
    am:       { fn: amMod,    label: 'AM MOD',    freqs: [2.4, 4.8, 3.6], harmonics: 1 },
    pwm:      { fn: pwm,      label: 'PWM',       freqs: [1.5, 3.0, 2.0], harmonics: 1 },
  };

  let activeWave = 'sine';
  let t = 0;
  let freqIdx = 0;
  let freqTimer = 0;
  let transitionAlpha = 1;    // for smooth crossfade when switching waveforms
  let prevWaveFn = null;
  let blendT = 0;             // 0→1 blend progress

  // ── Resize handling ──────────────────────────────────────────────────────
  let W = 0, H = 0, DPR = window.devicePixelRatio || 1;

  function resize() {
    DPR = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(DPR, DPR);
  }

  window.addEventListener('resize', resize);
  resize();

  // ── Grid ─────────────────────────────────────────────────────────────────
  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(77,240,255,0.04)';
    ctx.lineWidth = 0.5;
    const cols = 12, rows = 4;
    for (let i = 0; i <= cols; i++) {
      const x = (i / cols) * W;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      const y = (i / rows) * H;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // Brighter centre axis
    ctx.strokeStyle = 'rgba(77,240,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    ctx.restore();
  }

  // ── Single waveform path ─────────────────────────────────────────────────
  function buildPath(waveFn, speed, amp) {
    ctx.beginPath();
    const samples = W;
    for (let px = 0; px <= samples; px++) {
      const progress = px / samples;
      const phase    = progress * 3 + t * speed;
      const y        = waveFn(phase) * amp;
      const cy       = H / 2 - y * (H * 0.42);
      if (px === 0) ctx.moveTo(px, cy);
      else          ctx.lineTo(px, cy);
    }
  }

  // ── Draw with glow ───────────────────────────────────────────────────────
  function drawWaveform(waveFn, alpha) {
    if (!waveFn || alpha <= 0) return;
    const def = Object.values(WAVEFORMS).find(w => w.fn === waveFn) || WAVEFORMS.sine;
    const speed = def.freqs[freqIdx % def.freqs.length];

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineJoin = 'round';
    ctx.lineCap  = 'round';

    // Glow layer
    buildPath(waveFn, speed, 1);
    ctx.strokeStyle = 'rgba(77,240,255,0.18)';
    ctx.lineWidth = 8;
    ctx.filter = 'blur(6px)';
    ctx.stroke();
    ctx.filter = 'none';

    // Mid layer
    buildPath(waveFn, speed, 1);
    ctx.strokeStyle = 'rgba(77,240,255,0.45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Crisp top layer
    buildPath(waveFn, speed, 1);
    ctx.strokeStyle = 'rgba(77,240,255,0.92)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // ── Scan line ────────────────────────────────────────────────────────────
  function drawScan() {
    const scanX = ((t * 28) % (W + 60)) - 30;
    const g = ctx.createLinearGradient(scanX - 40, 0, scanX + 16, 0);
    g.addColorStop(0, 'transparent');
    g.addColorStop(1, 'rgba(77,240,255,0.06)');
    ctx.fillStyle = g;
    ctx.fillRect(scanX - 40, 0, 56, H);
  }

  // ── Main loop ────────────────────────────────────────────────────────────
  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawScan();

    const def = WAVEFORMS[activeWave];

    if (prevWaveFn && blendT < 1) {
      // Cross-fade between old and new waveform
      blendT = Math.min(blendT + 0.05, 1);
      drawWaveform(prevWaveFn, 1 - blendT);
      drawWaveform(def.fn, blendT);
      if (blendT >= 1) prevWaveFn = null;
    } else {
      drawWaveform(def.fn, 1);
    }

    t += 0.013;

    // Cycle frequency label
    freqTimer++;
    if (freqTimer > 200) {
      freqIdx = (freqIdx + 1) % 3;
      const f = def.freqs[freqIdx];
      if (freqLabel) freqLabel.textContent = `f = ${f.toFixed(1)} kHz`;
      freqTimer = 0;
    }

    requestAnimationFrame(animate);
  }

  // ── Waveform switcher (called from HTML buttons) ──────────────────────────
  window.setOscWave = function(type) {
    if (type === activeWave) return;
    prevWaveFn = WAVEFORMS[activeWave].fn;
    blendT = 0;
    activeWave = type;
    freqTimer = 0;
    freqIdx = 0;
    const def = WAVEFORMS[type];
    if (freqLabel) freqLabel.textContent = `f = ${def.freqs[0].toFixed(1)} kHz`;
    if (waveLabel) waveLabel.textContent = def.label;

    // Update button states
    document.querySelectorAll('.osc-wave-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.wave === type);
    });
  };

  animate();
})();


// ===== CUSTOM CURSOR — clean minimal crosshair =====
(function () {
  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const el = document.createElement('div');
  el.id = 'evalCursor';
  el.style.cssText = [
    'position:fixed',
    'top:0', 'left:0',
    'z-index:99999',
    'pointer-events:none',
    'will-change:transform',
    // Two arms of the crosshair via box-shadow
    'width:1px', 'height:16px',
    'background:rgba(77,240,255,0.85)',
    'transform:translate(-50%,-50%)',
  ].join(';');

  // Horizontal arm via pseudo — we'll use a second div instead
  const elH = document.createElement('div');
  elH.style.cssText = [
    'position:fixed',
    'top:0', 'left:0',
    'z-index:99999',
    'pointer-events:none',
    'will-change:transform',
    'width:16px', 'height:1px',
    'background:rgba(77,240,255,0.85)',
    'transform:translate(-50%,-50%)',
  ].join(';');

  // Center dot
  const dot = document.createElement('div');
  dot.style.cssText = [
    'position:fixed',
    'top:0', 'left:0',
    'z-index:99999',
    'pointer-events:none',
    'will-change:transform',
    'width:3px', 'height:3px',
    'border-radius:50%',
    'background:rgba(77,240,255,1)',
    'transform:translate(-50%,-50%)',
    'transition:width 0.15s,height 0.15s,opacity 0.15s',
  ].join(';');

  document.body.appendChild(el);
  document.body.appendChild(elH);
  document.body.appendChild(dot);

  let x = -100, y = -100;

  document.addEventListener('mousemove', e => {
    x = e.clientX; y = e.clientY;
    const pos = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    el.style.transform   = pos;
    elH.style.transform  = pos;
    dot.style.transform  = pos;
  }, { passive: true });

  // Grow dot on interactive elements
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [role="button"], input, select, textarea')) {
      dot.style.width   = '8px';
      dot.style.height  = '8px';
      dot.style.opacity = '0.5';
    } else {
      dot.style.width   = '3px';
      dot.style.height  = '3px';
      dot.style.opacity = '1';
    }
  });
})();


