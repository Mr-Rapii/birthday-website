/* js/gallery.js
   Render galeri dari array PHOTOS, staggered entrance, + lightbox fullscreen
   dengan swipe (ganti foto) dan pinch-to-zoom.
   Tambah/hapus foto di array PHOTOS di bawah. Taruh file di /assets/photos/ */
(function(){
  const PHOTOS = [
    { src: 'assets/photos/1.jpg', caption: 'Momen 1' },
    { src: 'assets/photos/2.jpg', caption: 'Momen 2' },
    { src: 'assets/photos/3.jpg', caption: 'Momen 3' },
    { src: 'assets/photos/4.jpg', caption: 'Momen 4' },
  ];

  const grid = document.getElementById('gallery-grid');
  if(!grid) return;

  PHOTOS.forEach((photo, i)=>{
    const fig = document.createElement('figure');
    fig.style.transitionDelay = (i * 90) + 'ms';
    fig.dataset.index = i;
    fig.innerHTML = `
      <img src="${photo.src}" alt="${photo.caption}" loading="lazy"
           onerror="this.parentElement.style.display='none'">
      <figcaption>${photo.caption}</figcaption>
    `;
    grid.appendChild(fig);
  });

  // ---------- staggered entrance saat grid masuk viewport ----------
  const figures = Array.from(grid.querySelectorAll('figure'));
  figures.forEach(f => f.classList.add('gallery-item'));

  if('IntersectionObserver' in window){
    const gridObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          figures.forEach(f => f.classList.add('gallery-item-visible'));
          gridObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    gridObserver.observe(grid);
  } else {
    figures.forEach(f => f.classList.add('gallery-item-visible'));
  }

  // ---------- lightbox ----------
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  if(!lightbox) return;

  let currentIndex = 0;
  let zoomScale = 1;

  function openLightbox(index){
    currentIndex = index;
    updateLightboxImage();
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
    resetZoom();
  }

  function updateLightboxImage(){
    const photo = PHOTOS[currentIndex];
    if(!photo) return;
    resetZoom();
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.caption;
    lightboxCaption.textContent = photo.caption;
  }

  function showNext(){ currentIndex = (currentIndex + 1) % PHOTOS.length; updateLightboxImage(); }
  function showPrev(){ currentIndex = (currentIndex - 1 + PHOTOS.length) % PHOTOS.length; updateLightboxImage(); }

  function resetZoom(){
    zoomScale = 1;
    lightboxImg.style.transform = 'scale(1)';
  }

  grid.addEventListener('click', (e)=>{
    const fig = e.target.closest('figure');
    if(!fig) return;
    openLightbox(parseInt(fig.dataset.index, 10));
  });

  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', showNext);
  prevBtn.addEventListener('click', showPrev);
  lightbox.addEventListener('click', (e)=>{
    if(e.target === lightbox) closeLightbox();
  });

  // ---------- swipe (satu jari) buat ganti foto ----------
  let touchStartX = 0;
  let touchStartY = 0;
  let isPinching = false;

  lightbox.addEventListener('touchstart', (e)=>{
    if(e.touches.length === 2){
      isPinching = true;
      pinchStartDist = getDistance(e.touches[0], e.touches[1]);
      pinchStartScale = zoomScale;
    } else if(e.touches.length === 1 && zoomScale <= 1){
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive:true });

  lightbox.addEventListener('touchend', (e)=>{
    if(isPinching){
      isPinching = false;
      return;
    }
    if(zoomScale > 1) return; // lagi zoom, jangan swipe ganti foto
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0) showNext(); else showPrev();
    }
  });

  // ---------- pinch to zoom (dua jari) ----------
  let pinchStartDist = 0;
  let pinchStartScale = 1;

  function getDistance(t1, t2){
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }

  lightbox.addEventListener('touchmove', (e)=>{
    if(e.touches.length === 2){
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const rawScale = pinchStartScale * (dist / pinchStartDist);
      zoomScale = Math.min(4, Math.max(1, rawScale));
      lightboxImg.style.transform = `scale(${zoomScale})`;
    }
  }, { passive:false });

  // double-tap buat toggle zoom (fallback buat yang nggak pinch)
  let lastTap = 0;
  lightbox.addEventListener('touchend', ()=>{
    const now = Date.now();
    if(now - lastTap < 300){
      zoomScale = zoomScale > 1 ? 1 : 2.2;
      lightboxImg.style.transform = `scale(${zoomScale})`;
    }
    lastTap = now;
  });

  // keyboard (desktop testing)
  document.addEventListener('keydown', (e)=>{
    if(lightbox.classList.contains('hidden')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight') showNext();
    if(e.key === 'ArrowLeft') showPrev();
  });
})();
