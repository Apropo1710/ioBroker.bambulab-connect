# Projektstatus – ioBroker BambuLab Connect

## Geprüfter Gesamtstand – 13.11.2026 (vormittags, MEZ)
- Maßgeblicher Branch: `main`, zuletzt geprüfter Laufzeitcode-Commit `cd1a6a65a0bece57f4ef922fedc907ff9c21b2df`, Adapterversion **0.4.10**.
- Der stabile Mehrdrucker-Stand ist bereits nach `main` übernommen; `feature/multi-printer` zeigt auf denselben Commit.
- GitHub Actions „Test and Release“ #171 (Run `43382009645`) auf `main`: **completed / success**. Zusatzlauf #172 auf `feature/multi-printer` ebenfalls erfolgreich.
- Nutzer bestätigt stabilen Betrieb mit drei Druckern.
- CPU-Optimierung bleibt getrennte Arbeit auf `dev/bambulab-connect-cpu` und ist nicht Bestandteil des stabilen `main`-Stands.
- Historische Formulierungen „wird jetzt nach main übernommen“ sind überholt; die Übernahme ist abgeschlossen.


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

- CPU-Baseline und mögliche Optimierungen laufen auf dem separaten Branch `dev/bambulab-connect-cpu`; dieser Branch ist nicht Bestandteil der hier beschriebenen stabilen Mehrdrucker-Übernahme.
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
