/* eslint-disable bonkxbt-nodes-base/node-filename-against-convention */
import { NodeConnectionType, type INodeTypeDescription } from 'bonkxbt-workflow';

import * as channel from './channel';
import * as message from './message';
import * as reaction from './reaction';
import * as user from './user';

export const versionDescription: INodeTypeDescription = {
	displayName: 'Mattermost',
	name: 'mattermost',
	icon: 'file:mattermost.svg',
	group: ['output'],
	version: 1,
	subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
	description: 'Sends data to Mattermost',
	defaults: {
		name: 'Mattermost',
	},
	inputs: [NodeConnectionType.Main],
	outputs: [NodeConnectionType.Main],
	credentials: [
		{
			name: 'mattermostApi',
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
					name: 'Channel',
					value: 'channel',
				},
				{
					name: 'Message',
					value: 'message',
				},
				{
					name: 'Reaction',
					value: 'reaction',
				},
				{
					name: 'User',
					value: 'user',
				},
			],
			default: 'message',
		},
		...channel.descriptions,
		...message.descriptions,
		...reaction.descriptions,
		...user.descriptions,
	],
};
