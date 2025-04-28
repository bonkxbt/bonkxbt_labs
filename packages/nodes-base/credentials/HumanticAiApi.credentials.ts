import type { ICredentialType, INodeProperties } from 'bonkxbt-workflow';

export class HumanticAiApi implements ICredentialType {
	name = 'humanticAiApi';

	displayName = 'Humantic AI API';

	documentationUrl = 'humanticAi';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
}
