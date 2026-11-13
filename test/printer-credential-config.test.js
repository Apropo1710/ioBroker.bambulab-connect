'use strict';

const { expect } = require('chai');
const fs = require('node:fs');
const path = require('node:path');

describe('printer credential configuration', () => {
    it('uses js-controller encryptedNative without the table XOR encryption layer', () => {
        const adminConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'admin', 'jsonConfig.json'), 'utf8'));
        const adapterConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'io-package.json'), 'utf8'));

        expect(adminConfig.items.printers.encryptedAttributes).to.equal(undefined);
        expect(adminConfig.items.printers.items.find(item => item.attr === 'Password').type).to.equal('password');
        expect(adapterConfig.encryptedNative).to.include('printers.Password');
        expect(adapterConfig.protectedNative).to.include('printers.Password');
    });
});
