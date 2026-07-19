/* js/gift.js
   Gift box interaktif di hero: klik -> animasi buka + confetti + reveal pesan.
   Edit teks reveal langsung di index.html (#gift-reveal-text). */
(function(){
  const box = document.getElementById('gift-box');
  const hint = document.getElementById('gift-hint');
  const reveal = document.getElementById('gift-reveal');
  const canvas = document.getElementById('confetti-canvas');
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

  function burstConfetti(originX, originY){
    const count = window.innerWidth < 600 ? 60 : 120;
    for(let i=0;i<count;i++){
      particles.push({
        x: originX,
        y: originY,
        vx: (Math.random()-0.5)*8,
        vy: Math.random()*-9 - 2,
        size: Math.random()*6+3,
        color: colors[Math.floor(Math.random()*colors.length)],
        rot: Math.random()*360,
        vrot: (Math.random()-0.5)*10,
        life: 0,
        maxLife: 90 + Math.random()*40
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

  box.addEventListener('click', ()=>{
    if(opened) return;
    opened = true;
    box.classList.add('gift-box-open');
    hint.classList.add('hidden');

    const rect = box.getBoundingClientRect();
    burstConfetti(rect.left + rect.width/2, rect.top + rect.height/2);

    setTimeout(()=>{
      reveal.classList.remove('hidden');
      requestAnimationFrame(()=> reveal.classList.add('gift-reveal-visible'));
    }, 350);
  });
})();
