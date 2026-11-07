'use strict';

/**
 * Normalize the multi-printer configuration and migrate the legacy single-printer
 * settings without dropping credentials or printer-specific options.
 *
 * @param {object} config Adapter native configuration.
 * @returns {object[]} Normalized printer configuration list.
 */
function getPrinters(config = {}) {
    if (Array.isArray(config.printers) && config.printers.length > 0) {
        return config.printers
            .filter(printer => printer && typeof printer === 'object')
            .map((printer, index) => normalizePrinter(printer, index))
            .filter(printer => printer.host && printer.serial && printer.Password);
    }

    // Legacy configuration migration: retain the old single printer exactly.
    // An empty new table can be added to an existing native config by ioBroker;
    // in that case it must not hide the previously configured legacy printer.
    if (config.host && config.serial && config.Password) {
        return [
            normalizePrinter(
                {
                    id: config.serial,
                    name: config.printerName || config.printerModel || config.serial,
                    host: config.host,
                    Password: config.Password,
                    serial: config.serial,
                    printerModel: config.printerModel,
                    requestInterval: config.requestInterval,
                },
                0,
            ),
        ];
    }

    return [];
}

/**
 * @param {object} printer Printer settings.
 * @param {number} index Position in configuration.
 * @returns {object} Normalized settings.
 */
function normalizePrinter(printer, index = 0) {
    const serial = String(printer.serial || '').trim();
    const preferredId = String(printer.id || printer.name || serial || `printer_${index + 1}`).trim();
    const id = preferredId
        .normalize('NFKD')
        .replace(/[\\u0300-\\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 64) || `printer_${index + 1}`;

    return {
        ...printer,
        id,
        name: String(printer.name || preferredId),
        host: String(printer.host || '').trim(),
        Password: String(printer.Password || printer.password || ''),
        serial,
        printerModel: String(printer.printerModel || printer.model || ''),
        requestInterval: printer.requestInterval,
    };
}

/**
 * @param {object[]} printers Printer configurations.
 * @returns {object[]} Printer configurations with unique object IDs.
 */
function ensureUniqueIds(printers) {
    const used = new Set();
    return printers.map((printer, index) => {
        const base = printer.id || `printer_${index + 1}`;
        let id = base;
        let suffix = 2;
        while (used.has(id.toLowerCase())) {
            id = `${base}_${suffix++}`;
        }
        used.add(id.toLowerCase());
        return { ...printer, id };
    });
}

module.exports = { getPrinters, normalizePrinter, ensureUniqueIds };
