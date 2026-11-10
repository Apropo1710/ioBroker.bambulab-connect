'use strict';

/**
 * Compare dotted numeric firmware versions without losing leading zeroes in
 * the values exposed to ioBroker.
 *
 * @param {string} current Installed firmware version.
 * @param {string} available Firmware version advertised by the printer.
 * @returns {boolean|null} True when available is newer, false when equal/older,
 * or null when either version cannot be compared safely.
 */
function isNewerFirmwareVersion(current, available) {
    if (typeof current !== 'string' || typeof available !== 'string') {
        return null;
    }
    const currentVersion = current.trim();
    const availableVersion = available.trim();
    const versionPattern = /^\d+(?:\.\d+)*$/;
    if (!versionPattern.test(currentVersion) || !versionPattern.test(availableVersion)) {
        return null;
    }
    const currentParts = currentVersion.split('.').map(Number);
    const availableParts = availableVersion.split('.').map(Number);
    const length = Math.max(currentParts.length, availableParts.length);
    for (let index = 0; index < length; index++) {
        const currentPart = currentParts[index] ?? 0;
        const availablePart = availableParts[index] ?? 0;
        if (availablePart > currentPart) {
            return true;
        }
        if (availablePart < currentPart) {
            return false;
        }
    }
    return false;
}

/**
 * Derive the printer OTA firmware update state from its advertised version list.
 *
 * @param {object} upgradeState MQTT upgrade_state payload.
 * @returns {{firmware_update_available:boolean,firmware_current_version:string,firmware_available_version:string}|null}
 *   Derived states, or null until a comparable OTA version pair is available.
 */
function deriveFirmwareUpdate(upgradeState) {
    if (!upgradeState || !Array.isArray(upgradeState.new_ver_list)) {
        return null;
    }
    const ota = upgradeState.new_ver_list.find(
        entry => entry && typeof entry === 'object' && String(entry.name).toLowerCase() === 'ota',
    );
    if (!ota) {
        return null;
    }
    const available = isNewerFirmwareVersion(ota.cur_ver, ota.new_ver);
    if (available === null) {
        return null;
    }
    return {
        firmware_update_available: available,
        firmware_current_version: ota.cur_ver.trim(),
        firmware_available_version: ota.new_ver.trim(),
    };
}

module.exports = deriveFirmwareUpdate;
