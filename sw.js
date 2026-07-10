const CACHE = 'lakshmi-dlr-v11';

self.addEventListener('install', e=>{ self.skipWaiting(); });

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  if(e.request.url.includes('firestore.googleapis.com')) return;
  if(e.request.url.includes('firebase')) return;
  e.respondWith(
    fetch(e.request).then(resp=>{
      if(resp&&resp.status===200){
        const clone=resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
      }
      return resp;
    }).catch(()=>caches.match(e.request))
  );
});
