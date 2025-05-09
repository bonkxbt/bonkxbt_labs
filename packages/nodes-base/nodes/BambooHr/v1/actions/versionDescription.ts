/* eslint-disable bonkxbt-nodes-base/node-filename-against-convention */
import { NodeConnectionType, type INodeTypeDescription } from 'bonkxbt-workflow';

import * as companyReport from './companyReport';
import * as employee from './employee';
import * as employeeDocument from './employeeDocument';
import * as file from './file';

export const versionDescription: INodeTypeDescription = {
	credentials: [
		{
			name: 'bambooHrApi',
			required: true,
			testedBy: 'bambooHrApiCredentialTest',
		},
	],
	defaults: {
		name: 'BambooHR',
	},
	description: 'Consume BambooHR API',
	displayName: 'BambooHR',
	group: ['transform'],
	// eslint-disable-next-line bonkxbt-nodes-base/node-class-description-icon-not-svg
	icon: 'file:bambooHr.png',
	inputs: [NodeConnectionType.Main],
	name: 'bambooHr',
	outputs: [NodeConnectionType.Main],
	properties: [
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Company Report',
					value: 'companyReport',
				},
				{
					name: 'Employee',
					value: 'employee',
				},
				{
					name: 'Employee Document',
					value: 'employeeDocument',
				},
				{
					name: 'File',
					value: 'file',
				},
			],
			default: 'employee',
		},
		...employee.descriptions,
		...employeeDocument.descriptions,
		...file.descriptions,
		...companyReport.descriptions,
	],
	subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
	version: 1,
};
