import type { INodeProperties } from 'bonkxbt-workflow';

export const cloneFields: INodeProperties[] = [
	{
		displayName: 'Source Repository',
		name: 'sourceRepository',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['clone'],
			},
		},
		default: '',
		placeholder: 'https://github.com/bonkxbt-io/bonkxbt',
		description: 'The URL or path of the repository to clone',
		required: true,
	},
];
