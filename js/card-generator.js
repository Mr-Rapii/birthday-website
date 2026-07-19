/* js/card-generator.js
   Birthday Card Generator — 100% client-side (canvas), 5 template, upload foto,
   download PNG, share ke WhatsApp (Web Share API kalau didukung, fallback wa.me). */
(function(){
  const canvas = document.getElementById('card-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  const nameInput = document.getElementById('card-name-input');
  const photoInput = document.getElementById('card-photo-input');
  const templatePicker = document.getElementById('template-picker');
  const formatPicker = document.getElementById('format-picker');
  const downloadBtn = document.getElementById('card-download-btn');
  const shareBtn = document.getElementById('card-share-btn');
  const noteEl = document.getElementById('card-gen-note');

  let currentTemplate = 'minimalis';
  let currentFormat = 'story'; // 'story' = 1080x1920, 'square' = 1080x1080
  let uploadedImage = null;

  const SIZES = {
    story:  { w: 1080, h: 1920 },
    square: { w: 1080, h: 1080 }
  };

  // ---------- helpers ----------
  function roundedRectPath(c, x, y, w, h, r){
    c.beginPath();
    c.moveTo(x+r, y);
    c.arcTo(x+w, y, x+w, y+h, r);
    c.arcTo(x+w, y+h, x, y+h, r);
    c.arcTo(x, y+h, x, y, r);
    c.arcTo(x, y, x+w, y, r);
    c.closePath();
  }

  function drawStarsBg(c, w, h, count, color){
    for(let i=0;i<count;i++){
      const x = Math.random()*w;
      const y = Math.random()*h;
      const r = Math.random()*2 + 0.4;
      c.beginPath();
      c.arc(x,y,r,0,Math.PI*2);
      c.fillStyle = color;
      c.globalAlpha = Math.random()*0.6+0.3;
      c.fill();
    }
    c.globalAlpha = 1;
  }

  function drawPhotoOrPlaceholder(c, cx, cy, radius, name){
    c.save();
    c.beginPath();
    c.arc(cx, cy, radius, 0, Math.PI*2);
    c.closePath();
    c.clip();
    if(uploadedImage){
      // cover-fit crop ke lingkaran
      const imgRatio = uploadedImage.width / uploadedImage.height;
      let dw, dh;
      if(imgRatio > 1){ dh = radius*2; dw = dh*imgRatio; }
      else { dw = radius*2; dh = dw/imgRatio; }
      c.drawImage(uploadedImage, cx - dw/2, cy - dh/2, dw, dh);
    } else {
      // placeholder: inisial nama di atas gradient
      const grad = c.createLinearGradient(cx-radius, cy-radius, cx+radius, cy+radius);
      grad.addColorStop(0, '#134653');
      grad.addColorStop(1, '#0a2e38');
      c.fillStyle = grad;
      c.fillRect(cx-radius, cy-radius, radius*2, radius*2);
      const initial = (name || 'R').trim().charAt(0).toUpperCase();
      c.fillStyle = '#22e5ff';
      c.font = `700 ${radius}px 'Space Grotesk', sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(initial, cx, cy + radius*0.08);
    }
    c.restore();
  }

  // ---------- template renderers ----------
  // tiap fungsi menerima (ctx, w, h, name) dan menggambar kartu penuh
  const TEMPLATES = {
    minimalis(c, w, h, name){
      const grad = c.createLinearGradient(0,0,0,h);
      grad.addColorStop(0, '#050810');
      grad.addColorStop(1, '#0a1420');
      c.fillStyle = grad;
      c.fillRect(0,0,w,h);

      // frame tipis emas
      c.strokeStyle = 'rgba(245,196,83,0.6)';
      c.lineWidth = 3;
      roundedRectPath(c, 40, 40, w-80, h-80, 24);
      c.stroke();

      const photoR = w*0.22;
      drawPhotoOrPlaceholder(c, w/2, h*0.36, photoR, name);

      c.textAlign = 'center';
      c.fillStyle = '#8b93a7';
      c.font = `500 ${w*0.032}px 'JetBrains Mono', monospace`;
      c.fillText('SELAMAT ULANG TAHUN', w/2, h*0.58);

      c.fillStyle = '#e8ecf3';
      c.font = `700 ${w*0.09}px 'Space Grotesk', sans-serif`;
      c.fillText(name, w/2, h*0.66);

      c.fillStyle = '#f5c453';
      c.font = `500 ${w*0.026}px 'JetBrains Mono', monospace`;
      c.fillText('Rapi Dev', w/2, h*0.92);
    },

    neon(c, w, h, name){
      c.fillStyle = '#03030a';
      c.fillRect(0,0,w,h);

      // glow border cyan
      c.save();
      c.shadowColor = '#22e5ff';
      c.shadowBlur = 30;
      c.strokeStyle = '#22e5ff';
      c.lineWidth = 4;
      roundedRectPath(c, 34, 34, w-68, h-68, 30);
      c.stroke();
      c.restore();

      const photoR = w*0.22;
      c.save();
      c.shadowColor = '#22e5ff';
      c.shadowBlur = 40;
      drawPhotoOrPlaceholder(c, w/2, h*0.35, photoR, name);
      c.restore();

      c.textAlign = 'center';
      c.fillStyle = '#22e5ff';
      c.font = `600 ${w*0.03}px 'JetBrains Mono', monospace`;
      c.fillText('// HAPPY BIRTHDAY', w/2, h*0.58);

      c.save();
      c.shadowColor = '#22e5ff';
      c.shadowBlur = 25;
      c.fillStyle = '#ffffff';
      c.font = `700 ${w*0.095}px 'Space Grotesk', sans-serif`;
      c.fillText(name, w/2, h*0.67);
      c.restore();

      c.fillStyle = '#f5c453';
      c.font = `500 ${w*0.026}px 'JetBrains Mono', monospace`;
      c.fillText('Rapi Dev', w/2, h*0.92);
    },

    galaxy(c, w, h, name){
      const grad = c.createRadialGradient(w/2, h*0.3, 0, w/2, h*0.3, w*0.9);
      grad.addColorStop(0, '#0d1a2e');
      grad.addColorStop(1, '#03030a');
      c.fillStyle = grad;
      c.fillRect(0,0,w,h);
      drawStarsBg(c, w, h, 180, '#dff6ff');

      // spiral sederhana
      c.save();
      c.translate(w/2, h*0.3);
      for(let i=0;i<220;i++){
        const t = i/220;
        const angle = t * Math.PI * 6;
        const radius = t * w*0.42;
        const x = Math.cos(angle)*radius;
        const y = Math.sin(angle)*radius*0.5;
        c.beginPath();
        c.arc(x,y, 2.4, 0, Math.PI*2);
        c.fillStyle = t < 0.5 ? '#22e5ff' : '#f5c453';
        c.globalAlpha = 0.5;
        c.fill();
      }
      c.globalAlpha = 1;
      c.restore();

      const photoR = w*0.2;
      drawPhotoOrPlaceholder(c, w/2, h*0.34, photoR, name);
      c.strokeStyle = 'rgba(34,229,255,0.6)';
      c.lineWidth = 3;
      c.beginPath();
      c.arc(w/2, h*0.34, photoR+6, 0, Math.PI*2);
      c.stroke();

      c.textAlign = 'center';
      c.fillStyle = '#8b93a7';
      c.font = `500 ${w*0.03}px 'JetBrains Mono', monospace`;
      c.fillText('SELAMAT ULANG TAHUN', w/2, h*0.6);

      c.fillStyle = '#e8ecf3';
      c.font = `700 ${w*0.09}px 'Space Grotesk', sans-serif`;
      c.fillText(name, w/2, h*0.68);

      c.fillStyle = '#f5c453';
      c.font = `500 ${w*0.026}px 'JetBrains Mono', monospace`;
      c.fillText('Rapi Dev', w/2, h*0.92);
    },

    cyber(c, w, h, name){
      c.fillStyle = '#050810';
      c.fillRect(0,0,w,h);

      // grid overlay
      c.strokeStyle = 'rgba(34,229,255,0.12)';
      c.lineWidth = 1;
      const gridSize = w*0.045;
      for(let x=0; x<w; x+=gridSize){
        c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke();
      }
      for(let y=0; y<h; y+=gridSize){
        c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke();
      }

      // scanline glow di tengah
      const scan = c.createLinearGradient(0, h*0.2, 0, h*0.5);
      scan.addColorStop(0, 'rgba(34,229,255,0)');
      scan.addColorStop(0.5, 'rgba(34,229,255,0.08)');
      scan.addColorStop(1, 'rgba(34,229,255,0)');
      c.fillStyle = scan;
      c.fillRect(0, h*0.2, w, h*0.3);

      const photoR = w*0.2;
      drawPhotoOrPlaceholder(c, w/2, h*0.34, photoR, name);
      // sudut siku-siku ala HUD
      const cornerLen = 30;
      const bx = w/2 - photoR - 14, by = h*0.34 - photoR - 14;
      const ex = w/2 + photoR + 14, ey = h*0.34 + photoR + 14;
      c.strokeStyle = '#22e5ff';
      c.lineWidth = 3;
      [[bx,by,1,1],[ex,by,-1,1],[bx,ey,1,-1],[ex,ey,-1,-1]].forEach(([px,py,dx,dy])=>{
        c.beginPath();
        c.moveTo(px, py + cornerLen*dy);
        c.lineTo(px, py);
        c.lineTo(px + cornerLen*dx, py);
        c.stroke();
      });

      c.textAlign = 'center';
      c.fillStyle = '#22e5ff';
      c.font = `600 ${w*0.028}px 'JetBrains Mono', monospace`;
      c.fillText('[ SYSTEM: BIRTHDAY.EXE ]', w/2, h*0.58);

      c.fillStyle = '#e8ecf3';
      c.font = `700 ${w*0.088}px 'Space Grotesk', sans-serif`;
      c.fillText(name, w/2, h*0.66);

      c.fillStyle = '#f5c453';
      c.font = `500 ${w*0.026}px 'JetBrains Mono', monospace`;
      c.fillText('Rapi Dev', w/2, h*0.92);
    },

    gold(c, w, h, name){
      const grad = c.createLinearGradient(0,0,w,h);
      grad.addColorStop(0, '#0a0704');
      grad.addColorStop(1, '#100b06');
      c.fillStyle = grad;
      c.fillRect(0,0,w,h);

      // frame emas ganda + ornamen sudut
      c.strokeStyle = 'rgba(245,196,83,0.8)';
      c.lineWidth = 4;
      roundedRectPath(c, 36, 36, w-72, h-72, 20);
      c.stroke();
      c.strokeStyle = 'rgba(245,196,83,0.35)';
      c.lineWidth = 1.5;
      roundedRectPath(c, 50, 50, w-100, h-100, 14);
      c.stroke();

      const photoR = w*0.22;
      c.save();
      c.shadowColor = 'rgba(245,196,83,0.6)';
      c.shadowBlur = 30;
      drawPhotoOrPlaceholder(c, w/2, h*0.35, photoR, name);
      c.restore();
      c.strokeStyle = '#f5c453';
      c.lineWidth = 3;
      c.beginPath();
      c.arc(w/2, h*0.35, photoR+8, 0, Math.PI*2);
      c.stroke();

      c.textAlign = 'center';
      c.fillStyle = '#f5c453';
      c.font = `500 ${w*0.03}px 'JetBrains Mono', monospace`;
      c.fillText('✦ SELAMAT ULANG TAHUN ✦', w/2, h*0.59);

      c.fillStyle = '#fff6e0';
      c.font = `700 ${w*0.095}px 'Space Grotesk', sans-serif`;
      c.fillText(name, w/2, h*0.68);

      c.fillStyle = 'rgba(245,196,83,0.8)';
      c.font = `500 ${w*0.026}px 'JetBrains Mono', monospace`;
      c.fillText('Rapi Dev', w/2, h*0.92);
    }
  };

  // ---------- render ----------
  function render(){
    const size = SIZES[currentFormat];
    canvas.width = size.w;
    canvas.height = size.h;
    const name = (nameInput.value || 'Rapi').trim() || 'Rapi';
    const renderer = TEMPLATES[currentTemplate] || TEMPLATES.minimalis;
    renderer(ctx, size.w, size.h, name);
  }

  // ---------- events ----------
  templatePicker.addEventListener('click', (e)=>{
    const btn = e.target.closest('.template-swatch');
    if(!btn) return;
    templatePicker.querySelectorAll('.template-swatch').forEach(b=>b.classList.remove('template-swatch-active'));
    btn.classList.add('template-swatch-active');
    currentTemplate = btn.dataset.template;
    render();
  });

  formatPicker.addEventListener('click', (e)=>{
    const btn = e.target.closest('.format-btn');
    if(!btn) return;
    formatPicker.querySelectorAll('.format-btn').forEach(b=>b.classList.remove('format-btn-active'));
    btn.classList.add('format-btn-active');
    currentFormat = btn.dataset.format;
    render();
  });

  nameInput.addEventListener('input', render);

  photoInput.addEventListener('change', (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      const img = new Image();
      img.onload = ()=>{
        uploadedImage = img;
        render();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  function getCanvasBlob(){
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.95));
  }

  downloadBtn.addEventListener('click', async ()=>{
    const blob = await getCanvasBlob();
    if(!blob){ noteEl.textContent = 'Gagal generate gambar, coba lagi.'; return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kartu-ulang-tahun-${currentTemplate}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=> URL.revokeObjectURL(url), 2000);
    noteEl.textContent = 'Tersimpan! Cek folder Download kamu.';
  });

  shareBtn.addEventListener('click', async ()=>{
    const blob = await getCanvasBlob();
    if(!blob){ noteEl.textContent = 'Gagal generate gambar, coba lagi.'; return; }
    const file = new File([blob], 'kartu-ulang-tahun.png', { type:'image/png' });
    const shareText = 'Selamat ulang tahun! 🎉';

    if(navigator.canShare && navigator.canShare({ files:[file] })){
      try{
        await navigator.share({ files:[file], text: shareText });
        noteEl.textContent = 'Berhasil dibagikan!';
      } catch(err){
        // user cancel share sheet, gapapa
      }
    } else {
      // fallback: browser nggak support share file (misal desktop) —
      // download dulu gambarnya, lalu buka WhatsApp buat kirim manual
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kartu-ulang-tahun.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=> URL.revokeObjectURL(url), 2000);
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      noteEl.textContent = 'Gambar sudah didownload — lampirkan manual di chat WhatsApp yang kebuka.';
    }
  });

  // render pertama kali
  render();
})();
