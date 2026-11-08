'use strict';
const { expect } = require('chai');
const organizeTelemetry = require('../lib/telemetryStructure');

describe('Printer telemetry folder organization', () => {
    it('groups common telemetry fields by purpose', () => {
        const result = organizeTelemetry({
            nozzle_temper: 220,
            bed_temper: 60,
            mc_percent: 45,
            cooling_fan_speed: 50,
            wifi_signal: '-45dBm',
            ams_status: 1,
        });
        expect(result.temperature).to.deep.equal({ nozzle_temper: 220, bed_temper: 60 });
        expect(result.print).to.deep.equal({ mc_percent: 45 });
        expect(result.fans).to.deep.equal({ cooling_fan_speed: 50 });
        expect(result.network).to.deep.equal({ wifi_signal: '-45dBm' });
        expect(result.ams).to.deep.equal({ ams_status: 1 });
    });
    it('keeps control states at the printer root for command compatibility', () => {
        const control = { pause: true, lightChamber: false };
        const result = organizeTelemetry({ control, nozzle_temper: 20 });
        expect(result.control).to.equal(control);
        expect(result.temperature).to.deep.equal({ nozzle_temper: 20 });
    });
    it('preserves nested groups and unknown future fields', () => {
        const device = { nozzle: { type: 'HX01' } };
        const unknown = { firmware_new_field: { nested: 7 } };
        const result = organizeTelemetry({ device, unknown_field: unknown });
        expect(result.device.device).to.equal(device);
        expect(result.raw.unknown_field).to.equal(unknown);
    });

    it('moves the nested AMS units into one units folder and preserves metadata', () => {
        const units = [
            { ams_id: 0, tray: [{ id: 0, tray_type: 'PLA' }, { id: 1 }, { id: 2 }, { id: 3 }] },
            { ams_id: 1, tray: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }] },
        ];
        // Reflect the actual MQTT shape: print.ams contains metadata and
        // print.ams.ams is the array of physical AMS modules.
        const result = organizeTelemetry({
            ams: {
                ams: { ams: units, ams_status: 1, ams_exist_bits: '3' },
            },
            vt_tray: { tray_type: 'PETG' },
        });
        expect(result.ams.units).to.deep.equal(units);
        expect(result.ams.ams_status).to.equal(1);
        expect(result.ams.ams_exist_bits).to.equal('3');
        expect(result.ams).not.to.have.property('ams');
        expect(result.ams.units).to.have.length(2);
        expect(result.ams.units[0].tray).to.have.length(4);
        expect(result.ams.units[1].tray).to.have.length(4);
        expect(result.ams.vt_tray).to.deep.equal({ tray_type: 'PETG' });
    });

    it('returns non-object payloads unchanged', () => {
        expect(organizeTelemetry(null)).to.equal(null);
        expect(organizeTelemetry('payload')).to.equal('payload');
    });
});
