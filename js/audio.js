/* js/audio.js
   Toggles background music. Browsers block autoplay with sound,
   so playback only starts after the user taps the button. */
(function(){
  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-toggle');
  let playing = false;

  btn.addEventListener('click', ()=>{
    if(playing){
      music.pause();
      btn.textContent = '🔇 Musik';
    } else {
      music.play().catch(()=>{
        btn.textContent = '⚠️ file musik belum ada';
      });
      btn.textContent = '🔊 Musik';
    }
    playing = !playing;
  });

  // expose so main.js can auto-start music right after intro if desired
  window.tryAutoplayMusic = function(){
    music.play().then(()=>{
      playing = true;
      btn.textContent = '🔊 Musik';
    }).catch(()=>{
      // autoplay blocked, user must tap button — this is expected/normal
    });
  };
})();
