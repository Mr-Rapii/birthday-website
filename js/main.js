/* js/main.js
   Orkestrator alur: loading screen -> video intro -> reveal app.
   loading.js memanggil window.onLoadingComplete()
   video-intro.js memanggil window.onAppRevealed() setelah app muncul */

window.onLoadingComplete = function(){
  window.startVideoIntro();
};

window.onAppRevealed = function(){
  // coba nyalain musik otomatis (biasanya diblokir browser sampai user interaksi)
  if(typeof window.tryAutoplayMusic === 'function'){
    window.tryAutoplayMusic();
  }
};

// register service worker buat PWA (opsional, aman kalau gagal)
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('service-worker.js').catch(()=>{
      // gagal register gapapa, bukan fitur kritis
    });
  });
}
