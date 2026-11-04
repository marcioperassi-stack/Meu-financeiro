const CACHE_NAME = "financeiro-pro-v3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Instalação e armazenamento dos arquivos principais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Ativação e limpeza somente dos caches deste aplicativo
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      const cachesAntigos = keys.filter((key) =>
        key.startsWith("financeiro-pro-") &&
        key !== CACHE_NAME
      );

      return Promise.all(
        cachesAntigos.map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Internet primeiro; cache como alternativa offline
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok && response.type === "basic") {
          const copia = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copia);
          });
        }

        return response;
      })
      .catch(async () => {
        const arquivoSalvo = await caches.match(request);

        if (arquivoSalvo) {
          return arquivoSalvo;
        }

        if (request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return Response.error();
      })
  );
});
