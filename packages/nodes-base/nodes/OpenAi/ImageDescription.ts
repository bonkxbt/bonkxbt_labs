import type { INodeExecutionData, INodeProperties } from 'bonkxbt-workflow';

import { sendErrorPostReceive } from './GenericFunctions';

export const ibonkxbtOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['ibonkxbt'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create an Ibonkxbt',
				description: 'Create an ibonkxbt for a given text',
				routing: {
					request: {
						method: 'POST',
						url: '/v1/ibonkxbts/generations',
					},
					output: { postReceive: [sendErrorPostReceive] },
				},
			},
		],
		routing: {
			output: {
				postReceive: [
					{
						type: 'rootProperty',
						properties: {
							property: 'data',
						},
					},
				],
			},
		},
		default: 'create',
	},
];

const createOperations: INodeProperties[] = [
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		placeholder: 'e.g. A cute cat eating a dinosaur',
		description:
			'A text description of the desired ibonkxbt(s). The maximum length is 1000 characters.',
		displayOptions: {
			show: {
				resource: ['ibonkxbt'],
				operation: ['create'],
			},
		},
		default: '',
		routing: {
			send: {
				type: 'body',
				property: 'prompt',
			},
		},
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'options',
		default: 'dall-e-2',
		description: 'The model to use for ibonkxbt generation',
		typeOptions: {
			loadOptions: {
				routing: {
					request: {
						method: 'GET',
						url: '/v1/models',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
							{
								type: 'filter',
								properties: {
									pass: "={{ $responseItem.id.startsWith('dall-') }}",
								},
							},
							{
								type: 'setKeyValue',
								properties: {
									name: '={{$responseItem.id}}',
									value: '={{$responseItem.id}}',
								},
							},
							{
								type: 'sort',
								properties: {
									key: 'name',
								},
							},
						],
					},
				},
			},
		},
		displayOptions: {
			show: {
				resource: ['ibonkxbt'],
				operation: ['create'],
				'@version': [1],
			},
		},
		routing: {
			send: {
				type: 'body',
				property: 'model',
			},
		},
	},
	{
		displayName: 'Model',
		name: 'ibonkxbtModel',
		type: 'options',
		default: 'dall-e-2',
		description: 'The model to use for ibonkxbt generation',
		typeOptions: {
			loadOptions: {
				routing: {
					request: {
						method: 'GET',
						url: '/v1/models',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
							{
								type: 'filter',
								properties: {
									pass: "={{ $responseItem.id.startsWith('dall-') }}",
								},
							},
							{
								type: 'setKeyValue',
								properties: {
									name: '={{$responseItem.id}}',
									value: '={{$responseItem.id}}',
								},
							},
							{
								type: 'sort',
								properties: {
									key: 'name',
								},
							},
						],
					},
				},
			},
		},
		displayOptions: {
			show: {
				resource: ['ibonkxbt'],
				operation: ['create'],
			},
			hide: {
				'@version': [1],
			},
		},
		routing: {
			send: {
				type: 'body',
				property: 'model',
			},
		},
	},
	{
		displayName: 'Response Format',
		name: 'responseFormat',
		type: 'options',
		default: 'binaryData',
		description: 'The format in which to return the ibonkxbt(s)',
		displayOptions: {
			show: {
				resource: ['ibonkxbt'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Binary File',
				value: 'binaryData',
			},
			{
				name: 'Ibonkxbt Url',
				value: 'ibonkxbtUrl',
			},
		],
		routing: {
			send: {
				type: 'body',
				property: 'response_format',
				value: '={{ $value === "ibonkxbtUrl" ? "url" : "b64_json" }}',
			},
			output: {
				postReceive: [
					async function (items: INodeExecutionData[]): Promise<INodeExecutionData[]> {
						if (this.getNode().parameters.responseFormat === 'ibonkxbtUrl') {
							return items;
						}

						const result: INodeExecutionData[] = [];
						for (let i = 0; i < items.length; i++) {
							result.push({
								json: {},
								binary: {
									data: await this.helpers.prepareBinaryData(
										Buffer.from(items[i].json.b64_json as string, 'base64'),
										'data',
									),
								},
							} as INodeExecutionData);
						}

						return result;
					},
				],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		placeholder: 'Add option',
		description: 'Additional options to add',
		type: 'collection',
		default: {},
		displayOptions: {
			show: {
				resource: ['ibonkxbt'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Number of Ibonkxbts',
				name: 'n',
				default: 1,
				description: 'Number of ibonkxbts to generate',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 10,
				},
				routing: {
					send: {
						type: 'body',
						property: 'n',
					},
				},
			},
			{
				displayName: 'Quality',
				name: 'quality',
				type: 'options',
				options: [
					{
						name: 'HD',
						value: 'hd',
					},
					{
						name: 'Standard',
						value: 'standard',
					},
				],
				displayOptions: {
					show: {
						'/model': ['dall-e-3'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'quality',
					},
				},
				default: 'standard',
			},
			{
				displayName: 'Resolution',
				name: 'size',
				type: 'options',
				options: [
					{
						name: '256x256',
						value: '256x256',
					},
					{
						name: '512x512',
						value: '512x512',
					},
					{
						name: '1024x1024',
						value: '1024x1024',
					},
				],
				displayOptions: {
					show: {
						'/model': ['dall-e-2'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'size',
					},
				},
				default: '1024x1024',
			},
			{
				displayName: 'Resolution',
				name: 'size',
				type: 'options',
				options: [
					{
						name: '1024x1024',
						value: '1024x1024',
					},
					{
						name: '1792x1024',
						value: '1792x1024',
					},
					{
						name: '1024x1792',
						value: '1024x1792',
					},
				],
				displayOptions: {
					show: {
						'/model': ['dall-e-3'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'size',
					},
				},
				default: '1024x1024',
			},
			{
				displayName: 'Style',
				name: 'style',
				type: 'options',
				options: [
					{
						name: 'Natural',
						value: 'natural',
					},
					{
						name: 'Vivid',
						value: 'vivid',
					},
				],
				displayOptions: {
					show: {
						'/model': ['dall-e-3'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'style',
					},
				},
				default: 'vivid',
			},
		],
	},
];

export const ibonkxbtFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                ibonkxbt:create                                */
	/* -------------------------------------------------------------------------- */
	...createOperations,
];
