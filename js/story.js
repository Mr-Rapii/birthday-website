/* js/story.js
   Menampilkan beberapa baris narasi satu-satu (fade in/out) sebelum masuk ke app.
   Edit array LINES di bawah buat ganti ceritanya.
   Exposes window.startStoryMode() dan window.revealApp() (dipakai bareng skip juga). */
(function(){
  const LINES = [
    'Halo…',
    'Hari ini bukan hari biasa.',
    'Karena kamu berhasil sampai di titik ini —',
    'satu tahun lagi, dengan segala proses di dalamnya.',
    'Ini persembahan kecil buat diri sendiri.'
  ];

  const storyEl = document.getElementById('story-mode');
  const lineEl = document.getElementById('story-line');
  const skipBtn = document.getElementById('skip-story');
  const app = document.getElementById('app');

  let idx = 0;
  let timer = null;

  window.revealApp = function(){
    if(timer) clearTimeout(timer);
    storyEl.classList.add('hidden');
    app.classList.remove('hidden');
    if(typeof window.onAppRevealed === 'function'){
      window.onAppRevealed();
    }
  };

  function showLine(){
    if(idx >= LINES.length){
      window.revealApp();
      return;
    }
    lineEl.textContent = LINES[idx];
    lineEl.classList.remove('story-line-visible');
    // force reflow biar animasi fade re-trigger tiap baris
    void lineEl.offsetWidth;
    lineEl.classList.add('story-line-visible');
    idx++;
    timer = setTimeout(showLine, 2200);
  }

  skipBtn.addEventListener('click', window.revealApp);

  window.startStoryMode = function(){
    storyEl.classList.remove('hidden');
    idx = 0;
    showLine();
  };
})();
