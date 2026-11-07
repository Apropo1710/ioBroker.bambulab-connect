'use strict';

const { expect } = require('chai');
const { getPrinters, normalizePrinter, ensureUniqueIds } = require('../lib/printerConfig');

describe('printerConfig', () => {
    it('migrates legacy single-printer configuration without losing connection settings', () => {
        const printers = getPrinters({
            host: ' 192.168.1.20 ',
            Password: 'secret-token',
            serial: '01P00A123456789',
            printerModel: 'X1C',
            requestInterval: 30,
        });

        expect(printers).to.have.lengthOf(1);
        expect(printers[0]).to.include({
            host: '192.168.1.20',
            Password: 'secret-token',
            serial: '01P00A123456789',
            printerModel: 'X1C',
            requestInterval: 30,
        });
    });

    it('migrates legacy settings if the newly introduced printer table is empty', () => {
        const printers = getPrinters({
            printers: [],
            host: '192.168.1.20',
            Password: 'legacy-token',
            serial: 'LEGACY_SERIAL',
            printerModel: 'P1S',
        });

        expect(printers).to.have.lengthOf(1);
        expect(printers[0].Password).to.equal('legacy-token');
        expect(printers[0].serial).to.equal('LEGACY_SERIAL');
    });

    it('normalizes a list and accepts legacy lowercase password key', () => {
        const printers = getPrinters({
            printers: [
                { id: 'Mini 1', host: '10.0.0.1', serial: 'S1', password: 'token-1' },
                { id: 'X1 Carbon', host: '10.0.0.2', serial: 'S2', Password: 'token-2', model: 'X1C' },
            ],
        });

        expect(printers).to.have.lengthOf(2);
        expect(printers[0].id).to.equal('Mini_1');
        expect(printers[0].Password).to.equal('token-1');
        expect(printers[1].id).to.equal('X1_Carbon');
        expect(printers[1].printerModel).to.equal('X1C');
    });

    it('filters incomplete printer entries', () => {
        expect(getPrinters({ printers: [{ host: '10.0.0.1', serial: 'S1' }] })).to.have.lengthOf(0);
    });

    it('normalizes accented printer names to stable ASCII IDs', () => {
        const printer = normalizePrinter({
            name: 'Étage 2 – Drucker',
            host: '192.168.1.10',
            Password: 'token',
            serial: 'SERIAL',
        });

        expect(printer.id).to.equal('Etage_2_Drucker');
    });

    it('generates unique case-insensitive IDs', () => {
        const printers = ensureUniqueIds([{ id: 'A1' }, { id: 'a1' }, { id: 'A1' }]);
        expect(printers.map(printer => printer.id)).to.deep.equal(['A1', 'a1_2', 'A1_3']);
    });

    it('uses a stable fallback ID for empty names', () => {
        expect(normalizePrinter({ host: '10.0.0.1', serial: 'S1' }, 3).id).to.equal('S1');
    });
});
