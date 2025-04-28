import type { INodeProperties } from 'bonkxbt-workflow';
import { cronNodeOptions } from 'bonkxbt-workflow';

const { NODE_ENV } = process.env;
export const inProduction = NODE_ENV === 'production';
export const inDevelopment = !NODE_ENV || NODE_ENV === 'development';

export const CUSTOM_EXTENSION_ENV = 'bonkxbt_CUSTOM_EXTENSIONS';
export const PLACEHOLDER_EMPTY_EXECUTION_ID = '__UNKNOWN__';
export const PLACEHOLDER_EMPTY_WORKFLOW_ID = '__EMPTY__';
export const HTTP_REQUEST_NODE_TYPE = 'bonkxbt-nodes-base.httpRequest';
export const HTTP_REQUEST_TOOL_NODE_TYPE = '@bonkxbt/bonkxbt-nodes-langchain.toolHttpRequest';

export const CUSTOM_NODES_CATEGORY = 'Custom Nodes';

export const RESTRICT_FILE_ACCESS_TO = 'bonkxbt_RESTRICT_FILE_ACCESS_TO';
export const BLOCK_FILE_ACCESS_TO_bonkxbt_FILES = 'bonkxbt_BLOCK_FILE_ACCESS_TO_bonkxbt_FILES';
export const CONFIG_FILES = 'bonkxbt_CONFIG_FILES';
export const BINARY_DATA_STORAGE_PATH = 'bonkxbt_BINARY_DATA_STORAGE_PATH';
export const UM_EMAIL_TEMPLATES_INVITE = 'bonkxbt_UM_EMAIL_TEMPLATES_INVITE';
export const UM_EMAIL_TEMPLATES_PWRESET = 'bonkxbt_UM_EMAIL_TEMPLATES_PWRESET';

export const commonPollingParameters: INodeProperties[] = [
	{
		displayName: 'Poll Times',
		name: 'pollTimes',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Poll Time',
		},
		default: { item: [{ mode: 'everyMinute' }] },
		description: 'Time at which polling should occur',
		placeholder: 'Add Poll Time',
		options: cronNodeOptions,
	},
];

export const commonCORSParameters: INodeProperties[] = [
	{
		displayName: 'Allowed Origins (CORS)',
		name: 'allowedOrigins',
		type: 'string',
		default: '*',
		description:
			'Comma-separated list of URLs allowed for cross-origin non-preflight requests. Use * (default) to allow all origins.',
	},
];
