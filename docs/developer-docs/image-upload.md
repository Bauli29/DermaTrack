# Image Upload, Preview und Speicherung

Diese Dokumentation beschreibt den aktuellen Image-Flow für Symptomfotos in DermaTrack. Die Funktion gehört zum Daily-Tracking-Formular und speichert Bild-URLs im Diary-Eintrag unter `tracking.symptoms.spreadPhotoUrls`.

## Kurzüberblick

- Nutzerinnen und Nutzer wählen im Daily Tracking bis zu fünf Bilder aus.
- Das Frontend zeigt lokale Vorschauen sofort über `URL.createObjectURL` an.
- Beim Speichern des Diary-Eintrags werden neu ausgewählte Bilder zuerst hochgeladen.
- Der Backend-Upload speichert die Bilddateien user-scoped im Dateisystem.
- Der Diary-Eintrag speichert nur die zurückgegebenen URL-Strings, nicht die Bildbytes.
- Gespeicherte Bilder werden später über die geschützte Upload-Route geladen und in der Preview angezeigt.
- Daily Tracking und Timeline öffnen gespeicherte beziehungsweise ausgewählte Bilder per Klick in einer größeren Vorschau.

## Relevante Dateien

### Frontend

- `frontend/src/components/molecules/ImageUpload/index.tsx`
  - wiederverwendbare Upload-/Preview-Komponente
  - zeigt gespeicherte Bild-URLs und lokale Vorschauen für neu ausgewählte Dateien
- `frontend/src/components/templates/daily-tracking/index.tsx`
  - bindet `ImageUpload` in das Daily Tracking ein
  - lädt neue Dateien vor dem Diary-Speichern hoch
  - hängt erfolgreiche Upload-URLs an `spreadPhotoUrls` an
- `frontend/src/components/templates/timeline/index.tsx`
  - zeigt gespeicherte Bild-URLs im ausgewählten Timeline-Eintrag
  - öffnet Bildkacheln per Klick in einer größeren Vorschau
- `frontend/src/services/uploads/index.ts`
  - stellt `uploadImage` und `deleteImage` bereit
  - nutzt `sessionAwareFetch`, damit ein abgelaufener Access Token per Refresh-Flow behandelt werden kann
- `frontend/src/app/api/uploads/images/route.ts`
  - proxyt `POST /api/uploads/images` vom Frontend zum Backend
- `frontend/src/app/api/uploads/images/[fileName]/route.ts`
  - proxyt `GET` und `DELETE` für einzelne Bilddateien
- `frontend/src/constants/uploads.ts`
  - definiert Frontend-Grenzen: `MAX_IMAGES = 5`, `MAX_IMAGE_MB = 5`, JPEG/PNG

### Backend

- `backend/src/main/java/de/dermatrack/backend/upload/api/controller/ImageUploadController.java`
  - stellt `POST`, `GET` und `DELETE` für Bilder bereit
  - löst den aktuellen Nutzer über den authentifizierten Principal auf
- `backend/src/main/java/de/dermatrack/backend/upload/service/ImageStorageService.java`
  - validiert Dateityp und Größe
  - speichert Dateien pro Nutzerverzeichnis
  - verhindert Zugriff auf fremde Dateien und Path Traversal
- `backend/src/main/java/de/dermatrack/backend/upload/config/ImageUploadProperties.java`
  - bindet Upload-Konfiguration aus `app.uploads.images.*`
- `backend/src/main/resources/application.yml`
  - enthält die lokale Standardkonfiguration für Uploads

## Upload-Ablauf im Detail

1. Im Daily Tracking wird `ImageUpload` mit `savedImageUrls` und `selectedImages` gerendert.
2. Bereits gespeicherte Bilder werden direkt über ihre URL angezeigt.
3. Neu ausgewählte Dateien werden noch nicht sofort hochgeladen, sondern im lokalen Formularzustand gehalten.
4. Für jede neu ausgewählte Datei erstellt die Komponente eine lokale Preview-URL per `URL.createObjectURL(file)`.
5. Beim Speichern ruft `DailyTrackingTemplate` für jede neue Datei `uploadImage(file)` auf.
6. `uploadImage` sendet ein `multipart/form-data`-Request an die Next.js-API-Route `/api/uploads/images`.
7. Die Next.js-Route leitet das Request mit Access Token an das Backend unter `/api/uploads/images` weiter.
8. Das Backend validiert und speichert die Datei und gibt eine Antwort mit `url`, `fileName`, `contentType` und `size` zurück.
9. Das Frontend sammelt alle erfolgreichen Upload-URLs.
10. Erst danach wird der Diary-Eintrag mit den vorhandenen und neuen `spreadPhotoUrls` gespeichert.

Falls ein Upload oder das Diary-Speichern fehlschlägt, versucht das Frontend, bereits in diesem Speichervorgang hochgeladene Dateien per `deleteImage(url)` wieder zu entfernen.

## Preview-Verhalten

Die Preview unterscheidet zwei Fälle:

- Gespeicherte Bilder:
  - Quelle ist eine URL wie `/api/uploads/images/{fileName}`.
  - Diese URL wird aus dem Diary-Eintrag geladen.
  - Das Bild wird über die geschützte GET-Route vom Backend ausgeliefert.
- Neu ausgewählte Bilder:
  - Quelle ist eine temporäre Browser-Object-URL.
  - Die URL wird nur für die lokale Vorschau verwendet.
  - Beim Wechsel der Auswahl oder Unmount wird sie mit `URL.revokeObjectURL` wieder freigegeben.

## Speicherung im Backend

Der Backend-Service speichert Dateien nicht in der Datenbank, sondern im Dateisystem:

```text
{storage-path}/{user-id}/{generated-file-name}.jpg
{storage-path}/{user-id}/{generated-file-name}.png
```

Wichtige Eigenschaften:

- Der Dateiname wird serverseitig als UUID generiert.
- Die Dateiendung wird aus dem erkannten Bildtyp abgeleitet.
- Erlaubt sind aktuell `image/jpeg` und `image/png`.
- Die Validierung basiert auf Dateisignaturen, nicht nur auf Client-Dateinamen oder Browser-Content-Type.
- Dateien werden unter der ID des aktuell authentifizierten Nutzers gespeichert.
- Beim Laden und Löschen wird nur im Verzeichnis des aktuellen Nutzers gesucht.

## Konfiguration

Die Upload-Konfiguration liegt unter `app.uploads.images`.

Aktuelle Standardwerte:

```yaml
app:
  uploads:
    images:
      storage-path: ${DERMATRACK_UPLOAD_DIR:backend/uploads/images}
      max-file-size-bytes: 5242880
      allowed-content-types:
        - image/jpeg
        - image/png
```

Für lokale Entwicklung wird ohne zusätzliche Umgebungskonfiguration `backend/uploads/images` verwendet. Für produktionsähnliche Umgebungen sollte `DERMATRACK_UPLOAD_DIR` auf ein dauerhaftes Volume oder eine andere persistente Ablage zeigen.

### Production Deployment

Der Spring-Boot-Container läuft als nicht-root Nutzer. Das Docker-Image legt deshalb `/app/uploads/images` an und macht `/app/uploads` für den App-Nutzer beschreibbar. Ohne diese Vorbereitung schlägt der erste Upload in Production mit `500 Internal Server Error` fehl, weil der Prozess das Standardverzeichnis nicht erstellen darf.

Wichtig: Dieses Verzeichnis ist nur dauerhaft, wenn die Deployment-Plattform dort ein persistentes Volume mountet. Für Render kann `DERMATRACK_UPLOAD_DIR` auf einen gemounteten Disk-Pfad zeigen. Für Vercel Functions oder andere serverless Umgebungen sollte nicht in das lokale Dateisystem geschrieben werden; dafür ist Object Storage wie Vercel Blob, S3, Azure Blob oder ein vergleichbarer Dienst nötig.

## Abruf und Löschen

### Abruf

Gespeicherte Bild-URLs zeigen auf:

```text
/api/uploads/images/{fileName}
```

Das Frontend ruft diese Route auf. Die Next.js-API leitet den Request mit dem Auth-Token an das Backend weiter. Das Backend liefert die Datei inline mit passendem `Content-Type`, `Content-Length`, `Content-Disposition` und `Cache-Control: no-store` aus.

### Löschen

Für Upload-Rollbacks oder manuelles Entfernen im Formular ruft das Frontend:

```text
DELETE /api/uploads/images/{fileName}
```

`deleteImage` löscht nur URLs, die zur lokalen Upload-Route gehören. Externe URLs werden ignoriert, damit keine unerwarteten fremden Ressourcen gelöscht werden.

## Sicherheits- und Betriebsaspekte

- Upload-, Abruf- und Lösch-Endpunkte sind authentifiziert.
- Bildzugriff ist user-scoped; Nutzer können die Dateien anderer Nutzer nicht über deren Dateinamen abrufen.
- Dateinamen müssen dem UUID-Dateinamenmuster des Backends entsprechen.
- Path-Traversal-Versuche werden verworfen.
- Aktuell gibt es keine automatische Löschung unreferenzierter Dateien außerhalb der Rollback-Logik beim Speichern.
- Für Produktion ist das lokale Dateisystem nur geeignet, wenn es persistent und gesichert ist; sonst sollte eine robuste Storage-Lösung wie ein persistentes Volume oder Object Storage eingeplant werden.
- EXIF-Stripping, Bildkompression, Virenscan und serverseitige Bildnormalisierung sind aktuell nicht implementiert.

## Testabdeckung

Die Funktion wird aktuell durch folgende Tests abgesichert:

- Backend-Integrationstest für Upload, Abruf, User-Isolation, Löschen und ungültige Dateien:
  - `backend/src/test/java/de/dermatrack/backend/upload/api/controller/ImageUploadControllerIntegrationTest.java`
- Backend-Service-Test für Validierung, Speicherung und Sicherheitsfälle:
  - `backend/src/test/java/de/dermatrack/backend/upload/service/ImageStorageServiceTest.java`
- Frontend-Komponententest für gespeicherte und lokale Previews:
  - `frontend/src/components/molecules/ImageUpload/__tests__/index.test.tsx`
- Frontend-Service-Test für Upload und Delete-Verhalten:
  - `frontend/src/services/uploads/__tests__/index.test.ts`
- Daily-Tracking-Utility-Tests für Bildvalidierung und Payload-Mapping:
  - `frontend/src/components/templates/daily-tracking/__tests__/utils.test.ts`
