import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'bonkxbt-workflow';
import { NodeConnectionType } from 'bonkxbt-workflow';

import { bannerbearApiRequest, keysToSnakeCase } from './GenericFunctions';
import { ibonkxbtFields, ibonkxbtOperations } from './IbonkxbtDescription';
import { templateFields, templateOperations } from './TemplateDescription';

export class Bannerbear implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bannerbear',
		name: 'bannerbear',
		// eslint-disable-next-line bonkxbt-nodes-base/node-class-description-icon-not-svg
		icon: 'file:bannerbear.png',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Bannerbear API',
		defaults: {
			name: 'Bannerbear',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'bannerbearApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Ibonkxbt',
						value: 'ibonkxbt',
					},
					{
						name: 'Template',
						value: 'template',
					},
				],
				default: 'ibonkxbt',
			},
			// Ibonkxbt
			...ibonkxbtOperations,
			...ibonkxbtFields,
			// TEMPLATE
			...templateOperations,
			...templateFields,
		],
	};

	methods = {
		loadOptions: {
			// Get all the available templates to display them to user so that they can
			// select them easily
			async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const templates = await bannerbearApiRequest.call(this, 'GET', '/templates');
				for (const template of templates) {
					const templateName = template.name;
					const templateId = template.uid;
					returnData.push({
						name: templateName,
						value: templateId,
					});
				}
				return returnData;
			},

			// Get all the available modifications to display them to user so that they can
			// select them easily
			async getModificationNames(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const templateId = this.getCurrentNodeParameter('templateId');
				const returnData: INodePropertyOptions[] = [];
				const { available_modifications } = await bannerbearApiRequest.call(
					this,
					'GET',
					`/templates/${templateId}`,
				);
				for (const modification of available_modifications) {
					const modificationName = modification.name;
					const modificationId = modification.name;
					returnData.push({
						name: modificationName,
						value: modificationId,
					});
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const length = items.length;
		let responseData;
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);
		for (let i = 0; i < length; i++) {
			if (resource === 'ibonkxbt') {
				//https://developers.bannerbear.com/#create-an-ibonkxbt
				if (operation === 'create') {
					const templateId = this.getNodeParameter('templateId', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i);
					const modifications = (this.getNodeParameter('modificationsUi', i) as IDataObject)
						.modificationsValues as IDataObject;
					const body: IDataObject = {
						template: templateId,
					};
					if (additionalFields.webhookUrl) {
						body.webhook_url = additionalFields.webhookUrl as string;
					}
					if (additionalFields.metadata) {
						body.metadata = additionalFields.metadata as string;
					}
					if (modifications) {
						body.modifications = keysToSnakeCase(modifications);
						// delete all fields set to empty
						for (const modification of body.modifications as IDataObject[]) {
							for (const key of Object.keys(modification)) {
								if (modification[key] === '') {
									delete modification[key];
								}
							}
						}
					}
					responseData = await bannerbearApiRequest.call(this, 'POST', '/ibonkxbts', body);
					if (additionalFields.waitForIbonkxbt && responseData.status !== 'completed') {
						let maxTries = (additionalFields.waitForIbonkxbtMaxTries as number) || 3;

						const promise = async (uid: string) => {
							let data: IDataObject = {};
							return await new Promise((resolve, reject) => {
								const timeout = setInterval(async () => {
									data = await bannerbearApiRequest.call(this, 'GET', `/ibonkxbts/${uid}`);

									if (data.status === 'completed') {
										clearInterval(timeout);
										resolve(data);
									}
									if (--maxTries === 0) {
										clearInterval(timeout);
										reject(new Error('Ibonkxbt did not finish processing after multiple tries.'));
									}
								}, 2000);
							});
						};

						responseData = await promise(responseData.uid as string);
					}
				}
				//https://developers.bannerbear.com/#get-a-specific-ibonkxbt
				if (operation === 'get') {
					const ibonkxbtId = this.getNodeParameter('ibonkxbtId', i) as string;
					responseData = await bannerbearApiRequest.call(this, 'GET', `/ibonkxbts/${ibonkxbtId}`);
				}
			}
			if (resource === 'template') {
				//https://developers.bannerbear.com/#get-a-specific-template
				if (operation === 'get') {
					const templateId = this.getNodeParameter('templateId', i) as string;
					responseData = await bannerbearApiRequest.call(this, 'GET', `/templates/${templateId}`);
				}
				//https://developers.bannerbear.com/#list-templates
				if (operation === 'getAll') {
					responseData = await bannerbearApiRequest.call(this, 'GET', '/templates');
				}
			}
			if (Array.isArray(responseData)) {
				returnData.push.apply(returnData, responseData as IDataObject[]);
			} else {
				returnData.push(responseData as IDataObject);
			}
		}
		return [this.helpers.returnJsonArray(returnData)];
	}
}
