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

    it('defines the additional H2C telemetry attributes observed in live MQTT reports', () => {
        expect(stateAttr.stg_cd).to.exist;
        expect(stateAttr.stg_cd.type).to.equal('number');
        expect(stateAttr.img_id).to.exist;
        expect(stateAttr.img_id.type).to.equal('string');
        expect(stateAttr.encrypted_type).to.exist;
        expect(stateAttr.encrypted_type.type).to.equal('number');
        expect(stateAttr.pm).to.exist;
        expect(stateAttr.pm.type).to.equal('number');
        expect(stateAttr.cap_pic_enable).to.exist;
        expect(stateAttr.cap_pic_enable.type).to.equal('string');
        expect(stateAttr.job_state).to.exist;
        expect(stateAttr.job_state.type).to.equal('number');
        expect(stateAttr.upgrade_type).to.exist;
        expect(stateAttr.upgrade_type.type).to.equal('string');
        expect(stateAttr.dry_temperature).to.exist;
        expect(stateAttr.dry_temperature.type).to.equal('number');
        expect(stateAttr.dry_filament).to.exist;
        expect(stateAttr.dry_filament.type).to.equal('string');
        expect(stateAttr.dry_duration).to.exist;
        expect(stateAttr.dry_duration.type).to.equal('number');
        expect(stateAttr.tray_hall_out_bits).to.exist;
        expect(stateAttr.tray_hall_out_bits.type).to.equal('string');
        expect(stateAttr.p_t).to.exist;
        expect(stateAttr.p_t.type).to.equal('number');
        expect(stateAttr.fila_id).to.exist;
        expect(stateAttr.fila_id.type).to.equal('string');
        expect(stateAttr.color_m).to.exist;
        expect(stateAttr.color_m.type).to.equal('string');
        expect(stateAttr.step).to.exist;
        expect(stateAttr.step.type).to.equal('string');
        expect(stateAttr.pos).to.exist;
        expect(stateAttr.pos.type).to.equal('number');
        expect(stateAttr.job).to.exist;
        expect(stateAttr.job.type).to.equal('number');
        expect(stateAttr.theta_pitch).to.exist;
        expect(stateAttr.theta_pitch.type).to.equal('number');
        expect(stateAttr.fila_switch).to.exist;
        expect(stateAttr.fila_switch.type).to.equal('mixed');
        expect(stateAttr.timelapse_path).to.exist;
        expect(stateAttr.timelapse_path.type).to.equal('string');
        expect(stateAttr.print_cali_option).to.exist;
        expect(stateAttr.print_cali_option.type).to.equal('number');
        expect(stateAttr.enc_type).to.exist;
        expect(stateAttr.enc_type.type).to.equal('number');
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