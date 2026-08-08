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
  ["/oche/privacy", "/oche/privacy.html"],
  ["/oche/privacy.html", "/oche/privacy.html"],
  ["/oche/join", "/oche/join/index.html"],
  ["/oche/join/", "/oche/join/index.html"],
]);

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
    if (ASSOCIATION_PATHS.has(url.pathname)) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
