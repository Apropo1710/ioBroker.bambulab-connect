'use strict';

/**
 * Build the response expected by Admin json-config's ConfigSendto component.
 *
 * Admin 8.3.5 (json-config 10.1.8) applies response.native through onChangeAsync
 * and schedules the table force-update 300 ms later. Do not request an automatic
 * save here: let the user save the updated form after the table has rendered,
 * avoiding a save against a stale table state.
 *
 * @param {object[]} printers complete printer table rows
 * @returns {{native: {printers: object[]}}}
 */
function createAdminDiscoveryResponse(printers) {
    return {
        native: { printers },
    };
}

module.exports = { createAdminDiscoveryResponse };
