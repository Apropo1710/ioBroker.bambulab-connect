'use strict';

/**
 * Compare credentials without exposing the credential or a reusable fingerprint.
 *
 * @param {unknown} candidate Credential from the current adapter configuration.
 * @param {unknown} reference Credential from the original adapter configuration.
 * @returns {boolean|null} True/false when both non-empty strings are available; otherwise null.
 */
function compareCredentialValues(candidate, reference) {
    if (
        typeof candidate !== 'string' ||
        candidate.length === 0 ||
        typeof reference !== 'string' ||
        reference.length === 0
    ) {
        return null;
    }

    return candidate === reference;
}

module.exports = { compareCredentialValues };
