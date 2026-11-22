# Projektstatus – ioBroker BambuLab Connect

Einzige Statusdatei des Projekts. Sie wird nur auf `main` gepflegt, kurz gehalten und nur bei echten Änderungen aktualisiert (keine reinen Status-Commits).

## Stand 22.11.2026 – Version 0.4.14

- **0.4.14:** `<Drucker>.raw.err2.err_code` als gemischter Typ: Der H2C sendet bei aktivem Fehler (z. B. Luftdruck-Fehlalarm am 22.11.2026) einen Text-Code, der vorher abgelehnt wurde. Format dieses Codes noch unbekannt.
- **0.4.13:** Zugangsdaten-Vergleich mit dem Original-Adapter `bambulab` entfernt (Original wurde am 20.11.2026 deinstalliert); Zugangsdaten-Diagnose nur noch im Debug-Log. Verbindung und Datenpunkte unverändert.
- **0.4.12:** Definitionen für die HMS-Felder `action` und `timestamp` (`<Drucker>.status.hms.<n>`) aus neuerer A1-Firmware (Warnung im Log vom 20.11.2026); sonst wie 0.4.11.

### 0.4.11 (19.11.2026)

- **Drucker im Einsatz:** vier (2× A1 Mini, X1C, H2C).
- **0.4.11 am echten System getestet (19.11.2026):** Installation, alle vier Drucker online, Testdruck auf dem X1C mit Alexa-Fertigmeldung, Adapter-Neustart mit sauberem Wiederverbinden.
- **Enthält:** den bisherigen Stand von `feature/multi-printer` (0.4.10), die AMS-Definitionen `cfs`/`dry_sf_reason` und die Aufräumarbeiten (PR #10).
- **Installationsquelle:** `main` – `https://github.com/Apropo1710/ioBroker.bambulab-connect` (seit 19.11.2026; vorher `feature/multi-printer`).
- Weitere Branches nur kurzzeitig für einzelne Änderungen; nach dem Merge löschen.

## Funktionsumfang

- Mehrere Drucker mit getrennten Laufzeit- und Verbindungszuständen.
- Lokale Druckersuche im Admin (Name, IP, Seriennummer, Modell); der Access Code wird immer manuell eingetragen.
- Offline-Drucker bleiben beim Start still; Verbindungsverlust wird als Info mit Druckernamen geloggt.
- Erkennung von Drucker-OTA- und AMS-Firmwareupdates (Präfixe `ams/`, `ams_f1/`, `n3f/`, `n3s/`).
- Warnungsdatei `warnMessages.json` liegt im Instanz-Datenverzeichnis.

## Tests

- `npm run test:unit` (Unit- und Paket-Tests) läuft lokal und in der CI („Test and Release“).
- Die CI führt außerdem Lint und die TypeScript-Prüfung (`npm run check`) aus; beide müssen ohne Fehler durchlaufen (Stand 19.11.2026: 0 Warnungen, PR #12).
- Die CI prüft zusätzlich den Adapterstart (Integrationstest) auf Ubuntu, Windows und macOS mit Node 22/24.
- CI-Erfolg ersetzt keinen Test am echten Drucker.

## Offene Punkte

- Falls macOS-Runner bei GitHub wieder ausfallen: macOS in der CI-Matrix erneut pausieren.

## Regeln für Änderungen

1. Vor Änderungen diese Datei und die betroffenen Quelldateien lesen.
2. Zusammengehörige Änderungen bündeln; pro Stand ein CI-Lauf.
3. Vor dem Push `npm run lint`, `npm run check` und `npm run test:unit` ausführen.
4. CI-Ergebnis, lokale Tests und Hardwaretest klar unterscheiden.
5. Nichts nach `main` übernehmen, was nicht am Drucker getestet ist.
6. Herkunftshinweis und MIT-Lizenz erhalten.
7. Keine veralteten Branches, PRs oder Dateien liegen lassen.
8. Arbeitsregeln für Menschen und KI-Werkzeuge stehen in `AGENTS.md` (`CLAUDE.md` verweist darauf); der Workflow „Docs guard“ verhindert weitere Statusdateien.
