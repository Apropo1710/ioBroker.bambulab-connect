'use strict';

/**
 * Create an isolated runtime context for one printer while reusing the ioBroker
 * adapter API and existing single-printer implementation.
 *
 * Runtime fields are deliberately own-properties: MQTT state, queues and
 * printing status must never be shared between printers.
 *
 * @param {object} adapter The owning ioBroker adapter instance.
 * @param {object} printer Normalized printer configuration.
 * @returns {object} Printer runtime context.
 */
function createPrinterContext(adapter, printer) {
    const context = Object.create(adapter);

    context.printerId = printer.id;
    context.printerName = printer.name || printer.id;
    context.config = {
        ...adapter.config,
        host: printer.host,
        Password: printer.Password,
        serial: printer.serial,
        printerModel: printer.printerModel,
        requestInterval: printer.requestInterval ?? adapter.config.requestInterval,
    };

    context.client = null;
    context.clientConnection = {
        connected: false,
        connectError: false,
        initiated: false,
        reconnectMessageShown: false,
    };
    context.currentPrintingState = null;
    context.messageQueue = Promise.resolve();
    context.lastHmsErrorCode = null;
    context.shuttingDown = false;

    return context;
}

/**
 * Find a configured printer ID from a fully qualified ioBroker state ID.
 *
 * @param {string} stateId Fully qualified state ID.
 * @param {string} namespace Adapter namespace (e.g. "bambulab-connect.0").
 * @param {string[]} printerIds Configured printer IDs.
 * @returns {string|null} Matching printer ID or null.
 */
function getPrinterIdFromStateId(stateId, namespace, printerIds) {
    const prefix = `${namespace}.`;
    if (typeof stateId !== 'string' || !stateId.startsWith(prefix)) {
        return null;
    }

    const relativeId = stateId.slice(prefix.length);
    const firstSegment = relativeId.split('.')[0];
    return printerIds.includes(firstSegment) ? firstSegment : null;
}

/**
 * Stop a printer context and release its timers and MQTT resources.
 * Safe to call more than once.
 *
 * @param {object} context Printer runtime context.
 * @param {object} timers Shared adapter timer registry.
 * @param {(timer: any) => void} clearTimer Adapter timer clearing function.
 */
function shutdownPrinterContext(context, timers, clearTimer) {
    if (!context || context.shuttingDown) {
        return;
    }

    context.shuttingDown = true;

    for (const timerKey of [context.printerId, `${context.printerId}_dataPolling`]) {
        const timer = timers[timerKey];
        if (timer) {
            clearTimer(timer);
            timers[timerKey] = null;
        }
    }

    if (context.client) {
        const client = context.client;
        context.client = null;
        client.removeAllListeners();
        client.end(true);
    }

    context.clientConnection.connected = false;
    context.clientConnection.connectError = false;
    context.clientConnection.initiated = false;
    context.currentPrintingState = null;
    context.messageQueue = Promise.resolve();
}

/**
 * Mark a printer disconnected after its MQTT transport closes.
 *
 * @param {object} context Printer runtime context.
 * @param {Function} setState State setter.
 */
function markPrinterDisconnected(context, setState) {
    if (!context || context.shuttingDown) {
        return;
    }
    if (context.clientConnection.connected) {
        context.log.warn('Printer connection lost - this could be due to printer being powered off or network issues');
    }
    context.clientConnection.connected = false;
    setState('info.connection', false, true);
    context.clientConnection.connectError = true;
    context.clientConnection.initiated = false;
}

module.exports = { createPrinterContext, getPrinterIdFromStateId, shutdownPrinterContext, markPrinterDisconnected };
