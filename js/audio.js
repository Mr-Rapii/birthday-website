/* js/audio.js
   Toggles background music. Browsers block autoplay with sound,
   so playback only starts after the user taps a button.
   Exposes window.setMusicPlaying(bool) dan window.isMusicPlaying()
   biar bisa disinkron sama toggle di settings panel. */
(function(){
  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-toggle');
  let playing = false;

  function updateBtnLabel(){
    btn.textContent = playing ? '🔊 Musik' : '🔇 Musik';
  }

  function setPlaying(next){
    if(next === playing) return;
    if(next){
      music.play().then(()=>{
        playing = true;
        updateBtnLabel();
      }).catch(()=>{
        playing = false;
        updateBtnLabel();
      });
    } else {
      music.pause();
      playing = false;
      updateBtnLabel();
    }
    if(typeof window.onMusicStateChanged === 'function'){
      window.onMusicStateChanged(playing);
    }
  }

  btn.addEventListener('click', ()=> setPlaying(!playing));

  window.setMusicPlaying = setPlaying;
  window.isMusicPlaying = ()=> playing;

  // dipanggil main.js setelah app reveal, browser mungkin tetap blokir ini
  window.tryAutoplayMusic = function(){
    music.play().then(()=>{
      playing = true;
      updateBtnLabel();
    }).catch(()=>{
      // autoplay blocked, user harus tap tombol — ini normal
    });
  };
})();
