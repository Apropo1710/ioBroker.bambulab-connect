'use strict';

const { expect } = require('chai');
const { createPrinterContext, getPrinterIdFromStateId, shutdownPrinterContext, markPrinterDisconnected } = require('../lib/printerRuntime');

describe('printerRuntime', () => {
    it('creates independent runtime fields for each printer', () => {
        const adapter = {
            config: { requestInterval: 300, legacy: true },
            log: {},
        };
        const first = createPrinterContext(adapter, {
            id: 'A1_Mini',
            name: 'A1 Mini',
            host: '192.168.1.10',
            Password: 'token-a',
            serial: 'SERIAL_A',
            printerModel: 'A1 mini',
        });
        const second = createPrinterContext(adapter, {
            id: 'X1C',
            name: 'X1 Carbon',
            host: '192.168.1.11',
            Password: 'token-b',
            serial: 'SERIAL_B',
            printerModel: 'X1C',
            requestInterval: 600,
        });

        expect(Object.getPrototypeOf(first)).to.equal(adapter);
        expect(first.client).to.equal(null);
        expect(second.client).to.equal(null);
        expect(first.clientConnection).not.to.equal(second.clientConnection);
        expect(first.messageQueue).not.to.equal(second.messageQueue);
        expect(first.currentPrintingState).to.equal(null);
        expect(first.config.host).to.equal('192.168.1.10');
        expect(second.config.host).to.equal('192.168.1.11');
        expect(first.config.requestInterval).to.equal(300);
        expect(second.config.requestInterval).to.equal(600);

        first.clientConnection.connected = true;
        first.currentPrintingState = 1;
        expect(second.clientConnection.connected).to.equal(false);
        expect(second.currentPrintingState).to.equal(null);
    });

    it('clears per-printer timers and closes MQTT on shutdown', () => {
        const adapter = { config: {}, log: {} };
        const context = createPrinterContext(adapter, {
            id: 'A1_Mini',
            host: '192.168.1.10',
            Password: 'token',
            serial: 'SERIAL_A',
        });
        const cleared = [];
        const timers = { A1_Mini: 'mqtt-retry', A1_Mini_dataPolling: 'polling' };
        let endedWithForce = false;
        context.client = {
            removeAllListeners: () => {},
            end: force => {
                endedWithForce = force;
            },
        };

        shutdownPrinterContext(context, timers, timer => cleared.push(timer));

        expect(context.shuttingDown).to.equal(true);
        expect(cleared).to.deep.equal(['mqtt-retry', 'polling']);
        expect(timers.A1_Mini).to.equal(null);
        expect(timers.A1_Mini_dataPolling).to.equal(null);
        expect(context.client).to.equal(null);
        expect(endedWithForce).to.equal(true);
        expect(context.clientConnection.connected).to.equal(false);
    });

    it('makes printer shutdown idempotent', () => {
        const context = createPrinterContext({ config: {}, log: {} }, { id: 'P1', serial: 'S' });
        let clearedCount = 0;
        const timers = { P1: 'timer' };
        shutdownPrinterContext(context, timers, () => clearedCount++);
        shutdownPrinterContext(context, timers, () => clearedCount++);
        expect(clearedCount).to.equal(1);
    });

    it('shuts down one printer without affecting another runtime', () => {
        const adapter = { config: {}, log: {} };
        const first = createPrinterContext(adapter, { id: 'A1_Mini', serial: 'SERIAL_A' });
        const second = createPrinterContext(adapter, { id: 'X1C', serial: 'SERIAL_B' });
        const cleared = [];
        const timers = {
            A1_Mini: 'retry-a',
            A1_Mini_dataPolling: 'poll-a',
            X1C: 'retry-b',
            X1C_dataPolling: 'poll-b',
        };
        let firstEnded = false;
        let secondEnded = false;
        first.client = {
            removeAllListeners: () => {},
            end: force => {
                firstEnded = force;
            },
        };
        second.client = {
            removeAllListeners: () => {},
            end: force => {
                secondEnded = force;
            },
        };
        first.clientConnection.connected = true;
        second.clientConnection.connected = true;
        first.currentPrintingState = 2;
        second.currentPrintingState = 3;

        shutdownPrinterContext(first, timers, timer => cleared.push(timer));

        expect(cleared).to.deep.equal(['retry-a', 'poll-a']);
        expect(timers.A1_Mini).to.equal(null);
        expect(timers.A1_Mini_dataPolling).to.equal(null);
        expect(timers.X1C).to.equal('retry-b');
        expect(timers.X1C_dataPolling).to.equal('poll-b');
        expect(firstEnded).to.equal(true);
        expect(secondEnded).to.equal(false);
        expect(first.client).to.equal(null);
        expect(second.client).not.to.equal(null);
        expect(first.clientConnection.connected).to.equal(false);
        expect(second.clientConnection.connected).to.equal(true);
        expect(first.currentPrintingState).to.equal(null);
        expect(second.currentPrintingState).to.equal(3);
    });

    it('marks the runtime disconnected on MQTT close', () => {
        const states = [];
        const adapter = { config: {}, log: { warn: () => {} } };
        const context = createPrinterContext(adapter, { id: 'P1', serial: 'S1' });
        context.clientConnection.connected = true;
        context.clientConnection.initiated = true;
        markPrinterDisconnected(context, (...args) => states.push(args));
        expect(context.clientConnection.connected).to.equal(false);
        expect(context.clientConnection.connectError).to.equal(true);
        expect(context.clientConnection.initiated).to.equal(false);
        expect(states).to.deep.equal([['info.connection', false, true]]);
    });

    it('ignores MQTT close callbacks during shutdown', () => {
        const states = [];
        const context = createPrinterContext({ config: {}, log: { warn: () => {} } }, { id: 'P1', serial: 'S1' });
        context.shuttingDown = true;
        context.clientConnection.connected = true;
        markPrinterDisconnected(context, (...args) => states.push(args));
        expect(context.clientConnection.connected).to.equal(true);
        expect(states).to.deep.equal([]);
    });

    it('routes fully qualified states to the configured printer ID', () => {
        const ids = ['A1_Mini', 'X1C', 'H2C'];
        expect(getPrinterIdFromStateId('bambulab-connect.0.A1_Mini.control.pause', 'bambulab-connect.0', ids))
            .to.equal('A1_Mini');
        expect(getPrinterIdFromStateId('bambulab-connect.0.X1C.hms.hmsErrors', 'bambulab-connect.0', ids))
            .to.equal('X1C');
        expect(getPrinterIdFromStateId('bambulab-connect.0.unknown.control.pause', 'bambulab-connect.0', ids))
            .to.equal(null);
        expect(getPrinterIdFromStateId('other.0.X1C.control.pause', 'bambulab-connect.0', ids))
            .to.equal(null);
    });
});
