# .well-known — App Links und Universal Links

Diese beiden Dateien sorgen dafür, dass ein Link auf `fruhji.github.io` die
zugehörige App öffnet, statt im Browser zu landen. Ohne sie ist ein
`https://…`-Link nur eine Webseite.

## assetlinks.json (Android)

**Der Fingerabdruck muss der des Schlüssels sein, mit dem Google die App
signiert — nicht der des Upload-Schlüssels.** Seit Oche als AAB ausgeliefert
wird, greift Play App Signing: Google signiert das APK beim Ausliefern mit
einem eigenen Schlüssel neu. Ein Gerät, das die App aus dem Play Store hat,
prüft gegen diesen Schlüssel.

Aktuell steht hier der **Upload-Schlüssel** aus `android/oche-release.jks`. Das
reicht für ein per `adb install` aufgespieltes Build, aber **nicht** für eine
aus dem Play Store installierte App.

Der richtige Wert steht in der Play Console unter
**Test und Veröffentlichung → Einrichtung → App-Integrität →
App-Signaturschlüssel-Zertifikat → SHA-256-Zertifikat-Fingerabdruck**.
Er gehört zusätzlich in die Liste `sha256_cert_fingerprints` — beide dürfen
nebeneinander stehen, dann funktionieren Sideload und Store-Installation.

Prüfen lässt sich das Ergebnis ohne Gerät:

```
https://digitalassetlinks.googleapis.com/v1/statements:list
  ?source.web.site=https://fruhji.github.io
  &relation=delegate_permission/common.handle_all_urls
```

Auf dem Gerät: `adb shell pm get-app-links dev.oche.app` muss `verified`
melden.

## apple-app-site-association (iOS)

Ohne Dateiendung und mit `Content-Type: application/json` auszuliefern — das
ist bei GitHub Pages der wackelige Punkt, weil Pages endungslose Dateien als
`application/octet-stream` ausliefert. Wenn Apple die Datei deshalb ablehnt,
ist der Ausweg, beide Dateien stattdessen vom Cloudflare-Worker
(`oche-room-worker`) ausliefern zu lassen; der kann den Content-Type exakt
setzen. Die App müsste dann auf dessen Host zeigen.

Die App-ID ist `<TeamID>.<BundleID>`, für Oche also `R37Q54JBKD.dev.oche.app`.
Die Berechtigung „Associated Domains" muss zusätzlich am App-Identifier im
Developer-Portal aktiviert sein, sonst schlägt schon die Signierung fehl.
