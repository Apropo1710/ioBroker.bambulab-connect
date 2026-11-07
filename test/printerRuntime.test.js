'use strict';

const { expect } = require('chai');
const { createPrinterContext, getPrinterIdFromStateId } = require('../lib/printerRuntime');

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
