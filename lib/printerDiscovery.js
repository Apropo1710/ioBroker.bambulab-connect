'use strict';

const dgram = require('node:dgram');

const SSDP_MULTICAST = '239.255.255.250';
const DISCOVERY_PORTS = [2021, 1990];
const MODEL_CODES = {
    N1: 'A1 mini',
    N2S: 'A1',
    C11: 'P1P',
    C12: 'P1S',
    'BL-P001': 'X1C',
    'BL-P002': 'X1',
    C13: 'X1E',
    O1D: 'H2D',
    O1S: 'H2S',
};
let scanInProgress = false;

function parseDiscoveryPacket(packet, remoteAddress = '') {
    const text = Buffer.isBuffer(packet) ? packet.toString('utf8') : String(packet || '');
    if (!text || !/bambu/i.test(text)) {
        return null;
    }

    const headers = new Map();
    for (const line of text.split(/\r?\n/)) {
        const separator = line.indexOf(':');
        if (separator <= 0) {
            continue;
        }
        headers.set(line.slice(0, separator).trim().toLowerCase(), line.slice(separator + 1).trim());
    }

    const getHeader = (...names) => {
        for (const name of names) {
            const value = headers.get(name.toLowerCase());
            if (value) {
                return value;
            }
        }
        return '';
    };

    const location = getHeader('location');
    let ip = remoteAddress;
    if (location) {
        try {
            const parsed = new URL(location);
            if (parsed.hostname) {
                ip = parsed.hostname;
            }
        } catch {
            // Some firmware versions report a bare IP address in LOCATION.
            if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(location)) {
                ip = location;
            }
        }
    }

    const usn = getHeader('usn', 'unique service name');
    const serial =
        getHeader('devserial.bambu.com', 'serial.bambu.com', 'serialnumber', 'serial') ||
        (usn.match(/(?:uuid:)?([^:]+)(?:::|$)/i)?.[1] || '').trim();
    const modelCode = getHeader('devmodel.bambu.com', 'devmodel', 'model.bambu.com', 'model');
    const name = getHeader('devname.bambu.com', 'devname', 'friendlyname', 'name.bambu.com');
    const firmware = getHeader('devversion.bambu.com', 'devversion', 'firmware.bambu.com');

    if (!ip || (!serial && !modelCode && !name)) {
        return null;
    }

    return {
        ip,
        serial: serial.replace(/^uuid:/i, '').trim(),
        name: name.trim(),
        modelCode: modelCode.trim(),
        model: MODEL_CODES[modelCode.trim()] || '',
        firmware: firmware.trim(),
    };
}

function buildSearchMessage() {
    return Buffer.from(
        [
            'M-SEARCH * HTTP/1.1',
            `HOST: ${SSDP_MULTICAST}:1900`,
            'MAN: "ssdp:discover"',
            'MX: 3',
            'ST: urn:bambulab-com:device:*',
            '',
            '',
        ].join('\r\n'),
    );
}

/**
 * Discover Bambu Lab printers via local UDP/SSDP announcements.
 * This is a read-only LAN scan and never attempts MQTT authentication.
 *
 * @param {{timeoutMs?: number, ports?: number[]}} options Scan settings.
 * @returns {Promise<object[]>} Deduplicated discovered printer records.
 */
function discoverPrinters({ timeoutMs = 10000, ports = DISCOVERY_PORTS } = {}) {
    if (scanInProgress) {
        return Promise.reject(new Error('A printer discovery scan is already running.'));
    }
    scanInProgress = true;

    return new Promise((resolve, reject) => {
        const found = new Map();
        const sockets = [];
        let failed = 0;
        let finished = false;
        const scanDuration = Math.max(3000, Math.min(Number(timeoutMs) || 10000, 20000));
        const searchMessage = buildSearchMessage();

        const finish = error => {
            if (finished) {
                return;
            }
            finished = true;
            clearTimeout(timer);
            for (const socket of sockets) {
                try {
                    socket.close();
                } catch {
                    // Socket may already be closed.
                }
            }
            scanInProgress = false;
            if (error && !found.size) {
                reject(error);
            } else {
                resolve([...found.values()].sort((a, b) => a.ip.localeCompare(b.ip)));
            }
        };

        const timer = setTimeout(() => finish(), scanDuration);
        timer.unref?.();

        for (const port of ports) {
            const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
            sockets.push(socket);
            socket.on('message', (message, remote) => {
                const printer = parseDiscoveryPacket(message, remote.address);
                if (!printer) {
                    return;
                }
                const key = printer.serial || `${printer.ip}:${printer.modelCode}`;
                const previous = found.get(key) || {};
                found.set(key, { ...previous, ...printer });
            });
            socket.on('error', error => {
                failed++;
                if (failed === ports.length) {
                    finish(error);
                }
                try {
                    socket.close();
                } catch {
                    // Ignore close errors.
                }
            });
            socket.bind(port, '0.0.0.0', () => {
                try {
                    socket.setBroadcast(true);
                    try {
                        socket.addMembership(SSDP_MULTICAST);
                    } catch {
                        // Multicast may be unavailable on this interface; broadcast listening still works.
                    }
                    socket.send(searchMessage, 1900, SSDP_MULTICAST, () => {});
                    socket.send(searchMessage, port, SSDP_MULTICAST, () => {});
                    socket.send(searchMessage, port, '255.255.255.255', () => {});
                } catch {
                    // Continue listening for passive announcements if the probe cannot be sent.
                }
            });
        }
    });
}

module.exports = { parseDiscoveryPacket, discoverPrinters, MODEL_CODES };
