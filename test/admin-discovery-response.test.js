'use strict';

const { expect } = require('chai');
const { createAdminDiscoveryResponse } = require('../lib/adminDiscoveryResponse');

describe('Admin printer discovery response contract (transient json-config data)', () => {
    it('returns display-only discovery data without touching printer rows or requesting a save', () => {
        const printers = [
            {
                name: 'X1 Carbon',
                ip: '192.168.178.60',
                serial: 'ABC123',
                model: 'X1C',
            },
        ];

        const response = createAdminDiscoveryResponse(printers);

        expect(response).to.have.keys(['native']);
        expect(response.native).to.have.keys(['_discoveryResults']);
        expect(response.native._discoveryResults).to.deep.equal([
            {
                name: 'X1 Carbon',
                ip: '192.168.178.60',
                serial: 'ABC123',
                model: 'X1C',
                configured: false,
            },
        ]);
        expect(response).not.to.have.property('saveConfig');
        expect(response.native).not.to.have.property('printers');
    });

    it('marks existing printers as configured without returning their access tokens', () => {
        const discovered = [
            { name: 'Existing', ip: '192.168.1.10', serial: 'abc123', model: 'X1C', Password: 'broadcast-token' },
            { name: 'New', ip: '192.168.1.11', serial: 'NEW456', model: 'P1S' },
        ];

        const response = createAdminDiscoveryResponse(discovered, new Set(['ABC123']));

        expect(response.native._discoveryResults[0].configured).to.equal(true);
        expect(response.native._discoveryResults[1].configured).to.equal(false);
        expect(JSON.stringify(response)).not.to.include('broadcast-token');
        expect(response.native._discoveryResults[0]).not.to.have.property('Password');
    });

    it('normalizes absent values to empty strings and handles empty discovery', () => {
        expect(createAdminDiscoveryResponse([]).native._discoveryResults).to.deep.equal([]);
        expect(createAdminDiscoveryResponse([{ ip: '10.0.0.2' }]).native._discoveryResults[0]).to.deep.equal({
            name: '',
            ip: '10.0.0.2',
            serial: '',
            model: '',
            configured: false,
        });
    });

    it('does not mutate discovered printer records', () => {
        const printers = [{ name: 'Printer', serial: 'SN', ip: '192.168.1.20' }];
        const before = JSON.parse(JSON.stringify(printers));

        createAdminDiscoveryResponse(printers);

        expect(printers).to.deep.equal(before);
    });
});
