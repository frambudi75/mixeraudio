/**
 * StudioMaster Pro - Service Worker
 * Enables PWA installability and fast asset caching
 */

const CACHE_NAME = 'overmix-pro-v3.2.0';
const ASSETS_TO_CACHE = [
  './',
  'index.php',
  'manifest.json',
  'favicon.svg',
  'css/main.css',
  'css/mixer.css',
  'css/visualizers.css',
  'css/dsp-suite.css',
  'js/app.js',
  'js/audio-engine.js',
  'js/audio-visualizer.js',
  'js/audio-recorder.js',
  'js/audio-effects.js',
  'js/audio-routing.js',
  'js/dsp-suite.js',
  'js/auto-ducking.js',
  'js/vocal-fx.js',
  'js/sample-pads.js',
  'js/synth-demo.js',
  'js/midi-controller.js',
  'js/interactive-eq.js',
  'js/loudness-meter.js',
  'js/reference-track.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Some assets could not be cached immediately:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests, bypass API POST/PHP requests
  if (e.request.method !== 'GET' || e.request.url.includes('/api/')) {
    return;
  }

  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
