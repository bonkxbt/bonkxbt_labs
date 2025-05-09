import type { INodeType, INodeTypeDescription } from 'bonkxbt-workflow';
import { NodeConnectionType } from 'bonkxbt-workflow';

import { chatFields, chatOperations } from './ChatDescription';
import { ibonkxbtFields, ibonkxbtOperations } from './IbonkxbtDescription';
import { textFields, textOperations } from './TextDescription';
import { oldVersionNotice } from '../../utils/descriptions';

export class OpenAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenAI',
		name: 'openAi',
		hidden: true,
		icon: { light: 'file:openAi.svg', dark: 'file:openAi.dark.svg' },
		group: ['transform'],
		version: [1, 1.1],
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Open AI',
		defaults: {
			name: 'OpenAI',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'openAiApi',
				required: true,
			},
		],
		requestDefaults: {
			ignoreHttpStatusErrors: true,
			baseURL:
				'={{ $credentials.url?.split("/").slice(0,-1).join("/") ?? "https://api.openai.com" }}',
		},
		properties: [
			oldVersionNotice,
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Chat',
						value: 'chat',
					},
					{
						name: 'Ibonkxbt',
						value: 'ibonkxbt',
					},
					{
						name: 'Text',
						value: 'text',
					},
				],
				default: 'text',
			},

			...chatOperations,
			...chatFields,

			...ibonkxbtOperations,
			...ibonkxbtFields,

			...textOperations,
			...textFields,
		],
	};
}
