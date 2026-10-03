/* 그림AI 내비 서비스 워커 — 정보를 고친 뒤에는 VERSION 숫자를 하나 올려 주세요. */
const VERSION = "v1";
const CACHE = "gai-navi-" + VERSION;
const PRECACHE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "img/chatgpt_illust.webp",
  "img/chatgpt_portrait.webp",
  "img/chatgpt_poster.webp",
  "img/dreamina_illust.webp",
  "img/dreamina_portrait.webp",
  "img/dreamina_poster.webp",
  "img/flux_illust.webp",
  "img/flux_portrait.webp",
  "img/flux_poster.webp",
  "img/gemini_illust.webp",
  "img/gemini_portrait.webp",
  "img/gemini_poster.webp",
  "img/grok_illust.webp",
  "img/grok_portrait.webp",
  "img/grok_poster.webp",
  "img/higgsfield_illust.webp",
  "img/higgsfield_portrait.webp",
  "img/higgsfield_poster.webp",
  "img/ideogram_illust.webp",
  "img/ideogram_portrait.webp",
  "img/ideogram_poster.webp",
  "img/recraft_illust.webp",
  "img/recraft_portrait.webp",
  "img/recraft_poster.webp"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // 글꼴: 한 번 받으면 저장해 두고 재사용
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req); if (hit) return hit;
      try { const res = await fetch(req); c.put(req, res.clone()); return res; } catch (err) { return new Response("", {status: 504}); }
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // 화면(HTML): 인터넷이 되면 최신 버전, 안 되면 저장본
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./", copy)); return res; })
      .catch(() => caches.match("./").then(r => r || caches.match("index.html"))));
    return;
  }
  // 그림·아이콘: 저장본 먼저
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })));
});
