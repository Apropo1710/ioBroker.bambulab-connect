'use strict';

const { expect } = require('chai');
const deriveFirmwareUpdate = require('../lib/firmwareUpdate');

describe('firmware update detection', () => {
    it('detects an available OTA update from the advertised version pair', () => {
        expect(
            deriveFirmwareUpdate({
                new_version_state: 1,
                new_ver_list: [
                    { name: 'ota', cur_ver: '01.08.01', new_ver: '01.09.00' },
                    { name: 'ams/0', cur_ver: '00.00.06.44', new_ver: '00.00.06.49' },
                ],
            }),
        ).to.deep.equal({
            firmware_update_available: true,
            firmware_current_version: '01.08.01',
            firmware_available_version: '01.09.00',
        });
    });

    it('reports no update when the OTA version is already installed', () => {
        expect(
            deriveFirmwareUpdate({
                new_ver_list: [{ name: 'ota', cur_ver: '01.09.00', new_ver: '01.09.00' }],
            }),
        ).to.deep.equal({
            firmware_update_available: false,
            firmware_current_version: '01.09.00',
            firmware_available_version: '01.09.00',
        });
    });

    it('does not create a misleading state when the OTA version pair is missing or invalid', () => {
        expect(deriveFirmwareUpdate({ new_ver_list: [{ name: 'ams/0', cur_ver: '1', new_ver: '2' }] })).to.equal(null);
        expect(deriveFirmwareUpdate({ new_ver_list: [{ name: 'ota', cur_ver: '', new_ver: '01.09.00' }] })).to.equal(
            null,
        );
        expect(deriveFirmwareUpdate({})).to.equal(null);
    });

    it('compares numeric version segments rather than lexicographic strings', () => {
        expect(
            deriveFirmwareUpdate({
                new_ver_list: [{ name: 'ota', cur_ver: '01.10.00', new_ver: '01.09.99' }],
            }).firmware_update_available,
        ).to.equal(false);
    });
});
