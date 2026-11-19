// This file extends the AdapterConfig type from "@types/iobroker"
// using the actual properties present in io-package.json
// in order to provide typings for adapter.config properties

import { native } from '../io-package.json';

/** One row of the printer table in the instance configuration. */
interface PrinterConfigRow {
	id?: string;
	name?: string;
	host: string;
	serial: string;
	Password: string;
	printerModel?: string;
	requestInterval?: number;
	[key: string]: unknown;
}

// io-package.json defaults "printers" to [], which would otherwise be typed as never[].
type _AdapterConfig = Omit<typeof native, 'printers'> & {
	printers: PrinterConfigRow[];
	/** Optional name of a legacy single-printer configuration. */
	printerName?: string;
};

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
	namespace ioBroker {
		interface AdapterConfig extends _AdapterConfig {
			// Do not enter anything here!
		}
	}
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
