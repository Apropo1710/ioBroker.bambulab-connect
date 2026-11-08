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
    it('returns non-object payloads unchanged', () => {
        expect(organizeTelemetry(null)).to.equal(null);
        expect(organizeTelemetry('payload')).to.equal('payload');
    });
});
