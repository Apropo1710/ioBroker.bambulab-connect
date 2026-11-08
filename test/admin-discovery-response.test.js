'use strict';

const { expect } = require('chai');
const { createAdminDiscoveryResponse } = require('../lib/adminDiscoveryResponse');

describe('Admin printer discovery response contract (Admin 8.3.5 / json-config 10.1.8)', () => {
    it('returns native.printers without triggering an immediate config save', () => {
        const rows = [
            {
                name: 'X1CC',
                host: '192.168.178.60',
                serial: 'ABC123',
                Password: '',
                printerModel: 'X1 Carbon (X1C)',
                requestInterval: 300,
            },
        ];

        const response = createAdminDiscoveryResponse(rows);

        expect(response).to.have.keys(['native']);
        expect(response.native).to.have.keys(['printers']);
        expect(response.native.printers).to.deep.equal(rows);
        expect(response).not.to.have.property('saveConfig');
    });

    it('preserves existing rows and discovered rows in the returned table', () => {
        const existing = [{ name: 'Existing', serial: 'OLD', Password: 'secret' }];
        const discovered = [{ name: 'New', serial: 'NEW', Password: '' }];
        const response = createAdminDiscoveryResponse([...existing, ...discovered]);

        expect(response.native.printers).to.deep.equal([...existing, ...discovered]);
        expect(response.native.printers[0].Password).to.equal('secret');
        expect(response.native.printers[1].Password).to.equal('');
    });

    it('does not mutate the supplied table array', () => {
        const rows = [{ name: 'Printer', serial: 'SN' }];
        const before = rows.map(row => ({ ...row }));

        createAdminDiscoveryResponse(rows);

        expect(rows).to.deep.equal(before);
    });
});
