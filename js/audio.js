// audio.js - handle background music playback (must be triggered by user interaction)

(function(){
  const bgMusic = document.getElementById('bgMusic');
  let isPlaying = false;

  async function play(){
    if(!bgMusic) return;
    try{
      await bgMusic.play();
      isPlaying = true;
      document.getElementById('musicStatus')?.textContent = 'Playing';
    }catch(e){
      // autoplay blocked; will play after user interaction; swallow error
      console.warn('Autoplay blocked or audio error', e);
    }
  }

  function pause(){
    if(!bgMusic) return;
    bgMusic.pause();
    isPlaying = false;
    document.getElementById('musicStatus')?.textContent = 'Paused';
  }

  window.__UBV2_audio = { play, pause, get isPlaying(){return isPlaying} };
})();
