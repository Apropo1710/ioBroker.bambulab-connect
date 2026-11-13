'use strict';

const { expect } = require('chai');
const {
    DISCOVERY_STATE_ID,
    createAdminDiscoveryResponse,
    createDiscoveryHtml,
    escapeHtml,
} = require('../lib/adminDiscoveryResponse');

describe('Admin printer discovery (state based, no config change)', () => {
    it('answers the Admin button with an empty response', () => {
        expect(createAdminDiscoveryResponse()).to.deep.equal({});
    });

    it('uses the state configured in jsonConfig', () => {
        expect(DISCOVERY_STATE_ID).to.equal('discovery.results');
    });

    it('renders values as selectable HTML', () => {
        const html = createDiscoveryHtml([{ name: 'X1 Carbon', ip: '192.168.178.60', serial: 'ABC123', model: 'X1C' }]);
        for (const value of ['X1 Carbon', '192.168.178.60', 'ABC123', 'X1C']) {
            expect(html).to.include('user-select:all');
            expect(html).to.include(value);
        }
    });

    it('filters configured printers and never leaks access tokens', () => {
        const printers = [
            { name: 'Existing', ip: '192.168.1.10', serial: 'abc123', model: 'X1C', Password: 'broadcast-token' },
            { name: 'New', ip: '192.168.1.11', serial: 'NEW456', model: 'P1S' },
        ];
        const html = createDiscoveryHtml(printers, new Set(['ABC123']));
        expect(html).to.include('New');
        expect(html).not.to.include('Existing');
        expect(html).not.to.include('broadcast-token');
    });

    it('escapes network-provided text', () => {
        const html = createDiscoveryHtml([{ name: '<img src=x onerror=alert(1)>', ip: '1.2.3.4', serial: 'S"1' }]);
        expect(html).not.to.include('<img');
        expect(html).to.include('&lt;img src=x onerror=alert(1)&gt;');
        expect(html).to.include('S&quot;1');
        expect(escapeHtml(undefined)).to.equal('');
    });

    it('handles initial state, empty discovery and missing values', () => {
        expect(createDiscoveryHtml(null)).to.include('No search has been run yet.');
        expect(createDiscoveryHtml([])).to.include('No BambuLab printers found');
        expect(createDiscoveryHtml([{ ip: '10.0.0.2' }])).to.include('10.0.0.2');
        expect(createDiscoveryHtml([{ serial: 'abc' }], new Set(['ABC']))).to.include(
            'All discovered printers are already configured.',
        );
    });

    it('supports German and English fallback', () => {
        expect(createDiscoveryHtml(null, new Set(), 'de')).to.include('noch keine Suche');
        expect(createDiscoveryHtml(null, new Set(), 'fr')).to.include('No search has been run yet.');
    });

    it('does not mutate discovered printer records', () => {
        const printers = [{ name: 'Printer', serial: 'SN', ip: '192.168.1.20' }];
        const before = JSON.parse(JSON.stringify(printers));
        createDiscoveryHtml(printers);
        expect(printers).to.deep.equal(before);
    });
});
