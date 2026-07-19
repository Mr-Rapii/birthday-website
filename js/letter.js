/* js/letter.js
   Efek mengetik buat surat: karakter satu-satu, kata tertentu di-highlight (gold),
   cursor berkedip, auto-scroll di dalam kartu kalau kontennya kepanjangan.
   Edit SEGMENTS di bawah buat ganti isi suratnya — set h:true buat highlight kata itu. */
(function(){
  const typedEl = document.getElementById('letter-typed');
  const cursorEl = document.getElementById('letter-cursor');
  const cardEl = document.getElementById('letter-card');
  if(!typedEl || !cardEl) return;

  // Segmen surat. h:true = kata/frasa itu di-highlight warna gold.
  const SEGMENTS = [
    { t: 'Hei, ', h:false }, { t:'Rapi', h:true }, { t:'.\n\n', h:false },
    { t:'Kalau kamu baca ini, artinya kamu berhasil bikin website ulang tahun buat diri sendiri — khas banget, ya. Tapi lebih dari itu, ini pengingat kecil tentang ', h:false },
    { t:'satu tahun yang udah dilewatin', h:true },
    { t:': setiap baris kode yang error terus akhirnya jalan, setiap project yang deploy jam 2 pagi dari HP, dan setiap kali kamu mikir "ah nanggung, lanjut dulu deh."\n\n', h:false },
    { t:'Tahun ini boleh capek, boleh banyak yang belum kelar, tapi kamu tetap nyalain layar dan bikin sesuatu. Itu bukan hal kecil.\n\n', h:false },
    { t:'Semoga tahun depan lebih baik. Lebih banyak project yang kelar, lebih sehat, lebih banyak waktu buat orang-orang yang sayang sama kamu — termasuk ', h:false },
    { t:'Endah', h:true },
    { t:'.\n\n', h:false },
    { t:'Selamat ulang tahun. Terus jalan, terus belajar, terus rapi.', h:true },
    { t:'\n\n— kamu, hari ini.', h:false }
  ];

  // flatten jadi array {c, h} per karakter
  const chars = [];
  SEGMENTS.forEach(seg=>{
    for(const c of seg.t){
      chars.push({ c, h: seg.h });
    }
  });

  function escapeHtml(str){
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function buildHTML(count){
    let html = '';
    let i = 0;
    while(i < count){
      const curH = chars[i].h;
      let run = '';
      while(i < count && chars[i].h === curH){
        run += chars[i].c;
        i++;
      }
      const escaped = escapeHtml(run);
      html += curH ? `<span class="letter-highlight">${escaped}</span>` : escaped;
    }
    return html;
  }

  let started = false;
  let revealCount = 0;
  const CHARS_PER_TICK = 2;
  const TICK_MS = 22;

  function tick(){
    revealCount = Math.min(chars.length, revealCount + CHARS_PER_TICK);
    typedEl.innerHTML = buildHTML(revealCount);

    // auto-scroll: kalau kartu overflow, ikutin baris terakhir yang lagi diketik
    if(cardEl.scrollHeight > cardEl.clientHeight){
      cardEl.scrollTop = cardEl.scrollHeight;
    }

    if(revealCount < chars.length){
      setTimeout(tick, TICK_MS);
    } else if(cursorEl){
      // biarin cursor tetap berkedip santai di akhir surat
      cursorEl.classList.add('letter-cursor-idle');
    }
  }

  function startTyping(){
    if(started) return;
    started = true;
    tick();
  }

  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          startTyping();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(cardEl);
  } else {
    startTyping();
  }
})();
