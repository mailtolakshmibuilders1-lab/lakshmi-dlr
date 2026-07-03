const CACHE = 'lakshmi-dlr-v3';

// Install — skip waiting immediately
self.addEventListener('install', e=>{
  self.skipWaiting();
});

// Activate — delete ALL old caches
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

// Fetch — ALWAYS go to network first, cache as fallback only
self.addEventListener('fetch', e=>{
  if(e.request.method !== 'GET') return;
  
  e.respondWith(
    fetch(e.request)
      .then(resp=>{
        // Cache the fresh response
        if(resp && resp.status===200){
          const clone = resp.clone();
          caches.open(CACHE).then(c=>c.put(e.request, clone));
        }
        return resp;
      })
      .catch(()=>{
        // Only use cache if network fails (offline)
        return caches.match(e.request);
      })
  );
});
