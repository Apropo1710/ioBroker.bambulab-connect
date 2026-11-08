'use strict';

/*
 * Created with @iobroker/create-adapter v2.4.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

const mqtt = require('mqtt'); // MQTT request library
const { discoverPrinters } = require('./lib/printerDiscovery');
const { default: axios } = require('axios'); // Http request library

const jsonExplorer = require('./lib/jsonExplorer'); // Local optimized jsonExplorer implementation
const organizeTelemetry = require('./lib/telemetryStructure');
const convert = require('./lib/converter'); // Load converter functions
const stateAttr = require(`${__dirname}/lib/state_attr.js`); // Load attribute library
const { getPrinters, ensureUniqueIds, ensureUniqueSerials, getStalePrinterRootIds } = require('./lib/printerConfig');
const { compareCredentialValues } = require('./lib/credentialDiagnostics');
const {
    createPrinterContext,
    getPrinterIdFromStateId,
    shutdownPrinterContext,
    markPrinterDisconnected,
    getCachedHmsErrorJson,
} = require('./lib/printerRuntime');

const timeouts = {}; // Object array containing all running timers
const errorCodesHMS = {}; // Object array of translated error codes
let language = 'en'; // System language to handle error code translations, default EN

// Array of G-code commands that should be blocked during printing for safety
const blockedCommandsDuringPrinting = ['G0', 'G1', 'G28', 'G90', 'G91'];

class BambulabConnect extends utils.Adapter {
    /**
     * @param {Partial<utils.AdapterOptions>} [options] - Adapter configuration options
     */
    constructor(options) {
        super({
            ...options,
            name: 'bambulab-connect',
        });
        // Serialize MQTT report processing so rapid updates cannot race each other.
        this.client = null;
        this.clientConnection = {
            connected: false,
            connectError: false,
            initiated: false,
            reconnectMessageShown: false,
        };
        this.currentPrintingState = null;
        this.messageQueue = Promise.resolve();
        this.printers = new Map();
        this.discoveryInProgress = false;
        this.lastDiscoveryResult = '';
        this.on('ready', this.onReady.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
        jsonExplorer.init(this, stateAttr);
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        const sys_conf = await this.getForeignObjectAsync('system.config');
        if (sys_conf && sys_conf.common.language) {
            language = sys_conf.common.language;
        }

        await this.setState('info.connection', false, true);
        await this.loadHMSErrorCodeTranslations();

        const printersWithUniqueIds = ensureUniqueIds(getPrinters(this.config));
        const printers = ensureUniqueSerials(printersWithUniqueIds, (printer, reason) => {
            this.log.error(
                `Skipping configured printer "${printer.name || printer.id}" (${printer.serial || 'no serial'}): ${reason}.`,
            );
        });
        if (!printers.length) {
            this.log.error(
                'No valid printer configured. Please add at least one printer with IP, serial and access token.',
            );
            return;
        }

        // Remove object trees for printers deleted from the configuration.
        // Do this only after at least one valid printer was found to avoid
        // destructive cleanup on an incomplete/empty configuration.
        try {
            const deviceView = await this.getObjectViewAsync('system', 'device', {
                startkey: `${this.namespace}.`,
                endkey: `${this.namespace}.\u9999`,
            });
            const existingDeviceIds = (deviceView?.rows || []).map(row => row.id);
            const stalePrinterIds = getStalePrinterRootIds(
                existingDeviceIds,
                this.namespace,
                printers.map(printer => printer.id),
            );

            for (const stalePrinterId of stalePrinterIds) {
                this.log.info(`Removing stale printer objects for "${stalePrinterId}"`);
                await this.delObjectAsync(stalePrinterId, { recursive: true });

                const cachePrefix = `${stalePrinterId}.`;
                for (const objectId of this.createdStructureObjects) {
                    if (objectId === stalePrinterId || objectId.startsWith(cachePrefix)) {
                        this.createdStructureObjects.delete(objectId);
                    }
                }
                for (const objectId of this.lastStateValues.keys()) {
                    if (objectId === stalePrinterId || objectId.startsWith(cachePrefix)) {
                        this.lastStateValues.delete(objectId);
                    }
                }
                for (const objectId of Object.keys(this.createdStatesDetails)) {
                    if (objectId === stalePrinterId || objectId.startsWith(cachePrefix)) {
                        delete this.createdStatesDetails[objectId];
                    }
                }
            }
        } catch (e) {
            this.log.warn(`Could not clean up removed printer objects: ${e}`);
        }

        const credentialConfigSource =
            Array.isArray(this.config.printers) && this.config.printers.length > 0 ? 'printer table' : 'legacy config';

        // Compare the configured table token with the working legacy adapter's
        // native credential without ever logging either credential or a hash.
        let legacyAccessToken;
        let legacyConfigAvailable = false;
        try {
            const legacyAdapterObject = await this.getForeignObjectAsync('system.adapter.bambulab.0');
            if (legacyAdapterObject && legacyAdapterObject.native) {
                legacyConfigAvailable = true;
                legacyAccessToken = legacyAdapterObject.native.Password;
            }
        } catch (error) {
            this.log.debug(
                `Could not read legacy bambulab.0 config for credential comparison: ${error.message || error}`,
            );
        }

        for (const printer of printers) {
            // Remove the obsolete AMS -> ams subtree created by previous adapter
            // versions. The new layout stores units at printer.ams.units.
            // Only remove this legacy branch, never the whole AMS channel.
            try {
                const legacyAmsBranch = `${printer.id}.ams.ams`;
                if (await this.getObjectAsync(legacyAmsBranch)) {
                    this.log.info(`Removing obsolete AMS object branch for "${printer.name || printer.id}"`);
                    await this.delObjectAsync(legacyAmsBranch, { recursive: true });
                }
            } catch (e) {
                this.log.warn(`Could not remove obsolete AMS object branch for "${printer.name || printer.id}": ${e}`);
            }

            const context = createPrinterContext(this, printer);
            this.printers.set(printer.id, context);

            // Safe credential diagnostics: never log the access token itself.
            const accessToken = context.config.Password;
            this.log.info(
                `Credential diagnostics for "${context.printerName}": source=${credentialConfigSource}, token present=${Boolean(accessToken)}, type=${typeof accessToken}, length=${typeof accessToken === 'string' ? accessToken.length : 'n/a'}.`,
            );
            const credentialComparison = compareCredentialValues(accessToken, legacyAccessToken);
            this.log.info(
                `Credential comparison for "${context.printerName}" against bambulab.0 native Password: original config available=${legacyConfigAvailable}, result=${credentialComparison === null ? 'unavailable' : credentialComparison ? 'MATCH' : 'DIFFERENT'}.`,
            );

            // Per-printer connection state; the instance-wide indicator is true
            // whenever at least one configured printer is connected.
            await this.extendObjectAsync(`${printer.id}.info`, {
                type: 'channel',
                common: { name: `${context.printerName} information` },
                native: {},
            });
            await this.extendObjectAsync(`${printer.id}.info.connection`, {
                type: 'state',
                common: {
                    name: 'Printer connected',
                    type: 'boolean',
                    role: 'indicator.connected',
                    read: true,
                    write: false,
                    def: false,
                },
                native: {},
            });
            await this.setStateAsync(`${printer.id}.info.connection`, { val: false, ack: true });

            const adapterSetState = this.setState.bind(this);
            context.setState = (id, state, ack) => {
                if (id !== 'info.connection') {
                    return adapterSetState(id, state, ack);
                }

                const printerStateId = `${context.printerId}.info.connection`;
                const writePrinterState =
                    state && typeof state === 'object'
                        ? adapterSetState(printerStateId, state)
                        : adapterSetState(printerStateId, state, ack);
                const anyConnected = [...this.printers.values()].some(item => item.clientConnection.connected);
                const writeInstanceState = adapterSetState('info.connection', anyConnected, true);
                return Promise.all([writePrinterState, writeInstanceState]);
            };

            this.log.info(`Starting printer runtime "${context.printerName}" (${printer.serial}) at ${printer.host}`);
            context.mqttMessageHandle();
        }
    }

    /**
     * Handle MQTT connection & message
     */
    mqttMessageHandle() {
        try {
            if (this.shuttingDown) {
                this.log.debug(`Skipping MQTT startup for printer "${this.printerId}" during shutdown`);
                return;
            }

            // Prevent multiple concurrent connection attempts
            if (this.clientConnection.initiated) {
                this.log.debug(`MQTT connection already in progress, skipping`);
                return;
            }

            // Only log connection attempt if we haven't shown the reconnect message yet
            if (!this.clientConnection.reconnectMessageShown) {
                if (this.clientConnection.connectError) {
                    this.log.info(
                        `Attempting to reconnect to printer - will retry automatically every 30 seconds until connection is restored`,
                    );
                    this.clientConnection.reconnectMessageShown = true;
                } else {
                    this.log.info(`Try to connect to printer`);
                }
            } else {
                this.log.debug(`Retrying connection to printer`);
            }

            this.clientConnection.initiated = true;

            // Properly close existing this.client if present
            if (this.client) {
                this.client.removeAllListeners();
                this.client.end();
                this.client = null;
            }

            // Connect to Printer using MQTT
            const client = mqtt.connect(`mqtts://${this.config.host}:8883`, {
                username: 'bblp',
                password: this.config.Password,
                reconnectPeriod: 30000,
                rejectUnauthorized: false,
            });
            this.client = client;

            // Establish connection to printer by MQTT
            client.on('connect', () => {
                if (this.client !== client || this.shuttingDown) {
                    return;
                }
                if (!this.clientConnection.connected) {
                    this.log.info(`Printer connected successfully`);
                }
                this.clientConnection.connected = true;
                this.setState('info.connection', true, true);
                this.clientConnection.connectError = false;
                this.clientConnection.initiated = false; // Reset initiated flag on successful connection
                this.clientConnection.reconnectMessageShown = false; // Reset for future disconnections

                this.createControlStates();

                // Subscribe on a printer topic after connection
                client.subscribe([`device/${this.config.serial}/report`], error => {
                    if (this.client !== client || this.shuttingDown) {
                        return;
                    }
                    if (error) {
                        this.log.warn(`MQTT subscribe failed: ${error.message || error}`);
                    }
                    this.log.debug(`Subscribed to printer data topic by serial | ${this.config.serial}`);
                });

                // After new firmware release this summer all data must be requested 1 time at adapter start
                this.requestData();
            });

            // Receive MQTT messages
            client.on('message', (topic, message) => {
                if (this.client !== client || this.shuttingDown) {
                    return;
                }
                // Parse printer payload safely; malformed MQTT packets must not crash the adapter.
                try {
                    message = JSON.parse(message.toString());
                } catch (error) {
                    this.log.warn(`Ignoring invalid MQTT JSON message on topic ${topic}: ${error.message}`);
                    return;
                }

                // @ts-expect-error if print does not exist function will return false and skip
                if (message && message.print && message && message.print.result) {
                    // Handle values for printer statistics
                    if (this.log.level === 'debug' || this.log.level === 'silly') {
                        this.log.debug(`Printer message result ${JSON.stringify(message)}`);
                    }
                    // @ts-expect-error if system does not exist function will return false and skip
                } else if (message && message.print) {
                    if (this.log.level === 'debug' || this.log.level === 'silly') {
                        this.log.debug(`Printer Message ${JSON.stringify(message)}`);
                    }
                    this.messageQueue = this.messageQueue
                        .then(() => {
                            // A message may wait in the queue until its MQTT client has
                            // already been replaced. Never apply stale telemetry.
                            if (this.client !== client || this.shuttingDown) {
                                return;
                            }
                            return this.messageHandler(message);
                        })
                        .catch(error => {
                            this.log.error(`[MQTT Message queue] ${error.message || error}`);
                        });
                    // @ts-expect-error if system does not exist function will return false and skip
                } else if (message && message.command) {
                    this.log.info(`Response to control command ${JSON.stringify(message)}`);
                    // @ts-expect-error if system does not exist function will return false and skip
                } else if (message && message.system) {
                    // Handle values for system messages, used to acknowledge messages
                    if (this.log.level === 'debug' || this.log.level === 'silly') {
                        this.log.debug(`System Message ${JSON.stringify(message)}`);
                    }
                } else if (message && message['t_utc']) {
                    // Handle values for system messages, used to acknowledge messages
                    // this.log.info(`System Message ${JSON.stringify(message)}`);
                    // TimeStamp Message, ignore
                } else {
                    if (this.log.level === 'debug' || this.log.level === 'silly') {
                        this.log.debug(`Unknown Message ${JSON.stringify(message)}`);
                    }
                }
                this.clientConnection.connected = true;
                this.clientConnection.connectError = false;
            });

            client.on('end', () => {
                if (this.client !== client || this.shuttingDown) {
                    return;
                }
                markPrinterDisconnected(this, this.setState.bind(this));
            });

            // MQTT.js emits close on transport loss, including during automatic reconnect.
            client.on('close', () => {
                if (this.client !== client || this.shuttingDown) {
                    return;
                }
                markPrinterDisconnected(this, this.setState.bind(this));
            });

            client.on('error', error => {
                if (this.client !== client || this.shuttingDown) {
                    return;
                }
                if (!this.clientConnection.connectError) {
                    this.log.error(`Connection issue occurred: ${error} - printer may be powered off or unreachable`);
                }
                // Close MQTT connection
                client.end();
                if (this.clientConnection.connected) {
                    this.log.warn(
                        `Printer connection lost - this could be due to printer being powered off or network issues`,
                    );
                }
                this.clientConnection.connected = false;
                this.setState('info.connection', false, true);

                // Try to reconnect by creating a new this.client instead of using reconnect()
                if (timeouts[this.printerId]) {
                    this.clearTimeout(timeouts[this.printerId]);
                    timeouts[this.printerId] = null;
                }
                timeouts[this.printerId] = this.setTimeout(() => {
                    // Ignore a retry timer if another MQTT client has already replaced this one.
                    if (!this.shuttingDown && this.client === client) {
                        this.mqttMessageHandle();
                    }
                }, 30000);
                this.clientConnection.connected = false;
                this.clientConnection.connectError = true;
                this.clientConnection.initiated = false;
            });
        } catch (e) {
            this.log.error(`[MQTT Message handler] ${e} | ${e.stack}`);
        }
    }

    /**
     * Handle MQTT messages to ioBroker states
     *
     * @param {object} message - MQTT message to process
     */
    async messageHandler(message) {
        try {
            // Process every MQTT report. Printer reports are often partial/delta updates;
            // dropping messages here can leave ioBroker states stale or incomplete.

            if (message.print) {
                if (this.log.level === 'debug' || this.log.level === 'silly') {
                    try {
                        this.log.debug(`Extruder R temp: ${message.print.device.extruder.info[0].temp}`);
                    } catch {
                        // Ignore if extruder info is not available
                    }

                    try {
                        this.log.debug(
                            `Extruder R temp decoded: ${decodeExtruderTemp(message.print.device.extruder.info[0].temp)}`,
                        );
                    } catch {
                        // Ignore if extruder info is not available
                    }

                    try {
                        this.log.debug(`Extruder L temp: ${message.print.device.extruder.info[1].temp}`);
                    } catch {
                        // Ignore if extruder info is not available
                    }

                    try {
                        this.log.debug(
                            `Extruder L temp decoded: ${decodeExtruderTemp(message.print.device.extruder.info[1].temp)}`,
                        );
                    } catch {
                        // Ignore if extruder info is not available
                    }

                    try {
                        this.log.debug(`Nozzel temp: ${decodeExtruderTemp(message.print.nozzle_temper)}`);
                    } catch {
                        // Ignore if nozzle_temper is not available
                    }
                }

                function decodeExtruderTemp(raw) {
                    if (raw > 500) {
                        return Math.round(raw / 58100);
                    }
                    return raw; // Already realistic
                }

                // Modify values of JSON for states which need modification
                message.print.control = {};
                if (message.print.cooling_fan_speed != null) {
                    message.print.cooling_fan_speed = convert.fanSpeed(message.print.cooling_fan_speed);
                    message.print.control.cooling_fan_speed = message.print.cooling_fan_speed;
                }
                if (message.print.heatbreak_fan_speed != null) {
                    message.print.heatbreak_fan_speed = convert.fanSpeed(message.print.heatbreak_fan_speed);
                    message.print.control.heatbreak_fan_speed = message.print.heatbreak_fan_speed;
                }
                // Store original stg_cur value for printer state checking before conversion
                const originalStgCur = message.print.stg_cur;

                // Keep the last known printing state when a delta report omits stg_cur.
                // This state is also used to block potentially dangerous G-code commands.
                if (originalStgCur != null) {
                    this.currentPrintingState = originalStgCur;
                    message.print.stg_cur = convert.stageParser(originalStgCur);
                    message.print.control.stg_cur = message.print.stg_cur;
                }
                if (message.print.big_fan1_speed != null) {
                    message.print.big_fan1_speed = convert.fanSpeed(message.print.big_fan1_speed);
                    message.print.control.big_fan1_speed = message.print.big_fan1_speed;
                }
                if (message.print.big_fan2_speed != null) {
                    message.print.big_fan2_speed = convert.fanSpeed(message.print.big_fan2_speed);
                    message.print.control.big_fan2_speed = message.print.big_fan2_speed;
                }
                if (message.print.spd_lvl != null) {
                    message.print.control.spd_lvl = message.print.spd_lvl;
                }
                if (message.print.bed_target_temper != null) {
                    message.print.control.bed_target_temper = message.print.bed_target_temper;
                }
                if (message.print.nozzle_target_temper != null) {
                    message.print.control.nozzle_target_temper = message.print.nozzle_target_temper;
                }
                if (message.print.mc_remaining_time != null) {
                    // Only calculate finish time when printer is actively printing (not idle/offline)
                    // stg_cur values:
                    //   -2 = Offline
                    //   -1 = Idle
                    //    0 = Preparing
                    //    1 = Printing
                    //    2 = Paused
                    //    3 = Completed
                    //    4+ = Other working states (update as needed)
                    if (this.currentPrintingState != null && this.currentPrintingState >= 0) {
                        message.print.finishTime = new Date(
                            new Date().getTime() + message.print.mc_remaining_time * 60000,
                        ).toISOString();
                    } else {
                        // Clear finish time when printer is idle/offline to avoid stale data
                        message.print.finishTime = '';
                    }
                    message.print.mc_remaining_time = convert.remainingTime(message.print.mc_remaining_time);
                }

                if (message.print.gcode_start_time != null) {
                    let gcode_start_timeFormatted = new Date(message.print.gcode_start_time * 1000).toString();
                    gcode_start_timeFormatted = gcode_start_timeFormatted.replace('"', '');
                    message.print.gcode_start_timeFormatted = gcode_start_timeFormatted;
                }
                if (message.print.vt_tray != null && message.print.vt_tray.bed_temp != null) {
                    message.print.vt_tray.bed_temp = +message.print.vt_tray.bed_temp;
                }
                // Update light control datapoint
                if (
                    message.print.lights_report &&
                    message.print.lights_report[0] &&
                    message.print.lights_report[0].mode === 'on'
                ) {
                    message.print.control.lightChamber = true;
                    message.print.lights_report[0].mode = true;
                } else if (
                    message.print.lights_report &&
                    message.print.lights_report[0] &&
                    message.print.lights_report[0].mode === 'off'
                ) {
                    message.print.control.lightChamber = false;
                    message.print.lights_report[0].mode = false;
                }

                // Translate HMS Code & write to state
                let hmsErrorCodeJson;
                if (message.print.hms != null) {
                    hmsErrorCodeJson = getCachedHmsErrorJson(this, message.print.hms, language, hmsEntries => {
                        const hmsError = [];
                        for (const hms_code in hmsEntries) {
                            const attr = convert.DecimalHexTwosComplement(hmsEntries[hms_code].attr);
                            const code = convert.DecimalHexTwosComplement(hmsEntries[hms_code].code);

                            let full_code = (attr + code).replace(/(.{4})/g, '$1_');
                            full_code = full_code.substring(0, full_code.length - 1);
                            const urlEN = `https://wiki.bambulab.com/en/x1/troubleshooting/hmscode/${full_code}`;

                            let errorDesc = 'No description available in your language';
                            const translation = errorCodesHMS[full_code.replaceAll('_', '').toUpperCase()];
                            if (translation != null && translation['desc'] != null) {
                                errorDesc = translation['desc'];
                            }
                            const errorMessageArray = {
                                code: `HMS_${full_code}`,
                                'url-EN': urlEN,
                                description: errorDesc,
                            };
                            if (language.toUpperCase() !== 'EN') {
                                errorMessageArray['url-local'] =
                                    `https://wiki.bambulab.com/${language}/x1/troubleshooting/hmscode/${full_code}`;
                            }
                            hmsError.push(errorMessageArray);
                        }
                        return hmsError;
                    });
                    message.print.hms.hmsErrors = true;
                } else {
                    message.print.hms = {
                        hmsErrorCount: 0,
                        hmsErrors: false,
                    };
                    hmsErrorCodeJson = getCachedHmsErrorJson(this, null, language, () => []);
                }

                // Avoid repeated ioBroker state writes for unchanged translated HMS data.
                if (this.lastHmsErrorCode !== hmsErrorCodeJson) {
                    await this.setState(`${this.printerId}.hms.hmsErrorCode`, {
                        val: hmsErrorCodeJson,
                        ack: true,
                    });
                    this.lastHmsErrorCode = hmsErrorCodeJson;
                }

                // Process all reported AMS units. ams_exist_bits is a bitmask:
                // with two connected AMS devices it is "3", not "1".
                // The presence of the actual unit array is the reliable condition.
                if (Array.isArray(message.print.ams?.ams)) {
                    message.print.ams.ams = this.handleAMSUnits(message);
                }
            }

            // Estimate filament grams for the external spool (vt_tray) only if MQTT omits remain_g.
            const vtTray = message.print.vt_tray;
            if (vtTray && vtTray.remain_g == null) {
                const pct = Number(vtTray.remain);
                const nominalG = Number(vtTray.tray_weight);
                if (Number.isFinite(pct) && pct >= 0 && pct <= 100 && Number.isFinite(nominalG) && nominalG > 0) {
                    vtTray.remain_g = Math.round((nominalG * pct) / 100);
                }
            }

            // Translate home_flag to door state
            if (message.print.home_flag === 14796168) {
                message.print.doorOpen = true;
            } else if (message.print.home_flag === 6407560) {
                message.print.doorOpen = false;
            }

            // Normalize known MQTT type inconsistencies only at their specific paths.
            // err2.err_code is sometimes sent as a numeric string, while nozzle.tar_id
            // can arrive as a number. Keep global state definitions unchanged because
            // these keys are used with different types elsewhere.
            const errCode = message.print.err2?.err_code;
            if (typeof errCode === 'string') {
                const normalizedErrCode = errCode.trim();
                if (normalizedErrCode !== '' && Number.isFinite(Number(normalizedErrCode))) {
                    message.print.err2.err_code = Number(normalizedErrCode);
                }
            }
            if (typeof message.print.device?.nozzle?.tar_id === 'number') {
                message.print.device.nozzle.tar_id = String(message.print.device.nozzle.tar_id);
            }

            // Explore JSON & create states
            const organizedPrint = organizeTelemetry(message.print);
            const returnJONexplorer = await jsonExplorer.traverseJson(organizedPrint, this.printerId, false, false, 0);
            if (this.log.level === 'debug' || this.log.level === 'silly') {
                this.log.debug(`Response of JSONexploer: ${JSON.stringify(returnJONexplorer)}`);
            }
        } catch (e) {
            this.log.error(`[messageHandler] ${e} | ${e.stack}`);
        }
        this.clientConnection.initiated = true;
    }

    handleAMSUnits(message) {
        const amsData = message.print.ams.ams;
        // handle conversion for all AMS units
        for (const unit in amsData) {
            if (amsData[unit] !== null) {
                for (const tray in amsData[unit].tray) {
                    const trayData = amsData[unit].tray[tray];
                    // Calculate estimated remaining filament grams only when MQTT omits remain_g.
                    const trayObj = amsData[unit].tray[tray];
                    if (trayObj.remain_g == null) {
                        const pct = Number(trayObj.remain);
                        const nominalG = Number(trayObj.tray_weight);
                        if (
                            Number.isFinite(pct) &&
                            pct >= 0 &&
                            pct <= 100 &&
                            Number.isFinite(nominalG) &&
                            nominalG > 0
                        ) {
                            trayObj.remain_g = Math.round((nominalG * pct) / 100);
                        }
                    }
                    // Convert bed_temp only once per tray. Some firmware payloads omit
                    // this field, while populated trays may send it as a string.
                    if (trayData.cols || trayData.bed_temp != null) {
                        trayData.bed_temp = parseInt(trayData.bed_temp);
                    }
                }
            }
        }
        return amsData;
    }

    publishMQTTmessages(msg) {
        if (this.log.level === 'debug' || this.log.level === 'silly') {
            this.log.debug(`Publish message ${JSON.stringify(msg)}`);
        }

        // State changes can trigger commands while the printer is disconnected.
        // Avoid dereferencing a missing or disconnected MQTT this.client.
        if (this.shuttingDown || !this.client || !this.client.connected) {
            this.log.debug('Skipping MQTT publish because the printer is not connected');
            return;
        }

        const topic = `device/${this.config.serial}/request`;
        this.client.publish(topic, JSON.stringify(msg), { qos: 0, retain: false }, error => {
            if (error) {
                this.log.warn(`MQTT publish failed: ${error.message || error}`);
            }
        });
    }

    requestData() {
        // Prepare MQTT message
        const msg = {
            pushing: {
                sequence_id: '1',
                command: 'pushall',
            },
            user_id: '1234567890',
        };

        // Try to request data
        this.publishMQTTmessages(msg);

        // Keep a polling timer only for P1-Series printers.
        if (timeouts[`${this.printerId}_dataPolling`]) {
            this.clearTimeout(timeouts[`${this.printerId}_dataPolling`]);
            timeouts[`${this.printerId}_dataPolling`] = null;
        }
        if (['P1P', 'P1S', 'P1-Series'].includes(this.config.printerModel)) {
            // P1 printers can lag when pushall is requested too frequently.
            // Enforce a conservative minimum of five minutes, including legacy configs.
            const pollingInterval = Math.max(300, Number(this.config.requestInterval) || 300);
            timeouts[`${this.printerId}_dataPolling`] = this.setTimeout(() => {
                if (!this.shuttingDown) {
                    this.requestData();
                }
            }, pollingInterval * 1000);
        }
    }

    createControlStates() {
        const controlStates = {
            homing: {
                name: 'Homing print head',
                type: 'boolean',
                role: 'button',
                read: false,
                write: true,
            },
            _customGcode: {
                name: 'Custom G-Code',
                type: 'string',
                role: 'state',
                read: true,
                write: true,
                def: '',
            },
            lightToolHeadLogo: {
                name: 'Tool head Logo',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
                def: false,
            },
            pause: {
                name: 'Pause printing',
                type: 'boolean',
                role: 'button.pause',
                read: false,
                write: true,
            },
            stop: {
                name: 'Stop Printing',
                type: 'boolean',
                role: 'button.stop',
                read: false,
                write: true,
            },
            resume: {
                name: 'Resume Printing',
                type: 'boolean',
                role: 'button.resume',
                read: false,
                write: true,
            },
            updateHMSErrorCodeTranslation: {
                name: 'Update HMS error code translations',
                type: 'boolean',
                role: 'button',
                read: false,
                write: true,
            },
        };

        const hmstates = {
            hmsErrorCode: {
                role: 'indicator.maintenance',
                name: 'Health Management System (HMS)',
                type: 'string',
                read: true,
                write: false,
                def: '',
            },
            hmsErrorCount: {
                role: 'indicator.maintenance',
                name: 'HMS Alarm count',
                type: 'number',
                read: true,
                write: false,
                def: 0,
            },
            hmsErrors: {
                role: 'indicator.alarm',
                name: 'HMS Alarm ',
                type: 'boolean',
                read: true,
                write: false,
                def: false,
            },
        };

        this.extendObject(`${this.printerId}.control`, {
            type: 'channel',
            common: {
                name: `Control device`,
            },
        });

        for (const state in controlStates) {
            this.extendObject(`${this.printerId}.control.${state}`, {
                type: 'state',
                common: controlStates[state],
            });

            this.subscribeStates(`${this.printerId}.control.${state}`);
        }

        for (const state in hmstates) {
            this.extendObject(`${this.printerId}.hms.${state}`, {
                type: 'state',
                common: hmstates[state],
            });
        }
    }

    async loadHMSErrorCodeTranslations() {
        try {
            this.log.info('Try to get current HMS code translations');

            // Web request to download latest translations
            const requestDeviceDataByAPI = async () => {
                const response = await axios.get(`https://e.bambulab.com/query.php?lang=${language}`, {
                    timeout: 3000,
                }); // Timout of 3 seconds for API call
                this.log.debug(JSON.stringify(`HMS ErrorCode translations : ${response.data}`));
                return response.data;
            };

            const loadTranslationsToMemory = async tranJSON => {
                for (const errorType in tranJSON) {
                    for (const errorCode in tranJSON[errorType][language]) {
                        if (
                            tranJSON[errorType][language][errorCode] != null &&
                            tranJSON[errorType][language][errorCode].ecode != null
                        ) {
                            errorCodesHMS[tranJSON[errorType][language][errorCode].ecode.toUpperCase()] = {
                                ecode: tranJSON[errorType][language][errorCode].ecode,
                                desc: tranJSON[errorType][language][errorCode].intro,
                            };
                        }
                    }
                }
            };

            // Try to download new translation JSON, abort function in case of error
            const onlineTran = await requestDeviceDataByAPI();
            if (onlineTran == null || onlineTran.data == null) {
                this.log.warn(`Cannot download HMS error code translations`);
                return false;
            }

            const onlineTranObj = onlineTran.data;
            onlineTranObj.ver = onlineTran.ver;
            onlineTranObj.language = language.toUpperCase();

            // get current Translations
            const currentTran = await this.getStateAsync('info.hmsErrorCodeTranslations');

            if (currentTran == null || currentTran.val === '') {
                this.log.info(`No Local translation available, version ${onlineTran.ver} downloaded`);
                await this.setStateAsync(`info.hmsErrorCodeTranslations`, {
                    val: JSON.stringify(onlineTranObj),
                    ack: true,
                });
                await loadTranslationsToMemory(onlineTranObj);
            } else if (typeof currentTran.val === 'string' && currentTran.val !== '') {
                const currentTranObj = JSON.parse(currentTran.val);
                // Check if new version is available
                if (currentTranObj.ver !== onlineTran.ver) {
                    this.log.info(`Local translation ${currentTranObj.ver} outdated, updating to ${onlineTran.ver}`);
                    await this.setStateAsync(`info.hmsErrorCodeTranslations`, {
                        val: JSON.stringify(onlineTranObj),
                        ack: true,
                    });
                    await loadTranslationsToMemory(onlineTranObj);
                } else if (currentTranObj.language.toUpperCase() !== language.toUpperCase()) {
                    this.log.info(
                        `Local translation ${currentTranObj.language} incorrect, updating to ${language.toUpperCase()}`,
                    );
                    await this.setStateAsync(`info.hmsErrorCodeTranslations`, {
                        val: JSON.stringify(onlineTranObj),
                        ack: true,
                    });
                    loadTranslationsToMemory(onlineTranObj);
                } else {
                    this.log.info(`Local translation available, version ${currentTranObj.ver} is up-to-date`);
                    loadTranslationsToMemory(currentTranObj);
                }
            }
        } catch (e) {
            // Axios errors normally expose code/message, but keep error handling safe for
            // unexpected thrown values as well.
            const errorCode = e && typeof e === 'object' ? e.code : undefined;
            const errorMessage = e && typeof e === 'object' && e.message ? e.message : String(e);
            if (errorCode === 'ECONNABORTED' || errorMessage.includes('timeout')) {
                this.log.warn(
                    `Translation definitions not updated, cannot connect to Bambulab documentation (timeout)`,
                );
                this.log.debug(`[loadHMSErrorCodeTranslations] Timeout details: ${errorMessage}`);
            } else if (errorCode === 'ENOTFOUND' || errorCode === 'ECONNREFUSED') {
                this.log.warn(
                    `Translation definitions not updated, cannot connect to Bambulab documentation (network error)`,
                );
                this.log.debug(`[loadHMSErrorCodeTranslations] Network error details: ${errorMessage}`);
            } else {
                this.log.warn(`Translation definitions not updated, error downloading from Bambulab documentation`);
                this.log.debug(
                    `[loadHMSErrorCodeTranslations] Error details: ${errorMessage} | ${e && e.stack ? e.stack : ''}`,
                );
            }
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param {() => void} callback - Callback function to signal shutdown completion
     */
    onUnload(callback) {
        try {
            jsonExplorer.clearStateExpireTimers();

            for (const context of this.printers.values()) {
                try {
                    shutdownPrinterContext(context, timeouts, timer => this.clearTimeout(timer));
                } catch (e) {
                    this.log.error(`[onUnload] Failed to stop printer "${context.printerId}": ${e}`);
                }
            }

            this.printers.clear();
            callback();
        } catch (e) {
            this.log.error(`[onUnload] ${e} | ${e.stack}`);
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes
     *
     * @param {string} id - State ID that changed
     * @param {ioBroker.State | null | undefined} state - New state value
     */
    /**
     * Check if printer is currently in a state where dangerous G-code commands should be blocked
     *
     * @returns {boolean} True if dangerous G-code should be blocked
     */
    isPrintingOrActiveState() {
        // Block dangerous commands when printer is actively working
        // Based on stg_cur values:
        //   -2 = Offline (safe)
        //   -1 = Idle (safe)
        //    0+ = Active working states (potentially dangerous)
        return this.currentPrintingState != null && this.currentPrintingState >= 0;
    }

    /**
     * Check if a G-code command should be blocked during printing
     *
     * @param {string|number} gcodeParam - The G-code command parameter
     * @returns {boolean} True if command should be blocked
     */
    shouldBlockGcodeCommand(gcodeParam) {
        if (!this.isPrintingOrActiveState()) {
            return false; // Allow all commands when not actively working
        }

        // Check every line and recognize compact G-code (e.g. G1X10), too.
        // Match command numbers as a whole so G10 is not mistaken for G1.
        const lines = String(gcodeParam).toUpperCase().split(/\r?\n/);
        const blockedCommandPattern = new RegExp(`^(${blockedCommandsDuringPrinting.join('|')})(?=$|[A-Z\\s;])`);
        return lines.some(line => blockedCommandPattern.test(line.trim()));
    }

    /**
     * Validate numeric printer control values before sending MQTT commands.
     *
     * @param {number|string} value - Requested control value
     * @param {string} control - Control name for logging
     * @param {number} min - Minimum accepted value
     * @param {number} max - Maximum accepted value
     * @param {boolean} integer - Whether the value must be an integer (defaults to false)
     * @returns {number|null} Validated numeric value or null
     */
    validateNumericControl(value, control, min, max, integer = false) {
        const numericValue = typeof value === 'number' ? value : Number(value);
        if (
            !Number.isFinite(numericValue) ||
            numericValue < min ||
            numericValue > max ||
            (integer && !Number.isInteger(numericValue))
        ) {
            this.log.warn(
                `Rejected invalid ${control} value "${value}". Expected ${integer ? 'an integer' : 'a number'} between ${min} and ${max}.`,
            );
            return null;
        }
        return numericValue;
    }

    /**
     * Handle Admin configuration actions.
     *
     * @param {ioBroker.Message} obj Admin message.
     */
    async onMessage(obj) {
        if (!obj || !obj.command) {
            return;
        }

        this.log.debug(
            `Admin message received: command=${obj.command}, from=${obj.from || 'unknown'}, callback=${Boolean(obj.callback)}`,
        );

        if (!obj.callback) {
            this.log.warn(`Admin command "${obj.command}" arrived without a callback; cannot return a response.`);
            return;
        }

        if (obj.command !== 'discoverPrinters') {
            return;
        }

        if (this.discoveryInProgress) {
            this.sendTo(obj.from, obj.command, { error: 'A network scan is already running.' }, obj.callback);
            return;
        }

        this.discoveryInProgress = true;
        try {
            this.log.info('Searching the local network for BambuLab printers (SSDP/UDP)...');
            this.log.debug('Discovery request accepted; starting UDP scan with a 10-second timeout.');
            const discovered = await discoverPrinters({ timeoutMs: 10000 });
            // Read the latest persisted instance configuration. The adapter's
            // in-memory this.config can be stale if the user saved settings while
            // this instance was already running; returning that stale snapshot to
            // Admin would overwrite newer table values during discovery.
            let currentConfig = this.config;
            try {
                const instanceObject = await this.getForeignObjectAsync(`system.adapter.${this.namespace}`);
                if (instanceObject?.native && typeof instanceObject.native === 'object') {
                    currentConfig = instanceObject.native;
                }
            } catch (error) {
                this.log.debug(
                    `Could not read latest saved instance configuration for discovery: ${error.message || error}`,
                );
            }

            const configuredPrinters = Array.isArray(currentConfig.printers)
                ? currentConfig.printers.filter(item => item && typeof item === 'object')
                : [];

            // Preserve a legacy single-printer config when the table is empty.
            if (!configuredPrinters.length && currentConfig.host && currentConfig.serial && currentConfig.Password) {
                configuredPrinters.push({
                    name: currentConfig.printerName || currentConfig.printerModel || currentConfig.serial,
                    host: currentConfig.host,
                    serial: currentConfig.serial,
                    Password: currentConfig.Password,
                    printerModel: currentConfig.printerModel || '',
                    requestInterval: currentConfig.requestInterval || 300,
                });
            }

            const knownSerials = new Set(
                configuredPrinters
                    .map(item =>
                        String(item.serial || '')
                            .trim()
                            .toUpperCase(),
                    )
                    .filter(Boolean),
            );
            const knownNames = new Set(
                configuredPrinters
                    .map(item =>
                        String(item.name || '')
                            .trim()
                            .toLowerCase(),
                    )
                    .filter(Boolean),
            );
            const additions = [];
            const discoveredSummary = [];

            for (const printer of discovered) {
                const modelLabel = printer.model || printer.modelCode || 'BambuLab printer';
                const printerLabel = printer.name || modelLabel;
                discoveredSummary.push(
                    `${printerLabel} — ${printer.ip}` +
                        `${printer.serial ? ` — S/N: ${printer.serial}` : ''}` +
                        `${printer.modelCode ? ` — model code: ${printer.modelCode}` : ''}`,
                );

                if (!printer.serial || knownSerials.has(printer.serial.toUpperCase())) {
                    continue;
                }

                const serialSuffix = printer.serial.slice(-4);
                let name = String(printer.name || `${modelLabel}_${serialSuffix}`).trim();
                if (knownNames.has(name.toLowerCase())) {
                    name = `${name}_${serialSuffix}`;
                }
                let suffix = 2;
                const baseName = name;
                while (knownNames.has(name.toLowerCase())) {
                    name = `${baseName}_${suffix++}`;
                }
                knownNames.add(name.toLowerCase());
                knownSerials.add(printer.serial.toUpperCase());

                additions.push({
                    name,
                    host: printer.ip,
                    serial: printer.serial,
                    Password: '',
                    printerModel: printer.model || '',
                    requestInterval: 300,
                });
            }

            if (!discovered.length) {
                this.lastDiscoveryResult =
                    'No BambuLab printer was detected. Check that the printer and ioBroker VM are on the same LAN/VLAN and that UDP discovery traffic is allowed. You can still enter a printer manually.';
            } else {
                this.lastDiscoveryResult =
                    `Found ${discovered.length} BambuLab printer(s):\n${discoveredSummary.join('\n')}\n\n` +
                    `Added ${additions.length} new printer row(s). Access codes are not broadcast and must be entered manually.`;
            }

            this.log.info(
                `Network discovery completed: ${discovered.length} printer(s) found, ` +
                    `${additions.length} new configuration row(s).`,
            );
            const updatedNative = {
                ...currentConfig,
                printers: [...configuredPrinters, ...additions],
            };

            if (additions.length > 0) {
                // Persist the merged printer list first. The instance-config Admin
                // view does not reliably reinitialize ConfigTable from response.native.
                // A backend refresh command makes Admin reload the instance GUI and
                // its native configuration from the saved object.
                await this.extendForeignObjectAsync(`system.adapter.${this.namespace}`, {
                    native: { printers: updatedNative.printers },
                });
                this.config = updatedNative;
                this.log.info(
                    `Saved ${additions.length} discovered printer row(s); requesting Admin instance-config refresh.`,
                );
                this.sendTo(
                    obj.from,
                    obj.command,
                    { command: { command: 'refresh' } },
                    obj.callback,
                );
                return;
            }

            this.log.debug(
                `Discovery found no new printers; existing configuration remains unchanged (${updatedNative.printers.length} row(s)).`,
            );
            this.sendTo(
                obj.from,
                obj.command,
                {
                    result: `Found ${discovered.length} printer(s), but all are already configured.`,
                },
                obj.callback,
            );
        } catch (error) {
            this.lastDiscoveryResult = `Network discovery failed: ${error.message || error}`;
            this.log.warn(this.lastDiscoveryResult);
            this.sendTo(obj.from, obj.command, { error: this.lastDiscoveryResult }, obj.callback);
        } finally {
            this.discoveryInProgress = false;
        }
    }

    async onStateChange(id, state) {
        const printerId = getPrinterIdFromStateId(id, this.namespace, [...this.printers.keys()]);
        if (!printerId) {
            return;
        }
        return this.printers.get(printerId).handlePrinterStateChange(id, state);
    }

    async handlePrinterStateChange(id, state) {
        if (state && state.val != null) {
            // Only act on trigger if value is not Acknowledged
            if (!state.ack) {
                this.log.debug(`${id} | ${state.val}`);
                let msg;
                const checkID = id.split('.');

                //ToDo: Implement ACK based on success message of MQTT in relation to sequence ID.
                // Handle control states

                let stateLocation = 3;
                if (checkID[3] === 'control') {
                    stateLocation = 4;
                }

                switch (checkID[stateLocation]) {
                    case '_customGcode':
                        // Check if this G-code command should be blocked during printing
                        if (this.shouldBlockGcodeCommand(state.val)) {
                            this.log.warn(
                                `Blocked dangerous G-code command "${state.val}" during active printing/working state (stg_cur: ${this.currentPrintingState}). Command ignored for safety.`,
                            );
                            return; // Exit without sending the command
                        }

                        msg = {
                            print: {
                                command: 'gcode_line',
                                param: `${state.val}`,
                                sequence_id: '0',
                            },
                        };
                        break;
                    case 'lightChamber':
                        if (state.val === true) {
                            msg = {
                                system: {
                                    sequence_id: '2003',
                                    command: 'ledctrl',
                                    led_node: 'chamber_light',
                                    led_mode: 'on',
                                    led_on_time: 500,
                                    led_off_time: 500,
                                    loop_times: 0,
                                    interval_time: 0,
                                },
                                user_id: '2712364565',
                            };
                        } else if (state.val === false) {
                            msg = {
                                system: {
                                    sequence_id: '2003',
                                    command: 'ledctrl',
                                    led_node: 'chamber_light',
                                    led_mode: 'off',
                                    led_on_time: 500,
                                    led_off_time: 500,
                                    loop_times: 0,
                                    interval_time: 0,
                                },
                            };
                        }
                        break;
                    case 'lightToolHeadLogo':
                        if (state.val === true) {
                            msg = {
                                print: {
                                    command: 'gcode_line',
                                    param: `M960 S5 P1 \n`,
                                    sequence_id: '0',
                                },
                            };
                        } else if (state.val === false) {
                            msg = {
                                print: {
                                    command: 'gcode_line',
                                    param: `M960 S5 P0 \n`,
                                    sequence_id: '0',
                                },
                            };
                        }
                        break;
                    case 'pause':
                        msg = {
                            print: {
                                sequence_id: '0',
                                command: 'pause',
                            },
                        };
                        break;
                    case 'updateHMSErrorCodeTranslation':
                        await this.loadHMSErrorCodeTranslations();
                        break;
                    case 'stop':
                        msg = {
                            print: {
                                sequence_id: '0',
                                command: 'stop',
                            },
                        };
                        break;
                    case 'resume':
                        msg = {
                            print: {
                                sequence_id: '0',
                                command: 'resume',
                            },
                        };
                        break;
                    case 'fanSpeedChamber': {
                        const fanValue = this.validateNumericControl(state.val, 'chamber fan', 0, 100);
                        if (fanValue === null) {
                            return;
                        }
                        msg = {
                            print: {
                                command: 'gcode_line',
                                param: `M106 P3 S${fanValue * 2.55} \n`,
                                sequence_id: '0',
                            },
                        };
                        break;
                    }
                    case 'spd_lvl': {
                        const speedLevel = this.validateNumericControl(state.val, 'print speed', 1, 4, true);
                        if (speedLevel === null) {
                            return;
                        }
                        msg = {
                            print: {
                                command: 'print_speed',
                                param: `${speedLevel} \n`,
                                sequence_id: '0',
                            },
                        };
                        break;
                    }
                    case 'bed_target_temper': {
                        const temperature = this.validateNumericControl(state.val, 'bed temperature', 0, 120);
                        if (temperature === null) {
                            return;
                        }
                        msg = {
                            print: {
                                command: 'gcode_line',
                                param: `M140 S${temperature} \n`,
                                sequence_id: '0',
                            },
                        };
                        break;
                    }
                    case 'nozzle_target_temper': {
                        const temperature = this.validateNumericControl(state.val, 'nozzle temperature', 0, 350);
                        if (temperature === null) {
                            return;
                        }
                        msg = {
                            print: {
                                command: 'gcode_line',
                                param: `M104 S${temperature} \n`,
                                sequence_id: '0',
                            },
                        };
                        break;
                    }
                    case 'big_fan1_speed': {
                        const fanValue = this.validateNumericControl(state.val, 'auxiliary fan', 0, 100);
                        if (fanValue === null) {
                            return;
                        }
                        msg = {
                            print: {
                                command: 'gcode_line',
                                param: `M106 P2 S${fanValue * 2.55} \n`,
                                sequence_id: '0',
                            },
                        };
                        break;
                    }
                    case 'big_fan2_speed': {
                        const fanValue = this.validateNumericControl(state.val, 'chamber fan', 0, 100);
                        if (fanValue === null) {
                            return;
                        }
                        msg = {
                            print: {
                                command: 'gcode_line',
                                param: `M106 P3 S${fanValue * 2.55} \n`,
                                sequence_id: '0',
                            },
                        };
                        break;
                    }
                    case 'cooling_fan_speed': {
                        const fanValue = this.validateNumericControl(state.val, 'cooling fan', 0, 100);
                        if (fanValue === null) {
                            return;
                        }
                        msg = {
                            print: {
                                command: 'gcode_line',
                                param: `M106 P1 S${fanValue * 2.55} \n`,
                                sequence_id: '0',
                            },
                        };
                        break;
                    }
                    case 'homing':
                        // Block homing (G28) command during active printing/working state
                        if (this.isPrintingOrActiveState()) {
                            this.log.warn(
                                `Blocked homing command (G28) during active printing/working state (stg_cur: ${this.currentPrintingState}). Command ignored for safety.`,
                            );
                            return; // Exit without sending the command
                        }

                        msg = {
                            print: {
                                command: 'gcode_line',
                                param: 'G28 \n',
                                reason: 'SUCCESS',
                                result: 'SUCCESS',
                                sequence_id: '20086',
                                user_id: '1767420324',
                            },
                        };
                        break;
                }

                if (msg) {
                    this.publishMQTTmessages(msg);
                }
            }
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options] - Adapter configuration options
     */
    module.exports = options => new BambulabConnect(options);
} else {
    // otherwise start the instance directly
    new BambulabConnect();
}
