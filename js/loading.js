/* js/loading.js
   Loading screen: fake progress + particle canvas.
   Calls window.onLoadingComplete() when done (defined in main.js). */
(function(){
  // safety net: kalau ada error JS apapun di halaman, tampilkan di layar
  // biar ketauan errornya (bukan cuma macet diem-diem)
  window.addEventListener('error', function(e){
    const label = document.getElementById('loading-label') ||
                  document.querySelector('.loading-label');
    if(label){
      label.textContent = 'Error: ' + e.message + ' (' + e.filename + ':' + e.lineno + ')';
      label.style.color = '#ff5c5c';
    }
  });

  // safety net kedua: apapun yang terjadi, paksa lanjut abis 6 detik
  // biar nggak nyangkut selamanya kalau ada bug lain
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
  }, 6000);

  const canvas = document.getElementById('loading-particles');
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const count = window.innerWidth < 600 ? 40 : 90;
  particles = Array.from({length: count}, () => ({
    x: Math.random()*w,
    y: Math.random()*h,
    r: Math.random()*1.6+0.4,
    vy: Math.random()*0.4+0.1,
    a: Math.random()*0.5+0.2
  }));

  function draw(){
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
        const screen = document.getElementById('loading-screen');
        screen.style.opacity = '0';
        setTimeout(()=>{
          screen.classList.add('hidden');
          if(typeof window.onLoadingComplete === 'function'){
            window.onLoadingComplete();
          }
        }, 600);
      }, 300);
    }
  }
  tick();
})();
