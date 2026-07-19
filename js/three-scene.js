/* js/three-scene.js
   Background 3D lengkap: starfield, galaxy spiral, nebula, aurora, shooting star,
   planet + ring, cinematic camera intro, dan (khusus desktop) bloom + lens flare.
   Mobile dioptimasi: partikel dikurangi drastis, bloom & lens flare dimatikan
   karena post-processing terlalu berat buat GPU Android low-end.
   Requires: three.min.js r128 + (desktop only) EffectComposer/RenderPass/ShaderPass/
   UnrealBloomPass/Lensflare dari CDN yang sudah ditambahkan di index.html. */
(function(){
  if(typeof THREE === 'undefined'){
    console.warn('three.js belum ke-load — cek script tag CDN di index.html');
    return;
  }

  const canvas = document.getElementById('bg-canvas');
  const isMobile = window.innerWidth < 768;
  // deteksi kasar device rendah: mobile + hardwareConcurrency kecil,
  // atau user ngaktifin "Mode Hemat Baterai" manual di settings
  const lowPerfSetting = localStorage.getItem('lowPerfMode') === '1';
  const isLowEnd = lowPerfSetting || (isMobile && (navigator.hardwareConcurrency || 4) <= 4);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 2000);

  const renderer = new THREE.WebGLRenderer({canvas, antialias: !isMobile, alpha:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowEnd ? 1 : (isMobile ? 1.5 : 2)));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // ==================================================
  // STARFIELD (bintang jauh, statis-ish, banyak)
  // ==================================================
  const starCount = isLowEnd ? 500 : (isMobile ? 1200 : 6000);
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){
    starPositions[i*3]   = (Math.random()-0.5)*400;
    starPositions[i*3+1] = (Math.random()-0.5)*400;
    starPositions[i*3+2] = (Math.random()-0.5)*400;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions,3));
  const starMat = new THREE.PointsMaterial({
    color: 0xdff6ff, size: 0.5, transparent:true, opacity:0.75, sizeAttenuation:true
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ==================================================
  // GALAXY SPIRAL (lengan spiral warna cyan -> gold)
  // ==================================================
  const galaxyCount = isLowEnd ? 800 : (isMobile ? 1800 : 5000);
  const galaxyGeo = new THREE.BufferGeometry();
  const galaxyPositions = new Float32Array(galaxyCount*3);
  const galaxyColors = new Float32Array(galaxyCount*3);
  const colorCyan = new THREE.Color(0x22e5ff);
  const colorGold = new THREE.Color(0xf5c453);
  const armCount = 3;
  const galaxyRadius = 70;

  for(let i=0;i<galaxyCount;i++){
    const armIndex = i % armCount;
    const t = Math.random();
    const radius = t * galaxyRadius;
    const armAngleOffset = (armIndex / armCount) * Math.PI * 2;
    const spinAngle = radius * 0.12;
    const randomAngleJitter = (Math.random()-0.5) * 0.4;
    const angle = armAngleOffset + spinAngle + randomAngleJitter;

    const spread = (1 - t) * 6 + 1;
    const x = Math.cos(angle) * radius + (Math.random()-0.5) * spread;
    const y = (Math.random()-0.5) * (2 + (1-t)*3);
    const z = Math.sin(angle) * radius + (Math.random()-0.5) * spread;

    galaxyPositions[i*3] = x;
    galaxyPositions[i*3+1] = y - 40; // taruh agak di bawah/belakang scene
    galaxyPositions[i*3+2] = z - 90;

    const mixed = colorCyan.clone().lerp(colorGold, t);
    galaxyColors[i*3] = mixed.r;
    galaxyColors[i*3+1] = mixed.g;
    galaxyColors[i*3+2] = mixed.b;
  }
  galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPositions,3));
  galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyColors,3));
  const galaxyMat = new THREE.PointsMaterial({
    size: 0.6, vertexColors:true, transparent:true, opacity:0.85,
    blending: THREE.AdditiveBlending, depthWrite:false
  });
  const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
  scene.add(galaxy);

  // ==================================================
  // NEBULA (awan sprite translucent, drift pelan)
  // ==================================================
  function makeNebulaTexture(hex){
    const size = 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const cctx = c.getContext('2d');
    const grad = cctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
    grad.addColorStop(0, hex + 'aa');
    grad.addColorStop(0.4, hex + '44');
    grad.addColorStop(1, hex + '00');
    cctx.fillStyle = grad;
    cctx.fillRect(0,0,size,size);
    return new THREE.CanvasTexture(c);
  }

  const nebulaTexCyan = makeNebulaTexture('#22e5ff');
  const nebulaTexGold = makeNebulaTexture('#f5c453');
  const nebulaSprites = [];
  const nebulaCount = isMobile ? 3 : 7;

  for(let i=0;i<nebulaCount;i++){
    const tex = i % 2 === 0 ? nebulaTexCyan : nebulaTexGold;
    const mat = new THREE.SpriteMaterial({
      map: tex, transparent:true, opacity: 0.12 + Math.random()*0.08,
      blending: THREE.AdditiveBlending, depthWrite:false
    });
    const sprite = new THREE.Sprite(mat);
    const scale = 60 + Math.random()*80;
    sprite.scale.set(scale, scale, 1);
    sprite.position.set(
      (Math.random()-0.5)*160,
      (Math.random()-0.5)*60 - 10,
      -60 - Math.random()*120
    );
    sprite.userData.driftSpeed = 0.02 + Math.random()*0.03;
    sprite.userData.driftOffset = Math.random()*Math.PI*2;
    scene.add(sprite);
    nebulaSprites.push(sprite);
  }

  // ==================================================
  // AURORA (pita cahaya bergelombang di bagian atas)
  // ==================================================
  const auroraGroup = new THREE.Group();
  const auroraBandCount = isMobile ? 2 : 4;
  const auroraMeshes = [];

  for(let b=0; b<auroraBandCount; b++){
    const segments = isMobile ? 24 : 48;
    const width = 140;
    const auroraGeo = new THREE.PlaneGeometry(width, 18, segments, 1);
    const isGoldBand = b % 2 === 1;
    const auroraMat = new THREE.MeshBasicMaterial({
      color: isGoldBand ? 0xf5c453 : 0x22e5ff,
      transparent:true, opacity: 0.10,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite:false
    });
    const mesh = new THREE.Mesh(auroraGeo, auroraMat);
    mesh.position.set(0, 30 + b*4, -70 - b*10);
    mesh.rotation.x = -0.3;
    auroraGroup.add(mesh);
    auroraMeshes.push({mesh, baseY: mesh.position.y, phase: b*1.3});
  }
  scene.add(auroraGroup);

  // ==================================================
  // PLANET + RING
  // ==================================================
  const planetGeo = new THREE.SphereGeometry(6, isLowEnd ? 16 : (isMobile ? 20 : 32), isLowEnd ? 16 : (isMobile ? 20 : 32));
  const planetMat = new THREE.MeshStandardMaterial({
    color: 0x0d1420,
    emissive: 0xf5c453,
    emissiveIntensity: 0.08,
    roughness: 0.85,
    metalness: 0.2
  });
  const planet = new THREE.Mesh(planetGeo, planetMat);
  planet.position.set(14, -6, -20);
  scene.add(planet);

  const ringGeo = new THREE.TorusGeometry(9, 0.08, 8, 64);
  const ringMat = new THREE.MeshBasicMaterial({color:0x22e5ff, transparent:true, opacity:0.35});
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI/2.3;
  planet.add(ring);

  // ==================================================
  // SMALL DECORATIVE PLANETS (ngisi ruang kosong pas scroll)
  // ==================================================
  const smallPlanets = [];
  const smallPlanetConfigs = [
    { size: 1.4, color: 0x22e5ff, x: -30, y: -20, z: -50, driftSpeed: 0.15 },
    { size: 2.2, color: 0xf5c453, x: 34, y: 40, z: -110, driftSpeed: 0.1 },
    { size: 0.9, color: 0xffffff, x: -50, y: 55, z: -140, driftSpeed: 0.2 }
  ];
  smallPlanetConfigs.forEach(cfg=>{
    const geo = new THREE.SphereGeometry(cfg.size, isMobile ? 10 : 16, isMobile ? 10 : 16);
    const mat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent:true, opacity:0.55 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.userData = { baseY: cfg.y, driftSpeed: cfg.driftSpeed, phase: Math.random()*Math.PI*2 };
    scene.add(mesh);
    smallPlanets.push(mesh);
  });

  // ==================================================
  // SATELIT KECIL (melintas orbit pelan)
  // ==================================================
  const satelliteGroup = new THREE.Group();
  const satBodyGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  const satBodyMat = new THREE.MeshBasicMaterial({ color: 0xcfd6e3 });
  const satBody = new THREE.Mesh(satBodyGeo, satBodyMat);
  satelliteGroup.add(satBody);
  const panelGeo = new THREE.BoxGeometry(1.6, 0.05, 0.5);
  const panelMat = new THREE.MeshBasicMaterial({ color: 0x22e5ff, transparent:true, opacity:0.8 });
  const panelL = new THREE.Mesh(panelGeo, panelMat);
  panelL.position.x = -1.3;
  const panelR = new THREE.Mesh(panelGeo, panelMat);
  panelR.position.x = 1.3;
  satelliteGroup.add(panelL, panelR);
  satelliteGroup.userData = { orbitRadius: 55, orbitSpeed: 0.06, orbitY: 10, phase: 0 };
  scene.add(satelliteGroup);

  // ==================================================
  // LIGHTS + LENS FLARE (desktop only)
  // ==================================================
  const light = new THREE.PointLight(0xffffff, 1.2);
  light.position.set(-40, 25, -40);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x223344, 0.6));

  if(!isMobile && !isLowEnd && typeof THREE.Lensflare !== 'undefined'){
    const flareTex = (function(){
      const size = 256;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const cctx = c.getContext('2d');
      const grad = cctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, '#bff3ff');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      cctx.fillStyle = grad;
      cctx.fillRect(0,0,size,size);
      return new THREE.CanvasTexture(c);
    })();
    const lensflare = new THREE.Lensflare();
    lensflare.addElement(new THREE.LensflareElement(flareTex, 350, 0, light.color));
    lensflare.addElement(new THREE.LensflareElement(flareTex, 70, 0.6));
    lensflare.addElement(new THREE.LensflareElement(flareTex, 90, 0.9));
    light.add(lensflare);
  }

  // ==================================================
  // SHOOTING STAR (muncul periodik, garis memudar)
  // ==================================================
  const shootingStars = [];
  function spawnShootingStar(){
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(6); // 2 titik (garis)
    geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    const mat = new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:1});
    const line = new THREE.Line(geo, mat);

    const startX = (Math.random()-0.5)*150 + 40;
    const startY = 40 + Math.random()*20;
    const startZ = -60 - Math.random()*60;
    const dir = new THREE.Vector3(-1.4, -0.7, 0).normalize();

    line.userData = {
      pos: new THREE.Vector3(startX, startY, startZ),
      dir,
      life: 0,
      maxLife: 40 + Math.random()*20,
      trailLength: 6
    };
    scene.add(line);
    shootingStars.push(line);
  }

  function updateShootingStars(){
    for(let i = shootingStars.length-1; i>=0; i--){
      const s = shootingStars[i];
      const d = s.userData;
      d.pos.addScaledVector(d.dir, 2.2);
      d.life++;

      const tail = d.pos.clone().addScaledVector(d.dir, -d.trailLength);
      const posAttr = s.geometry.attributes.position;
      posAttr.setXYZ(0, d.pos.x, d.pos.y, d.pos.z);
      posAttr.setXYZ(1, tail.x, tail.y, tail.z);
      posAttr.needsUpdate = true;

      s.material.opacity = Math.max(0, 1 - d.life/d.maxLife);

      if(d.life >= d.maxLife){
        scene.remove(s);
        s.geometry.dispose();
        s.material.dispose();
        shootingStars.splice(i,1);
      }
    }
  }

  const shootingInterval = isMobile ? 4500 : 3000;
  setInterval(()=>{
    if(document.hidden) return;
    spawnShootingStar();
  }, shootingInterval);

  // ==================================================
  // BLOOM POST-PROCESSING (desktop only — berat buat mobile)
  // ==================================================
  let composer = null;
  const bloomEnabled = !isMobile && !isLowEnd &&
    typeof THREE.EffectComposer !== 'undefined' &&
    typeof THREE.UnrealBloomPass !== 'undefined';

  if(bloomEnabled){
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.55,  // strength — halus, jangan overexpose
      0.4,   // radius
      0.82   // threshold — cuma bagian terang yang glow
    );
    composer.addPass(bloomPass);
  }

  // ==================================================
  // CINEMATIC CAMERA INTRO
  // ==================================================
  const cameraRestPosition = new THREE.Vector3(0, 0, 30);
  const cameraStartPosition = new THREE.Vector3(0, 8, 130);
  camera.position.copy(cameraStartPosition);
  camera.lookAt(0,0,0);

  let cinematicActive = true;
  let cinematicStart = null;
  const cinematicDuration = 2600; // ms

  function easeOutCubic(t){ return 1 - Math.pow(1-t, 3); }

  window.playCinematicCameraIntro = function(){
    cinematicActive = true;
    cinematicStart = performance.now();
  };
  // langsung mulai begitu scene ke-load, biar berjalan bebarengan dgn reveal app
  window.playCinematicCameraIntro();

  function updateCinematicCamera(now){
    if(!cinematicActive) return;
    const elapsed = now - cinematicStart;
    const t = Math.min(1, elapsed / cinematicDuration);
    const eased = easeOutCubic(t);
    camera.position.lerpVectors(cameraStartPosition, cameraRestPosition, eased);
    camera.lookAt(0,0,0);
    if(t >= 1) cinematicActive = false;
  }

  // ==================================================
  // RESIZE
  // ==================================================
  function onResize(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if(composer) composer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // ==================================================
  // ANIMATE LOOP
  // ==================================================
  let t = 0;
  function animate(now){
    requestAnimationFrame(animate);
    t += 0.0015;

    stars.rotation.y = t*0.1;
    galaxy.rotation.y = t*0.05;
    planet.rotation.y = t*2;

    nebulaSprites.forEach(sprite=>{
      sprite.position.x += Math.sin(t*sprite.userData.driftSpeed + sprite.userData.driftOffset) * 0.02;
      sprite.position.y += Math.cos(t*sprite.userData.driftSpeed + sprite.userData.driftOffset) * 0.01;
    });

    auroraMeshes.forEach(({mesh, baseY, phase})=>{
      mesh.position.y = baseY + Math.sin(t*1.5 + phase) * 1.2;
      mesh.material.opacity = 0.08 + Math.sin(t*2 + phase) * 0.03;
    });

    smallPlanets.forEach(mesh=>{
      const d = mesh.userData;
      mesh.position.y = d.baseY + Math.sin(t*d.driftSpeed + d.phase) * 3;
      mesh.rotation.y = t * (0.5 + d.driftSpeed);
    });

    const satD = satelliteGroup.userData;
    satD.phase += 0.0016;
    satelliteGroup.position.set(
      Math.cos(satD.phase) * satD.orbitRadius,
      satD.orbitY + Math.sin(satD.phase*1.7) * 6,
      Math.sin(satD.phase) * satD.orbitRadius - 60
    );
    satelliteGroup.rotation.y = satD.phase;

    updateShootingStars();

    if(cinematicActive) updateCinematicCamera(now);
    else if(!cinematicActive){
      // idle slow drift setelah intro selesai
      camera.position.x = Math.sin(t*0.3)*2;
      camera.lookAt(0,0,0);
    }

    if(composer) composer.render();
    else renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
})();
