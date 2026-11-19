# Projektstatus – ioBroker BambuLab Connect

Einzige Statusdatei des Projekts. Sie wird nur im Installationsbranch gepflegt, kurz gehalten und nur bei echten Änderungen aktualisiert (keine reinen Status-Commits).

## Stand 19.11.2026 – Version 0.4.11

- **Drucker im Einsatz:** vier (2× A1 Mini, X1C, H2C).
- **0.4.11 am echten System getestet (19.11.2026):** Installation, alle vier Drucker online, Testdruck auf dem X1C mit Alexa-Fertigmeldung, Adapter-Neustart mit sauberem Wiederverbinden.
- **Enthält:** den bisherigen Stand von `feature/multi-printer` (0.4.10), die AMS-Definitionen `cfs`/`dry_sf_reason` und die Aufräumarbeiten (PR #10).
- **`main` und `feature/multi-printer`** stehen auf demselben Stand.

## Funktionsumfang

- Mehrere Drucker mit getrennten Laufzeit- und Verbindungszuständen.
- Lokale Druckersuche im Admin (Name, IP, Seriennummer, Modell); der Access Code wird immer manuell eingetragen.
- Offline-Drucker bleiben beim Start still; Verbindungsverlust wird als Info mit Druckernamen geloggt.
- Erkennung von Drucker-OTA- und AMS-Firmwareupdates (Präfixe `ams/`, `ams_f1/`, `n3f/`, `n3s/`).
- Warnungsdatei `warnMessages.json` liegt im Instanz-Datenverzeichnis.

## Tests

- `npm run test:unit` (Unit- und Paket-Tests) läuft lokal und in der CI („Test and Release“).
- Die CI prüft zusätzlich den Adapterstart (Integrationstest) auf Ubuntu, Windows und macOS mit Node 22/24.
- CI-Erfolg ersetzt keinen Test am echten Drucker.

## Offene Punkte

- Festlegen, ob künftig von `main` installiert wird (dann kann `feature/multi-printer` entfallen).
- `npm run check` (TypeScript-Prüfung) meldet viele Typhinweise im Laufzeitcode; bewusst nicht angefasst, um nichts am laufenden Verhalten zu ändern.
- Falls macOS-Runner bei GitHub wieder ausfallen: macOS in der CI-Matrix erneut pausieren.

## Regeln für Änderungen

1. Vor Änderungen diese Datei und die betroffenen Quelldateien lesen.
2. Zusammengehörige Änderungen bündeln; pro Stand ein CI-Lauf.
3. Vor dem Push `npm run lint` und `npm run test:unit` ausführen.
4. CI-Ergebnis, lokale Tests und Hardwaretest klar unterscheiden.
5. Nichts in den Installationsbranch übernehmen, was nicht am Drucker getestet ist.
6. Herkunftshinweis und MIT-Lizenz erhalten.
7. Keine veralteten Branches, PRs oder Dateien liegen lassen.
