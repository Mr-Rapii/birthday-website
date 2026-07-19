/* js/gallery.js
   Tambah/hapus foto di array PHOTOS di bawah.
   Taruh file fotonya di /assets/photos/ */
(function(){
  const PHOTOS = [
    { src: 'assets/photos/1.jpg', caption: 'Momen 1' },
    { src: 'assets/photos/2.jpg', caption: 'Momen 2' },
    { src: 'assets/photos/3.jpg', caption: 'Momen 3' },
    { src: 'assets/photos/4.jpg', caption: 'Momen 4' },
  ];

  const grid = document.getElementById('gallery-grid');
  if(!grid) return;

  PHOTOS.forEach(photo=>{
    const fig = document.createElement('figure');
    fig.innerHTML = `
      <img src="${photo.src}" alt="${photo.caption}" loading="lazy"
           onerror="this.parentElement.style.display='none'">
      <figcaption>${photo.caption}</figcaption>
    `;
    grid.appendChild(fig);
  });
})();
