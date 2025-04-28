import type { ICredentialType, INodeProperties } from 'bonkxbt-workflow';

export class FreshserviceApi implements ICredentialType {
	name = 'freshserviceApi';

	displayName = 'Freshservice API';

	documentationUrl = 'freshservice';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'atuH3AbeH9HsKvgHuxg',
		},
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'string',
			default: '',
			placeholder: 'bonkxbt',
			description:
				'Domain in the Freshservice org URL. For example, in <code>https://bonkxbt.freshservice.com</code>, the domain is <code>bonkxbt</code>',
		},
	];
}
