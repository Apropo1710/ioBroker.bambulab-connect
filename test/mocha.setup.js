// Don't silently swallow unhandled rejections
process.on('unhandledRejection', (e) => {
	throw e;
});

// enable the should interface with sinon
// and load chai-as-promised and sinon-chai by default
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { should, use } = require('chai');

should();
use(sinonChai);
use(chaiAsPromised);

// Unit tests run without a js-controller installation. Loading the real
// @iobroker/adapter-core outside ioBroker terminates the process
// ("Cannot find js-controller"), so unit tests get a minimal stand-in that
// only provides what lib/ needs. Integration tests use the real package.
const Module = require('module');
const os = require('os');
const path = require('path');
const adapterCorePath = require.resolve('@iobroker/adapter-core');
const adapterCoreStub = new Module(adapterCorePath);
adapterCoreStub.filename = adapterCorePath;
adapterCoreStub.loaded = true;
adapterCoreStub.exports = {
	getAbsoluteInstanceDataDir: (adapter) =>
		path.join(os.tmpdir(), 'bambulab-connect-unit-tests', (adapter && adapter.namespace) || 'instance'),
};
require.cache[adapterCorePath] = adapterCoreStub;
