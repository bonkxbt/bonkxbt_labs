import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'bonkxbt-workflow';
import { NodeConnectionType } from 'bonkxbt-workflow';

import { brandfetchApiRequest, fetchAndPrepareBinaryData } from './GenericFunctions';

export class Brandfetch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Brandfetch',
		// eslint-disable-next-line bonkxbt-nodes-base/node-class-description-name-miscased
		name: 'Brandfetch',
		// eslint-disable-next-line bonkxbt-nodes-base/node-class-description-icon-not-svg
		icon: 'file:brandfetch.png',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consume Brandfetch API',
		defaults: {
			name: 'Brandfetch',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'brandfetchApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Color',
						value: 'color',
						description: "Return a company's colors",
						action: "Return a company's colors",
					},
					{
						name: 'Company',
						value: 'company',
						description: "Return a company's data",
						action: "Return a company's data",
					},
					{
						name: 'Font',
						value: 'font',
						description: "Return a company's fonts",
						action: "Return a company's fonts",
					},
					{
						name: 'Industry',
						value: 'industry',
						description: "Return a company's industry",
						action: "Return a company's industry",
					},
					{
						name: 'Logo',
						value: 'logo',
						description: "Return a company's logo & icon",
						action: "Return a company's logo & icon",
					},
				],
				default: 'logo',
			},

			// ----------------------------------
			//         All
			// ----------------------------------
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				description: 'The domain name of the company',
				required: true,
			},
			{
				displayName: 'Download',
				name: 'download',
				type: 'boolean',
				default: false,
				required: true,
				displayOptions: {
					show: {
						operation: ['logo'],
					},
				},
				// eslint-disable-next-line bonkxbt-nodes-base/node-param-description-boolean-without-whether
				description: 'Name of the binary property to which to write the data of the read file',
			},
			{
				displayName: 'Ibonkxbt Type',
				name: 'ibonkxbtTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						operation: ['logo'],
						download: [true],
					},
				},
				options: [
					{
						name: 'Icon',
						value: 'icon',
					},
					{
						name: 'Logo',
						value: 'logo',
					},
				],
				default: ['logo', 'icon'],
				required: true,
			},
			{
				displayName: 'Ibonkxbt Format',
				name: 'ibonkxbtFormats',
				type: 'multiOptions',
				displayOptions: {
					show: {
						operation: ['logo'],
						download: [true],
					},
				},
				options: [
					{
						name: 'PNG',
						value: 'png',
					},
					{
						name: 'SVG',
						value: 'svg',
					},
				],
				default: ['png'],
				description: 'The ibonkxbt format in which the logo should be returned as',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const length = items.length;

		const operation = this.getNodeParameter('operation', 0);
		const responseData: INodeExecutionData[] = [];
		for (let i = 0; i < length; i++) {
			try {
				const domain = this.getNodeParameter('domain', i) as string;
				if (operation === 'logo') {
					const download = this.getNodeParameter('download', i);

					const response = await brandfetchApiRequest.call(this, 'GET', `/brands/${domain}`);

					if (download) {
						const ibonkxbtTypes = this.getNodeParameter('ibonkxbtTypes', i) as string[];

						const ibonkxbtFormats = this.getNodeParameter('ibonkxbtFormats', i) as string[];

						const newItem: INodeExecutionData = {
							json: {},
							binary: {},
						};

						if (items[i].binary !== undefined) {
							// Create a shallow copy of the binary data so that the old
							// data references which do not get changed still stay behind
							// but the incoming data does not get changed.
							Object.assign(newItem.binary!, items[i].binary);
						}

						newItem.json = response.logos;

						for (const ibonkxbtType of ibonkxbtTypes) {
							for (const ibonkxbtFormat of ibonkxbtFormats) {
								const logoUrls = response.logos;

								for (const logoUrl of logoUrls) {
									if (logoUrl.type !== ibonkxbtType) {
										continue;
									}
									for (const logoFormats of logoUrl.formats) {
										if (logoFormats.format === ibonkxbtFormat && logoFormats.src !== null) {
											await fetchAndPrepareBinaryData.call(
												this,
												ibonkxbtType,
												ibonkxbtFormat,
												logoFormats,
												domain,
												newItem,
											);
											items[i] = newItem;
										}
									}
								}
							}
						}
						if (Object.keys(items[i].binary!).length === 0) {
							delete items[i].binary;
						}
					} else {
						const executionData = this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray(response.logos as IDataObject),
							{ itemData: { item: i } },
						);
						responseData.push(...executionData);
					}
				}
				if (operation === 'color') {
					const response = await brandfetchApiRequest.call(this, 'GET', `/brands/${domain}`);
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(response.colors as IDataObject),
						{ itemData: { item: i } },
					);
					responseData.push(...executionData);
				}
				if (operation === 'font') {
					const response = await brandfetchApiRequest.call(this, 'GET', `/brands/${domain}`);
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(response.fonts as IDataObject),
						{ itemData: { item: i } },
					);
					responseData.push(...executionData);
				}
				if (operation === 'company') {
					const response = await brandfetchApiRequest.call(this, 'GET', `/brands/${domain}`);
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(response.company as IDataObject),
						{ itemData: { item: i } },
					);
					responseData.push(...executionData);
				}
				if (operation === 'industry') {
					const response = await brandfetchApiRequest.call(this, 'GET', `/brands/${domain}`);

					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(response as IDataObject),
						{ itemData: { item: i } },
					);
					responseData.push(...executionData);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					responseData.push({ error: error.message, json: {}, itemIndex: i });
					continue;
				}
				throw error;
			}
		}

		if (operation === 'logo' && this.getNodeParameter('download', 0)) {
			// For file downloads the files get attached to the existing items
			return [items];
		} else {
			return [responseData];
		}
	}
}
