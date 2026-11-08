'use strict';

/**
 * Arrange flat MQTT printer telemetry into user-friendly ioBroker folders.
 * Delta payloads must retain every key, including unknown future fields.
 * The control channel intentionally stays at <printer>.control for compatibility.
 */
const groups = {
    status: [
        'online',
        'state',
        'stg_cur',
        'gcode_state',
        'err',
        'ap_err',
        'fail_reason',
        'mc_err',
        'mc_print_error_code',
        'print_error',
        'mc_action',
        'mc_stage',
        'mc_print_stage',
        'mc_print_sub_stage',
        'print_real_action',
        'print_gcode_action',
        'print_type',
        'doorOpen',
        'home_flag',
        'hw_switch_state',
        'sdcard',
        'force_upgrade',
        'upgrade_state',
        'printer',
        'hms',
    ],
    print: [
        'file',
        'gcode_file',
        'gcode_file_prepare_percent',
        'gcode_start_time',
        'gcode_start_timeFormatted',
        'finishTime',
        'mc_remaining_time',
        'remain_time',
        'mc_percent',
        'percent',
        'prepare_per',
        'layer_num',
        'total_layer_num',
        'queue',
        'queue_est',
        'queue_number',
        'queue_sts',
        'queue_total',
        'job_id',
        'task_id',
        'subtask_id',
        'subtask_name',
        'plate_cnt',
        'plate_id',
        'plate_idx',
        'plate_type',
        'project_id',
        'design_id',
        'profile_id',
        'sequence_id',
        'batch_id',
        'print_time',
        'print_duration',
        'print_time_left',
        'job',
        'print',
    ],
    temperature: [
        'bed_temp',
        'bed_temper',
        'bed_target_temper',
        'nozzle_temper',
        'nozzle_target_temper',
        'chamber_temper',
        'chamber_temp',
        'temperature',
        'temp',
        'target_temp',
    ],
    fans: [
        'cooling_fan_speed',
        'heatbreak_fan_speed',
        'big_fan1_speed',
        'big_fan2_speed',
        'aux_part_fan',
        'fan_gear',
        'fan_speed',
    ],
    ams: ['ams', 'ams_status', 'ams_rfid_status', 'vir_slot', 'vt_tray'],
    camera: ['ipcam', 'xcam', 'xcam_status'],
    network: ['net', 'wifi_signal', 'mac', 'rtt', 'retrans'],
    device: [
        'device',
        'info',
        'model_id',
        'model',
        'ver',
        'version',
        'nozzle_diameter',
        'nozzle_type',
        'cfg',
        'cali_version',
        'canvas_id',
        'fun',
        'fun2',
        '3D',
        'care',
    ],
    lighting: ['lights_report', 'light_status'],
    maintenance: ['maintenance', 'service', 'calibration'],
};
const keyToGroup = new Map();
for (const [group, keys] of Object.entries(groups)) {
    for (const key of keys) {
        keyToGroup.set(key, group);
    }
}

/**
 * Convert a printer telemetry payload into grouped state objects.
 *
 * @param {object} payload MQTT printer report
 * @returns {object} Grouped telemetry payload
 */
function organizeTelemetry(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return payload;
    }
    const result = {};
    const raw = {};
    for (const [key, value] of Object.entries(payload)) {
        if (key === 'control') {
            result.control = value;
            continue;
        }
        const group = keyToGroup.get(key);
        if (group) {
            result[group] ??= {};
            // Avoid the redundant AMS -> ams -> [unit] hierarchy. The raw
            // MQTT "ams" array represents independently attached AMS units.
            if (group === 'ams' && key === 'ams') {
                result.ams.units = value;
            } else {
                result[group][key] = value;
            }
        } else {
            raw[key] = value;
        }
    }
    if (Object.keys(raw).length > 0) {
        result.raw = raw;
    }
    return result;
}
module.exports = organizeTelemetry;
