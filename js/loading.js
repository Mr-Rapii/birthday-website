/* js/loading.js
   Loading screen: particle canvas + progress bar + typing-effect status lines.
   Calls window.onLoadingComplete() when done (defined in main.js). */
(function(){
  // safety net: kalau ada error JS apapun di halaman, tampilkan di layar
  window.addEventListener('error', function(e){
    const label = document.getElementById('loading-label');
    if(label){
      label.textContent = 'Error: ' + e.message + ' (' + e.filename + ':' + e.lineno + ')';
      label.style.color = '#ff5c5c';
    }
  });

  // safety net kedua: paksa lanjut abis 8 detik apapun yang terjadi
  setTimeout(function(){
    const screen = document.getElementById('loading-screen');
    if(screen && !screen.classList.contains('hidden')){
      screen.style.opacity = '0';
      setTimeout(function(){
        screen.classList.add('hidden');
        if(typeof window.onLoadingComplete === 'function'){
          window.onLoadingComplete();
        }
      }, 600);
    }
  }, 8000);

  const canvas = document.getElementById('loading-particles');
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 40 : 90;
  particles = Array.from({length: count}, () => ({
    x: Math.random()*w,
    y: Math.random()*h,
    r: Math.random()*1.6+0.4,
    vy: Math.random()*0.4+0.1,
    a: Math.random()*0.5+0.2
  }));

  let particlesRunning = true;
  function draw(){
    if(!particlesRunning) return;
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.y -= p.vy;
      if(p.y < 0) p.y = h;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(34,229,255,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();

  // ---------- typing effect ----------
  const TYPE_LINES = [
    'Initializing...',
    'Loading memories...',
    'Connecting...',
    'Welcome, Rapi.'
  ];
  const typeEl = document.getElementById('loading-type');
  let typeLineIdx = 0;
  let typeCharIdx = 0;
  let typeTimer = null;

  function typeStep(){
    if(!typeEl) return;
    const currentLine = TYPE_LINES[typeLineIdx];
    if(typeCharIdx <= currentLine.length){
      typeEl.textContent = currentLine.slice(0, typeCharIdx);
      typeCharIdx++;
      typeTimer = setTimeout(typeStep, 45);
    } else {
      typeTimer = setTimeout(()=>{
        if(typeLineIdx < TYPE_LINES.length - 1){
          typeLineIdx++;
          typeCharIdx = 0;
          typeStep();
        }
      }, 500);
    }
  }
  typeStep();

  // ---------- progress bar ----------
  const fill = document.getElementById('loading-bar-fill');
  const percentLabel = document.getElementById('loading-percent');
  let progress = 0;

  function tick(){
    const inc = progress < 70 ? Math.random()*8 : Math.random()*2;
    progress = Math.min(100, progress + inc);
    fill.style.width = progress + '%';
    percentLabel.textContent = Math.floor(progress) + '%';

    if(progress < 100){
      setTimeout(tick, 120);
    } else {
      setTimeout(()=>{
        particlesRunning = false;
        if(typeTimer) clearTimeout(typeTimer);
        const screen = document.getElementById('loading-screen');
        screen.style.opacity = '0';
        setTimeout(()=>{
          screen.classList.add('hidden');
          if(typeof window.onLoadingComplete === 'function'){
            window.onLoadingComplete();
          }
        }, 600);
      }, 400);
    }
  }
  tick();
})();
