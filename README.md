<img src="admin/bambulab.png" alt="Logo" width="200"/>

# Bambulab Connect

[![Test and Release](https://github.com/Apropo1710/ioBroker.bambulab-connect/actions/workflows/test-and-release.yml/badge.svg)](https://github.com/Apropo1710/ioBroker.bambulab-connect/actions/workflows/test-and-release.yml)

## Bambulab Connect – 3D-Printing adapter for ioBroker

## Project origin and license

Bambulab Connect is a community-maintained derivative of the original [ioBroker.bambulab adapter by DrozmotiX](https://github.com/DrozmotiX/ioBroker.bambulab). The original project and its contributors are acknowledged; the MIT license and original copyright notice are retained in [`LICENSE`](LICENSE).

## Getting started

With credits to [kmxak](https://forum.iobroker.net/user/kmxak), [djalexz](https://forum.iobroker.net/user/djalexz), all other involved and inspired by [this forum thread](https://forum.iobroker.net/topic/61585/bambu-lab-3d-drucker-mqtt-integration)
this adapter integrates Bambulab 3D-Printers into ioBroker.

Please provide your Printer IP-Address, API token and serial number in adapter settings;
these are required for a local connection (no cloud involved) to your printer.
These credentials are stored locally and not shared to third parties.

## Finding the API Token and Serial Number

The location of the API token and serial number depends on your printer model:

### A1/A1 mini Series
1. Navigate to **Settings** → **Network** on your printer display
2. Enable **"LAN Mode Only"** (nur Lan-Modus)
3. Once enabled, IP address, access token, and serial number will be displayed

### P1S Series  
1. Navigate to **Settings** → **Network** on your printer display
2. The access token is directly visible in network settings (no LAN mode required)
3. Serial number can be found in the same menu or in device information

### X1/X1C Series
1. Navigate to **Settings** → **Network** on your printer display  
2. The access token is directly visible in network settings
3. Serial number can be found in the same menu or in device information

**Note:** You must select your Printer model correctly in the adapter settings. Only the X1 series allows pushing of messages, P1x series needs to request by interval setting (default every 5 seconds)

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
| Command            | X1C                 | X1                  | P1P                      | P1S                      | A1                       |
|--------------------|---------------------|---------------------|--------------------------|--------------------------|--------------------------|
| Custom g-code      | :white_check_mark:  | :white_check_mark:  | :white_check_mark:       | :white_check_mark:       | :white_check_mark:       |
| Pause              | :white_check_mark:  | :white_check_mark:  | :white_check_mark:       | :white_check_mark:       | :white_check_mark:       |
| Resume             | :white_check_mark:  | :white_check_mark:  | :white_check_mark:       | :white_check_mark:       | :white_check_mark:       |
| Stop               | :white_check_mark:  | :white_check_mark:  | :white_check_mark:       | :white_check_mark:       | :white_check_mark:       |
| Fan-Aux            | :white_check_mark:  | :white_check_mark:  | :interrobang: if present | :white_check_mark:       | :x: No hardware support  |
| Fan-Chamber        | :white_check_mark:  | :white_check_mark:  | :interrobang: if present | :white_check_mark:       | :x: No hardware support  |
| Fan-ToolHead       | :white_check_mark:  | :white_check_mark:  | :interrobang: if present | :white_check_mark:       | :white_check_mark:       |
| Light-Chamber      | :white_check_mark:  | :white_check_mark:  | :interrobang: if present | :white_check_mark:       | :white_check_mark:       |
| Light-Logo         | :white_check_mark:  | :white_check_mark:  | :x: No hardware support  | :x: No hardware support  | :x: No hardware support  |
| Temperature-Bed    | :white_check_mark:  | :white_check_mark:  | :white_check_mark:       | :white_check_mark:       | :white_check_mark:       |
| Temperature-Nozzle | :white_check_mark:  | :white_check_mark:  | :white_check_mark:       | :white_check_mark:       | :white_check_mark:       |
| Speed Level        | :white_check_mark:  | :white_check_mark:  | :white_check_mark:       | :white_check_mark:       | :white_check_mark:       |

## To-Do
[ ] Restructure/complete current control states in control folder
[ ] Optimize state attributes definitions  

## Support the original adapter author
The donation link below supports DutchmanNL, the original adapter author. It is not a donation link for the Bambulab Connect maintainer or the ioBroker project.  
[![Donate](https://raw.githubusercontent.com/DrozmotiX/ioBroker.sourceanalytix/master/admin/button.png)](http://paypal.me/DutchmanNL)

## What is Sentry.io and what is reported to the servers of that company?
Sentry.io is a service for developers to get an overview about errors from their applications. And exactly this is implemented in this adapter.

When the adapter crashes or any other Code error happens,
this error message that also appears in the ioBroker log is submitted to Sentry.
When you allow iobroker GmbH to collect diagnostic data, then also your installation ID
(this is just a unique ID **without** any additional infos about you, email, name or such) is included.
This allows Sentry to group errors and show how many unique users are affected by such an error.
All of this helps me to provide error-free adapters that basically never crash.


## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### __WORK IN PROGRESS__
-->
### __WORK IN PROGRESS__
* (DutchmanNL & Copilot) Update all dependencies to latest versions, consolidating 17 Dependabot PRs
* (DutchmanNL & Copilot) Synchronize admin translations with jsonConfig.json - add missing translations and remove orphaned keys (#202)
* (DutchmanNL) Raise minimum Node.js to 22, modernise CI (Node 24, testing-action-check v2) and release tooling, and resolve repository checker findings

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
