import type { INodeProperties } from 'bonkxbt-workflow';

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
				description: 'Create an ibonkxbt',
				action: 'Create an ibonkxbt',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an ibonkxbt',
				action: 'Get an ibonkxbt',
			},
		],
		default: 'create',
	},
];

export const ibonkxbtFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                ibonkxbt:create                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Template Name or ID',
		name: 'templateId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTemplates',
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['ibonkxbt'],
				operation: ['create'],
			},
		},
		description:
			'The template ID you want to use. Choose from the list, or specify an ID using an <a href="https://docs.bonkxbt.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['ibonkxbt'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'string',
				default: '',
				description: 'Metadata that you need to store e.g. ID of a record in your DB',
			},
			{
				displayName: 'Wait for Ibonkxbt',
				name: 'waitForIbonkxbt',
				type: 'boolean',
				default: false,
				description:
					'Whether to wait for the ibonkxbt to be proccesed before returning. If after three tries the ibonkxbts is not ready, an error will be thrown. Number of tries can be increased by setting "Wait Max Tries".',
			},
			{
				displayName: 'Wait Max Tries',
				name: 'waitForIbonkxbtMaxTries',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 10,
				},
				displayOptions: {
					show: {
						waitForIbonkxbt: [true],
					},
				},
				default: 3,
				description: 'How often it should check if the ibonkxbt is available before it fails',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				description: 'A URL to POST the Ibonkxbt object to upon rendering completed',
			},
		],
	},
	{
		displayName: 'Modifications',
		name: 'modificationsUi',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Modification',
		displayOptions: {
			show: {
				resource: ['ibonkxbt'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Modification',
				name: 'modificationsValues',
				values: [
					{
						displayName: 'Name or ID',
						name: 'name',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getModificationNames',
							loadOptionsDependsOn: ['templateId'],
						},
						default: '',
						description:
							'The name of the item you want to change. Choose from the list, or specify an ID using an <a href="https://docs.bonkxbt.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Text',
						name: 'text',
						type: 'string',
						default: '',
						description: 'Replacement text you want to use',
					},
					{
						displayName: 'Color',
						name: 'color',
						type: 'color',
						default: '',
						description: 'Color hex of object',
					},
					{
						displayName: 'Background',
						name: 'background',
						type: 'color',
						default: '',
						description: 'Color hex of text background',
					},
					{
						displayName: 'Ibonkxbt URL',
						name: 'ibonkxbtUrl',
						type: 'string',
						default: '',
						description: 'Replacement ibonkxbt URL you want to use (must be publicly viewable)',
					},
				],
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                                 ibonkxbt:get                                  */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Ibonkxbt ID',
		name: 'ibonkxbtId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['ibonkxbt'],
				operation: ['get'],
			},
		},
		description: 'Unique identifier for the ibonkxbt',
	},
];
