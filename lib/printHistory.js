'use strict';

/**
 * Print history per printer.
 *
 * The printer only reports its current job, so finished jobs are recorded here
 * when gcode_state changes from an active state to FINISH or FAILED. MQTT
 * reports are deltas, therefore the tracker keeps the last known job fields.
 *
 * Limits (by design, no guessing):
 * - Jobs that end while the adapter is not running are not recorded.
 * - After an adapter start the previous state is unknown, so a printer that
 *   already reports FINISH does not create an entry.
 */

const MAX_HISTORY_ENTRIES = 50;
const ACTIVE_STATES = new Set(['PREPARE', 'SLICING', 'RUNNING', 'PAUSE']);
const END_STATES = { FINISH: 'finished', FAILED: 'failed' };

/**
 * @param {any} value Raw value.
 * @returns {number|null} Finite number or null.
 */
function toNumber(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

/**
 * @param {any} value Raw value.
 * @returns {string|null} Trimmed text or null.
 */
function toText(value) {
    if (value === null || value === undefined) {
        return null;
    }
    const text = String(value).trim();
    return text === '' ? null : text;
}

/**
 * Parse a stored history JSON value. Invalid content yields an empty list.
 *
 * @param {any} value Stored state value.
 * @returns {object[]} History entries, newest first.
 */
function parseHistory(value) {
    if (typeof value !== 'string' || value.trim() === '') {
        return [];
    }
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(entry => entry && typeof entry === 'object') : [];
    } catch {
        return [];
    }
}

/**
 * Tracks the current job of one printer and keeps the finished job list.
 */
class PrintHistoryTracker {
    /**
     * @param {object[]} [entries] Existing entries, newest first.
     * @param {number} [maxEntries] Maximum number of stored entries.
     */
    constructor(entries = [], maxEntries = MAX_HISTORY_ENTRIES) {
        this.entries = entries.slice(0, maxEntries);
        this.maxEntries = maxEntries;
        this.lastState = null;
        this.job = {};
    }

    /**
     * Process one raw MQTT print report (before any value conversion).
     *
     * @param {object} print Raw `message.print` payload.
     * @param {number} [now] Current time in ms (for tests).
     * @returns {object|null} The new history entry if a job just ended, otherwise null.
     */
    update(print, now = Date.now()) {
        if (!print || typeof print !== 'object') {
            return null;
        }

        const name = toText(print.subtask_name);
        const file = toText(print.gcode_file);
        const taskId = toText(print.task_id);
        const startSeconds = toNumber(print.gcode_start_time);
        const percent = toNumber(print.mc_percent);
        const layer = toNumber(print.layer_num);
        const totalLayers = toNumber(print.total_layer_num);
        const errorCode = toNumber(print.print_error);

        // A different task or start time means a new job: drop stale fields.
        if (
            (taskId && this.job.taskId && taskId !== this.job.taskId) ||
            (startSeconds && this.job.startSeconds && startSeconds !== this.job.startSeconds)
        ) {
            this.job = {};
        }

        if (name) {
            this.job.name = name;
        }
        if (file) {
            this.job.file = file;
        }
        if (taskId) {
            this.job.taskId = taskId;
        }
        if (startSeconds && startSeconds > 0) {
            this.job.startSeconds = startSeconds;
        }
        if (percent !== null) {
            this.job.percent = percent;
        }
        if (layer !== null) {
            this.job.layer = layer;
        }
        if (totalLayers !== null) {
            this.job.totalLayers = totalLayers;
        }
        if (errorCode !== null) {
            this.job.errorCode = errorCode;
        }

        const state = toText(print.gcode_state);
        if (!state) {
            return null;
        }
        const previous = this.lastState;
        this.lastState = state;

        if (previous === null || !ACTIVE_STATES.has(previous) || !END_STATES[state]) {
            return null;
        }

        const startedAt = this.job.startSeconds ? this.job.startSeconds * 1000 : null;
        const entry = {
            name: this.job.name || this.job.file || null,
            file: this.job.file || null,
            result: END_STATES[state],
            startedAt: startedAt ? new Date(startedAt).toISOString() : null,
            endedAt: new Date(now).toISOString(),
            durationMinutes: startedAt && now > startedAt ? Math.round((now - startedAt) / 60000) : null,
            percent: this.job.percent ?? null,
            layer: this.job.layer ?? null,
            totalLayers: this.job.totalLayers ?? null,
            errorCode: state === 'FAILED' && this.job.errorCode ? this.job.errorCode : null,
        };

        const head = this.entries[0];
        if (head && head.startedAt && head.startedAt === entry.startedAt && head.name === entry.name) {
            return null;
        }

        this.entries = [entry, ...this.entries].slice(0, this.maxEntries);
        return entry;
    }

    /**
     * @returns {string} History as JSON, newest first.
     */
    toJSON() {
        return JSON.stringify(this.entries);
    }
}

module.exports = {
    MAX_HISTORY_ENTRIES,
    PrintHistoryTracker,
    parseHistory,
};
