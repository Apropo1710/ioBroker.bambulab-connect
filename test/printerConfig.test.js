'use strict';

const { expect } = require('chai');
const { getPrinters, normalizePrinter, ensureUniqueIds, ensureUniqueSerials, getStalePrinterRootIds } = require('../lib/printerConfig');

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

    it('filters duplicate serials case-insensitively and reports them', () => {
        const duplicates = [];
        const printers = ensureUniqueSerials(
            [
                { id: 'A1', name: 'A1 Mini', serial: 'SERIAL-01' },
                { id: 'X1', name: 'X1 Carbon', serial: 'serial-01' },
                { id: 'P1', name: 'P1S', serial: 'SERIAL-02' },
            ],
            (printer, reason) => duplicates.push({ id: printer.id, reason }),
        );

        expect(printers.map(printer => printer.id)).to.deep.equal(['A1', 'P1']);
        expect(duplicates).to.deep.equal([{ id: 'X1', reason: 'duplicate serial' }]);
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

    it('reserves the adapter-level info namespace for printer roots', () => {
        const printers = ensureUniqueIds([{ id: 'info' }, { id: 'INFO' }, { id: 'A1' }]);
        expect(printers.map(printer => printer.id)).to.deep.equal(['info_2', 'INFO_2', 'A1']);
    });

    it('generates unique case-insensitive IDs', () => {
        const printers = ensureUniqueIds([{ id: 'A1' }, { id: 'a1' }, { id: 'A1' }]);
        expect(printers.map(printer => printer.id)).to.deep.equal(['A1', 'a1_2', 'A1_3']);
    });

    it('identifies stale printer roots but ignores nested and active objects', () => {
        const stale = getStalePrinterRootIds(
            [
                'bambulab-connect.0.A1_Mini',
                'bambulab-connect.0.X1C',
                'bambulab-connect.0.X1C.control',
                'bambulab-connect.0.info',
                'other.0.H2C',
            ],
            'bambulab-connect.0',
            ['A1_Mini', 'H2C'],
        );

        expect(stale).to.deep.equal(['X1C']);
    });

    it('uses a stable fallback ID for empty names', () => {
        expect(normalizePrinter({ host: '10.0.0.1', serial: 'S1' }, 3).id).to.equal('S1');
    });
});
