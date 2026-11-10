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

    it('detects firmware updates for AMS modules independently of the printer OTA update', () => {
        expect(
            deriveFirmwareUpdate({
                new_ver_list: [
                    { name: 'ota', cur_ver: '01.09.00', new_ver: '01.09.00' },
                    { name: 'ams/0', cur_ver: '00.00.06.44', new_ver: '00.00.06.49' },
                    { name: 'ams/1', cur_ver: '00.00.06.49', new_ver: '00.00.06.49' },
                ],
            }),
        ).to.deep.equal({
            firmware_update_available: false,
            firmware_current_version: '01.09.00',
            firmware_available_version: '01.09.00',
            ams_firmware_update_available: true,
            ams_firmware_update_count: 1,
            ams_firmware_update_details: JSON.stringify([
                {
                    module: 'ams/0',
                    update_available: true,
                    current_version: '00.00.06.44',
                    available_version: '00.00.06.49',
                },
                {
                    module: 'ams/1',
                    update_available: false,
                    current_version: '00.00.06.49',
                    available_version: '00.00.06.49',
                },
            ]),
        });
    });

    it('recognizes all AMS firmware module prefixes and keeps printer OTA separate', () => {
        const result = deriveFirmwareUpdate({
            new_ver_list: [
                { name: 'ota', cur_ver: '01.08.01.00', new_ver: '01.09.00.00' },
                { name: 'ams/0', cur_ver: '00.00.06.44', new_ver: '00.00.06.49' },
                { name: 'ams_f1/0', cur_ver: '00.00.06.44', new_ver: '00.00.06.49' },
                { name: 'n3f/0', cur_ver: '04.00.21.87', new_ver: '04.01.21.95' },
                { name: 'n3s/128', cur_ver: '00.00.00.10', new_ver: '00.00.00.11' },
                { name: 'mc/0', cur_ver: '1.0', new_ver: '2.0' },
            ],
        });

        expect(result.firmware_update_available).to.equal(true);
        expect(result.ams_firmware_update_available).to.equal(true);
        expect(result.ams_firmware_update_count).to.equal(4);
        expect(JSON.parse(result.ams_firmware_update_details)).to.deep.equal([
            {
                module: 'ams/0',
                module_type: 'AMS',
                module_id: 0,
                update_available: true,
                current_version: '00.00.06.44',
                available_version: '00.00.06.49',
            },
            {
                module: 'ams_f1/0',
                module_type: 'AMS Lite',
                module_id: 0,
                update_available: true,
                current_version: '00.00.06.44',
                available_version: '00.00.06.49',
            },
            {
                module: 'n3f/0',
                module_type: 'AMS 2 Pro',
                module_id: 0,
                update_available: true,
                current_version: '04.00.21.87',
                available_version: '04.01.21.95',
            },
            {
                module: 'n3s/128',
                module_type: 'AMS HT',
                module_id: 128,
                update_available: true,
                current_version: '00.00.00.10',
                available_version: '00.00.00.11',
            },
        ]);
    });

    it('does not mark an AMS update as available when all AMS versions match', () => {
        expect(
            deriveFirmwareUpdate({
                new_ver_list: [{ name: 'ams/0', cur_ver: '00.00.06.49', new_ver: '00.00.06.49' }],
            }),
        ).to.deep.equal({
            ams_firmware_update_available: false,
            ams_firmware_update_count: 0,
            ams_firmware_update_details: JSON.stringify([
                {
                    module: 'ams/0',
                    update_available: false,
                    current_version: '00.00.06.49',
                    available_version: '00.00.06.49',
                },
            ]),
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
