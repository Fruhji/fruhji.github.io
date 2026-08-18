const ROUTES = new Map([
  ["/", "/oche/index.html"],
  ["/index.html", "/oche/index.html"],
  ["/privacy", "/oche/privacy.html"],
  ["/privacy/", "/oche/privacy.html"],
  ["/privacy.html", "/oche/privacy.html"],
  ["/join", "/oche/join/index.html"],
  ["/join/", "/oche/join/index.html"],
  ["/join/index.html", "/oche/join/index.html"],
  ["/oche", "/oche/index.html"],
  ["/oche/", "/oche/index.html"],
  ["/oche/index.html", "/oche/index.html"],
  ["/oche/privacy", "/oche/privacy.html"],
  ["/oche/privacy/", "/oche/privacy.html"],
  ["/oche/privacy.html", "/oche/privacy.html"],
  ["/oche/join", "/oche/join/index.html"],
  ["/oche/join/", "/oche/join/index.html"],
  ["/oche/join/index.html", "/oche/join/index.html"],
  // Impressum: bis zum 18.08.2026 hatte OCHE keines — weder hier noch sonstwo.
  ["/impressum", "/oche/impressum.html"],
  ["/impressum/", "/oche/impressum.html"],
  ["/impressum.html", "/oche/impressum.html"],
  ["/oche/impressum", "/oche/impressum.html"],
  ["/oche/impressum.html", "/oche/impressum.html"],
  // Der Support liegt als Abschnitt auf der Startseite, weil ASC dieselbe URL
  // als Support- und als Marketing-Adresse fuehrt. Diese Route existiert fuer
  // Links, die "/support" erwarten.
  ["/support", "/oche/index.html"],
  ["/support/", "/oche/index.html"],
]);

// Bildschirmfotos der Startseite. Die Routentabelle ist absichtlich eng — ein
// enges Muster statt eines Eintrags je Datei.
const BILDER = /^\/oche\/img\/(en\/)?[a-z0-9]+\.webp$/;

const ASSOCIATION_PATHS = new Set([
  "/.well-known/apple-app-site-association",
  "/.well-known/assetlinks.json",
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const assetPath = ROUTES.get(url.pathname);
    if (assetPath) {
      url.pathname = assetPath;
      return env.ASSETS.fetch(new Request(url, request));
    }
    if (BILDER.test(url.pathname) || ASSOCIATION_PATHS.has(url.pathname)) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
