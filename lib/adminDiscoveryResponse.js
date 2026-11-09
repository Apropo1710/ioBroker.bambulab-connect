'use strict';

const DISCOVERY_STATE_ID = 'discovery.results';

const LABELS = {
    en: {
        printer: 'Printer',
        name: 'Name',
        ip: 'IP address',
        serial: 'Serial number',
        model: 'Model',
        configured: 'Already configured',
        none: 'No BambuLab printers found. Check that the printer and ioBroker are on the same LAN/VLAN and that UDP discovery traffic is allowed.',
        initial: 'No search has been run yet.',
        hint: 'Click a value to select it, then copy it (Ctrl+C) into a new row of the printer table. Access tokens are never discovered.',
        lastScan: 'Last search',
    },
    de: {
        printer: 'Drucker',
        name: 'Name',
        ip: 'IP-Adresse',
        serial: 'Seriennummer',
        model: 'Modell',
        configured: 'Bereits konfiguriert',
        none: 'Keine BambuLab-Drucker gefunden. Prüfe, ob Drucker und ioBroker im selben LAN/VLAN sind und UDP-Suchverkehr erlaubt ist.',
        initial: 'Es wurde noch keine Suche durchgeführt.',
        hint: 'Klicke auf einen Wert, um ihn auszuwählen, und kopiere ihn (Strg+C) in eine neue Zeile der Druckertabelle. Access Tokens werden nie ermittelt.',
        lastScan: 'Letzte Suche',
    },
};

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function createDiscoveryHtml(printers, configuredSerials = new Set(), language = 'en', scannedAt = new Date()) {
    const labels = LABELS[language] || LABELS.en;
    const muted = 'opacity:.7';

    if (printers === null) {
        return '<div style="' + muted + '">' + escapeHtml(labels.initial) + '</div>';
    }

    const knownSerials = configuredSerials instanceof Set ? configuredSerials : new Set(configuredSerials || []);
    const locale = language === 'de' ? 'de-DE' : 'en-GB';
    const when = '<div style="' + muted + ';font-size:.85em;margin-top:8px">' + escapeHtml(labels.lastScan) +
        ': ' + escapeHtml(scannedAt.toLocaleString(locale)) + '</div>';

    if (!Array.isArray(printers) || !printers.length) {
        return '<div>' + escapeHtml(labels.none) + '</div>' + when;
    }

    const valueStyle = 'user-select:all;-webkit-user-select:all;cursor:text;font-family:monospace;padding:1px 6px;' +
        'border-radius:4px;background:rgba(128,128,128,.18);justify-self:start';

    const blocks = printers.map((printer, index) => {
        const serial = String(printer.serial || '').trim();
        const configured = Boolean(serial && knownSerials.has(serial.toUpperCase()));
        const rows = [
            [labels.name, printer.name],
            [labels.ip, printer.ip],
            [labels.serial, serial],
            [labels.model, printer.model],
        ].map(([label, value]) =>
            '<span style="' + muted + '">' + escapeHtml(label) + '</span>' +
            '<span style="' + valueStyle + '">' + escapeHtml(String(value || '').trim()) + '</span>',
        ).join('');
        return '<div style="border:1px solid rgba(128,128,128,.45);border-radius:6px;padding:8px 12px">' +
            '<div style="font-weight:bold">' + escapeHtml(labels.printer) + ' ' + (index + 1) +
            (configured ? ' <span style="' + muted + ';font-weight:normal">(' + escapeHtml(labels.configured) + ')</span>' : '') +
            '</div><div style="display:grid;grid-template-columns:max-content 1fr;column-gap:12px;row-gap:4px;margin-top:6px">' +
            rows + '</div></div>';
    });

    return '<div style="display:flex;flex-direction:column;gap:10px">' + blocks.join('') + '</div>' +
        '<div style="' + muted + ';margin-top:8px">' + escapeHtml(labels.hint) + '</div>' + when;
}

function createAdminDiscoveryResponse() {
    return {};
}

module.exports = { DISCOVERY_STATE_ID, createAdminDiscoveryResponse, createDiscoveryHtml, escapeHtml };
