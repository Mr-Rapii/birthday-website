# Ultimate Birthday Website V2

Website ulang tahun personal — loading screen, intro video skippable, background three.js (planet + bintang), countdown umur, galeri foto, musik, dan surat.

## Struktur

```
index.html
css/style.css
js/
  loading.js       -> loading screen + particle canvas
  video-intro.js   -> intro video skippable
  countdown.js     -> countdown & umur (UBAH BIRTHDATE di sini)
  three-scene.js   -> background 3D (butuh CDN three.js, sudah ditambahkan di index.html)
  audio.js         -> toggle musik
  gallery.js       -> render galeri foto (isi array PHOTOS)
  main.js          -> orkestrator alur
manifest.json
service-worker.js
```

## Yang perlu kamu isi sendiri

1. **Tanggal lahir** — edit `BIRTHDATE` di `js/countdown.js`
2. **Video intro** — taruh file di `assets/video/intro.mp4` (kalau nggak ada, otomatis di-skip ke app setelah beberapa detik)
3. **Musik** — taruh file di `assets/music/birthday.mp3`
4. **Foto galeri** — taruh di `assets/photos/1.jpg`, `2.jpg`, dst. Sesuaikan array `PHOTOS` di `js/gallery.js`
5. **Icon PWA** — taruh di `assets/icons/icon-192.png` dan `icon-512.png`
6. **Surat** — edit langsung teks di `#letter-body` pada `index.html`

## Jalanin lokal

```bash
npx http-server .
# atau
python3 -m http.server 8000
```

## Deploy ke Vercel

```bash
vercel --prod
```

Semua asset yang belum ada (video/musik/foto) sudah di-handle biar nggak error kalau belum kamu isi — tinggal upload pas siap.
