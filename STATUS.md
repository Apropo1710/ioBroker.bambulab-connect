# Projektstatus – ioBroker BambuLab Connect

## Verifizierter Abgleich – 18.11.2026, 03:09 MEZ

- Produktionsbranch `main`: aktueller Head `8dffe2bd9bb75c1435e65a8d6017882e9375392c` (Dokumentation), letzter übernommener Laufzeitcode `cd1a6a65a0bece57f4ef922fedc907ff9c21b2df`, Paketversion **0.4.10**. „Test and Release“ Run `43405722766` für den nachfolgenden Main-Stand war **completed / success**. Nutzer bestätigt stabilen Betrieb mit drei Druckern.
- PR [#7](https://github.com/Apropo1710/ioBroker.bambulab-connect/pull/7) / `feature/multi-printer`: aktueller Head `b6f3676c461de8d9c6fe53ea788e442796edc0b7`, letzter Laufzeitcode-Commit `b7e842406b66fb1575e3eb9f69bfef66b886271f`; **11 ahead / 0 behind**, offen und mergeable/clean. Test and Release #179 / Run `43592404382` für exakt den Code-Commit: **completed / success**. macOS ist in diesem Feature-Branch vorübergehend aus der Testmatrix genommen.
- PR [#8](https://github.com/Apropo1710/ioBroker.bambulab-connect/pull/8) / `fix/missing-ams-state-attributes`: aktueller Head `864c5f293c3ebe34c68e94da6c5083db2803d461`, Laufzeitcode-Commit `fc88de9b188a00a3509edf08b9aa5f68deebe01b`; **4 ahead / 0 behind**, offen und mergeable/clean. PR-Run #182 / `43616767673`: **completed / success**.
- PR [#9 – Statusdokumentation](https://github.com/Apropo1710/ioBroker.bambulab-connect/pull/9) bleibt offen und mergeable/clean. Diese Aktualisierung erfolgt auf dem bestehenden Head-Branch `docs/status-refresh-2026-11-15`; kein zweiter Dokumentations-PR und kein automatisches Merge.
- PRs #7 und #8 sind nicht gemergt. Die Änderungen sind nicht Teil von `main`; eine erneute Live-Beobachtung am Drucker nach diesen Änderungen fehlt. Kein neues Release und kein Versionsbump.
- Der frühere CPU-Branch `dev/bambulab-connect-cpu` ist in der aktuellen Remote-Branchliste nicht vorhanden. Ob gelöscht oder umbenannt, bleibt ungeklärt.


## Geprüfter Gesamtstand – 15.11.2026, 03:05 MEZ
- Produktionsbranch `main`: aktueller Head `8dffe2bd9bb75c1435e65a8d6017882e9375392c` (Dokumentationscommit); letzter Laufzeitcode-Commit `cd1a6a65a0bece57f4ef922fedc907ff9c21b2df`, Adapterversion **0.4.10**. „Test and Release“ Run `43382009645`: **completed / success**.
- Der Nutzer hat den stabilen Betrieb mit drei Druckern bestätigt. Dieser Hardware-Nachweis bezieht sich auf den Main-Stand, nicht auf die noch offenen PR-Änderungen.
- Offener PR [#7](https://github.com/Apropo1710/ioBroker.bambulab-connect/pull/7), Branch `feature/multi-printer`, Head `dbbfeaad6f25f42e0b70c04c14592afc43affecf`: sechs Commits vor `main`, null dahinter. Push-Run `43593649645` und PR-Run `43593653360`: **completed / success**. Enthält u. a. `filam_bak` samt Alias, H2C-/AMS-Telemetriedefinitionen und Speicherung von `warnMessages.json` im absoluten Instanz-Datenverzeichnis. Nicht nach `main` übernommen; kein Release und noch keine erneute Live-Beobachtung nach diesen Änderungen.
- Offener PR [#8](https://github.com/Apropo1710/ioBroker.bambulab-connect/pull/8), Branch `fix/missing-ams-state-attributes`, Head `fc88de9b188a00a3509edf08b9aa5f68deebe01b`: ein Commit vor `main`. PR-Run `43616767673`: **completed / success**. Ergänzt State-Definitionen für rohe CFS-Metadaten (`cfs`) und AMS-Trockner-Ablehnungsgründe (`dry_sf_reason`); beide bleiben JSON-Text und werden nicht zusätzlich decodiert. Nicht nach `main` übernommen.
- Auf `feature/multi-printer` ist macOS vorübergehend aus der Testmatrix genommen; die jüngsten Läufe prüfen Ubuntu und Windows mit Node 22/24 sowie Lint.
- Der frühere CPU-Branch `dev/bambulab-connect-cpu` ist in der aktuellen Remote-Branchliste nicht sichtbar; Status/Fortbestand ungeklärt. Nicht als aktiven Branch voraussetzen.
- `main` bleibt der stabile Installationsbranch. Keine PR-Änderung wird durch diese Statuspflege gemergt.


**Stand: 13.11.2026**  
**Adapterversion im Paket: 0.4.10**  
**Maßgeblicher Branch: `main` (stabile Mehrdrucker-Version bereits übernommen)**  
**Betriebsstatus: Nutzer bestätigt stabilen Betrieb mit drei Druckern**

## Projektziel und Herkunft

Eigenständiger ioBroker-Adapter für BambuLab-Drucker unter dem Repository und Projektnamen `Apropo1710/ioBroker.bambulab-connect`. Die ursprüngliche Herkunftsangabe und MIT-Lizenz bleiben erhalten.

## Umgesetzte Funktionen und Korrekturen

- Mehrdrucker-Unterstützung mit getrennten Laufzeit- und Verbindungszuständen je Drucker.
- Fehlende State-Attributdefinitionen ergänzt; Firmware-Versionswerte bleiben Strings, damit führende Nullen erhalten bleiben.
- Erwartete MQTT-Keepalive-/Offline-Ereignisse erzeugen keine unnötigen Fehler beim regulären Ausschalten.
- Nicht erreichbare Drucker bleiben beim Adapterstart still; ein Drucker, der zuvor verbunden war und später die Verbindung verliert, wird separat behandelt.
- Verbindungsverlust wird als Info statt Warnung protokolliert und nennt den jeweiligen Druckernamen.
- Drucker-OTA-Firmwareupdates werden getrennt von AMS-Firmwareupdates erkannt.
- AMS-Firmwareerkennung berücksichtigt die Bambu-Modulpräfixe `ams/`, `ams_f1/`, `n3f/` und `n3s/`; Details enthalten Modultyp und Modul-ID.
- Die Rohdaten unter `mc_for_ams_firmware.firmware` werden nicht als Liste tatsächlich angeschlossener AMS-Geräte fehlinterpretiert.

## Prüfung und Stabilität

- Nutzer-Hardwaretest mit drei Druckern: nicht erreichbare Drucker bleiben beim Adapterstart still; erreichbare Drucker verbinden sich normal.
- Nutzer bestätigt am 13.11.2026, dass der Adapter stabil läuft.
- CI #161 (Startverhalten Offline-Drucker): erfolgreich.
- CI #164 (AMS-Firmwareerkennung auf feature/multi-printer): erfolgreich.
- CI #166 (Info-Log bei Verbindungsverlust): erfolgreich.
- Die AMS-Firmwarezuordnung ist durch Regressionstests für die bekannten Modulpräfixe abgedeckt. Die vollständige Zuordnung mit realen AMS-Hardwarekombinationen bleibt bei Gelegenheit weiter zu beobachten.
- CI-Ergebnisse sind keine vollständige Hardwarefreigabe; Hardwaretests werden separat dokumentiert.

## Noch offene bzw. getrennte Arbeiten

- CPU-Baseline und mögliche Optimierungen waren zuvor dem Branch `dev/bambulab-connect-cpu` zugeordnet. Dieser Branch ist in der aktuellen GitHub-Branchliste nicht sichtbar; Status und Fortbestand müssen vor einer Wiederaufnahme geklärt werden.
- Weitere Firmware-/AMS-Beobachtungen nur anhand realer Gerätedaten ergänzen.
- Nach der Übernahme nach `main` bleibt `main` der maßgebliche Haupt- und Installationsbranch; weitere Entwicklung erfolgt dort bzw. über darauf basierende Feature-Branches.

## Verbindliche Entwicklungs- und Build-Regeln

1. Vor Änderungen diese STATUS.md und die betroffenen Quelldateien lesen.
2. Zusammengehörige Änderungen bündeln; keine unnötigen Einzel-Builds, Commits oder Pushes.
3. Vor Push alle betroffenen Dateien und Zusammenhänge prüfen; lokale Tests und statische Prüfungen ausführen, soweit möglich.
4. Pro gebündeltem Stand einen CI-Lauf auslösen und währenddessen keine Folge-Commits pushen.
5. CI-Erfolg, lokale Tests und Hardwaretests klar voneinander unterscheiden.
6. Keine Installation empfehlen, solange der relevante Stand nicht ausreichend geprüft ist.
7. Herkunftshinweis und MIT-Lizenz erhalten.
8. Diese Datei nach jeder zusammenhängenden Änderung aktualisieren und bei Branch-Wechseln in den maßgeblichen Branch übernehmen.
