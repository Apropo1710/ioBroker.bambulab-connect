'use strict';

const { expect } = require('chai');
const { parseDiscoveryPacket } = require('../lib/printerDiscovery');

describe('printerDiscovery', () => {
    it('parses Bambu SSDP fields and model code', () => {
        const packet = [
            'NOTIFY * HTTP/1.1',
            'USN: uuid:01P00A123456789::urn:bambulab-com:device:BL-P001',
            'DevModel.bambu.com: BL-P001',
            'DevName.bambu.com: My X1 Carbon',
            'DevVersion.bambu.com: 01.08.00.00',
            'Location: http://192.168.1.40:2021/device',
            '',
        ].join('\r\n');

        expect(parseDiscoveryPacket(packet, '192.168.1.40')).to.deep.equal({
            ip: '192.168.1.40',
            serial: '01P00A123456789',
            name: 'My X1 Carbon',
            modelCode: 'BL-P001',
            model: 'X1C',
            firmware: '01.08.00.00',
        });
    });

    it('uses the sender IP when LOCATION is absent', () => {
        const packet = 'NOTIFY * HTTP/1.1\r\nUSN: uuid:SERIAL-1::urn:bambulab-com:device:N1\r\nDevModel.bambu.com: N1\r\n';
        expect(parseDiscoveryPacket(packet, '10.0.0.20')).to.include({ ip: '10.0.0.20', serial: 'SERIAL-1', model: 'A1 mini' });
    });

    it('ignores unrelated SSDP and non-Bambu packets', () => {
        expect(parseDiscoveryPacket('NOTIFY * HTTP/1.1\r\nUSN: uuid:abc\r\n', '192.168.1.1')).to.equal(null);
        expect(parseDiscoveryPacket('', '192.168.1.1')).to.equal(null);
    });

    it('keeps unknown model codes without guessing a friendly model', () => {
        const packet = 'USN: uuid:SERIAL-2::urn:bambulab-com:device:UNKNOWN\r\nDevModel.bambu.com: UNKNOWN\r\n';
        expect(parseDiscoveryPacket(packet, '192.168.1.2')).to.include({ modelCode: 'UNKNOWN', model: '' });
    });
});
