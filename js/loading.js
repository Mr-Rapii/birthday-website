// loading.js - handles loading screen progress and particle canvas used during preload
// This module simulates loading and preloads critical modules (three-scene) before revealing intro.

(function(){
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingCanvas = document.getElementById('loadingParticles');

  // Simple particle background for the loading screen using Canvas 2D
  function startParticles(){
    if(!loadingCanvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = loadingCanvas.width = loadingCanvas.clientWidth * dpr;
    const h = loadingCanvas.height = loadingCanvas.clientHeight * dpr;
    const ctx = loadingCanvas.getContext('2d');
    ctx.scale(dpr,dpr);

    const particles = [];
    for(let i=0;i<60;i++){
      particles.push({x:Math.random()*loadingCanvas.clientWidth,y:Math.random()*loadingCanvas.clientHeight, r:Math.random()*2+0.5, vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4, alpha:Math.random()*0.9+0.1});
    }

    let raf;
    function draw(){
      ctx.clearRect(0,0,loadingCanvas.clientWidth,loadingCanvas.clientHeight);
      particles.forEach(p=>{
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0) p.x = loadingCanvas.clientWidth;
        if(p.x > loadingCanvas.clientWidth) p.x = 0;
        if(p.y < 0) p.y = loadingCanvas.clientHeight;
        if(p.y > loadingCanvas.clientHeight) p.y = 0;
        ctx.beginPath();
        ctx.fillStyle = `rgba(122,252,255,${p.alpha})`;
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return ()=>cancelAnimationFrame(raf);
  }

  // Simulated asset loading progress with promises for important modules
  function simulateLoading(){
    return new Promise(async (resolve)=>{
      // start particle animation
      const stopParticles = startParticles();

      // define steps to simulate; in real app we would load models, images, audio
      const steps = [200, 400, 300, 200, 400];
      let total = steps.reduce((a,b)=>a+b,0);
      let loaded = 0;

      for(let i=0;i<steps.length;i++){
        await new Promise(r => setTimeout(r, steps[i]));
        loaded += steps[i];
        const percent = Math.round((loaded/total)*100);
        progressFill.style.width = percent + '%';
        progressPercent.textContent = percent + '%';
      }

      // small delay to feel complete
      setTimeout(()=>{
        stopParticles();
        resolve();
      }, 350);
    });
  }

  // expose start function
  window.__UBV2_loading = {
    start: simulateLoading,
    hideImmediately(){ if(loadingScreen) loadingScreen.classList.add('hidden'); }
  };
})();
