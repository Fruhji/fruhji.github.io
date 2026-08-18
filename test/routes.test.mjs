// Der Router muss jeden Pfad bedienen, den die Association-Dateien beanspruchen.
//
// `apple-app-site-association` erklaert Apple gegenueber, welche Pfade zur App
// gehoeren. Steht dort `/oche/join*`, dann uebergibt iOS jede URL darunter der
// App - und wer die App nicht hat, landet mit derselben URL im Browser. Ein
// 404 dort ist nicht kosmetisch: es ist die Seite, die dem Eingeladenen erklaeren
// soll, wozu der Code gehoert.
//
// Der Test leitet die Erwartung aus der AASA ab, statt eine Liste zu wiederholen.
// Ein spaeter ergaenztes Muster verlangt damit von selbst seine Routen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import worker from '../worker.js';

const association = JSON.parse(
  await readFile(new URL('../.well-known/apple-app-site-association', import.meta.url), 'utf8'),
);

const ORIGIN = 'https://oche-site.fruhji.workers.dev';

/** Fake-Assets-Binding: merkt sich den angefragten Pfad, liefert immer 200. */
function stubAssets() {
  const requested = [];
  return {
    requested,
    binding: {
      fetch(request) {
        requested.push(new URL(request.url).pathname);
        return new Response('asset', { status: 200 });
      },
    },
  };
}

async function get(path) {
  const assets = stubAssets();
  const response = await worker.fetch(new Request(`${ORIGIN}${path}`), { ASSETS: assets.binding });
  return { status: response.status, servedFrom: assets.requested[0] ?? null };
}

/** Die Praefixe aus der AASA, ohne den `*`-Platzhalter. */
function claimedPrefixes() {
  const prefixes = [];
  for (const detail of association.applinks.details) {
    for (const component of detail.components) {
      const pattern = component['/'];
      assert.ok(pattern.endsWith('*'), `unerwartetes AASA-Muster: ${pattern}`);
      prefixes.push(pattern.slice(0, -1));
    }
  }
  assert.ok(prefixes.length > 0, 'AASA ohne Muster - dann prueft dieser Test nichts');
  return prefixes;
}

test('jeder von der AASA beanspruchte Pfad wird bedient', async () => {
  for (const prefix of claimedPrefixes()) {
    // Die drei Formen, in denen dieselbe Seite adressiert wird: ohne Schraegstrich
    // (so steht sie im QR), mit (so ergaenzen ihn Clients) und als `index.html`
    // (so schreibt sie ein Browser aus, der einen Verzeichnisindex erwartet).
    for (const path of [prefix, `${prefix}/`, `${prefix}/index.html`]) {
      const { status } = await get(path);
      assert.equal(status, 200, `${path} sollte bedient werden, war ${status}`);
    }
  }
});

test('alle Formen eines Pfads liefern dieselbe Seite', async () => {
  for (const prefix of claimedPrefixes()) {
    const forms = await Promise.all(
      [prefix, `${prefix}/`, `${prefix}/index.html`].map((path) => get(path)),
    );
    const [first, ...rest] = forms;
    for (const other of rest) {
      assert.equal(other.servedFrom, first.servedFrom);
    }
  }
});

test('die Association-Dateien gehen unveraendert durch', async () => {
  for (const path of ['/.well-known/apple-app-site-association', '/.well-known/assetlinks.json']) {
    const { status, servedFrom } = await get(path);
    assert.equal(status, 200);
    assert.equal(servedFrom, path);
  }
});

test('ein unbekannter Pfad bleibt 404', async () => {
  const { status } = await get('/gibt-es-nicht');
  assert.equal(status, 404);
});

test('das Impressum ist unter allen erwarteten Formen erreichbar', async () => {
  // OCHE hatte bis zum 18.08.2026 kein Impressum. Fuer ein gewerbliches
  // Angebot ist das nach § 5 DDG Pflicht, deshalb hier festgehalten.
  for (const path of ['/impressum', '/impressum/', '/impressum.html', '/oche/impressum']) {
    const { status, servedFrom } = await get(path);
    assert.equal(status, 200, path);
    assert.equal(servedFrom, '/oche/impressum.html', path);
  }
});

test('die Bildschirmfotos der Startseite werden ausgeliefert', async () => {
  // Die Routentabelle ist eine Allowlist: ohne eigenes Muster laedt kein Bild,
  // und die Seite saehe lokal richtig aus und live leer.
  for (const name of ['start', 'x01', 'raum', 'turnier', 'statistik']) {
    for (const path of [`/oche/img/${name}.webp`, `/oche/img/en/${name}.webp`]) {
      const { status, servedFrom } = await get(path);
      assert.equal(status, 200, path);
      assert.equal(servedFrom, path, path);
    }
  }
  const { status } = await get('/oche/img/gibt-es-nicht.webp');
  assert.equal(status, 404);
});

test('Startseite und Support liefern dieselbe Seite', async () => {
  // ASC fuehrt fuer OCHE dieselbe URL als Support- und als Marketing-Adresse.
  // Die Startseite muss den Supportteil deshalb selbst tragen.
  const wurzel = await get('/');
  const support = await get('/support');
  assert.equal(wurzel.servedFrom, '/oche/index.html');
  assert.equal(support.servedFrom, '/oche/index.html');
});
