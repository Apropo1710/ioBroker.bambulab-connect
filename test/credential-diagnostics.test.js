'use strict';

const { expect } = require('chai');
const { compareCredentialValues } = require('../lib/credentialDiagnostics');

describe('credential diagnostics', () => {
    it('reports matching non-empty strings', () => {
        expect(compareCredentialValues('same-token', 'same-token')).to.equal(true);
    });

    it('reports different strings without returning either value', () => {
        expect(compareCredentialValues('table-token', 'legacy-token')).to.equal(false);
    });

    it('reports unavailable for missing, empty, or non-string values', () => {
        expect(compareCredentialValues('', '')).to.equal(null);
        expect(compareCredentialValues('token', undefined)).to.equal(null);
        expect(compareCredentialValues(undefined, 'token')).to.equal(null);
        expect(compareCredentialValues(123, 'token')).to.equal(null);
    });
});
