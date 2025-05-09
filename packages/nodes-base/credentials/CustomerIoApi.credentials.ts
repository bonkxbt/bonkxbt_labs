import { ApplicationError } from 'bonkxbt-workflow';
import type {
	ICredentialDataDecryptedObject,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'bonkxbt-workflow';

export class CustomerIoApi implements ICredentialType {
	name = 'customerIoApi';

	displayName = 'Customer.io API';

	documentationUrl = 'customerIo';

	properties: INodeProperties[] = [
		{
			displayName: 'Tracking API Key',
			name: 'trackingApiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Required for tracking API',
			required: true,
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{
					name: 'EU region',
					value: 'track-eu.customer.io',
				},
				{
					name: 'Global region',
					value: 'track.customer.io',
				},
			],
			default: 'track.customer.io',
			description: 'Should be set based on your account region',
			hint: 'The region will be omitted when being used with the HTTP node',
			required: true,
		},
		{
			displayName: 'Tracking Site ID',
			name: 'trackingSiteId',
			type: 'string',
			default: '',
			description: 'Required for tracking API',
		},
		{
			displayName: 'App API Key',
			name: 'appApiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Required for App API',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		// @ts-ignore
		const url = requestOptions.url ? requestOptions.url : requestOptions.uri;
		if (url.includes('track') || url.includes('api.customer.io')) {
			const basicAuthKey = Buffer.from(
				`${credentials.trackingSiteId}:${credentials.trackingApiKey}`,
			).toString('base64');
			// @ts-ignore
			Object.assign(requestOptions.headers, { Authorization: `Basic ${basicAuthKey}` });
		} else if (url.includes('beta-api.customer.io')) {
			// @ts-ignore
			Object.assign(requestOptions.headers, {
				Authorization: `Bearer ${credentials.appApiKey as string}`,
			});
		} else {
			throw new ApplicationError('Unknown way of authenticating', { level: 'warning' });
		}

		return requestOptions;
	}
}
