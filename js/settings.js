/* js/settings.js
   Panel pengaturan: dark/light mode, mute musik, mode hemat baterai, bahasa ID/EN,
   plus tombol install PWA. Semua preferensi disimpan di localStorage biar nempel
   tiap buka lagi. */
(function(){
  const TRANSLATIONS = {
    id: {
      musicOn: '🔊 Musik', musicOff: '🔇 Musik',
      settingsTitle: 'Pengaturan',
      settingTheme: 'Tema', themeDark: 'Dark', themeLight: 'Light',
      settingMusic: 'Musik',
      settingLowPerf: 'Mode Hemat Baterai',
      settingLang: 'Bahasa',
      settingLangNote: 'Surat & narasi tetap Bahasa Indonesia.',
      heroEyebrow: '// selamat ulang tahun',
      heroSub: 'Satu tahun lagi udah dilewatin. Ini persembahan kecil buat diri sendiri.',
      countdownLabel: 'Menuju ulang tahun berikutnya',
      giftHint: 'tap kadonya ▲',
      scrollCue: 'scroll ke bawah ↓',
      galleryEyebrow: '// galeri', galleryTitle: 'Beberapa Momen',
      lightboxHint: 'geser atau pakai tombol ‹ › \u00A0•\u00A0 cubit buat zoom',
      letterEyebrow: '// surat', letterTitle: 'Untuk Diri Sendiri',
      cardEyebrow: '// kartu ucapan', cardTitle: 'Bikin Kartu Ucapanmu',
      cardSub: 'Pilih template, upload foto (opsional), download, share ke Status WhatsApp.',
      cardLabelTemplate: 'Template', cardLabelFormat: 'Format', cardLabelName: 'Nama', cardLabelPhoto: 'Foto (opsional)',
      cardFormatStory: 'Status WA (9:16)', cardFormatSquare: 'Post (1:1)',
      cardNamePlaceholder: 'Nama di kartu',
      cardChoosePhoto: '📷 Pilih Foto',
      cardDownload: '⬇ Download PNG', cardShare: '📤 Share ke WhatsApp',
      footerVersion: 'Birthday Website v3.0',
      skip: 'Lewati ▸'
    },
    en: {
      musicOn: '🔊 Music', musicOff: '🔇 Music',
      settingsTitle: 'Settings',
      settingTheme: 'Theme', themeDark: 'Dark', themeLight: 'Light',
      settingMusic: 'Music',
      settingLowPerf: 'Battery Saver Mode',
      settingLang: 'Language',
      settingLangNote: 'The letter & narration stay in Indonesian.',
      heroEyebrow: '// happy birthday',
      heroSub: 'Another year gone by. A little something for myself.',
      countdownLabel: 'Counting down to next birthday',
      giftHint: 'tap the gift ▲',
      scrollCue: 'scroll down ↓',
      galleryEyebrow: '// gallery', galleryTitle: 'A Few Moments',
      lightboxHint: 'swipe or use ‹ › \u00A0•\u00A0 pinch to zoom',
      letterEyebrow: '// letter', letterTitle: 'To Myself',
      cardEyebrow: '// greeting card', cardTitle: 'Make Your Own Card',
      cardSub: 'Pick a template, upload a photo (optional), download, share to WhatsApp Status.',
      cardLabelTemplate: 'Template', cardLabelFormat: 'Format', cardLabelName: 'Name', cardLabelPhoto: 'Photo (optional)',
      cardFormatStory: 'WA Status (9:16)', cardFormatSquare: 'Post (1:1)',
      cardNamePlaceholder: 'Name on the card',
      cardChoosePhoto: '📷 Choose Photo',
      cardDownload: '⬇ Download PNG', cardShare: '📤 Share to WhatsApp',
      footerVersion: 'Birthday Website v3.0',
      skip: 'Skip ▸'
    }
  };

  const gearBtn = document.getElementById('settings-toggle');
  const panel = document.getElementById('settings-panel');
  const closeBtn = document.getElementById('settings-close');
  const musicSwitch = document.getElementById('settings-music-toggle');
  const lowPerfSwitch = document.getElementById('settings-lowperf-toggle');
  const themeBtns = panel ? panel.querySelectorAll('[data-theme]') : [];
  const langBtns = panel ? panel.querySelectorAll('[data-lang]') : [];
  if(!gearBtn || !panel) return;

  // ---------- panel open/close ----------
  gearBtn.addEventListener('click', ()=> panel.classList.toggle('hidden'));
  closeBtn.addEventListener('click', ()=> panel.classList.add('hidden'));

  // ---------- theme (dark/light) ----------
  function applyTheme(theme){
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    themeBtns.forEach(b=> b.classList.toggle('toggle-pill-active', b.dataset.theme === theme));
  }
  themeBtns.forEach(b=>{
    b.addEventListener('click', ()=> applyTheme(b.dataset.theme));
  });
  applyTheme(localStorage.getItem('theme') || 'dark');

  // ---------- music switch (sinkron sama tombol musik utama) ----------
  function updateMusicSwitchUI(playing){
    if(!musicSwitch) return;
    musicSwitch.classList.toggle('switch-on', playing);
    musicSwitch.setAttribute('aria-pressed', String(playing));
  }
  if(musicSwitch){
    musicSwitch.addEventListener('click', ()=>{
      const nowPlaying = typeof window.isMusicPlaying === 'function' ? window.isMusicPlaying() : false;
      if(typeof window.setMusicPlaying === 'function'){
        window.setMusicPlaying(!nowPlaying);
      }
    });
    window.onMusicStateChanged = updateMusicSwitchUI;
    // sync awal (kalau musik udah autoplay duluan)
    setTimeout(()=>{
      if(typeof window.isMusicPlaying === 'function'){
        updateMusicSwitchUI(window.isMusicPlaying());
      }
    }, 1500);
  }

  // ---------- low performance mode ----------
  function applyLowPerf(enabled, { silent } = {}){
    localStorage.setItem('lowPerfMode', enabled ? '1' : '0');
    if(lowPerfSwitch){
      lowPerfSwitch.classList.toggle('switch-on', enabled);
      lowPerfSwitch.setAttribute('aria-pressed', String(enabled));
    }
    if(!silent){
      // three-scene.js baca localStorage cuma sekali pas load,
      // jadi perubahan run-time butuh reload biar beneran ke-apply
      const noteId = 'lowperf-reload-note';
      if(!document.getElementById(noteId)){
        const note = document.createElement('p');
        note.id = noteId;
        note.className = 'settings-note';
        note.textContent = document.documentElement.lang === 'en'
          ? 'Reload the page to apply this.'
          : 'Reload halaman biar berlaku.';
        panel.appendChild(note);
      }
    }
  }
  if(lowPerfSwitch){
    lowPerfSwitch.addEventListener('click', ()=>{
      const enabled = !lowPerfSwitch.classList.contains('switch-on');
      applyLowPerf(enabled);
    });
  }
  applyLowPerf(localStorage.getItem('lowPerfMode') === '1', { silent:true });

  // ---------- bahasa ----------
  function applyLanguage(lang){
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.id;
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
    langBtns.forEach(b=> b.classList.toggle('toggle-pill-active', b.dataset.lang === lang));

    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.dataset.i18n;
      if(dict[key] !== undefined) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const key = el.dataset.i18nPlaceholder;
      if(dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
    });

    // sinkron label tombol musik sesuai state saat ini
    const musicBtn = document.getElementById('music-toggle');
    if(musicBtn && typeof window.isMusicPlaying === 'function'){
      musicBtn.textContent = window.isMusicPlaying() ? dict.musicOn : dict.musicOff;
    }
  }
  langBtns.forEach(b=>{
    b.addEventListener('click', ()=> applyLanguage(b.dataset.lang));
  });
  applyLanguage(localStorage.getItem('lang') || 'id');

  // ---------- PWA install prompt ----------
  const installBtn = document.getElementById('install-btn');
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    if(installBtn) installBtn.classList.remove('hidden');
  });

  if(installBtn){
    installBtn.addEventListener('click', async ()=>{
      if(!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.classList.add('hidden');
    });
  }

  window.addEventListener('appinstalled', ()=>{
    if(installBtn) installBtn.classList.add('hidden');
  });
})();
