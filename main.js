/* ===================================================
   EVALANCHE CLUB — main.js  (clean integrated build)
   =================================================== */

// ── 1. THEME SWITCHER (runs immediately, no flash) ──────────────────────────
(function () {
  var KEY = 'evalanche-theme';

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    document.querySelectorAll('.theme-pill').forEach(function (p) {
      var isActive = p.dataset.theme === t;
      p.classList.toggle('active', isActive);
      p.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    var pc = document.getElementById('particleCanvas');
    if (pc) pc.style.opacity = t === 'light' ? '0.3' : '1';
  }

  // Apply saved preference before DOM renders
  var saved = 'dark';
  try { saved = localStorage.getItem(KEY) || 'dark'; } catch (e) {}
  document.documentElement.setAttribute('data-theme', saved);

  document.addEventListener('DOMContentLoaded', function () {
    // Inject pills into every #themeToggle container
    document.querySelectorAll('#themeToggle').forEach(function (wrap) {
      wrap.innerHTML =
        '<button class="theme-pill" data-theme="dark"  aria-pressed="false" title="Dark mode">'  +
          '<i class="fas fa-moon"></i><span>Dark</span>'  +
        '</button>' +
        '<button class="theme-pill" data-theme="light" aria-pressed="false" title="Light mode">' +
          '<i class="fas fa-sun"></i><span>Light</span>' +
        '</button>';

      wrap.querySelectorAll('.theme-pill').forEach(function (pill) {
        pill.addEventListener('click', function () {
          var t = pill.dataset.theme;
          applyTheme(t);
          try { localStorage.setItem(KEY, t); } catch (e) {}
        });
      });
    });
    // Sync state after injection
    applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
  });
})();

// ── 2. PARTICLE CANVAS ──────────────────────────────────────────────────────
(function () {
  var canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var COUNT = window.innerWidth < 600 ? 35 : 65;
  var animFrame;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function Particle(init) { this.reset(init); }
  Particle.prototype.reset = function (init) {
    this.x       = Math.random() * canvas.width;
    this.y       = init ? Math.random() * canvas.height : canvas.height + 10;
    this.size    = Math.random() * 1.4 + 0.3;
    this.speedY  = -(Math.random() * 0.4 + 0.1);
    this.speedX  = (Math.random() - 0.5) * 0.18;
    this.opacity = Math.random() * 0.45 + 0.1;
    this.life    = 0;
    this.maxLife = Math.random() * 400 + 200;
  };
  Particle.prototype.update = function () {
    this.x += this.speedX; this.y += this.speedY; this.life++;
    if (this.life > this.maxLife || this.y < -10) this.reset(false);
  };
  Particle.prototype.draw = function () {
    var fade = Math.min(this.life / 60, 1) * Math.min((this.maxLife - this.life) / 60, 1);
    ctx.globalAlpha = this.opacity * fade;
    ctx.fillStyle   = '#4df0ff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  };

  function drawLines() {
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.globalAlpha  = (1 - d / 100) * 0.06;
          ctx.strokeStyle  = '#4df0ff';
          ctx.lineWidth    = 0.5;
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
    particles = [];
    for (var i = 0; i < COUNT; i++) particles.push(new Particle(true));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLines();
    particles.forEach(function (p) { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
    animFrame = requestAnimationFrame(animate);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      COUNT = window.innerWidth < 600 ? 35 : 65;
      init();
    }, 250);
  });

  init();
  animate();
})();

// ── 3. NAVBAR SCROLL ────────────────────────────────────────────────────────
(function () {
  var nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
})();

// ── 4. MOBILE NAV ───────────────────────────────────────────────────────────
(function () {
  var btn   = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var nav   = document.querySelector('.navbar');
  if (!btn || !links) return;

  function close() {
    btn.classList.remove('open');
    links.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function () {
    var open = btn.classList.toggle('open');
    links.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });

  document.addEventListener('click', function (e) {
    if (links.classList.contains('open') && nav && !nav.contains(e.target)) close();
  });
})();

// ── 5. COUNTER ANIMATION ────────────────────────────────────────────────────
function runCounter(el) {
  var target = parseInt(el.dataset.target) || 0;
  if (!target) return;
  var suffix  = target >= 100 ? '+' : '';
  var current = 0;
  var step    = target / 55;
  var timer   = setInterval(function () {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + suffix;
    if (current >= target) clearInterval(timer);
  }, 16);
}

(function () {
  var counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      runCounter(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  counters.forEach(function (c) { obs.observe(c); });
  window.rerunCounters = function () {
    counters.forEach(function (el) { if (el.textContent === '0') runCounter(el); });
  };
})();

// ── 6. SCROLL REVEAL ────────────────────────────────────────────────────────
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function () { entry.target.classList.add('visible'); }, i * 70);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(function (el) { obs.observe(el); });
})();

// ── 7. OSCILLOSCOPE ─────────────────────────────────────────────────────────
(function () {
  var canvas = document.getElementById('oscilloscopeCanvas');
  if (!canvas) return;
  var ctx       = canvas.getContext('2d');
  var freqLabel = document.getElementById('oscFreqLabel');
  var waveLabel = document.getElementById('oscWaveLabel');

  function sine(p)     { return Math.sin(p * Math.PI * 2); }
  function square(p)   { return Math.sin(p * Math.PI * 2) >= 0 ? 1 : -1; }
  function triangle(p) { var x = p % 1; return x < 0.25 ? x*4 : x < 0.75 ? 2-x*4 : (x-1)*4; }
  function sawtooth(p) { var x = p % 1; return x < 0.5 ? x*2 : (x-1)*2; }
  function amMod(p)    { return Math.sin(p*Math.PI*2*5) * (0.7 + 0.6*Math.sin(p*Math.PI*2*0.8)); }
  function pwm(p)      { var d = 0.3 + 0.25*Math.sin(p*Math.PI*0.3); return (p%1) < d ? 1 : -1; }

  var WAVES = {
    sine:     { fn: sine,     label: 'SINE',     freqs: [1.0, 2.0, 1.5] },
    square:   { fn: square,   label: 'SQUARE',   freqs: [0.8, 1.6, 1.2] },
    triangle: { fn: triangle, label: 'TRIANGLE', freqs: [1.2, 2.4, 0.9] },
    sawtooth: { fn: sawtooth, label: 'SAWTOOTH', freqs: [1.0, 2.0, 1.4] },
    am:       { fn: amMod,    label: 'AM MOD',   freqs: [2.4, 4.8, 3.6] },
    pwm:      { fn: pwm,      label: 'PWM',      freqs: [1.5, 3.0, 2.0] },
  };

  var active = 'sine', t = 0, fi = 0, ft = 0, prevFn = null, blend = 0;
  var W = 0, H = 0, DPR = 1;

  function resize() {
    DPR = window.devicePixelRatio || 1;
    W   = canvas.offsetWidth;
    H   = canvas.offsetHeight;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(DPR, DPR);
  }
  window.addEventListener('resize', function () { setTimeout(resize, 100); });
  resize();

  function grid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(77,240,255,0.04)'; ctx.lineWidth = 0.5;
    for (var i=0; i<=12; i++) { ctx.beginPath(); ctx.moveTo(i/12*W,0); ctx.lineTo(i/12*W,H); ctx.stroke(); }
    for (var j=0; j<=4;  j++) { ctx.beginPath(); ctx.moveTo(0,j/4*H); ctx.lineTo(W,j/4*H);  ctx.stroke(); }
    ctx.strokeStyle = 'rgba(77,240,255,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
    ctx.restore();
  }

  function path(fn, spd) {
    ctx.beginPath();
    for (var px=0; px<=W; px++) {
      var cy = H/2 - fn(px/W*3 + t*spd) * H*0.42;
      px===0 ? ctx.moveTo(px,cy) : ctx.lineTo(px,cy);
    }
  }

  function wave(fn, alpha) {
    if (!fn || alpha <= 0) return;
    var def = Object.values(WAVES).find(function(w){ return w.fn===fn; }) || WAVES.sine;
    var spd = def.freqs[fi % def.freqs.length];
    ctx.save(); ctx.globalAlpha = alpha; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    path(fn,spd); ctx.strokeStyle='rgba(77,240,255,0.18)'; ctx.lineWidth=8; ctx.filter='blur(6px)'; ctx.stroke(); ctx.filter='none';
    path(fn,spd); ctx.strokeStyle='rgba(77,240,255,0.45)'; ctx.lineWidth=2.5; ctx.stroke();
    path(fn,spd); ctx.strokeStyle='rgba(77,240,255,0.92)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.restore();
  }

  function scan() {
    var sx = ((t*28)%(W+60))-30, g = ctx.createLinearGradient(sx-40,0,sx+16,0);
    g.addColorStop(0,'transparent'); g.addColorStop(1,'rgba(77,240,255,0.06)');
    ctx.fillStyle=g; ctx.fillRect(sx-40,0,56,H);
  }

  function loop() {
    ctx.clearRect(0,0,W,H); grid(); scan();
    var def = WAVES[active];
    if (prevFn && blend < 1) {
      blend = Math.min(blend+0.05, 1);
      wave(prevFn, 1-blend); wave(def.fn, blend);
      if (blend>=1) prevFn=null;
    } else { wave(def.fn, 1); }
    t += 0.013; ft++;
    if (ft > 200) {
      fi = (fi+1)%3;
      if (freqLabel) freqLabel.textContent = 'f=' + def.freqs[fi].toFixed(1) + ' kHz';
      ft = 0;
    }
    requestAnimationFrame(loop);
  }

  window.setOscWave = function (type) {
    if (type === active) return;
    prevFn = WAVES[active].fn; blend = 0; active = type; ft = 0; fi = 0;
    var def = WAVES[type];
    if (freqLabel) freqLabel.textContent = 'f=' + def.freqs[0].toFixed(1) + ' kHz';
    if (waveLabel) waveLabel.textContent = def.label;
    document.querySelectorAll('.osc-wave-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.wave === type);
    });
  };

  loop();
})();

// ── 8. ANTI-GRAVITY PHYSICS LAB ─────────────────────────────────────────────
(function () {
  var canvas = document.getElementById('antigravityCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var W = 0, H = 0, DPR = 1;
  var mouse = { x: -9999, y: -9999, inside: false };
  var mode  = 'repulse'; // 'repulse' | 'attract' | 'chaos'
  var PARTICLE_COUNT = window.innerWidth < 600 ? 55 : 100;

  function resize() {
    DPR = window.devicePixelRatio || 1;
    W   = canvas.offsetWidth;
    H   = canvas.offsetHeight;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(DPR, DPR);
  }
  window.addEventListener('resize', function () { setTimeout(resize, 100); });
  resize();

  function AgParticle() { this.init(true); }
  AgParticle.prototype.init = function (spread) {
    this.x  = Math.random() * W;
    this.y  = spread ? Math.random() * H : H + Math.random() * 20;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = -(Math.random() * 0.6 + 0.15); // always drifting upward
    this.r  = Math.random() * 1.8 + 0.5;
    this.op = Math.random() * 0.55 + 0.15;
    this.life = 0;
    this.maxLife = Math.random() * 350 + 150;
  };
  AgParticle.prototype.update = function () {
    var dx = this.x - mouse.x;
    var dy = this.y - mouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var influence = Math.max(0, 1 - dist / 120);

    if (mouse.inside && influence > 0) {
      var force = influence * 2.2;
      if (mode === 'repulse') {
        this.vx += (dx / dist) * force * 0.08;
        this.vy += (dy / dist) * force * 0.08;
      } else if (mode === 'attract') {
        this.vx -= (dx / dist) * force * 0.08;
        this.vy -= (dy / dist) * force * 0.08;
      } else {
        // chaos: random impulse
        this.vx += (Math.random() - 0.5) * force * 0.25;
        this.vy += (Math.random() - 0.5) * force * 0.25;
      }
    }

    // Anti-gravity: pull upward
    this.vy -= 0.012;

    // Gentle damping to prevent runaway speed
    this.vx *= 0.98;
    this.vy *= 0.98;

    this.x += this.vx;
    this.y += this.vy;
    this.life++;

    // Wrap horizontally, reset when off top or too old
    if (this.x < -5)  this.x = W + 5;
    if (this.x > W+5) this.x = -5;
    if (this.y < -15 || this.life > this.maxLife) this.init(false);
  };
  AgParticle.prototype.draw = function () {
    var fade = Math.min(this.life / 50, 1) * Math.min((this.maxLife - this.life) / 50, 1);
    ctx.globalAlpha = this.op * fade;
    var g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3);
    g.addColorStop(0, '#4df0ff');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4df0ff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  };

  function drawConnections(pts) {
    for (var i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var dx = pts[i].x - pts[j].x;
        var dy = pts[i].y - pts[j].y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          ctx.globalAlpha = (1 - d / 80) * 0.07;
          ctx.strokeStyle = '#4df0ff';
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function drawMouseGlow() {
    if (!mouse.inside) return;
    ctx.globalAlpha = 0.12;
    var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 110);
    g.addColorStop(0, '#4df0ff');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 110, 0, Math.PI * 2);
    ctx.fill();
  }

  var particles = [];
  for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(new AgParticle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawMouseGlow();
    drawConnections(particles);
    for (var k = 0; k < particles.length; k++) {
      particles[k].update();
      particles[k].draw();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }

  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.inside = true;
  }, { passive: true });
  canvas.addEventListener('mouseleave', function () { mouse.inside = false; }, { passive: true });
  canvas.addEventListener('touchmove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
    mouse.inside = true;
  }, { passive: true });
  canvas.addEventListener('touchend', function () { mouse.inside = false; }, { passive: true });

  loop();

  window.setAgMode = function (m) {
    mode = m;
    var labels = { repulse: 'REPULSION MODE', attract: 'ATTRACTION MODE', chaos: 'CHAOS MODE' };
    var lbl = document.getElementById('agModeLabel');
    if (lbl) lbl.textContent = labels[m] || m.toUpperCase() + ' MODE';
    ['agRepulse','agAttract','agChaos'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('active', el.id === 'ag' + m.charAt(0).toUpperCase() + m.slice(1));
    });
  };
})();

// ── 9. CUSTOM CURSOR (desktop only) ─────────────────────────────────────────
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.innerWidth < 900) return;

  function mk(s) { var d=document.createElement('div'); d.style.cssText=s; document.body.appendChild(d); return d; }
  var B = 'position:fixed;top:0;left:0;z-index:99999;pointer-events:none;will-change:transform;';
  var vLine = mk(B+'width:1px;height:16px;background:rgba(77,240,255,0.8);transform:translate(-50%,-50%)');
  var hLine = mk(B+'width:16px;height:1px;background:rgba(77,240,255,0.8);transform:translate(-50%,-50%)');
  var dot   = mk(B+'width:3px;height:3px;border-radius:50%;background:#4df0ff;transform:translate(-50%,-50%);transition:width .15s,height .15s,opacity .15s');

  document.addEventListener('mousemove', function (e) {
    var p = 'translate('+e.clientX+'px,'+e.clientY+'px) translate(-50%,-50%)';
    vLine.style.transform = hLine.style.transform = dot.style.transform = p;
  }, { passive: true });

  document.addEventListener('mouseover', function (e) {
    var over = !!e.target.closest('a,button,[role="button"],input,select,textarea,.theme-pill,.osc-wave-btn');
    dot.style.width   = over ? '8px'  : '3px';
    dot.style.height  = over ? '8px'  : '3px';
    dot.style.opacity = over ? '0.5'  : '1';
  });
})();
