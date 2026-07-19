/* js/scroll.js
   Scroll experience: fade/slide-up reveal pakai IntersectionObserver,
   progress bar di atas, dan parallax ringan pada grid-overlay + hero-content. */
(function(){
  // ---------- reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && revealEls.length){
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    // fallback: kalau IntersectionObserver nggak ada, langsung tampilin semua
    revealEls.forEach(el => el.classList.add('reveal-visible'));
  }

  // ---------- scroll progress bar ----------
  const progressFill = document.getElementById('scroll-progress-fill');
  const gridOverlay = document.querySelector('.grid-overlay');
  const heroContent = document.querySelector('.hero-content');

  let ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(()=>{
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if(progressFill) progressFill.style.width = progress + '%';

      // parallax ringan: grid overlay & hero content geser lebih lambat dari scroll
      if(gridOverlay){
        gridOverlay.style.transform = `translateY(${scrollTop * 0.15}px)`;
      }
      if(heroContent && scrollTop < window.innerHeight){
        heroContent.style.transform = `translateY(${scrollTop * 0.08}px)`;
        heroContent.style.opacity = String(Math.max(0, 1 - scrollTop / (window.innerHeight*0.8)));
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
