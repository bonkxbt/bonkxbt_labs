import type { ICredentialType, INodeProperties } from 'bonkxbt-workflow';

export class PeekalinkApi implements ICredentialType {
	name = 'peekalinkApi';

	displayName = 'Peekalink API';

	documentationUrl = 'peekalink';

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
