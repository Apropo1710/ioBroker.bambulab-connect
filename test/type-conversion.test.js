const { expect } = require('chai');

const jsonExplorer = require('../lib/jsonExplorer');
const stateAttr = require('../lib/state_attr');

describe('Type Conversion Tests', () => {
    let mockAdapter;
    const writtenStates = [];

    before(() => {
        mockAdapter = {
            log: {
                silly: () => {},
                debug: () => {},
                info: () => {},
                warn: () => {},
                error: () => {},
            },
            FORBIDDEN_CHARS: /[\\]\\[*,;'"`<>\\\\?]/g,
            setObjectAsync: async () => {},
            extendObjectAsync: async () => {},
            getObjectAsync: async () => null,
            setStateAsync: async (id, state) => writtenStates.push({ id, state }),
            subscribeStates: () => {},
            setTimeout: (callback, ms) => setTimeout(callback, ms),
            createdStatesDetails: {},
        };
        jsonExplorer.init(mockAdapter, stateAttr);
    });

    describe('Local jsonExplorer conversions', () => {
        it('converts strings to integers using TOINTEGER', async () => {
            stateAttr.__test_integer = { type: 'number', modify: 'TOINTEGER' };
            await jsonExplorer.stateSetCreate('__test_integer', '__test_integer', '42', false);
            expect(writtenStates.at(-1).state.val).to.equal(42);
            expect(typeof writtenStates.at(-1).state.val).to.equal('number');
            delete stateAttr.__test_integer;
        });

        it('converts strings to floats using TOFLOAT', async () => {
            stateAttr.__test_float = { type: 'number', modify: 'TOFLOAT' };
            await jsonExplorer.stateSetCreate('__test_float', '__test_float', '42.5', false);
            expect(writtenStates.at(-1).state.val).to.equal(42.5);
            expect(typeof writtenStates.at(-1).state.val).to.equal('number');
            delete stateAttr.__test_float;
        });
    });

    describe('State attribute definitions', () => {
        it('has proper modify attributes for fan speed states', () => {
            expect(stateAttr.heatbreak_fan_speed).to.exist;
            expect(stateAttr.heatbreak_fan_speed.modify).to.be.an('array');
            expect(stateAttr.heatbreak_fan_speed.type).to.equal('number');

            expect(stateAttr.cooling_fan_speed).to.exist;
            expect(stateAttr.cooling_fan_speed.modify).to.be.an('array');
            expect(stateAttr.cooling_fan_speed.type).to.equal('number');
        });

        it('does not use deprecated tonumber modifier', () => {
            const problematicStates = Object.keys(stateAttr).filter(key => {
                const attr = stateAttr[key];
                return attr.modify && Array.isArray(attr.modify) && attr.modify.includes('tonumber');
            });
            expect(problematicStates).to.have.lengthOf(0, `States still using deprecated 'tonumber': ${problematicStates.join(', ')}`);
        });

        it('uses proper conversion methods for number types', () => {
            expect(stateAttr.heatbreak_fan_speed.modify).to.include('TOINTEGER');
            expect(stateAttr.cooling_fan_speed.modify).to.include('TOINTEGER');
            expect(stateAttr.nozzle_temper.modify).to.include('TOFLOAT');
            expect(stateAttr.bed_temper.modify).to.include('TOFLOAT');
        });
    });
});
