import type { CurlToJSONResponse } from '@/Interface';
import { createEventBus } from 'bonkxbt-design-system/utils';

export interface ImportCurlEventBusEvents {
	/** Command to set the HTTP node parameters based on the curl to JSON response */
	setHttpNodeParameters: CurlToJSONResponse;
}

export const importCurlEventBus = createEventBus<ImportCurlEventBusEvents>();
