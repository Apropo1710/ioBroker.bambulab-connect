'use strict';

/**
 * Build a safe response for Admin json-config's ConfigSendto component.
 * Discovery results are kept in the unsaved Admin form as display-only data.
 * Printer table entries and access tokens are intentionally not returned.
 *
 * @param {object[]} printers discovered printer records
 * @param {Set<string>} configuredSerials serial numbers already configured
 * @returns {{native: {discoveryResults: object[]}}} Admin response containing display-only printer data.
 */
function createAdminDiscoveryResponse(printers, configuredSerials = new Set()) {
    const knownSerials = configuredSerials instanceof Set ? configuredSerials : new Set(configuredSerials || []);

    const discoveryResults = (Array.isArray(printers) ? printers : []).map(printer => {
        const serial = String(printer.serial || '').trim();
        return {
            name: String(printer.name || '').trim(),
            ip: String(printer.ip || '').trim(),
            serial,
            model: String(printer.model || '').trim(),
            configured: Boolean(serial && knownSerials.has(serial.toUpperCase())),
        };
    });

    return {
        native: { discoveryResults },
    };
}

module.exports = { createAdminDiscoveryResponse };
