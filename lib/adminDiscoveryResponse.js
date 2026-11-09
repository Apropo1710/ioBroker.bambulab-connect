'use strict';

const LABELS = {
    en: {
        title: 'Discovered BambuLab printers',
        none: 'No BambuLab printers found. Check that the printer and ioBroker are on the same LAN/VLAN and that UDP discovery traffic is allowed.',
        printer: 'Printer',
        name: 'Name',
        ip: 'IP address',
        serial: 'Serial number',
        model: 'Model',
        configured: 'Already configured',
        hint: 'Copy the values into the printer table. Access tokens are never discovered.',
    },
    de: {
        title: 'Gefundene BambuLab-Drucker',
        none: 'Keine BambuLab-Drucker gefunden. Prüfe, ob Drucker und ioBroker im selben LAN/VLAN sind und UDP-Suchverkehr erlaubt ist.',
        printer: 'Drucker',
        name: 'Name',
        ip: 'IP-Adresse',
        serial: 'Seriennummer',
        model: 'Modell',
        configured: 'Bereits konfiguriert',
        hint: 'Kopiere die Werte in die Druckertabelle. Access Tokens werden nie ermittelt.',
    },
};

/**
 * Build a display-only copyDialog response for ConfigSendto without useNative.
 *
 * The response does not change configuration data and never contains access tokens.
 *
 * @param {object[]} printers Discovered printer records.
 * @param {Set<string>|string[]} configuredSerials Serial numbers already configured.
 * @param {string} [language] System language ('de' or English fallback).
 * @returns {{copyDialog: {title: string, type: string, text: string}}} Display-only copy dialog.
 */
function createAdminDiscoveryResponse(printers, configuredSerials = new Set(), language = 'en') {
    const knownSerials = configuredSerials instanceof Set ? configuredSerials : new Set(configuredSerials || []);
    const labels = LABELS[language] || LABELS.en;

    const list = (Array.isArray(printers) ? printers : []).map(printer => {
        const serial = String(printer.serial || '').trim();
        return {
            name: String(printer.name || '').trim(),
            ip: String(printer.ip || '').trim(),
            serial,
            model: String(printer.model || '').trim(),
            configured: Boolean(serial && knownSerials.has(serial.toUpperCase())),
        };
    });

    let text;
    if (!list.length) {
        text = labels.none;
    } else {
        const width = Math.max(labels.name.length, labels.ip.length, labels.serial.length, labels.model.length) + 2;
        const row = (label, value) => `${label}:`.padEnd(width) + value;
        const blocks = list.map((item, index) => {
            const lines = [
                `${labels.printer} ${index + 1}`,
                row(labels.name, item.name),
                row(labels.ip, item.ip),
                row(labels.serial, item.serial),
                row(labels.model, item.model),
            ];
            if (item.configured) {
                lines.push(`(${labels.configured})`);
            }
            return lines.join('\n');
        });
        text = `${blocks.join('\n\n')}\n\n${labels.hint}`;
    }

    return {
        copyDialog: { title: labels.title, type: 'text', text },
    };
}

module.exports = { createAdminDiscoveryResponse };
