// video-intro.js - handles the skippable intro video

(function(){
  const introModal = document.getElementById('introModal');
  const introVideo = document.getElementById('introVideo');
  const skipBtn = document.getElementById('skipIntro');

  function show(){
    if(!introModal) return;
    introModal.classList.remove('hidden');
    try{ introVideo.currentTime = 0; introVideo.play(); }catch(e){/* autoplay may be blocked until user interaction */}
  }

  function hide(){
    if(!introModal) return;
    introModal.classList.add('hidden');
    try{ introVideo.pause(); }catch(e){}
  }

  skipBtn?.addEventListener('click', ()=>{
    hide();
    window.dispatchEvent(new CustomEvent('ubv2:intro:ended'));
  });

  introVideo?.addEventListener('ended', ()=>{
    hide();
    window.dispatchEvent(new CustomEvent('ubv2:intro:ended'));
  });

  window.__UBV2_intro = { show, hide };
})();
