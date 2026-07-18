// main.js - orchestrates loading -> intro -> three.js init -> show app

(function(){
  const enterBtn = document.getElementById('enterBtn');
  const app = document.getElementById('app');
  const loadingScreen = document.getElementById('loadingScreen');
  const introModal = document.getElementById('introModal');

  // Start sequence: loading -> intro -> boot
  async function start(){
    // 1) show loading (already visible by default)
    // 2) run loading simulation
    if(window.__UBV2_loading){
      await window.__UBV2_loading.start();
    }

    // hide loading
    loadingScreen.classList.add('hidden');

    // show intro video
    if(window.__UBV2_intro){
      window.__UBV2_intro.show();
    }

    // wait for intro end event
    window.addEventListener('ubv2:intro:ended', ()=>{
      bootApp();
    }, { once:true });
  }

  function bootApp(){
    // reveal app
    app.classList.remove('hidden');

    // init three.js background
    try{ window.__UBV2_three.init(); }catch(e){ console.warn('three init failed', e); }

    // start countdown updater already running by module
  }

  // user entry button - used for audio autoplay policy
  enterBtn?.addEventListener('click', async (e)=>{
    // play audio on first interaction
    if(window.__UBV2_audio){
      await window.__UBV2_audio.play();
    }
    // hide intro if still present and boot
    if(!introModal.classList.contains('hidden')){
      // skip intro and boot
      window.__UBV2_intro.hide();
      bootApp();
    }
  });

  // Start automatic loading once script runs
  // Note: keep loading visible until assets simulated loaded
  start();

  // register service worker for PWA (best-effort)
  if('serviceWorker' in navigator){
    navigator.serviceWorker?.register('/service-worker.js').catch(()=>{});
  }
})();
