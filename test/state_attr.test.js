const { expect } = require('chai');
const stateAttr = require('../lib/state_attr.js');

describe('State Attributes Type Compatibility', () => {
    it('should handle mixed types for id field', () => {
        const idAttr = stateAttr.id;
        expect(idAttr).to.exist;
        expect(idAttr.type).to.equal('mixed');
        expect(idAttr.role).to.equal('state');
    });

    it('should handle mixed types for info field', () => {
        const infoAttr = stateAttr.info;
        expect(infoAttr).to.exist;
        expect(infoAttr.type).to.equal('mixed');
        expect(infoAttr.role).to.equal('state');
    });

    it('defines metadata for printer name and firmware IDs', () => {
        expect(stateAttr.name.type).to.equal('string');
        expect(stateAttr.current_firmware_id.type).to.equal('number');
        expect(stateAttr.current_run_firmware_id.type).to.equal('number');
    });

    it('should have key state attributes for device functionality', () => {
        // Test some of the newly added state attributes
        expect(stateAttr.dry_time).to.exist;
        expect(stateAttr.dry_time.type).to.equal('number');
        expect(stateAttr.dry_time.unit).to.equal('min');

        expect(stateAttr.state).to.exist;
        expect(stateAttr.state.type).to.equal('number');

        expect(stateAttr.diameter).to.exist;
        expect(stateAttr.diameter.type).to.equal('number');
        expect(stateAttr.diameter.unit).to.equal('mm');

        expect(stateAttr.color).to.exist;
        expect(stateAttr.color.type).to.equal('string');
    });

    it('defines the exact filament backup attribute reported by BambuLab firmware', () => {
        expect(stateAttr.filam_bak).to.exist;
        expect(stateAttr.filam_bak.type).to.equal('string');
        expect(stateAttr.filam_bak.role).to.equal('text');
        // Retain compatibility with the previously introduced alias.
        expect(stateAttr.filament_bak.type).to.equal('string');
    });

    it('should define metadata for X1-series MQTT telemetry fields', () => {
        expect(stateAttr.print_time.type).to.equal('number');
        expect(stateAttr.rtt.type).to.equal('string');
        expect(stateAttr.retrans.type).to.equal('number');
        expect(stateAttr.mac.type).to.equal('string');
        expect(stateAttr.fun2.type).to.equal('string');
    });

    it('should have printer-specific attributes', () => {
        expect(stateAttr.aux).to.exist;
        expect(stateAttr.aux.type).to.equal('string');

        expect(stateAttr.canvas_id).to.exist;
        expect(stateAttr.canvas_id.type).to.equal('number');

        expect(stateAttr.design_id).to.exist;
        expect(stateAttr.design_id.type).to.equal('string');
    });
});