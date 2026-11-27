'use strict';

const { expect } = require('chai');
const { PrintHistoryTracker, parseHistory } = require('../lib/printHistory');

const START = 1764200000; // seconds

describe('printHistory', () => {
    it('records a finished job from delta reports', () => {
        const tracker = new PrintHistoryTracker();
        tracker.update({
            gcode_state: 'PREPARE',
            subtask_name: 'Benchy',
            gcode_start_time: String(START),
            task_id: '7',
        });
        tracker.update({ gcode_state: 'RUNNING', mc_percent: 50, total_layer_num: 200 });
        tracker.update({ mc_percent: 100, layer_num: 200 });
        const entry = tracker.update({ gcode_state: 'FINISH' }, START * 1000 + 90 * 60000);
        expect(entry).to.include({ name: 'Benchy', result: 'finished', durationMinutes: 90, percent: 100 });
        expect(entry.totalLayers).to.equal(200);
        expect(JSON.parse(tracker.toJSON())).to.have.length(1);
    });

    it('records a failed job with error code', () => {
        const tracker = new PrintHistoryTracker();
        tracker.update({ gcode_state: 'RUNNING', subtask_name: 'Box', gcode_start_time: START, mc_percent: 12 });
        const entry = tracker.update({ gcode_state: 'FAILED', print_error: 50348044 });
        expect(entry).to.include({ name: 'Box', result: 'failed', errorCode: 50348044, percent: 12 });
    });

    it('does not record when the previous state is unknown (adapter start)', () => {
        const tracker = new PrintHistoryTracker();
        expect(tracker.update({ gcode_state: 'FINISH', subtask_name: 'Old' })).to.equal(null);
        expect(tracker.entries).to.have.length(0);
    });

    it('ignores repeated end states and IDLE afterwards', () => {
        const tracker = new PrintHistoryTracker();
        tracker.update({ gcode_state: 'RUNNING', subtask_name: 'A', gcode_start_time: START });
        tracker.update({ gcode_state: 'FINISH' });
        expect(tracker.update({ gcode_state: 'FINISH' })).to.equal(null);
        expect(tracker.update({ gcode_state: 'IDLE' })).to.equal(null);
        expect(tracker.entries).to.have.length(1);
    });

    it('clears stale fields for a new job and keeps newest first, limited', () => {
        const tracker = new PrintHistoryTracker([], 2);
        for (let i = 1; i <= 3; i++) {
            tracker.update({
                gcode_state: 'RUNNING',
                subtask_name: `Job${i}`,
                gcode_start_time: START + i,
                task_id: String(i),
            });
            tracker.update({ gcode_state: 'FINISH' });
        }
        expect(tracker.entries.map(e => e.name)).to.deep.equal(['Job3', 'Job2']);
    });

    it('parses stored history safely', () => {
        expect(parseHistory('not json')).to.deep.equal([]);
        expect(parseHistory('{"a":1}')).to.deep.equal([]);
        expect(parseHistory('[{"name":"x"},null]')).to.deep.equal([{ name: 'x' }]);
    });
});
