# Regeln für die Arbeit an diesem Repository

Diese Datei gilt für jeden, der hier Änderungen macht – Menschen und KI-Werkzeuge (Claude, ChatGPT/Codex, Copilot …). Sie wird bei jeder Sitzung zuerst gelesen und hat Vorrang vor eigenen Gewohnheiten.

## Projekt in einem Satz

ioBroker-Adapter „BambuLab Connect“ für mehrere BambuLab-3D-Drucker (u. a. H2C, X1C, A1 Mini) über MQTT, abgeleitet vom Adapter `ioBroker.bambulab` (MIT-Lizenz).

## Vor jeder Änderung lesen

1. [`STATUS.md`](STATUS.md) – einzige Statusdatei, insbesondere **„Regeln für Änderungen“**. Diese Regeln gelten vollständig; diese Datei wiederholt sie nicht.
2. Die betroffenen Quelldateien.

## Unverhandelbar

- **`STATUS.md` ist die einzige Statusdatei.** Keine weiteren Status-, Plan-, Übergabe-, TODO- oder Notizdateien anlegen, auch nicht „vorübergehend“. Der Workflow „Docs guard“ schlägt fehl, wenn eine weitere solche Datei auftaucht. `STATUS.md` nur bei echten Änderungen aktualisieren, keine reinen Status-Commits.
- **Ablauf:** `main` ist geschützt; jede Änderung über Branch und Pull Request, der Branch wird nach dem Merge automatisch gelöscht. Vorher `npm run lint`, `npm run check` und `npm run test:unit` ausführen.
- **Eigene Änderungen erst nach einem Test am Drucker nach `main` übernehmen.** CI-Ergebnis, lokale Tests und Hardwaretest klar unterscheiden. Einzige Ausnahme: Dependabot-Updates werden nach grüner Test-Matrix automatisch gemergt (siehe `STATUS.md`, Regel 5).
- **Herkunftshinweis und MIT-Lizenz** des Original-Adapters erhalten.

## Dokumentation – feste Plätze

- `README.md` – für Anwender
- `STATUS.md` – Stand, Funktionsumfang, Tests, offene Punkte, Regeln
- `CHANGELOG_OLD.md` – ältere Versionshinweise (ioBroker-Konvention), nur vom Release-Prozess ergänzt

## Entwicklung

- Node.js ≥ 22, Abhängigkeiten mit `npm ci` installieren.
- Prüfen: `npm run lint` (ESLint), `npm run check` (TypeScript-Prüfung der JavaScript-Quellen), `npm run test:unit` (Unit- und Paketprüfung). Integrationstest bei Bedarf mit `npm run test:integration`.
- Wichtige Dateien: `main.js` (Adapter), `lib/` (Druckerlaufzeit, Discovery, Konvertierung, Statusdefinitionen in `state_attr.js`), `admin/jsonConfig.json` (Einstellungsseite).
- **Übersetzungen synchron halten:** Jeder `label`- und `help`-Text in `admin/jsonConfig.json` muss in allen Sprachdateien `admin/i18n/<sprache>/translations.json` vorhanden sein; Schlüssel, die in `jsonConfig.json` nicht mehr vorkommen, werden aus allen Sprachdateien entfernt.
- Releases mit `npm run release` (release-script); `CHANGELOG_OLD.md` wird dabei automatisch gepflegt.

## Keine Reste

Veraltete Branches, Pull Requests, Workflows, Dateien und Code werden entfernt, nicht liegen gelassen oder „als veraltet markiert“.

## Sicherheit

Zugangscodes, Seriennummern, Tokens, Passwörter und persönliche Daten gehören nie in Git, Tests, Issues oder Logs.
