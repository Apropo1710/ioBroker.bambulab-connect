# Projektstatus – BambuLab Connect

Zuletzt aktualisiert: 11.11.2026  
Repository: https://github.com/Apropo1710/ioBroker.bambulab-connect  
Hauptbranch: `main`  
Bekannte Entwicklungsbranches: `feature/multi-printer`, `dev/bambulab-connect-cpu` sowie mehrere gezielte Fix-Branches (siehe GitHub).

> Diese Datei ist die zentrale Übergabe für neue Chats. Vor jeder Arbeit zuerst lesen und nach jeder zusammenhängenden Änderung aktualisieren.

## Projektziel und Herkunft
Eigenständiger ioBroker-Adapter auf Basis des BambuLab-Adapters. Herkunftshinweis und MIT-Lizenz des ursprünglichen Projekts müssen erhalten bleiben.

## Letzter bekannter Stand aus dem Projektverlauf
- Multi-Printer-Entwicklung auf `feature/multi-printer`.
- AMS-/Telemetrie-Struktur erfolgreich getestet.
- CPU-Optimierung ist ein Entwicklungsziel; eine belastbare CPU-Baseline war noch offen.
- Letzter bekannter CI-Stand im Verlauf: CI #90 grün (Lint/Check plus Adaptertests auf Ubuntu, Windows und macOS).
- Damals bekannte Versionsanzeige: `0.4.3+feature`. Vor weiteren Versionsangaben direkt im Repository/Artefakt prüfen.

## Offene Arbeiten / Beobachtungspunkte
- CPU-Baseline und Optimierungen weiter messen; unveränderte States unterdrücken, Objekt-Cache, verzögertes SILLY-Logging und MQTT-Queue nur mit Messung/Tests verändern.
- Offline-/ausgeschaltete Drucker: wiederholte Keepalive-Timeouts/Verbindungsverluste pro Offline-Phase nur einmal als Warnung ausgeben; automatische Reconnect-Meldungen im 30-Sekunden-Takt im normalen Log unterdrücken oder auf Debug reduzieren; erfolgreiche Wiederverbindung einmalig als Info melden. Reconnect-Funktion selbst nicht verändern.
- Ursache möglicher doppelter Logmeldungen untersuchen.
- Warnungen vom 09.11.2026 ca. 17:46:51 beobachten: `State attribute definition missing` für `filament_bak` (Stringwert `12`), `new_release_type` (`3`), `cur_release_type` (`3`), `new_ver` (`01.09.00`) und `cur_ver` (`01.08.01`). Noch ungeklärter Beobachtungspunkt, kein bestätigter Bug. Bei gezielter Analyse Herkunft der Attribute und fehlende ioBroker-State-Definitionen prüfen.
- Die Log-Beruhigung war ausdrücklich nicht Teil von Version 0.4.10; zunächst Stabilitätsbeobachtung, danach gebündelt umsetzen.
- Keine Änderungen allein aufgrund des ungeklärten Attribut-Warnungspunkts, solange die Stabilitätsbeobachtung läuft.

## Arbeits- und Release-Regeln
1. Vor Änderungen STATUS.md und relevante Quelldateien lesen.
2. Nach jeder zusammenhängenden Änderung STATUS.md im selben Commit aktualisieren.
3. CI und Build für den exakten Commit prüfen; Ergebnisse dokumentieren.
4. Reconnect-Verhalten bei Log-Änderungen nicht unbeabsichtigt verändern.
5. Herkunftshinweis und MIT-Lizenz erhalten.
6. Bei Chatwechsel hier beginnen; offene Beobachtungspunkte nicht als bestätigte Fehler behandeln.
