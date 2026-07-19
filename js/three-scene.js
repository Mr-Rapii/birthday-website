/* js/three-scene.js
   Lightweight three.js background: starfield + slow-rotating planet.
   Requires three.js loaded via CDN in index.html (added if missing).
   Reduces star count on mobile for performance. */
(function(){
  if(typeof THREE === 'undefined'){
    console.warn('three.js belum ke-load — cek script tag CDN di index.html');
    return;
  }

  const canvas = document.getElementById('bg-canvas');
  const isMobile = window.innerWidth < 768;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // ---- starfield ----
  const starCount = isMobile ? 600 : 1800;
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){
    positions[i*3] = (Math.random()-0.5)*200;
    positions[i*3+1] = (Math.random()-0.5)*200;
    positions[i*3+2] = (Math.random()-0.5)*200;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const starMat = new THREE.PointsMaterial({
    color: 0x22e5ff, size: 0.35, transparent:true, opacity:0.7
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ---- planet ----
  const planetGeo = new THREE.SphereGeometry(6, isMobile ? 20 : 32, isMobile ? 20 : 32);
  const planetMat = new THREE.MeshStandardMaterial({
    color: 0x0d1420,
    emissive: 0xf5c453,
    emissiveIntensity: 0.06,
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

  const light = new THREE.PointLight(0xffffff, 1.2);
  light.position.set(-20, 10, 10);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x223344, 0.6));

  function onResize(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  let t = 0;
  function animate(){
    t += 0.0015;
    stars.rotation.y = t*0.15;
    planet.rotation.y = t*2;
    camera.position.x = Math.sin(t*0.3)*2;
    camera.lookAt(0,0,0);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
