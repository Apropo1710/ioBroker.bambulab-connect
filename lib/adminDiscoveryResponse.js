'use strict';

/**
 * Build the response expected by Admin json-config's ConfigSendto component.
 *
 * Admin 8.3.5 (json-config 10.1.8) applies response.native through onChangeAsync,
 * calls forceUpdate for those native keys, and invokes onChange when saveConfig
 * is true. Keep this response shape in one place so it can be regression-tested.
 *
 * @param {object[]} printers complete printer table rows
 * @returns {{native: {printers: object[]}, saveConfig: boolean}}
 */
function createAdminDiscoveryResponse(printers) {
    return {
        native: { printers },
        saveConfig: true,
    };
}

module.exports = { createAdminDiscoveryResponse };
