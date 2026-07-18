// three-scene.js - lightweight Three.js background with planet, stars, and slow camera movement

(function(){
  const canvas = document.getElementById('threeCanvas');
  if(!canvas) return;

  let renderer, scene, camera, planet, stars, clock, resizeObserver;

  function init(){
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, width/height, 0.1, 2000);
    camera.position.set(0,0,60);

    // subtle ambient lights
    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(10,10,10);
    scene.add(dir);

    // Planet - simple sphere with gradient shader-ish material
    const geo = new THREE.SphereGeometry(12, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      color:0x3366ff,
      metalness:0.2,
      roughness:0.6,
      emissive: 0x001122,
      emissiveIntensity:0.3
    });
    planet = new THREE.Mesh(geo, mat);
    planet.position.set(-18, -6, -20);
    scene.add(planet);

    // Stars - Points
    const starGeo = new THREE.BufferGeometry();
    const starCount = (isMobileDevice() ? 300 : 1200);
    const positions = new Float32Array(starCount * 3);
    for(let i=0;i<starCount;i++){
      positions[i*3] = (Math.random()-0.5) * 200;
      positions[i*3+1] = (Math.random()-0.5) * 120;
      positions[i*3+2] = (Math.random()-0.5) * 400;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    const starMat = new THREE.PointsMaterial({color:0xffffff, size: (isMobileDevice()?0.6:1.2), transparent:true, opacity:0.9});
    stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // small aurora / fog via big translucent plane
    const fogGeo = new THREE.PlaneGeometry(180, 80);
    const fogMat = new THREE.MeshBasicMaterial({color:0x1a3a4f, transparent:true, opacity:0.06});
    const fog = new THREE.Mesh(fogGeo, fogMat);
    fog.position.set(30, -20, -50);
    fog.rotation.set(0.3, -0.6, 0);
    scene.add(fog);

    clock = new THREE.Clock();

    window.addEventListener('resize', onResize);
    // reduce work on background tabs
    document.addEventListener('visibilitychange', onVisibility);

    animate();
  }

  function isMobileDevice(){
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function onResize(){
    const w = window.innerWidth; const h = window.innerHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  }

  let animId;
  function animate(){
    animId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // planet rotates
    planet.rotation.y += 0.0025;
    planet.rotation.x = Math.sin(t*0.07) * 0.05;

    // stars drift
    stars.rotation.y += 0.0006;

    // slow camera orbit
    camera.position.x = Math.sin(t*0.03) * 30;
    camera.position.y = Math.sin(t*0.01) * 6;
    camera.lookAt(0,0,0);

    renderer.render(scene, camera);
  }

  function onVisibility(){
    if(document.hidden){
      cancelAnimationFrame(animId);
    }else{
      clock = new THREE.Clock();
      animate();
    }
  }

  // public init safe call
  window.__UBV2_three = { init };
})();
