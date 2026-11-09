# Projektstatus – ioBroker BambuLab Connect

**Stand: 09.11.2026**  
**Adapterversion: 0.4.10**  
**Status: Stabilitätsbeobachtung**

## Aktueller Stand

Der Adapter läuft derzeit in Version **0.4.10**. Die bisher bekannten Probleme sind behoben; aktuell sind keine offenen Bugs bekannt.

Erledigt:
- Druckersuche (Discovery) funktioniert und zeigt die Ergebnisse korrekt an.
- Admin-Problem mit „Verwerfen?“ / „Discard changes?“ behoben.
- Gelber Instanzstatus bei ausgeschaltetem/offline Drucker behoben.
- Die zuvor bekannten Probleme sind augenscheinlich gelöst.

## Aktuelle Phase

Der Adapter wird im laufenden Betrieb beobachtet.

Ziele:
- Stabilität prüfen
- Auf neu auftretende Bugs achten
- Auffälligkeiten sammeln und bei konkreten Fehlern gezielt untersuchen

**Derzeit keine aktive Feature-Entwicklung und keine geplanten Änderungen**, solange kein neuer Fehler oder konkreter Änderungsbedarf auftritt.

## Arbeitsregeln

- Keine bereits behobenen Probleme erneut als offen aufführen.
- Änderungen bündeln; keine unnötigen Einzel-Builds, Commits oder Pushes.
- Vor einem Push betroffene Dateien und Zusammenhänge prüfen und Tests durchführen, soweit möglich.
- Erst nach einem sinnvollen Arbeitspaket committen und pushen.
- Pro gebündeltem Stand einen CI-Lauf auslösen und währenddessen keine Folge-Commits pushen.
- Erfolg nur nach tatsächlicher Prüfung melden.
- CI, lokale Tests und Hardwaretests klar unterscheiden.

## Hinweis für Übergaben

Dieser Status ist die maßgebliche Momentaufnahme vom **09.11.2026**. Bei jeder relevanten Statusänderung aktualisieren und mit neuem Datum versehen. Frühere Übergaben können überholt sein.
