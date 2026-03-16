/* ===================================
   EVALANCHE CLUB — MAIN JS v3.0
   Full theme + responsive + OTP support
   =================================== */

// ===== THEME SWITCHER =====
// Runs as IIFE immediately — prevents flash
(function () {
  var KEY = 'evalanche-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-pill').forEach(function(p) {
      p.classList.toggle('active', p.dataset.theme === theme);
      p.setAttribute('aria-pressed', p.dataset.theme === theme ? 'true' : 'false');
    });
    // Update particles opacity
    var pc = document.getElementById('particleCanvas');
    if (pc) pc.style.opacity = theme === 'light' ? '0.3' : '1';
  }

  // Apply saved theme immediately to prevent flash
  var saved = 'dark';
  try { saved = localStorage.getItem(KEY) || 'dark'; } catch(e) {}
  document.documentElement.setAttribute('data-theme', saved);

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#themeToggle').forEach(function(container) {
      // Determine if this is floating (auth pages)
      var isFloat = container.style.position === 'fixed' || 
                    container.getAttribute('style') && container.getAttribute('style').includes('fixed');
      
      container.innerHTML =
        '<button class="theme-pill" data-theme="dark" aria-pressed="false" title="Dark mode">' +
          '<i class="fas fa-moon"></i><span>Dark</span>' +
        '</button>' +
        '<button class="theme-pill" data-theme="light" aria-pressed="false" title="Light mode">' +
          '<i class="fas fa-sun"></i><span>Light</span>' +
        '</button>';

      container.querySelectorAll('.theme-pill').forEach(function(pill) {
        pill.addEventListener('click', function() {
          var t = pill.dataset.theme;
          applyTheme(t);
          try { localStorage.setItem(KEY, t); } catch(e) {}
        });
      });
    });
    // Sync pill states
    applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
  });
})();

/* ─────────────────────────────────────────── */

// ===== PARTICLE CANVAS =====
(function () {
  var canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var COUNT = window.innerWidth < 600 ? 40 : 70;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function Particle(init) { this.reset(init); }
  Particle.prototype.reset = function(init) {
    this.x = Math.random() * canvas.width;
    this.y = init ? Math.random() * canvas.height : canvas.height + 10;
    this.size   = Math.random() * 1.4 + 0.3;
    this.speedY = -(Math.random() * 0.4 + 0.1);
    this.speedX = (Math.random() - 0.5) * 0.2;
    this.opacity = Math.random() * 0.45 + 0.1;
    this.life    = 0;
    this.maxLife = Math.random() * 400 + 200;
  };
  Particle.prototype.update = function() {
    this.x += this.speedX; this.y += this.speedY; this.life++;
    if (this.life > this.maxLife || this.y < -10) this.reset(false);
  };
  Particle.prototype.draw = function() {
    var fade = Math.min(this.life/60,1) * Math.min((this.maxLife-this.life)/60,1);
    ctx.globalAlpha = this.opacity * fade;
    ctx.fillStyle = '#4df0ff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fill();
  };

  function drawConnections() {
    for (var i=0; i<particles.length; i++) {
      for (var j=i+1; j<particles.length; j++) {
        var dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
        var dist=Math.sqrt(dx*dx+dy*dy);
        if (dist<110) {
          ctx.globalAlpha=(1-dist/110)*0.07;
          ctx.strokeStyle='#4df0ff'; ctx.lineWidth=0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x,particles[i].y);
          ctx.lineTo(particles[j].x,particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    resize();
    particles = [];
    for (var i=0;i<COUNT;i++) particles.push(new Particle(true));
  }

  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawConnections();
    particles.forEach(function(p){p.update();p.draw();});
    ctx.globalAlpha=1;
    requestAnimationFrame(animate);
  }

  var ro = null;
  window.addEventListener('resize', function() {
    clearTimeout(ro);
    ro = setTimeout(function() {
      COUNT = window.innerWidth < 600 ? 40 : 70;
      init();
    }, 200);
  });

  init(); animate();
})();

// ===== NAVBAR SCROLL =====
(function () {
  var nav = document.querySelector('.navbar');
  if (!nav) return;
  var last = 0;
  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    if (y > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    last = y;
  }, {passive:true});
})();

// ===== MOBILE NAV =====
(function () {
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function() {
    var open = toggle.classList.toggle('open');
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  links.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      toggle.classList.remove('open');
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (links.classList.contains('open') && !nav.contains(e.target)) {
      toggle.classList.remove('open');
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();

// ===== COUNTER ANIMATION =====
function runCounter(el) {
  var target = parseInt(el.dataset.target) || 0;
  if (!target) return;
  var suffix = target >= 100 ? '+' : '';
  var current = 0, step = target / 55;
  var timer = setInterval(function() {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + suffix;
    if (current >= target) clearInterval(timer);
  }, 16);
}

(function () {
  var counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      runCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  counters.forEach(function(c) { observer.observe(c); });
  window.rerunCounters = function() {
    counters.forEach(function(el) { if (el.textContent === '0') runCounter(el); });
  };
})();

// ===== SCROLL REVEAL =====
(function () {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function() { entry.target.classList.add('visible'); }, i * 75);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  reveals.forEach(function(el) { observer.observe(el); });
})();

// ===== OSCILLOSCOPE CANVAS =====
(function () {
  var canvas = document.getElementById('oscilloscopeCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var freqLabel = document.getElementById('oscFreqLabel');
  var waveLabel = document.getElementById('oscWaveLabel');

  function sine(p)     { return Math.sin(p*Math.PI*2); }
  function square(p)   { return Math.sin(p*Math.PI*2)>=0?1:-1; }
  function triangle(p) { var x=p%1; return x<0.25?x*4:x<0.75?2-x*4:(x-1)*4; }
  function sawtooth(p) { var x=p%1; return x<0.5?x*2:(x-1)*2; }
  function amMod(p)    { return Math.sin(p*Math.PI*2*5)*(0.7+0.6*Math.sin(p*Math.PI*2*0.8)); }
  function pwm(p)      { var d=0.3+0.25*Math.sin(p*Math.PI*0.3); return (p%1)<d?1:-1; }

  var WAVEFORMS = {
    sine:     {fn:sine,     label:'SINE',     freqs:[1.0,2.0,1.5]},
    square:   {fn:square,   label:'SQUARE',   freqs:[0.8,1.6,1.2]},
    triangle: {fn:triangle, label:'TRIANGLE', freqs:[1.2,2.4,0.9]},
    sawtooth: {fn:sawtooth, label:'SAWTOOTH', freqs:[1.0,2.0,1.4]},
    am:       {fn:amMod,    label:'AM MOD',   freqs:[2.4,4.8,3.6]},
    pwm:      {fn:pwm,      label:'PWM',      freqs:[1.5,3.0,2.0]},
  };

  var activeWave='sine', t=0, freqIdx=0, freqTimer=0, prevWaveFn=null, blendT=0;
  var W=0, H=0, DPR=window.devicePixelRatio||1;

  function resize() {
    DPR=window.devicePixelRatio||1; W=canvas.offsetWidth; H=canvas.offsetHeight;
    canvas.width=W*DPR; canvas.height=H*DPR;
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(DPR,DPR);
  }
  window.addEventListener('resize', function() { setTimeout(resize, 100); });
  resize();

  function drawGrid() {
    ctx.save(); ctx.strokeStyle='rgba(77,240,255,0.04)'; ctx.lineWidth=0.5;
    for(var i=0;i<=12;i++){var x=(i/12)*W;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(var j=0;j<=4;j++){var y=(j/4)*H;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.strokeStyle='rgba(77,240,255,0.1)'; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke(); ctx.restore();
  }

  function buildPath(fn, speed) {
    ctx.beginPath();
    for(var px=0;px<=W;px++){
      var ph=px/W*3+t*speed, y=fn(ph), cy=H/2-y*(H*0.42);
      px===0?ctx.moveTo(px,cy):ctx.lineTo(px,cy);
    }
  }

  function drawWaveform(fn, alpha) {
    if (!fn||alpha<=0) return;
    var keys=Object.keys(WAVEFORMS), def=null;
    for(var k=0;k<keys.length;k++){if(WAVEFORMS[keys[k]].fn===fn){def=WAVEFORMS[keys[k]];break;}}
    if(!def) def=WAVEFORMS.sine;
    var speed=def.freqs[freqIdx%def.freqs.length];
    ctx.save(); ctx.globalAlpha=alpha; ctx.lineJoin='round'; ctx.lineCap='round';
    buildPath(fn,speed); ctx.strokeStyle='rgba(77,240,255,0.18)'; ctx.lineWidth=8; ctx.filter='blur(6px)'; ctx.stroke(); ctx.filter='none';
    buildPath(fn,speed); ctx.strokeStyle='rgba(77,240,255,0.45)'; ctx.lineWidth=2.5; ctx.stroke();
    buildPath(fn,speed); ctx.strokeStyle='rgba(77,240,255,0.92)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.restore();
  }

  function drawScan() {
    var scanX=((t*28)%(W+60))-30, g=ctx.createLinearGradient(scanX-40,0,scanX+16,0);
    g.addColorStop(0,'transparent'); g.addColorStop(1,'rgba(77,240,255,0.06)');
    ctx.fillStyle=g; ctx.fillRect(scanX-40,0,56,H);
  }

  function animateOsc() {
    ctx.clearRect(0,0,W,H); drawGrid(); drawScan();
    var def=WAVEFORMS[activeWave];
    if (prevWaveFn && blendT<1) {
      blendT=Math.min(blendT+0.05,1);
      drawWaveform(prevWaveFn,1-blendT); drawWaveform(def.fn,blendT);
      if (blendT>=1) prevWaveFn=null;
    } else { drawWaveform(def.fn,1); }
    t+=0.013; freqTimer++;
    if (freqTimer>200) {
      freqIdx=(freqIdx+1)%3;
      if (freqLabel) freqLabel.textContent='f='+def.freqs[freqIdx].toFixed(1)+' kHz';
      freqTimer=0;
    }
    requestAnimationFrame(animateOsc);
  }

  window.setOscWave = function(type) {
    if (type===activeWave) return;
    prevWaveFn=WAVEFORMS[activeWave].fn; blendT=0; activeWave=type; freqTimer=0; freqIdx=0;
    var def=WAVEFORMS[type];
    if (freqLabel) freqLabel.textContent='f='+def.freqs[0].toFixed(1)+' kHz';
    if (waveLabel) waveLabel.textContent=def.label;
    document.querySelectorAll('.osc-wave-btn').forEach(function(b){
      b.classList.toggle('active',b.dataset.wave===type);
    });
  };
  animateOsc();
})();

// ===== CUSTOM CURSOR (desktop only) =====
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.innerWidth < 768) return;

  function mk(styles) {
    var d=document.createElement('div');
    d.style.cssText=styles; document.body.appendChild(d); return d;
  }
  var base='position:fixed;top:0;left:0;z-index:99999;pointer-events:none;will-change:transform;';
  var el  = mk(base+'width:1px;height:16px;background:rgba(77,240,255,0.85);transform:translate(-50%,-50%)');
  var elH = mk(base+'width:16px;height:1px;background:rgba(77,240,255,0.85);transform:translate(-50%,-50%)');
  var dot = mk(base+'width:3px;height:3px;border-radius:50%;background:#4df0ff;transform:translate(-50%,-50%);transition:width .15s,height .15s,opacity .15s');

  document.addEventListener('mousemove', function(e) {
    var pos='translate('+e.clientX+'px,'+e.clientY+'px) translate(-50%,-50%)';
    el.style.transform=elH.style.transform=dot.style.transform=pos;
  }, {passive:true});

  document.addEventListener('mouseover', function(e) {
    var over=!!e.target.closest('a,button,[role="button"],input,select,textarea,.theme-pill');
    dot.style.width=over?'8px':'3px';
    dot.style.height=over?'8px':'3px';
    dot.style.opacity=over?'0.5':'1';
  });
})();
