const CACHE = 'lakshmi-dlr-v2';
const ASSETS = [
  './',
  './index.html',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.10.0/dist/tabler-icons.min.css'
];

// Install — cache core assets
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

// Fetch — serve from cache, fallback to network
self.addEventListener('fetch', e=>{
  // Skip non-GET and Firebase requests (always need network)
  if(e.request.method!=='GET') return;
  if(e.request.url.includes('firestore.googleapis.com')) return;
  if(e.request.url.includes('firebase')) return;

  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(resp=>{
        // Cache successful responses
        if(resp && resp.status===200 && resp.type==='basic'){
          const clone=resp.clone();
          caches.open(CACHE).then(c=>c.put(e.request, clone));
        }
        return resp;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
