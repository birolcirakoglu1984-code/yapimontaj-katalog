const CACHE='ym-v1';
const SKIP=['supabase.co','googletagmanager','google-analytics'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(['/']))
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  const url=e.request.url;
  if(SKIP.some(s=>url.includes(s)))return;
  if(e.request.method!=='GET')return;

  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(res=>{
        if(!res||res.status!==200||res.type==='opaque')return res;
        const clone=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
        return res;
      }).catch(()=>cached);
    })
  );
});
