'use strict';

const { expect } = require('chai');
const { createPrinterContext } = require('../lib/printerRuntime');

describe('printer runtime adapter API binding', () => {
    it('binds ioBroker API methods to the owning adapter instance', () => {
        const adapter = {
            config: {},
            extendObject() {
                return this;
            },
            subscribeStates() {
                return this;
            },
            setState() {
                return this;
            },
        };

        const context = createPrinterContext(adapter, { id: 'X1CC', host: '127.0.0.1', serial: 'serial' });

        expect(context.extendObject()).to.equal(adapter);
        expect(context.subscribeStates()).to.equal(adapter);
        expect(context.setState()).to.equal(adapter);
        expect(context.printerId).to.equal('X1CC');
    });

    it('keeps printer-specific context fields independent', () => {
        const adapter = { config: {}, extendObject() {} };
        const first = createPrinterContext(adapter, { id: 'X1CC', host: '192.0.2.1', serial: 's1' });
        const second = createPrinterContext(adapter, { id: 'P1', host: '192.0.2.2', serial: 's2' });

        expect(first.printerId).to.equal('X1CC');
        expect(second.printerId).to.equal('P1');
        expect(first.config.host).to.equal('192.0.2.1');
        expect(second.config.host).to.equal('192.0.2.2');
    });
});
