# Ultimate Birthday Website V2

This branch implements the initial scaffold and Milestone 1 features for the "Ultimate Birthday Website V2".

What I added:
- Loading screen with progress bar and particle canvas (js/loading.js, css/style.css)
- Skippable intro video (js/video-intro.js) — placeholder: /video/intro.mp4
- Age & countdown module (js/countdown.js) using the provided birthdate: 2010-08-14
- Three.js background scaffold with planet + stars + slow camera (js/three-scene.js)
- Audio helper to trigger background music after user interaction (js/audio.js)
- Main orchestrator (js/main.js) that runs the loading flow and boots the app
- Minimal PWA manifest and service worker (placeholders)

Notes & next steps:
- All heavy assets (models, video, music, frames, stickers) are placeholders; replace in the repository under /video, /music, /assets as needed.
- The Three.js scene is intentionally lightweight and optimized for mobile by reducing star count on mobile devices.
- The countdown uses UTC for deterministic behavior; adjust to a specific timezone if desired.

Run locally:
- Serve the repository with a local static server (live-server, http-server, or VSCode Live Server) to test service worker and video playback.

Branch: feature/ultimate-birthday-v2
Commit message: Scaffold Milestone 1 - loading, intro, countdown, threejs background (placeholders)
