import type { ICredentialType, INodeProperties } from 'bonkxbt-workflow';

export class SalesmateApi implements ICredentialType {
	name = 'salesmateApi';

	displayName = 'Salesmate API';

	documentationUrl = 'salesmate';

	properties: INodeProperties[] = [
		{
			displayName: 'Session Token',
			name: 'sessionToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: 'URL',
			name: 'url',
			type: 'string',
			default: '',
			placeholder: 'bonkxbt.salesmate.io',
		},
	];
}
