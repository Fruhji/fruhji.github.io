# .well-known — App Links und Universal Links

Diese beiden Dateien sorgen dafür, dass ein Link auf
`oche-site.fruhji.workers.dev` die
zugehörige App öffnet, statt im Browser zu landen. Ohne sie ist ein
`https://…`-Link nur eine Webseite.

## assetlinks.json (Android)

**Der Fingerabdruck muss der des Schlüssels sein, mit dem Google die App
signiert — nicht der des Upload-Schlüssels.** Seit Oche als AAB ausgeliefert
wird, greift Play App Signing: Google signiert das APK beim Ausliefern mit
einem eigenen Schlüssel neu. Ein Gerät, das die App aus dem Play Store hat,
prüft gegen diesen Schlüssel.

**Beide Fingerabdrücke stehen drin (Stand 05.08.2026):**

- `9D:66:C3:…` — Upload-Schlüssel aus `android/oche-release.jks`, gilt für
  per `adb install` aufgespielte Builds
- `C8:49:38:…` — **Play-App-Signaturschlüssel**, gilt für alles aus dem Store

Zu finden in der Play Console unter
`…/app/<appId>/keymanagement` → „Zertifikat für den App-Signaturschlüssel".
Für Oche: App-ID **4973096735861338560**, Konto **5424999985196990756**.
Der Menüweg heißt dort **Mit Google Play geschützt → App-Signatur** — nicht
„App-Integrität", wie die Hilfeseiten teils noch schreiben.

Prüfen lässt sich das Ergebnis ohne Gerät:

```
https://digitalassetlinks.googleapis.com/v1/statements:list
  ?source.web.site=https://oche-site.fruhji.workers.dev
  &relation=delegate_permission/common.handle_all_urls
```

Auf dem Gerät: `adb shell pm get-app-links dev.oche.app` muss `verified`
melden.

## apple-app-site-association (iOS)

Ohne Dateiendung, und Apple verlangt laut Dokumentation
`Content-Type: application/json`. Der Cloudflare-Worker liefert die Datei
direkt ohne Redirect aus.

Der direkte Endpunkt wird mit folgendem Befehl geprüft:

```
curl -i https://oche-site.fruhji.workers.dev/.well-known/apple-app-site-association
```

Bereits geteilte Links auf `fruhji.github.io/oche/join` bleiben als
Kompatibilitätspfad lesbar, werden von neuen Builds aber nicht mehr erzeugt.

Die App-ID ist `<TeamID>.<BundleID>`, für Oche also `R37Q54JBKD.dev.oche.app`.
Die Berechtigung „Associated Domains" muss zusätzlich am App-Identifier im
Developer-Portal aktiviert sein, sonst schlägt schon die Signierung fehl.
