const state_attrb = {
    // Metadata for printer identity and firmware fields seen in newer MQTT reports.
    name: {
        name: 'Name',
        type: 'string',
        role: 'text',
    },
    current_firmware_id: {
        name: 'Current firmware ID',
        type: 'number',
        role: 'value',
    },
    current_run_firmware_id: {
        name: 'Current running firmware ID',
        type: 'number',
        role: 'value',
    },
    // X1-series MQTT fields observed in telemetry but missing from older state definitions.
    print_time: {
        name: 'Print time',
        type: 'number',
        role: 'value',
        unit: 's',
    },
    rtt: {
        name: 'MQTT round-trip time',
        type: 'string',
        role: 'text',
    },
    retrans: {
        name: 'MQTT retransmissions',
        type: 'number',
        role: 'value',
    },
    mac: {
        name: 'Printer MAC address',
        type: 'string',
        role: 'text',
    },
    fun2: {
        name: 'Printer function flag',
        type: 'string',
        role: 'text',
    },
    cooling_fan_speed: {
        name: 'Cooling fan Speed',
        modify: ['TOINTEGER'],
        type: 'number',
        unit: '%',
        role: 'level',
        write: true,
    },
    heatbreak_fan_speed: {
        name: 'Heatbreak fan Speed',
        modify: ['TOINTEGER'],
        type: 'number',
        unit: '%',
        role: 'level',
    },
    big_fan1_speed: {
        name: 'AUX Fan 1 Speed',
        modify: ['TOINTEGER'],
        type: 'number',
        unit: '%',
        role: 'level',
        write: true,
    },
    big_fan2_speed: {
        name: 'Chamber Fan 2 Speed',
        modify: ['TOINTEGER'],
        type: 'number',
        unit: '%',
        role: 'level',
        write: true,
    },
    mc_remaining_time: {
        name: 'Print job time remaining (HH:MM)',
        type: 'string',
        role: 'value.time',
    },
    lower_limit: {
        name: 'Expected Finish Time of current print',
        type: 'string',
        role: 'value.time',
    },
    finishTime: {
        name: 'Expected Finish Time of current print',
        type: 'string',
        role: 'value.time',
    },
    stg_cur: {
        name: 'Stage Parser',
        type: 'string',
    },
    spd_lvl: {
        name: 'Speed Profile',
        type: 'number',
        role: 'level',
        write: true,
        modify: ['TOINTEGER'],
        states: {
            1: 'silent',
            2: 'standard',
            3: 'sport',
            4: 'ludicrous',
        },
    },
    bed_temp: {
        name: 'Bed Temperature',
        type: 'mixed',
        unit: '°C',
        role: 'value.temperature',
        modify: ['TOFLOAT'],
    },
    bed_temper: {
        name: 'Bed current Temperature',
        type: 'number',
        unit: '°C',
        role: 'value.temperature',
        modify: ['TOFLOAT'],
    },
    bed_target_temper: {
        name: 'Bed Target Temperature',
        type: 'number',
        unit: '°C',
        role: 'level.temperature',
        write: true,
        modify: ['TOFLOAT'],
    },
    chamber_temper: {
        name: 'Chamber Temperature',
        type: 'number',
        unit: '°C',
        role: 'value.temperature',
        modify: ['TOFLOAT'],
    },
    cham_temp: {
        name: 'Chamber Temperature',
        type: 'number',
        unit: '°C',
        role: 'value.temperature',
        modify: ['TOFLOAT'],
    },
    nozzle_temper: {
        name: 'Nozzle current Temperature',
        type: 'number',
        unit: '°C',
        role: 'value.temperature',
        modify: ['TOFLOAT'],
    },
    nozzle_target_temper: {
        name: 'Nozzle target Temperature',
        type: 'number',
        unit: '°C',
        write: true,
        role: 'level.temperature',
        modify: ['TOFLOAT'],
    },
    mc_percent: {
        name: 'Printjob finish in percent',
        type: 'number',
        unit: '%',
        write: false,
        role: 'level',
        modify: ['TOFLOAT'],
    },
    mc_print_line_number: {
        name: 'Printjob line number',
        type: 'mixed',
        write: false,
        role: 'value',
        modify: ['TOINTEGER'],
    },
    lightChamber: {
        name: 'Chamber Light',
        type: 'boolean',
        role: 'switch.light',
        read: true,
        write: true,
        def: false,
    },

    humidity: {
        name: 'Humidity',
        type: 'string',
        role: 'value.humidity',
    },
    id: {
        name: 'ID',
        type: 'mixed',
        role: 'text',
    },
    temp: {
        name: 'Temperature',
        type: 'mixed',
        role: 'value.temperature',
    },
    bed_temp_type: {
        name: 'Type of bed',
        type: 'string',
        role: 'text',
    },
    cali_idx: {
        name: 'cali_idx',
        type: 'number',
        role: 'value',
    },
    cols: {
        name: 'Color',
        type: 'string',
        role: 'text',
    },
    ctype: {
        name: 'ctype',
        type: 'number',
        role: 'value',
    },
    drying_temp: {
        name: 'Recommended drying temperature (filament profile)',
        type: 'string',
        role: 'value.temperature',
    },
    drying_time: {
        name: 'Recommended drying duration (filament profile)',
        type: 'string',
        role: 'value',
        unit: 'h',
    },
    nozzle_temp_max: {
        name: 'Maximum nozzle temperature',
        type: 'string',
        role: 'value.temperature',
    },
    nozzle_temp_min: {
        name: 'Minimum nozzle temperature',
        type: 'string',
        role: 'value.temperature',
    },
    remain: {
        name: 'Filament remaining',
        type: 'number',
        role: 'value.level',
        unit: '%',
    },
    tag_uid: {
        name: 'Tag UID',
        type: 'string',
        role: 'text',
    },
    tray_color: {
        name: 'Filament color',
        type: 'string',
        role: 'text',
    },
    tray_diameter: {
        name: 'Filament diameter',
        type: 'string',
        role: 'value',
    },
    tray_id_name: {
        name: 'Name of tray ID',
        type: 'string',
        role: 'text',
    },
    tray_info_idx: {
        name: 'Tray IDX information',
        type: 'string',
        role: 'value',
    },
    tray_sub_brands: {
        name: 'Filament Brand',
        type: 'string',
        role: 'text',
    },
    tray_type: {
        name: 'Filament type',
        type: 'string',
        role: 'text',
    },
    tray_uuid: {
        name: 'Filament UUID',
        type: 'string',
        role: 'text',
    },
    // Calculated/estimated remaining filament mass, not measured by a scale.
    remain_g: {
        name: 'Estimated filament remaining (weight)',
        type: 'number',
        role: 'value',
        unit: 'g',
    },
    tray_weight: {
        name: 'Nominal spool weight (RFID)',
        type: 'string',
        role: 'value',
        unit: 'g',
    },
    xcam_info: {
        name: 'Xcam info',
        type: 'string',
        role: 'text',
    },
    ams_exist_bits: {
        name: 'AMS used',
        type: 'string',
        role: 'value',
    },
    insert_flag: {
        name: 'Insert Flag',
        type: 'boolean',
        role: 'indicator',
    },
    power_on_flag: {
        name: 'Power on Flag',
        type: 'boolean',
        role: 'indicator',
    },
    tray_exist_bits: {
        name: 'Filament present',
        type: 'string',
        role: 'value',
    },
    tray_is_bbl_bits: {
        name: 'Filament is bbl',
        type: 'string',
        role: 'value',
    },
    tray_now: {
        name: 'Current used Filament',
        type: 'string',
        role: 'text',
    },
    tray_pre: {
        name: 'Previous used Filament',
        type: 'string',
        role: 'text',
    },
    tray_read_done_bits: {
        name: 'Filament initiated',
        type: 'string',
        role: 'value',
    },
    tray_reading_bits: {
        name: 'Filament initiated',
        type: 'string',
        role: 'value',
    },
    tray_tar: {
        name: 'Tray Tar',
        type: 'string',
        role: 'text',
    },
    version: {
        name: 'Version',
        type: 'number',
        role: 'value',
    },
    ams_rfid_statu: {
        name: 'AMS RFID stats',
        type: 'number',
        role: 'value',
    },
    ams_status: {
        name: 'AMS status',
        type: 'number',
        role: 'value',
    },
    attr: {
        name: 'Attribute',
        type: 'number',
        role: 'value',
    },
    aux_part_fan: {
        name: 'AUX part fan active',
        type: 'boolean',
        role: 'indicator',
    },
    cali_version: {
        name: 'Calibration version',
        type: 'number',
        role: 'value',
    },
    code: {
        name: 'Code',
        type: 'number',
        role: 'value',
    },
    command: {
        name: 'Last MQTT command sent to printer',
        type: 'string',
        role: 'text',
    },
    fail_reason: {
        name: 'Command fail reason',
        type: 'string',
        role: 'text',
    },
    fan_gear: {
        name: 'Fan Gear',
        type: 'number',
        role: 'value',
    },
    force_upgrade: {
        name: 'Force Upgrade',
        type: 'boolean',
        role: 'indicator',
    },

    gcode_file: {
        name: 'Current used gcode file',
        type: 'string',
        role: 'text',
    },
    gcode_file_prepare_percent: {
        name: 'gCode file preparation status',
        type: 'string',
        role: 'level',
        unit: '%',
    },
    gcode_start_time: {
        name: 'gCode start time',
        type: 'string',
        role: 'value.time',
    },
    gcode_state: {
        name: 'gCode status',
        type: 'string',
        role: 'text',
    },
    home_flag: {
        name: 'Home Flag',
        type: 'number',
        role: 'indicator',
    },
    hw_switch_state: {
        name: 'Hardware Switch state',
        type: 'number',
        role: 'value',
    },
    ipcam_dev: {
        name: 'IP-Cam present',
        type: 'string',
        role: 'text',
    },
    ipcam_record: {
        name: 'IP-Cam recording',
        type: 'string',
        role: 'text',
    },
    mode_bits: {
        name: 'Mode',
        type: 'number',
        role: 'value',
    },
    resolution: {
        name: 'Camera resolution',
        type: 'string',
        role: 'text',
    },
    rtsp_url: {
        name: 'Camera RTSP stream URL',
        type: 'string',
        role: 'text.url',
    },
    timelapse: {
        name: 'Timelaps activation status',
        type: 'string',
        role: 'text',
    },
    tutk_server: {
        name: 'tutk server active',
        type: 'string',
        role: 'text',
    },
    layer_num: {
        name: 'Current layer',
        type: 'number',
        role: 'value',
        modify: ['TOINTEGER'],
    },
    k: {
        name: 'Flow factor K (filament)',
        type: 'mixed',
        role: 'value',
        modify: ['TOFLOAT'],
    },
    lifecycle: {
        name: 'Lifecycle type',
        type: 'string',
        role: 'text',
    },
    mode: {
        name: 'Modus',
        type: 'mixed',
        role: 'value',
    },
    node: {
        name: 'Node',
        type: 'string',
        role: 'text',
    },
    n: {
        name: 'N',
        type: 'number',
        role: 'value',
    },
    maintain: {
        name: 'Maintain',
        type: 'number',
        role: 'value',
    },
    mc_print_error_code: {
        name: 'Print error code',
        type: 'string',
        role: 'value',
    },
    mc_print_stage: {
        name: 'Print stage',
        type: 'string',
        role: 'text',
    },
    mc_print_sub_stage: {
        name: 'Print sub-stage',
        type: 'number',
        role: 'value',
    },
    mess_production_state: {
        name: 'Production State',
        type: 'string',
        role: 'text',
    },
    msg: {
        name: 'Message',
        type: 'mixed',
        role: 'text',
    },
    nozzle_diameter: {
        name: 'Nozzle_Diameter',
        type: 'string',
        role: 'value',
    },
    nozzle_type: {
        name: 'Nozzle type',
        type: 'string',
        role: 'text',
    },
    ahb: {
        type: 'boolean',
        role: 'indicator',
    },
    ext: {
        type: 'boolean',
        role: 'indicator',
    },
    print_error: {
        name: 'Print error',
        type: 'number',
        role: 'value',
    },
    print_gcode_action: {
        name: 'Print gCode action',
        type: 'number',
        role: 'value',
    },
    print_real_action: {
        name: 'Print real action',
        type: 'number',
        role: 'value',
    },
    print_type: {
        name: 'Print type',
        type: 'string',
        role: 'text',
    },
    profile_id: {
        name: 'Profile ID',
        type: 'string',
        role: 'text',
    },
    project_id: {
        name: 'Project ID',
        type: 'string',
        role: 'text',
    },
    queue_est: {
        name: 'Queue estimate',
        type: 'number',
        role: 'value',
    },
    queue_number: {
        name: 'Queue number',
        type: 'number',
        role: 'value',
    },
    queue_sts: {
        name: 'Queue sts',
        type: 'number',
        role: 'value',
    },
    queue_total: {
        name: 'Queue total',
        type: 'number',
        role: 'value',
    },
    sdcard: {
        name: 'SD0Card present',
        type: 'boolean',
        role: 'indicator',
    },
    sequence_id: {
        name: 'Current sequence ID',
        type: 'mixed',
        role: 'text',
    },
    spd_mag: {
        type: 'mixed',
        role: 'level',
        unit: '%',
    },
    stg: {
        name: 'Stage',
        type: 'string',
        role: 'text',
    },
    subtask_id: {
        name: 'Subtask ID',
        type: 'string',
        role: 'text',
    },
    subtask_name: {
        name: 'Subtask name',
        type: 'string',
        role: 'text',
    },
    tray_time: {
        name: 'Recommended drying duration (filament profile)',
        type: 'string',
        role: 'value',
        unit: 'h',
    },
    tray_temp: {
        name: 'Tray Temperature',
        type: 'string',
        role: 'value.temperature',
    },
    task_id: {
        name: 'Task ID',
        type: 'string',
        role: 'text',
    },
    total_layer_num: {
        name: 'Total layers',
        type: 'number',
        role: 'value',
        modify: ['TOINTEGER'],
    },
    ahb_new_version_number: {
        name: 'Printer new version number',
        type: 'string',
        role: 'text',
    },
    ams_new_version_number: {
        name: 'AMS new version number',
        type: 'string',
        role: 'text',
    },
    consistency_request: {
        name: 'Consistent request',
        type: 'boolean',
        role: 'indicator',
    },
    dis_state: {
        type: 'number',
        role: 'value',
    },
    err_code: {
        name: 'Error Code',
        type: 'number',
        role: 'value',
    },
    ext_new_version_number: {
        name: 'Extended new version number',
        type: 'string',
        role: 'text',
    },
    idx: {
        name: 'IDx',
        type: 'number',
        role: 'value',
    },
    idx1: {
        name: 'IDx1',
        type: 'number',
        role: 'value',
    },
    mask: {
        name: 'mask',
        type: 'number',
        role: 'value',
    },
    ip: {
        name: 'ip',
        type: 'number',
        role: 'value',
    },
    conf: {
        name: 'conf',
        type: 'number',
        role: 'value',
    },
    fan: {
        name: 'fan',
        type: 'number',
        role: 'value',
    },
    ctt: {
        name: 'ctt',
        type: 'number',
        role: 'value',
    },
    info: {
        name: 'info',
        type: 'mixed',
        role: 'value',
    },
    job_id: {
        name: 'conf',
        type: 'string',
        role: 'text',
    },
    agora_service: {
        name: 'agora_service',
        type: 'string',
        role: 'text',
    },
    ams_exist_bits_raw: {
        name: 'ams_exist_bits_raw',
        type: 'string',
        role: 'value',
    },
    message: {
        name: 'Message',
        type: 'string',
        role: 'text',
    },
    module: {
        name: 'xxxxx',
        type: 'string',
        role: 'text',
    },
    new_version_state: {
        name: 'New Version State',
        type: 'number',
        role: 'value',
    },
    ota_new_version_number: {
        name: 'New OTA Version number',
        type: 'string',
        role: 'text',
    },
    progress: {
        name: 'Current progress',
        type: 'mixed',
        role: 'level',
        unit: '%',
    },
    sn: {
        name: 'Serial number',
        type: 'string',
        role: 'text',
    },
    status: {
        name: 'Current status',
        type: 'string',
        role: 'text',
    },

    file_size: {
        name: 'Size of gCode file',
        type: 'number',
        role: 'value',
    },
    finish_size: {
        name: 'Finished size',
        type: 'number',
        role: 'value',
    },
    oss_url: {
        name: 'OSS URL',
        type: 'string',
        role: 'text.url',
    },
    speed: {
        name: 'Current speed setting',
        type: 'number',
        role: 'value.speed',
    },
    time_remaining: {
        name: 'Time remaining',
        type: 'number',
        role: 'value.time',
    },
    trouble_id: {
        name: 'Trouble ID',
        type: 'string',
        role: 'text',
    },
    wifi_signal: {
        name: 'Wifi signal strength',
        type: 'string',
        role: 'value',
    },
    allow_skip_parts: {
        name: 'Allow to skip parts',
        type: 'boolean',
        role: 'switch.mode',
    },
    buildplate_marker_detector: {
        name: 'Build plate marker detector enabled',
        type: 'boolean',
        role: 'switch.mode',
    },
    first_layer_inspector: {
        name: 'First layer inspection active',
        type: 'boolean',
        role: 'switch.mode',
    },
    halt_print_sensitivity: {
        name: 'Sensibility setting to stop on error',
        type: 'string',
        role: 'text',
    },
    print_halt: {
        name: 'Stop print if error occurs',
        type: 'boolean',
        role: 'switch.mode',
    },
    printing_monitor: {
        name: 'Print monitoring enabled',
        type: 'boolean',
        role: 'switch.mode',
    },
    spaghetti_detector: {
        name: 'Spaghetti detector enabled',
        type: 'boolean',
        role: 'switch.mode',
    },
    xcam_status: {
        name: 'xCam status',
        type: 'string',
        role: 'text',
    },
    gcode_start_timeFormatted: {
        name: 'xxxx',
        type: 'string',
        role: 'value.time',
    },
    hmsErrors: {
        name: 'HMS error occurred',
        type: 'boolean',
        role: 'indicator.alarm',
    },
    hmsErrorCount: {
        name: 'HMS error counts',
        type: 'number',
        role: 'value',
    },
    t_utc: {
        name: 'UTC time stamp',
        type: 'number',
        role: 'value.time',
    },
    ams_rfid_status: {
        name: 'AMS RFID status',
        type: 'number',
        role: 'value',
    },
    RFID: {
        name: 'RFID',
        type: 'boolean',
        role: 'indicator',
    },
    cur_state_code: {
        name: 'RFID',
        type: 'number',
        role: 'value',
    },
    doorOpen: {
        name: 'Door indicator',
        type: 'boolean',
        role: 'indicator',
    },
    // Additional state attributes for missing fields
    dry_time: {
        name: 'AMS drying time remaining',
        type: 'number',
        role: 'value.time',
        unit: 'min',
    },
    humidity_raw: {
        name: 'Humidity raw value',
        type: 'string',
        role: 'value.humidity',
    },
    state: {
        name: 'State',
        type: 'number',
        role: 'value',
    },
    total_len: {
        name: 'Nominal filament length (catalog)',
        type: 'number',
        role: 'value',
    },
    cali_id: {
        name: 'Calibration ID',
        type: 'number',
        role: 'value',
    },
    cali_stat: {
        name: 'Calibration status',
        type: 'number',
        role: 'value',
    },
    unbind_ams_stat: {
        name: 'Unbind AMS status',
        type: 'number',
        role: 'value',
    },
    ap_err: {
        name: 'Access point error',
        type: 'number',
        role: 'value',
    },
    aux: {
        name: 'Auxiliary information',
        type: 'string',
        role: 'text',
    },
    batch_id: {
        name: 'Batch ID',
        type: 'number',
        role: 'value',
    },
    canvas_id: {
        name: 'Canvas ID',
        type: 'number',
        role: 'value',
    },
    cfg: {
        name: 'Configuration',
        type: 'mixed',
        role: 'text',
    },
    design_id: {
        name: 'Design ID',
        type: 'string',
        role: 'text',
    },
    // Device-related attributes
    modeCur: {
        name: 'Current mode',
        type: 'number',
        role: 'value',
    },
    modeFunc: {
        name: 'Available mode functions',
        type: 'number',
        role: 'value',
    },
    modeVisable: {
        name: 'Visible modes',
        type: 'number',
        role: 'value',
    },
    subFunc: {
        name: 'Available sub-functions',
        type: 'number',
        role: 'value',
    },
    subVisable: {
        name: 'Visible sub-modes',
        type: 'number',
        role: 'value',
    },
    tar_state: {
        name: 'Target state',
        type: 'number',
        role: 'value',
    },
    func: {
        name: 'Function',
        type: 'number',
        role: 'value',
    },
    range: {
        name: 'Range',
        type: 'number',
        role: 'value',
    },
    exist: {
        name: 'Exists',
        type: 'number',
        role: 'indicator',
    },
    diameter: {
        name: 'Diameter',
        type: 'mixed',
        role: 'value',
        unit: 'mm',
        modify: ['TOFLOAT'],
    },
    tm: {
        name: 'Time',
        type: 'number',
        role: 'value.time',
    },
    wear: {
        name: 'Wear',
        type: 'number',
        role: 'value',
    },
    base: {
        name: 'Base',
        type: 'number',
        role: 'value',
    },
    cali2d_id: {
        name: 'Calibration 2D ID',
        type: 'string',
        role: 'text',
    },
    cur_id: {
        name: 'Current ID',
        type: 'string',
        role: 'text',
    },
    mat: {
        name: 'Material',
        type: 'number',
        role: 'value',
    },
    tar_id: {
        name: 'Target ID',
        type: 'string',
        role: 'text',
    },
    tar_name: {
        name: 'Target name',
        type: 'string',
        role: 'text',
    },
    // 2D print related attributes
    clock_in: {
        name: 'Clock in',
        type: 'boolean',
        role: 'indicator',
    },
    est_time: {
        name: 'Estimated time',
        type: 'number',
        role: 'value.time',
        unit: 'min',
    },
    print_then: {
        name: 'Print then',
        type: 'boolean',
        role: 'indicator',
    },
    step_type: {
        name: 'Step type',
        type: 'number',
        role: 'value',
    },
    color: {
        name: 'Color',
        type: 'string',
        role: 'text',
    },
    total_time: {
        name: 'Total time',
        type: 'number',
        role: 'value.time',
        unit: 'min',
    },
    cond: {
        name: 'Condition',
        type: 'number',
        role: 'value',
    },
    clock_in_time: {
        name: 'Clock in time',
        type: 'number',
        role: 'value.time',
    },
    left_time: {
        name: 'Left time',
        type: 'number',
        role: 'value.time',
        unit: 'min',
    },
    process: {
        name: 'Process',
        type: 'number',
        role: 'level',
        unit: '%',
    },
    first_confirm: {
        name: 'First confirm',
        type: 'boolean',
        role: 'indicator',
    },
    makeable: {
        name: 'Makeable',
        type: 'boolean',
        role: 'indicator',
    },
    // Missing state definitions reported in issue #180
    idx2: {
        name: 'IDx2',
        type: 'number',
        role: 'value',
    },
    flag3: {
        name: 'Flag3',
        type: 'number',
        role: 'value',
    },
    rfid: {
        name: 'RFID status',
        type: 'boolean',
        role: 'indicator',
    },
    ams_id: {
        name: 'AMS ID',
        type: 'string',
        role: 'text',
    },
    check: {
        name: 'Check status',
        type: 'number',
        role: 'value',
    },
    chip_id: {
        name: 'Chip ID',
        type: 'string',
        role: 'text',
    },
    // H2d printer model specific attributes
    ctrl: {
        name: 'Control parameters',
        type: 'string',
        role: 'text',
    },
    modeId: {
        name: 'Mode ID',
        type: 'number',
        role: 'value',
    },
    off: {
        name: 'Off parameters',
        type: 'string',
        role: 'text',
    },
    subMode: {
        name: 'Sub mode',
        type: 'number',
        role: 'value',
    },
    calib: {
        name: 'Calibration',
        type: 'number',
        role: 'value',
    },
    low_prec: {
        name: 'Low precision mode',
        type: 'boolean',
        role: 'indicator',
    },
    mount: {
        name: 'Mount status',
        type: 'number',
        role: 'value',
    },
    mount_3d: {
        name: '3D mount status',
        type: 'number',
        role: 'value',
    },
    th_temp: {
        name: 'Thermal temperature',
        type: 'number',
        role: 'value.temperature',
        unit: '°C',
        modify: ['TOFLOAT'],
    },
    type: {
        name: 'Type',
        type: 'mixed',
        role: 'text',
    },
    hnow: {
        name: 'Height now',
        type: 'number',
        role: 'value',
        unit: 'mm',
    },
    hpre: {
        name: 'Height previous',
        type: 'number',
        role: 'value',
        unit: 'mm',
    },
    htar: {
        name: 'Height target',
        type: 'number',
        role: 'value',
        unit: 'mm',
    },
    snow: {
        name: 'Speed now',
        type: 'number',
        role: 'value.speed',
    },
    spre: {
        name: 'Speed previous',
        type: 'number',
        role: 'value.speed',
    },
    star: {
        name: 'Speed target',
        type: 'number',
        role: 'value.speed',
    },
    stat: {
        name: 'Status',
        type: 'mixed',
        role: 'value',
    },
    bot_err: {
        name: 'Bottom error',
        type: 'number',
        role: 'value',
    },
    cd: {
        name: 'Countdown',
        type: 'number',
        role: 'value.time',
        unit: 's',
    },
    cd_init: {
        name: 'Countdown initial',
        type: 'number',
        role: 'value.time',
        unit: 's',
    },
    connect_flag: {
        name: 'Connection flag',
        type: 'number',
        role: 'indicator',
    },
    drill_flag: {
        name: 'Drill flag',
        type: 'number',
        role: 'indicator',
    },
    remain_time: {
        name: 'Remaining time',
        type: 'number',
        role: 'value.time',
        unit: 's',
    },
    rm_init: {
        name: 'Remaining time initial',
        type: 'number',
        role: 'value.time',
        unit: 's',
    },
    power: {
        name: 'Power status',
        type: 'number',
        role: 'value',
    },
    err: {
        name: 'Error',
        type: 'string',
        role: 'text',
    },
    file: {
        name: 'Current file',
        type: 'string',
        role: 'text',
    },
    fun: {
        name: 'Function code',
        type: 'string',
        role: 'text',
    },
    brtc_service: {
        name: 'BRTC service status',
        type: 'string',
        role: 'text',
    },
    bs_state: {
        name: 'Base station state',
        type: 'number',
        role: 'value',
    },
    laser_preview_res: {
        name: 'Laser preview resolution',
        type: 'number',
        role: 'value',
    },
    tl_store_hpd_type: {
        name: 'Tool store HPD type',
        type: 'number',
        role: 'value',
    },
    tl_store_path_type: {
        name: 'Tool store path type',
        type: 'number',
        role: 'value',
    },
    job_attr: {
        name: 'Job attributes',
        type: 'number',
        role: 'value',
    },
    lan_task_id: {
        name: 'LAN task ID',
        type: 'string',
        role: 'text',
    },
    mc_action: {
        name: 'Machine control action',
        type: 'number',
        role: 'value',
    },
    mc_err: {
        name: 'Machine control error',
        type: 'number',
        role: 'value',
    },
    mc_stage: {
        name: 'Machine control stage',
        type: 'number',
        role: 'value',
    },
    model_id: {
        name: 'Model ID',
        type: 'string',
        role: 'text',
    },
    percent: {
        name: 'Percentage',
        type: 'number',
        role: 'level',
        unit: '%',
        modify: ['TOFLOAT'],
    },
    plate_cnt: {
        name: 'Plate count',
        type: 'number',
        role: 'value',
    },
    plate_id: {
        name: 'Plate ID',
        type: 'number',
        role: 'value',
    },
    plate_idx: {
        name: 'Plate index',
        type: 'number',
        role: 'value',
    },
    prepare_per: {
        name: 'Preparation percentage',
        type: 'number',
        role: 'level',
        unit: '%',
        modify: ['TOFLOAT'],
    },
    queue: {
        name: 'Queue position',
        type: 'number',
        role: 'value',
    },
    ver: {
        name: 'Version',
        type: 'string',
        role: 'text',
    },
    // Missing state definitions from issue #194
    heigh: {
        name: 'Height information',
        type: 'number',
        role: 'value',
        unit: 'mm',
    },
    platform: {
        name: 'Platform information',
        type: 'string',
        role: 'text',
    },
    tool: {
        name: 'Tool configuration',
        type: 'string',
        role: 'text',
    },
    mapping: {
        name: 'Mapping configuration',
        type: 'string',
        role: 'text',
    },
    // Printer firmware and filament metadata reported by newer firmware
    filament_bak: {
        name: 'Filament backup information',
        type: 'string',
        role: 'text',
    },
    cur_release_type: {
        name: 'Current firmware release type',
        type: 'number',
        role: 'value',
    },
    new_release_type: {
        name: 'New firmware release type',
        type: 'number',
        role: 'value',
    },
    cur_ver: {
        name: 'Current firmware version',
        type: 'string',
        role: 'text',
    },
    new_ver: {
        name: 'New firmware version',
        type: 'string',
        role: 'text',
    },
    firmware_update_available: {
        name: 'Firmware update available',
        type: 'boolean',
        role: 'indicator',
    },
    firmware_current_version: {
        name: 'Installed printer firmware version',
        type: 'string',
        role: 'text',
    },
    firmware_available_version: {
        name: 'Available printer firmware version',
        type: 'string',
        role: 'text',
    },
    ams_firmware_update_available: {
        name: 'AMS firmware update available',
        type: 'boolean',
        role: 'indicator',
    },
    ams_firmware_update_count: {
        name: 'Number of AMS firmware updates available',
        type: 'number',
        role: 'value',
    },
    ams_firmware_update_details: {
        name: 'AMS firmware update details',
        type: 'string',
        role: 'json',
    },
};

module.exports = state_attrb;
