/* js/video-intro.js
   Shows intro video after loading, skippable, then hands off to Story Mode.
   Exposes window.startVideoIntro() called from main.js */
(function(){
  const introEl = document.getElementById('video-intro');
  const video = document.getElementById('intro-video');
  const skipBtn = document.getElementById('skip-intro');

  function finishIntro(){
    introEl.classList.add('hidden');
    if(typeof window.startStoryMode === 'function'){
      window.startStoryMode();
    } else if(typeof window.revealApp === 'function'){
      window.revealApp();
    }
  }

  skipBtn.addEventListener('click', ()=>{
    video.pause();
    finishIntro();
  });

  video.addEventListener('ended', finishIntro);

  // if video file is missing/broken (placeholder), skip straight through
  video.addEventListener('error', finishIntro);

  window.startVideoIntro = function(){
    introEl.classList.remove('hidden');
    const playPromise = video.play();
    if(playPromise){
      playPromise.catch(()=>{
        // autoplay blocked — show skip button prominently, user must tap
        skipBtn.textContent = 'Mulai ▸';
      });
    }
    // fallback: if placeholder video has no real duration, auto-advance after 6s
    setTimeout(()=>{
      if(!introEl.classList.contains('hidden') && (video.error || video.duration === Infinity || isNaN(video.duration))){
        finishIntro();
      }
    }, 6000);
  };
})();
