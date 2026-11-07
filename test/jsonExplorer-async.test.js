const { expect } = require('chai');

const jsonExplorer = require('../lib/jsonExplorer');

describe('Local jsonExplorer async traversal', () => {
    let mockAdapter;
    const writes = [];

    beforeEach(() => {
        writes.length = 0;
        mockAdapter = {
            log: {
                silly: () => {},
                debug: () => {},
                info: () => {},
                warn: () => {},
                error: () => {},
            },
            FORBIDDEN_CHARS: /[\]\[*,;'"`<>\\?]/g,
            setObjectAsync: async (id, object) => {
                writes.push({ kind: 'object', id, object });
            },
            extendObjectAsync: async (id, object) => {
                writes.push({ kind: 'extend', id, object });
            },
            getObjectAsync: async () => null,
            setStateAsync: async (id, state) => {
                await new Promise(resolve => setTimeout(resolve, 5));
                writes.push({ kind: 'state', id, state });
            },
            subscribeStates: () => {},
            setTimeout: (callback, ms) => setTimeout(callback, ms),
            createdStatesDetails: {},
        };
        jsonExplorer.init(mockAdapter, {});
    });

    it('awaits nested object and primitive-array state writes before resolving', async () => {
        await jsonExplorer.traverseJson(
            {
                temperature: 220,
                nested: { enabled: true },
                values: [1, 2, 3],
            },
            'printer',
            false,
            false,
            0,
            false,
        );

        const stateWrites = writes.filter(entry => entry.kind === 'state');
        expect(stateWrites.map(entry => entry.id)).to.have.members([
            'printer.temperature',
            'printer.nested.enabled',
            'printer.values',
        ]);
        expect(stateWrites).to.have.lengthOf(3);
        expect(stateWrites.find(entry => entry.id === 'printer.values').state.val).to.equal('[1,2,3]');
    });

    it('awaits mixed-array object traversal', async () => {
        await jsonExplorer.traverseJson(
            { items: [{ value: 'first' }, 2, { value: 'third' }] },
            'printer',
            false,
            false,
            0,
            false,
        );

        const stateWrites = writes.filter(entry => entry.kind === 'state');
        expect(stateWrites.map(entry => entry.id)).to.have.members([
            'printer.items.0.value',
            'printer.items.1',
            'printer.items.2.value',
        ]);
        expect(stateWrites).to.have.lengthOf(3);
    });
    it('creates structure objects only once across repeated MQTT-style updates', async () => {
        const payload = { nested: { enabled: true } };

        await jsonExplorer.traverseJson(payload, 'printer', false, false, 0, false);
        const firstObjectWrites = writes.filter(entry => entry.kind === 'object').length;

        await jsonExplorer.traverseJson(payload, 'printer', false, false, 0, false);
        const secondObjectWrites = writes.filter(entry => entry.kind === 'object').length;

        expect(firstObjectWrites).to.equal(2); // printer and printer.nested
        expect(secondObjectWrites).to.equal(firstObjectWrites);
    });

});
