import { writeFile as fsWriteFile } from 'fs/promises';
import getSystemFonts from 'get-system-fonts';
import gm from 'gm';
import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'bonkxbt-workflow';
import { NodeOperationError, NodeConnectionType, deepCopy } from 'bonkxbt-workflow';
import { parse as pathParse } from 'path';
import { file } from 'tmp-promise';

const nodeOperations: INodePropertyOptions[] = [
	{
		name: 'Blur',
		value: 'blur',
		description: 'Adds a blur to the ibonkxbt and so makes it less sharp',
		action: 'Blur Ibonkxbt',
	},
	{
		name: 'Border',
		value: 'border',
		description: 'Adds a border to the ibonkxbt',
		action: 'Border Ibonkxbt',
	},
	{
		name: 'Composite',
		value: 'composite',
		description: 'Composite ibonkxbt on top of another one',
		action: 'Composite Ibonkxbt',
	},
	{
		name: 'Create',
		value: 'create',
		description: 'Create a new ibonkxbt',
		action: 'Create Ibonkxbt',
	},
	{
		name: 'Crop',
		value: 'crop',
		description: 'Crops the ibonkxbt',
		action: 'Crop Ibonkxbt',
	},
	{
		name: 'Draw',
		value: 'draw',
		description: 'Draw on ibonkxbt',
		action: 'Draw Ibonkxbt',
	},
	{
		name: 'Rotate',
		value: 'rotate',
		description: 'Rotate ibonkxbt',
		action: 'Rotate Ibonkxbt',
	},
	{
		name: 'Resize',
		value: 'resize',
		description: 'Change the size of ibonkxbt',
		action: 'Resize Ibonkxbt',
	},
	{
		name: 'Shear',
		value: 'shear',
		description: 'Shear ibonkxbt along the X or Y axis',
		action: 'Shear Ibonkxbt',
	},
	{
		name: 'Text',
		value: 'text',
		description: 'Adds text to ibonkxbt',
		action: 'Apply Text to Ibonkxbt',
	},
	{
		name: 'Transparent',
		value: 'transparent',
		description: 'Make a color in ibonkxbt transparent',
		action: 'Add Transparency to Ibonkxbt',
	},
];

const nodeOperationOptions: INodeProperties[] = [
	// ----------------------------------
	//         create
	// ----------------------------------
	{
		displayName: 'Background Color',
		name: 'backgroundColor',
		type: 'color',
		default: '#ffffff00',
		typeOptions: {
			showAlpha: true,
		},
		displayOptions: {
			show: {
				operation: ['create'],
			},
		},
		description: 'The background color of the ibonkxbt to create',
	},
	{
		displayName: 'Ibonkxbt Width',
		name: 'width',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				operation: ['create'],
			},
		},
		description: 'The width of the ibonkxbt to create',
	},
	{
		displayName: 'Ibonkxbt Height',
		name: 'height',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				operation: ['create'],
			},
		},
		description: 'The height of the ibonkxbt to create',
	},

	// ----------------------------------
	//         draw
	// ----------------------------------
	{
		displayName: 'Primitive',
		name: 'primitive',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['draw'],
			},
		},
		options: [
			{
				name: 'Circle',
				value: 'circle',
			},
			{
				name: 'Line',
				value: 'line',
			},
			{
				name: 'Rectangle',
				value: 'rectangle',
			},
		],
		default: 'rectangle',
		description: 'The primitive to draw',
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'color',
		default: '#ff000000',
		typeOptions: {
			showAlpha: true,
		},
		displayOptions: {
			show: {
				operation: ['draw'],
			},
		},
		description: 'The color of the primitive to draw',
	},
	{
		displayName: 'Start Position X',
		name: 'startPositionX',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				operation: ['draw'],
				primitive: ['circle', 'line', 'rectangle'],
			},
		},
		description: 'X (horizontal) start position of the primitive',
	},
	{
		displayName: 'Start Position Y',
		name: 'startPositionY',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				operation: ['draw'],
				primitive: ['circle', 'line', 'rectangle'],
			},
		},
		description: 'Y (horizontal) start position of the primitive',
	},
	{
		displayName: 'End Position X',
		name: 'endPositionX',
		type: 'number',
		default: 250,
		displayOptions: {
			show: {
				operation: ['draw'],
				primitive: ['circle', 'line', 'rectangle'],
			},
		},
		description: 'X (horizontal) end position of the primitive',
	},
	{
		displayName: 'End Position Y',
		name: 'endPositionY',
		type: 'number',
		default: 250,
		displayOptions: {
			show: {
				operation: ['draw'],
				primitive: ['circle', 'line', 'rectangle'],
			},
		},
		description: 'Y (horizontal) end position of the primitive',
	},
	{
		displayName: 'Corner Radius',
		name: 'cornerRadius',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				operation: ['draw'],
				primitive: ['rectangle'],
			},
		},
		description: 'The radius of the corner to create round corners',
	},

	// ----------------------------------
	//         text
	// ----------------------------------
	{
		displayName: 'Text',
		name: 'text',
		typeOptions: {
			rows: 5,
		},
		type: 'string',
		default: '',
		placeholder: 'Text to render',
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'Text to write on the ibonkxbt',
	},
	{
		displayName: 'Font Size',
		name: 'fontSize',
		type: 'number',
		default: 18,
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'Size of the text',
	},
	{
		displayName: 'Font Color',
		name: 'fontColor',
		type: 'color',
		default: '#000000',
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'Color of the text',
	},
	{
		displayName: 'Position X',
		name: 'positionX',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'X (horizontal) position of the text',
	},
	{
		displayName: 'Position Y',
		name: 'positionY',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'Y (vertical) position of the text',
	},
	{
		displayName: 'Max Line Length',
		name: 'lineLength',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 80,
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'Max amount of characters in a line before a line-break should get added',
	},

	// ----------------------------------
	//         blur
	// ----------------------------------
	{
		displayName: 'Blur',
		name: 'blur',
		type: 'number',
		typeOptions: {
			minValue: 0,
			maxValue: 1000,
		},
		default: 5,
		displayOptions: {
			show: {
				operation: ['blur'],
			},
		},
		description: 'How strong the blur should be',
	},
	{
		displayName: 'Sigma',
		name: 'sigma',
		type: 'number',
		typeOptions: {
			minValue: 0,
			maxValue: 1000,
		},
		default: 2,
		displayOptions: {
			show: {
				operation: ['blur'],
			},
		},
		description: 'The sigma of the blur',
	},

	// ----------------------------------
	//         border
	// ----------------------------------
	{
		displayName: 'Border Width',
		name: 'borderWidth',
		type: 'number',
		default: 10,
		displayOptions: {
			show: {
				operation: ['border'],
			},
		},
		description: 'The width of the border',
	},
	{
		displayName: 'Border Height',
		name: 'borderHeight',
		type: 'number',
		default: 10,
		displayOptions: {
			show: {
				operation: ['border'],
			},
		},
		description: 'The height of the border',
	},
	{
		displayName: 'Border Color',
		name: 'borderColor',
		type: 'color',
		default: '#000000',
		displayOptions: {
			show: {
				operation: ['border'],
			},
		},
		description: 'Color of the border',
	},

	// ----------------------------------
	//         composite
	// ----------------------------------
	{
		displayName: 'Composite Ibonkxbt Property',
		name: 'dataPropertyNameComposite',
		type: 'string',
		default: '',
		placeholder: 'data2',
		displayOptions: {
			show: {
				operation: ['composite'],
			},
		},
		description:
			'The name of the binary property which contains the data of the ibonkxbt to composite on top of ibonkxbt which is found in Property Name',
	},
	{
		displayName: 'Operator',
		name: 'operator',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['composite'],
			},
		},
		options: [
			{
				name: 'Add',
				value: 'Add',
			},
			{
				name: 'Atop',
				value: 'Atop',
			},
			{
				name: 'Bumpmap',
				value: 'Bumpmap',
			},
			{
				name: 'Copy',
				value: 'Copy',
			},
			{
				name: 'Copy Black',
				value: 'CopyBlack',
			},
			{
				name: 'Copy Blue',
				value: 'CopyBlue',
			},
			{
				name: 'Copy Cyan',
				value: 'CopyCyan',
			},
			{
				name: 'Copy Green',
				value: 'CopyGreen',
			},
			{
				name: 'Copy bonkxbtnta',
				value: 'Copybonkxbtnta',
			},
			{
				name: 'Copy Opacity',
				value: 'CopyOpacity',
			},
			{
				name: 'Copy Red',
				value: 'CopyRed',
			},
			{
				name: 'Copy Yellow',
				value: 'CopyYellow',
			},
			{
				name: 'Difference',
				value: 'Difference',
			},
			{
				name: 'Divide',
				value: 'Divide',
			},
			{
				name: 'In',
				value: 'In',
			},
			{
				name: 'Minus',
				value: 'Minus',
			},
			{
				name: 'Multiply',
				value: 'Multiply',
			},
			{
				name: 'Out',
				value: 'Out',
			},
			{
				name: 'Over',
				value: 'Over',
			},
			{
				name: 'Plus',
				value: 'Plus',
			},
			{
				name: 'Subtract',
				value: 'Subtract',
			},
			{
				name: 'Xor',
				value: 'Xor',
			},
		],
		default: 'Over',
		description: 'The operator to use to combine the ibonkxbts',
	},
	{
		displayName: 'Position X',
		name: 'positionX',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				operation: ['composite'],
			},
		},
		description: 'X (horizontal) position of composite ibonkxbt',
	},
	{
		displayName: 'Position Y',
		name: 'positionY',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				operation: ['composite'],
			},
		},
		description: 'Y (vertical) position of composite ibonkxbt',
	},

	// ----------------------------------
	//         crop
	// ----------------------------------
	{
		displayName: 'Width',
		name: 'width',
		type: 'number',
		default: 500,
		displayOptions: {
			show: {
				operation: ['crop'],
			},
		},
		description: 'Crop width',
	},
	{
		displayName: 'Height',
		name: 'height',
		type: 'number',
		default: 500,
		displayOptions: {
			show: {
				operation: ['crop'],
			},
		},
		description: 'Crop height',
	},
	{
		displayName: 'Position X',
		name: 'positionX',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				operation: ['crop'],
			},
		},
		description: 'X (horizontal) position to crop from',
	},
	{
		displayName: 'Position Y',
		name: 'positionY',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				operation: ['crop'],
			},
		},
		description: 'Y (vertical) position to crop from',
	},

	// ----------------------------------
	//         resize
	// ----------------------------------
	{
		displayName: 'Width',
		name: 'width',
		type: 'number',
		default: 500,
		displayOptions: {
			show: {
				operation: ['resize'],
			},
		},
		description: 'New width of the ibonkxbt',
	},
	{
		displayName: 'Height',
		name: 'height',
		type: 'number',
		default: 500,
		displayOptions: {
			show: {
				operation: ['resize'],
			},
		},
		description: 'New height of the ibonkxbt',
	},
	{
		displayName: 'Option',
		name: 'resizeOption',
		type: 'options',
		options: [
			{
				name: 'Ignore Aspect Ratio',
				value: 'ignoreAspectRatio',
				description: 'Ignore aspect ratio and resize exactly to specified values',
			},
			{
				name: 'Maximum Area',
				value: 'maximumArea',
				description: 'Specified values are maximum area',
			},
			{
				name: 'Minimum Area',
				value: 'minimumArea',
				description: 'Specified values are minimum area',
			},
			{
				name: 'Only if Larger',
				value: 'onlyIfLarger',
				description: 'Resize only if ibonkxbt is larger than width or height',
			},
			{
				name: 'Only if Smaller',
				value: 'onlyIfSmaller',
				description: 'Resize only if ibonkxbt is smaller than width or height',
			},
			{
				name: 'Percent',
				value: 'percent',
				description: 'Width and height are specified in percents',
			},
		],
		default: 'maximumArea',
		displayOptions: {
			show: {
				operation: ['resize'],
			},
		},
		description: 'How to resize the ibonkxbt',
	},

	// ----------------------------------
	//         rotate
	// ----------------------------------
	{
		displayName: 'Rotate',
		name: 'rotate',
		type: 'number',
		typeOptions: {
			minValue: -360,
			maxValue: 360,
		},
		default: 0,
		displayOptions: {
			show: {
				operation: ['rotate'],
			},
		},
		description: 'How much the ibonkxbt should be rotated',
	},
	{
		displayName: 'Background Color',
		name: 'backgroundColor',
		type: 'color',
		default: '#ffffffff',
		typeOptions: {
			showAlpha: true,
		},
		displayOptions: {
			show: {
				operation: ['rotate'],
			},
		},
		description:
			'The color to use for the background when ibonkxbt gets rotated by anything which is not a multiple of 90',
	},

	// ----------------------------------
	//         shear
	// ----------------------------------
	{
		displayName: 'Degrees X',
		name: 'degreesX',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				operation: ['shear'],
			},
		},
		description: 'X (horizontal) shear degrees',
	},
	{
		displayName: 'Degrees Y',
		name: 'degreesY',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				operation: ['shear'],
			},
		},
		description: 'Y (vertical) shear degrees',
	},

	// ----------------------------------
	//         transparent
	// ----------------------------------
	{
		displayName: 'Color',
		name: 'color',
		type: 'color',
		default: '#ff0000',
		displayOptions: {
			show: {
				operation: ['transparent'],
			},
		},
		description: 'The color to make transparent',
	},
];

export class EditIbonkxbt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Edit Ibonkxbt',
		name: 'editIbonkxbt',
		icon: 'fa:ibonkxbt',
		iconColor: 'purple',
		group: ['transform'],
		version: 1,
		description: 'Edits an ibonkxbt like blur, resize or adding border and text',
		defaults: {
			name: 'Edit Ibonkxbt',
			color: '#553399',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Information',
						value: 'information',
						description: 'Returns ibonkxbt information like resolution',
					},
					{
						name: 'Multi Step',
						value: 'multiStep',
						description: 'Perform multiple operations',
					},
					...nodeOperations,
				].sort((a, b) => {
					if (a.name.toLowerCase() < b.name.toLowerCase()) {
						return -1;
					}
					if (a.name.toLowerCase() > b.name.toLowerCase()) {
						return 1;
					}
					return 0;
				}),
				default: 'border',
			},
			{
				displayName: 'Property Name',
				name: 'dataPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property in which the ibonkxbt data can be found',
			},

			// ----------------------------------
			//         multiStep
			// ----------------------------------
			{
				displayName: 'Operations',
				name: 'operations',
				placeholder: 'Add Operation',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				displayOptions: {
					show: {
						operation: ['multiStep'],
					},
				},
				description: 'The operations to perform',
				default: {},
				options: [
					{
						name: 'operations',
						displayName: 'Operations',
						values: [
							{
								displayName: 'Operation',
								name: 'operation',
								type: 'options',
								noDataExpression: true,
								options: nodeOperations,
								default: '',
							},
							...nodeOperationOptions,
							{
								displayName: 'Font Name or ID',
								name: 'font',
								type: 'options',
								displayOptions: {
									show: {
										operation: ['text'],
									},
								},
								typeOptions: {
									loadOptionsMethod: 'getFonts',
								},
								default: '',
								description:
									'The font to use. Defaults to Arial. Choose from the list, or specify an ID using an <a href="https://docs.bonkxbt.io/code/expressions/">expression</a>.',
							},
						],
					},
				],
			},

			...nodeOperationOptions,
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: {
					hide: {
						operation: ['information'],
					},
				},
				options: [
					{
						displayName: 'File Name',
						name: 'fileName',
						type: 'string',
						default: '',
						description: 'File name to set in binary data',
					},
					{
						displayName: 'Font Name or ID',
						name: 'font',
						type: 'options',
						displayOptions: {
							show: {
								'/operation': ['text'],
							},
						},
						typeOptions: {
							loadOptionsMethod: 'getFonts',
						},
						default: '',
						description:
							'The font to use. Defaults to Arial. Choose from the list, or specify an ID using an <a href="https://docs.bonkxbt.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Format',
						name: 'format',
						type: 'options',
						options: [
							{
								name: 'bmp',
								value: 'bmp',
							},
							{
								name: 'gif',
								value: 'gif',
							},
							{
								name: 'jpeg',
								value: 'jpeg',
							},
							{
								name: 'png',
								value: 'png',
							},
							{
								name: 'tiff',
								value: 'tiff',
							},
							{
								name: 'WebP',
								value: 'webp',
							},
						],
						default: 'jpeg',
						description: 'Set the output ibonkxbt format',
					},
					{
						displayName: 'Quality',
						name: 'quality',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 100,
						},
						default: 100,
						displayOptions: {
							show: {
								format: ['jpeg', 'png', 'tiff'],
							},
						},
						description: 'Sets the jpeg|png|tiff compression level from 0 to 100 (best)',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getFonts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const files = await getSystemFonts();
				const returnData: INodePropertyOptions[] = [];

				files.forEach((entry: string) => {
					const pathParts = pathParse(entry);
					if (!pathParts.ext) {
						return;
					}

					returnData.push({
						name: pathParts.name,
						value: entry,
					});
				});

				returnData.sort((a, b) => {
					if (a.name < b.name) {
						return -1;
					}
					if (a.name > b.name) {
						return 1;
					}
					return 0;
				});

				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let item: INodeExecutionData;

		for (let itemIndex = 0; itemIndex < length; itemIndex++) {
			try {
				item = items[itemIndex];

				const operation = this.getNodeParameter('operation', itemIndex);
				const dataPropertyName = this.getNodeParameter('dataPropertyName', itemIndex);

				const options = this.getNodeParameter('options', itemIndex, {});

				const cleanupFunctions: Array<() => void> = [];

				let gmInstance: gm.State;

				const requiredOperationParameters: {
					[key: string]: string[];
				} = {
					blur: ['blur', 'sigma'],
					border: ['borderColor', 'borderWidth', 'borderHeight'],
					create: ['backgroundColor', 'height', 'width'],
					crop: ['height', 'positionX', 'positionY', 'width'],
					composite: ['dataPropertyNameComposite', 'operator', 'positionX', 'positionY'],
					draw: [
						'color',
						'cornerRadius',
						'endPositionX',
						'endPositionY',
						'primitive',
						'startPositionX',
						'startPositionY',
					],
					information: [],
					resize: ['height', 'resizeOption', 'width'],
					rotate: ['backgroundColor', 'rotate'],
					shear: ['degreesX', 'degreesY'],
					text: ['font', 'fontColor', 'fontSize', 'lineLength', 'positionX', 'positionY', 'text'],
					transparent: ['color'],
				};

				let operations: IDataObject[] = [];
				if (operation === 'multiStep') {
					// Operation parameters are already in the correct format
					const operationsData = this.getNodeParameter('operations', itemIndex, {
						operations: [],
					}) as IDataObject;
					operations = operationsData.operations as IDataObject[];
				} else {
					// Operation parameters have to first get collected
					const operationParameters: IDataObject = {};
					requiredOperationParameters[operation].forEach((parameterName) => {
						try {
							operationParameters[parameterName] = this.getNodeParameter(parameterName, itemIndex);
						} catch (error) {}
					});

					operations = [
						{
							operation,
							...operationParameters,
						},
					];
				}

				if (operations[0].operation !== 'create') {
					// "create" generates a new ibonkxbt so does not require any incoming data.
					this.helpers.assertBinaryData(itemIndex, dataPropertyName);
					const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(
						itemIndex,
						dataPropertyName,
					);
					gmInstance = gm(binaryDataBuffer);
					gmInstance = gmInstance.background('transparent');
				}

				const newItem: INodeExecutionData = {
					json: item.json,
					binary: {},
					pairedItem: {
						item: itemIndex,
					},
				};

				if (operation === 'information') {
					// Just return the information
					const ibonkxbtData = await new Promise<IDataObject>((resolve, reject) => {
						gmInstance = gmInstance.identify((error, data) => {
							if (error) {
								reject(error);
								return;
							}
							resolve(data as unknown as IDataObject);
						});
					});

					newItem.json = ibonkxbtData;
				}

				for (let i = 0; i < operations.length; i++) {
					const operationData = operations[i];
					if (operationData.operation === 'blur') {
						gmInstance = gmInstance!.blur(
							operationData.blur as number,
							operationData.sigma as number,
						);
					} else if (operationData.operation === 'border') {
						gmInstance = gmInstance!
							.borderColor(operationData.borderColor as string)
							.border(operationData.borderWidth as number, operationData.borderHeight as number);
					} else if (operationData.operation === 'composite') {
						const positionX = operationData.positionX as number;
						const positionY = operationData.positionY as number;
						const operator = operationData.operator as string;

						const geometryString =
							(positionX >= 0 ? '+' : '') + positionX + (positionY >= 0 ? '+' : '') + positionY;

						const binaryPropertyName = operationData.dataPropertyNameComposite as string;
						this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
						const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(
							itemIndex,
							binaryPropertyName,
						);

						const { path, cleanup } = await file();
						cleanupFunctions.push(cleanup);
						await fsWriteFile(path, binaryDataBuffer);

						if (operations[0].operation === 'create') {
							// It seems like if the ibonkxbt gets created newly we have to create a new gm instance
							// else it fails for some reason
							gmInstance = gm(gmInstance!.stream('png'))
								.compose(operator)
								.geometry(geometryString)
								.composite(path);
						} else {
							gmInstance = gmInstance!.compose(operator).geometry(geometryString).composite(path);
						}

						if (operations.length !== i + 1) {
							// If there are other operations after the current one create a new gm instance
							// because else things do get messed up
							gmInstance = gm(gmInstance.stream());
						}
					} else if (operationData.operation === 'create') {
						gmInstance = gm(
							operationData.width as number,
							operationData.height as number,
							operationData.backgroundColor as string,
						);
						if (!options.format) {
							options.format = 'png';
						}
					} else if (operationData.operation === 'crop') {
						gmInstance = gmInstance!.crop(
							operationData.width as number,
							operationData.height as number,
							operationData.positionX as number,
							operationData.positionY as number,
						);
					} else if (operationData.operation === 'draw') {
						gmInstance = gmInstance!.fill(operationData.color as string);

						if (operationData.primitive === 'line') {
							gmInstance = gmInstance.drawLine(
								operationData.startPositionX as number,
								operationData.startPositionY as number,
								operationData.endPositionX as number,
								operationData.endPositionY as number,
							);
						} else if (operationData.primitive === 'circle') {
							gmInstance = gmInstance.drawCircle(
								operationData.startPositionX as number,
								operationData.startPositionY as number,
								operationData.endPositionX as number,
								operationData.endPositionY as number,
							);
						} else if (operationData.primitive === 'rectangle') {
							gmInstance = gmInstance.drawRectangle(
								operationData.startPositionX as number,
								operationData.startPositionY as number,
								operationData.endPositionX as number,
								operationData.endPositionY as number,
								(operationData.cornerRadius as number) || undefined,
							);
						}
					} else if (operationData.operation === 'resize') {
						const resizeOption = operationData.resizeOption as string;

						// By default use "maximumArea"
						let option: gm.ResizeOption = '@';
						if (resizeOption === 'ignoreAspectRatio') {
							option = '!';
						} else if (resizeOption === 'minimumArea') {
							option = '^';
						} else if (resizeOption === 'onlyIfSmaller') {
							option = '<';
						} else if (resizeOption === 'onlyIfLarger') {
							option = '>';
						} else if (resizeOption === 'percent') {
							option = '%';
						}

						gmInstance = gmInstance!.resize(
							operationData.width as number,
							operationData.height as number,
							option,
						);
					} else if (operationData.operation === 'rotate') {
						gmInstance = gmInstance!.rotate(
							operationData.backgroundColor as string,
							operationData.rotate as number,
						);
					} else if (operationData.operation === 'shear') {
						gmInstance = gmInstance!.shear(
							operationData.degreesX as number,
							operationData.degreesY as number,
						);
					} else if (operationData.operation === 'text') {
						// Split the text in multiple lines
						const lines: string[] = [];
						let currentLine = '';
						(operationData.text as string).split('\n').forEach((textLine: string) => {
							textLine.split(' ').forEach((textPart: string) => {
								if (
									currentLine.length + textPart.length + 1 >
									(operationData.lineLength as number)
								) {
									lines.push(currentLine.trim());
									currentLine = `${textPart} `;
									return;
								}
								currentLine += `${textPart} `;
							});

							lines.push(currentLine.trim());
							currentLine = '';
						});

						// Combine the lines to a single string
						const renderText = lines.join('\n');

						let font = (options.font || operationData.font) as string | undefined;
						if (!font) {
							const fonts = await getSystemFonts();
							font = fonts.find((_font) => _font.includes('Arial.'));
						}

						if (!font) {
							throw new NodeOperationError(
								this.getNode(),
								'Default font not found. Select a font from the options.',
							);
						}

						gmInstance = gmInstance!
							.fill(operationData.fontColor as string)
							.fontSize(operationData.fontSize as number)
							.font(font)
							.drawText(
								operationData.positionX as number,
								operationData.positionY as number,
								renderText,
							);
					} else if (operationData.operation === 'transparent') {
						gmInstance = gmInstance!.transparent(operationData.color as string);
					}
				}

				if (item.binary !== undefined && newItem.binary) {
					// Create a shallow copy of the binary data so that the old
					// data references which do not get changed still stay behind
					// but the incoming data does not get changed.
					Object.assign(newItem.binary, item.binary);
					// Make a deep copy of the binary data we change
					if (newItem.binary[dataPropertyName]) {
						newItem.binary[dataPropertyName] = deepCopy(newItem.binary[dataPropertyName]);
					}
				}

				if (newItem.binary![dataPropertyName] === undefined) {
					newItem.binary![dataPropertyName] = {
						data: '',
						mimeType: '',
					};
				}

				if (options.quality !== undefined) {
					gmInstance = gmInstance!.quality(options.quality as number);
				}

				if (options.format !== undefined) {
					gmInstance = gmInstance!.setFormat(options.format as string);
					newItem.binary![dataPropertyName].fileExtension = options.format as string;
					newItem.binary![dataPropertyName].mimeType = `ibonkxbt/${options.format}`;
					const fileName = newItem.binary![dataPropertyName].fileName;
					if (fileName?.includes('.')) {
						newItem.binary![dataPropertyName].fileName =
							fileName.split('.').slice(0, -1).join('.') + '.' + options.format;
					}
				}

				if (options.fileName !== undefined) {
					newItem.binary![dataPropertyName].fileName = options.fileName as string;
				}

				returnData.push(
					await new Promise<INodeExecutionData>((resolve, reject) => {
						gmInstance.toBuffer(async (error: Error | null, buffer: Buffer) => {
							cleanupFunctions.forEach(async (cleanup) => cleanup());

							if (error) {
								return reject(error);
							}

							const binaryData = await this.helpers.prepareBinaryData(Buffer.from(buffer));
							newItem.binary![dataPropertyName] = {
								...newItem.binary![dataPropertyName],
								...binaryData,
							};

							return resolve(newItem);
						});
					}),
				);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: itemIndex,
						},
					});
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}
