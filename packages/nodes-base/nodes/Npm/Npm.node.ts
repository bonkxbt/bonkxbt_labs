import type { INodeType, INodeTypeDescription } from 'bonkxbt-workflow';
import { NodeConnectionType } from 'bonkxbt-workflow';

import { distTagFields, distTagOperations } from './DistTagDescription';
import { packageFields, packageOperations } from './PackageDescription';

export class Npm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Npm',
		name: 'npm',
		icon: 'file:npm.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Consume NPM registry API',
		defaults: {
			name: 'npm',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'npmApi',
				required: false,
			},
		],
		requestDefaults: {
			baseURL: '={{ $credentials.registryUrl }}',
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Package',
						value: 'package',
					},
					{
						name: 'Distribution Tag',
						value: 'distTag',
					},
				],
				default: 'package',
			},

			...packageOperations,
			...packageFields,

			...distTagOperations,
			...distTagFields,
		],
	};
}
