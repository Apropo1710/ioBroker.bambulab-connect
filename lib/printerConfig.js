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
    const preferredId = String(printer.name || printer.id || serial || `printer_${index + 1}`).trim();
    const id =
        preferredId
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
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
    // `info` is reserved for adapter-wide objects (connection, diagnostics, etc.).
    // Printer roots must never shadow that namespace.
    const used = new Set(['info']);
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

/**
 * Drop duplicate printer serials to prevent two runtime clients subscribing to
 * the same MQTT topics and writing conflicting telemetry into separate trees.
 *
 * @param {object[]} printers Normalized printer configurations.
 * @param {Function} [onDuplicate] Optional callback for a duplicate entry.
 * @returns {object[]} Configurations with unique serial numbers.
 */
function ensureUniqueSerials(printers, onDuplicate = () => {}) {
    const used = new Set();
    return printers.filter(printer => {
        const serial = String(printer.serial || '')
            .trim()
            .toUpperCase();
        if (!serial) {
            onDuplicate(printer, 'missing serial');
            return false;
        }
        if (used.has(serial)) {
            onDuplicate(printer, 'duplicate serial');
            return false;
        }
        used.add(serial);
        return true;
    });
}

/**
 * Find printer-root devices left behind after a printer was removed from config.
 * Only direct children of the adapter namespace are considered; nested devices
 * and adapter-level channels are intentionally ignored.
 *
 * @param {string[]} objectIds Full ioBroker object IDs returned by the device view.
 * @param {string} namespace Adapter namespace.
 * @param {string[]} activePrinterIds Current configured printer IDs.
 * @returns {string[]} Relative printer IDs which should be deleted.
 */
function getStalePrinterRootIds(objectIds, namespace, activePrinterIds) {
    const prefix = `${namespace}.`;
    const active = new Set(activePrinterIds.map(id => String(id).toLowerCase()));

    return [...new Set(objectIds)]
        .filter(id => typeof id === 'string' && id.startsWith(prefix))
        .map(id => id.slice(prefix.length))
        .filter(relativeId => relativeId && !relativeId.includes('.'))
        .filter(relativeId => !active.has(relativeId.toLowerCase()));
}

module.exports = {
    getPrinters,
    normalizePrinter,
    ensureUniqueIds,
    ensureUniqueSerials,
    getStalePrinterRootIds,
};
