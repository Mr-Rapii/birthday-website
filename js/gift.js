/* js/gift.js
   Gift box interaktif v2: getar (haptic), glow charging saat ditekan,
   animasi buka + light beam, confetti 2 tahap (burst awal + firework susulan),
   efek suara saat dibuka. Edit teks reveal langsung di index.html (#gift-reveal-text). */
(function(){
  const box = document.getElementById('gift-box');
  const hint = document.getElementById('gift-hint');
  const reveal = document.getElementById('gift-reveal');
  const canvas = document.getElementById('confetti-canvas');
  const lightBeam = document.getElementById('gift-light-beam');
  const sfx = document.getElementById('gift-sfx');
  if(!box || !canvas) return;

  const ctx = canvas.getContext('2d');
  let opened = false;
  let particles = [];
  let raf = null;

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const colors = ['#22e5ff', '#f5c453', '#ffffff'];

  function spawnBurst(originX, originY, count, opts){
    opts = opts || {};
    const spreadV = opts.spreadV || 9;
    const spreadH = opts.spreadH || 8;
    for(let i=0;i<count;i++){
      particles.push({
        x: originX,
        y: originY,
        vx: (Math.random()-0.5)*spreadH,
        vy: Math.random()*-spreadV - 2,
        size: Math.random()*6+3,
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: Math.random()*360,
        vrot: (Math.random()-0.5)*10,
        life: 0,
        maxLife: 80 + Math.random()*50
      });
    }
    if(!raf) animateConfetti();
  }

  function animateConfetti(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.vy += 0.25; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.life++;
      const alpha = Math.max(0, 1 - p.life/p.maxLife);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    });
    particles = particles.filter(p => p.life < p.maxLife);
    if(particles.length > 0){
      raf = requestAnimationFrame(animateConfetti);
    } else {
      raf = null;
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  }

  // ---------- charging effect saat ditekan (sebelum kebuka) ----------
  let chargeTimer = null;
  function startCharging(){
    if(opened) return;
    box.classList.add('gift-box-charging');
    if(navigator.vibrate) navigator.vibrate(15);
  }
  function stopCharging(){
    box.classList.remove('gift-box-charging');
  }

  box.addEventListener('pointerdown', startCharging);
  box.addEventListener('pointerup', stopCharging);
  box.addEventListener('pointerleave', stopCharging);

  box.addEventListener('click', ()=>{
    if(opened) return;
    opened = true;
    box.classList.add('gift-box-open');
    box.classList.remove('gift-box-charging');
    hint.classList.add('hidden');

    // haptic feedback lebih kuat pas beneran kebuka
    if(navigator.vibrate) navigator.vibrate([20, 40, 20]);

    // sound effect (aman kalau file belum ada)
    if(sfx){
      sfx.currentTime = 0;
      sfx.play().catch(()=>{ /* file belum ada, gapapa */ });
    }

    // light beam nyala
    if(lightBeam) lightBeam.classList.add('gift-light-beam-active');

    const rect = box.getBoundingClientRect();
    const originX = rect.left + rect.width/2;
    const originY = rect.top + rect.height/2;

    // tahap 1: burst confetti dari kotak
    spawnBurst(originX, originY, window.innerWidth < 600 ? 50 : 90);

    // tahap 2: firework susulan dari beberapa titik di atas layar
    setTimeout(()=>{
      const fireworkCount = window.innerWidth < 600 ? 2 : 3;
      for(let i=0;i<fireworkCount;i++){
        setTimeout(()=>{
          const fx = window.innerWidth * (0.25 + Math.random()*0.5);
          const fy = window.innerHeight * (0.2 + Math.random()*0.25);
          spawnBurst(fx, fy, window.innerWidth < 600 ? 35 : 60, {spreadV:6, spreadH:11});
          if(navigator.vibrate) navigator.vibrate(10);
        }, i*350);
      }
    }, 400);

    setTimeout(()=>{
      reveal.classList.remove('hidden');
      requestAnimationFrame(()=> reveal.classList.add('gift-reveal-visible'));
    }, 500);
  });
})();
