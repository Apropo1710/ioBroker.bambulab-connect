# Regeln für die Arbeit an diesem Repository

Diese Datei gilt für jeden, der hier Änderungen macht – Menschen und KI-Werkzeuge (Claude, ChatGPT/Codex, Copilot …). Sie wird bei jeder Sitzung zuerst gelesen und hat Vorrang vor eigenen Gewohnheiten und vor der allgemeinen Entwickleranleitung in `.github/copilot-instructions.md`.

## Projekt in einem Satz

ioBroker-Adapter „BambuLab Connect“ für mehrere BambuLab-3D-Drucker (u. a. H2C, X1C, A1 Mini) über MQTT, abgeleitet vom Adapter `ioBroker.bambulab` (MIT-Lizenz).

## Vor jeder Änderung lesen

1. [`STATUS.md`](STATUS.md) – einzige Statusdatei, insbesondere **„Regeln für Änderungen“**. Diese Regeln gelten vollständig; diese Datei wiederholt sie nicht.
2. Die betroffenen Quelldateien.

## Unverhandelbar

- **`STATUS.md` ist die einzige Statusdatei.** Keine weiteren Status-, Plan-, Übergabe-, TODO- oder Notizdateien anlegen, auch nicht „vorübergehend“. Der Workflow „Docs guard“ schlägt fehl, wenn eine weitere solche Datei auftaucht. `STATUS.md` nur bei echten Änderungen aktualisieren, keine reinen Status-Commits.
- **Ablauf:** `main` ist geschützt; jede Änderung über Branch und Pull Request, der Branch wird nach dem Merge automatisch gelöscht. Vorher `npm run lint`, `npm run check` und `npm run test:unit` ausführen.
- **Nichts nach `main` übernehmen, was nicht am Drucker getestet ist.** CI-Ergebnis, lokale Tests und Hardwaretest klar unterscheiden.
- **Herkunftshinweis und MIT-Lizenz** des Original-Adapters erhalten.

## Dokumentation – feste Plätze

- `README.md` – für Anwender
- `STATUS.md` – Stand, Funktionsumfang, Tests, offene Punkte, Regeln
- `CHANGELOG_OLD.md` – ältere Versionshinweise (ioBroker-Konvention), nur vom Release-Prozess ergänzt
- `.github/copilot-instructions.md` – allgemeine Entwickleranleitung (Build, Tests); bei Widerspruch gilt diese Datei

## Keine Reste

Veraltete Branches, Pull Requests, Workflows, Dateien und Code werden entfernt, nicht liegen gelassen oder „als veraltet markiert“.

## Sicherheit

Zugangscodes, Seriennummern, Tokens, Passwörter und persönliche Daten gehören nie in Git, Tests, Issues oder Logs.
