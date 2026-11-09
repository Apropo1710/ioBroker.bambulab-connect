'use strict';

const { expect } = require('chai');
const { parseDiscoveryPacket } = require('../lib/printerDiscovery');

describe('BambuLab printer discovery model mapping', () => {
    for (const modelCode of ['O1C', 'O1C2']) {
        it(`identifies H2C model code ${modelCode}`, () => {
            const packet = [
                'HTTP/1.1 200 OK',
                'Location: 192.168.178.170',
                'USN: 31B8BK631200400',
                `DevModel.bambu.com: ${modelCode}`,
                'DevName.bambu.com: Bambu H2C',
                '',
                '',
            ].join('\\r\\n');

            const printer = parseDiscoveryPacket(packet, '192.168.178.170');
            expect(printer).to.include({
                ip: '192.168.178.170',
                modelCode,
                model: 'H2C',
            });
        });
    }
});
