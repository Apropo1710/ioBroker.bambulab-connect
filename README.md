<img src="admin/bambulab.png" alt="Logo" width="200"/>

# Bambulab Connect

[![Test and Release](https://github.com/Apropo1710/ioBroker.bambulab-connect/actions/workflows/test-and-release.yml/badge.svg)](https://github.com/Apropo1710/ioBroker.bambulab-connect/actions/workflows/test-and-release.yml)

## Bambulab Connect – 3D-Printing adapter for ioBroker

## Project origin and license

Bambulab Connect is a community-maintained derivative of the original [ioBroker.bambulab adapter by DrozmotiX](https://github.com/DrozmotiX/ioBroker.bambulab). The original project and its contributors are acknowledged; the MIT license and original copyright notice are retained in [`LICENSE`](LICENSE).

## Getting started

With credits to [kmxak](https://forum.iobroker.net/user/kmxak), [djalexz](https://forum.iobroker.net/user/djalexz), all other involved and inspired by [this forum thread](https://forum.iobroker.net/topic/61585/bambu-lab-3d-drucker-mqtt-integration)
this adapter integrates Bambulab 3D-Printers into ioBroker.

You can use **Search for BambuLab printers** in the adapter settings to detect devices announced via local SSDP/UDP. Detected printers are added to the table automatically; their LAN access codes are not discoverable and must be entered manually. Save your current settings before starting a scan.

Add one row per BambuLab printer in the adapter settings. Each row needs an object ID,
display name (optional), IP address, access token, serial number and model. All printers
can be managed in one adapter instance; their MQTT connections and state trees are isolated.
The object ID should be a short, unique name such as `A1_Mini`, `X1C` or `H2C`.

The adapter connects locally over MQTT (no cloud connection for printer data). Access tokens
are stored using ioBroker's encrypted native configuration. Existing single-printer settings
are migrated automatically if the new printer table is empty.

## Finding the API Token and Serial Number

The location of the API token and serial number depends on your printer model:

### A1/A1 mini Series
1. Navigate to **Settings** → **Network / WLAN** on your printer display
2. Look for the **Access Code** and serial number in the network settings. Menu labels may vary by firmware.

### P1S Series  
1. Navigate to **Settings** → **Network** on your printer display
2. The access token is directly visible in network settings (no LAN mode required)
3. Serial number can be found in the same menu or in device information

### X1/X1C Series
1. Navigate to **Settings** → **Network** on your printer display  
2. The access token is directly visible in network settings
3. Serial number can be found in the same menu or in device information

**Note:** You must select your Printer model correctly in the adapter settings. X1-family printers provide push updates. P1-series printers additionally use a conservative full refresh interval (minimum 300 seconds)

## Printer model compatibility

The adapter uses the local MQTT interface shared by many Bambu Lab printers. Selecting a model enables the appropriate adapter profile; **a model appearing in the list does not by itself mean that every feature has been validated on that hardware**.

| Model | Compatibility status |
|---|---|
| A1 mini, A1 | Existing A1-family profile; hardware verification still needed per model |
| P1P, P1S | Existing P1 profile; polling is enabled |
| X1, X1 Carbon (X1C), X1E | Existing X1-family profile |
| H2D | Existing H2D-family profile |
| A2L, P2S, X2D, H2D Pro, H2S, H2C, H3C | Newly selectable / experimental; not yet hardware-validated |

The legacy series choices (A1-Series, H2D-Series, P1-Series, X1-Series) remain available for existing installations. H2C and H3C have multi-tool architectures; their tool/nozzle-specific telemetry and controls require dedicated protocol validation and must not be assumed to work merely because common MQTT status data is received.


## Supported commands

Commands are written to the states under `<printer>.control`. The adapter sends the same MQTT command to every printer model; whether a printer executes it depends on its hardware and firmware.

**None of these commands have been verified with Bambulab Connect yet.** The table shows the support documented by the original adapter; the H2C column is not documented there.

| Command | State in `<printer>.control` | X1C / X1 | P1P | P1S | A1 / A1 mini | H2C |
|---|---|---|---|---|---|---|
| Pause | `pause` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: |
| Resume | `resume` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: |
| Stop | `stop` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: |
| Homing | `homing` | :grey_question: | :grey_question: | :grey_question: | :grey_question: | :grey_question: |
| Custom G-code | `_customGcode` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: |
| Fan – tool head / part cooling | `cooling_fan_speed` | :white_check_mark: | :interrobang: if present | :white_check_mark: | :white_check_mark: | :grey_question: |
| Fan – auxiliary | `big_fan1_speed` | :white_check_mark: | :interrobang: if present | :white_check_mark: | :x: no hardware | :grey_question: |
| Fan – chamber | `big_fan2_speed` | :white_check_mark: | :interrobang: if present | :white_check_mark: | :x: no hardware | :grey_question: |
| Light – chamber | `lightChamber` | :white_check_mark: | :interrobang: if present | :white_check_mark: | :white_check_mark: | :grey_question: |
| Light – tool head logo | `lightToolHeadLogo` | :white_check_mark: | :x: no hardware | :x: no hardware | :x: no hardware | :grey_question: |
| Temperature – bed | `bed_target_temper` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: |
| Temperature – nozzle | `nozzle_target_temper` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: |
| Speed level | `spd_lvl` | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :grey_question: |

:white_check_mark: documented by the original adapter · :interrobang: depends on installed hardware · :x: hardware not present · :grey_question: not documented / not verified

The H2C is a multi-tool printer; nozzle temperature and G-code commands that address a single tool may not behave as on single-nozzle printers. G-code commands that could interfere with a running print are blocked while printing.

## Print history

`<printer>.history.jobs` holds the last 50 finished or failed print jobs as JSON (newest first). An entry is written when `gcode_state` changes from an active state (`PREPARE`, `SLICING`, `RUNNING`, `PAUSE`) to `FINISH` or `FAILED`:

```json
{ "name": "Benchy", "file": "benchy.gcode", "result": "finished", "startedAt": "2026-11-27T08:00:00.000Z",
  "endedAt": "2026-11-27T09:30:00.000Z", "durationMinutes": 90, "percent": 100, "layer": 200, "totalLayers": 200, "errorCode": null }
```

Fields the printer did not report are `null`. Jobs that end while the adapter is not running are not recorded.

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### __WORK IN PROGRESS__
-->
### __WORK IN PROGRESS__
* (Apropo1710) Print history per printer in `<printer>.history.jobs` (last 50 finished/failed jobs)

### 0.4.14 (2026-11-22)
* (Apropo1710) `err2.err_code` accepts text error codes sent by the H2C while an error is active

### 0.4.13 (2026-11-20)
* (Apropo1710) Remove the start-up credential comparison with the original `bambulab` adapter (migration leftover)
* (Apropo1710) Log credential diagnostics at debug level only

### 0.4.12 (2026-11-20)
* (Apropo1710) Add state definitions for the HMS entry fields `action` and `timestamp` sent by newer A1 firmware
* (Apropo1710) TypeScript check of the JavaScript sources is clean and runs in CI

### 0.4.11 (2026-11-19)
* (Apropo1710) Consolidated maintenance release of the multi-printer branch
* (Apropo1710) Define the filament backup attribute `filam_bak` (alias `filament_bak` kept)
* (Apropo1710) Add H2C telemetry and AMS state definitions (`cfs`, `dry_sf_reason`)
* (Apropo1710) Store `warnMessages.json` in the instance data directory
* (Apropo1710) Never treat the adapter's own `info` folder as a removed printer
* (Apropo1710) Run unit tests in CI and clean up outdated test files

### 0.4.4 – 0.4.10 (2026-11)
* (Apropo1710) Bambulab Connect: multi-printer support with separate connection state per printer
* (Apropo1710) Local printer discovery in the admin page (name, IP, serial number, model; access code stays manual)
* (Apropo1710) Quieter logs for offline printers, named info message on connection loss
* (Apropo1710) Printer OTA and AMS firmware update detection
* (Apropo1710) Model-specific access token help and additional state definitions
* (DutchmanNL & Copilot) Taken over from the original adapter: dependency updates, translation sync (#202), minimum Node.js 22 and modernised CI

### 0.4.3 (2025-09-16)
* (DutchmanNL) Improve error messages if printer is offline or not reachable.
* (DutchmanNL) Added HD2 printer to the selection menu for easier access (#142)
* (DutchmanNL) Solve several type definition issues. #203, #202, #201, #200, #199, #198
* (DutchmanNL) Implemented a buffer system to reduce CPU usage and improve performance (#145)
* (DutchmanNL & Copilot) Fix type conversion errors by replacing deprecated `tonumber` with proper `TOINTEGER`/`TOFLOAT` modifiers. #197
* (DutchmanNL & Copilot) Add missing state attribute definitions for HD2 printer during printing (height, platform, tool, mapping). Fixes #194
* (DutchmanNL & Copilot) Fix repository checker issues: update devDependencies to latest versions and correct news entries

### 0.4.1 (2025-09-13)
* (DutchmanNL & Copilot) Fix HMS error code translations timeout error handling (#183)
* (DutchmanNL & Copilot) Block dangerous G-code commands during printing for safety (#185)
* (DutchmanNL & Copilot) Fix P1S fan speed display issues - double conversion and incorrect mapping (#184)
* (DutchmanNL & Copilot) Add comprehensive API token location documentation for all Bambulab printer models (#182)

### 0.4.0 (2025-09-13)
* (DutchmanNL) Add missing state definitions to resolve adapter warnings (#181)
* (DutchmanNL) Empty finishTime and avoid time calculation when not printing (#179)
* (DutchmanNL) Fix MQTT reconnection to prevent maximum call stack size exceeded error (#177)

### 0.3.5 (2025-09-13)
* (DutchmanNL & Copilot) Fix several type mismatches #143 #139 #130
* (DutchmanNL) Updated missing definitions for full MQTT API incl H2D
* (DutchmanNL & Copilot) Fix repository checker issues and improve admin UI compatibility

Older changes can be found at [CHANGELOG_OLD.md](CHANGELOG_OLD.md).

## License
MIT License

Copyright (c) 2025-2026 DutchmanNL <oss@drozmotix.eu>
Copyright (c) 2026 Apropo1710 (Bambulab Connect modifications)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
