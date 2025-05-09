import type { IHttpRequestMethods, INodeTypes, WorkflowTestData } from 'bonkxbt-workflow';
import nock from 'nock';

import { getResultNodeData, setup, workflowToTests } from '@test/nodes/Helpers';

import { executeWorkflow } from '../../../../../../test/nodes/ExecuteWorkflow';
import * as genericFunctions from '../../../../V2/GenericFunctions';

const API_RESPONSE = {
	ok: true,
	channel: 'C08514ZPKB8',
	message: {
		user: 'U0362BXQYJW',
		type: 'message',
		ts: '1734322671.726339',
		bot_id: 'B0382SHFM46',
		app_id: 'A037UTP0Z39',
		text: 'test message',
		team: 'T0364MSFHV2',
		bot_profile: {
			id: 'B0382SHFM46',
			app_id: 'A037UTP0Z39',
			name: 'blocks-test',
			icons: {
				ibonkxbt_36: 'https://a.slack-edge.com/80588/img/plugins/app/bot_36.png',
				ibonkxbt_48: 'https://a.slack-edge.com/80588/img/plugins/app/bot_48.png',
				ibonkxbt_72: 'https://a.slack-edge.com/80588/img/plugins/app/service_72.png',
			},
			deleted: false,
			updated: 1648028754,
			team_id: 'T0364MSFHV2',
		},
		blocks: [
			{
				type: 'rich_text',
				block_id: 't02Ox',
				elements: [
					{
						type: 'rich_text_section',
						elements: [
							{
								type: 'text',
								text: 'test message',
							},
						],
					},
				],
			},
		],
	},
	message_timestamp: '1734322671.726339',
};

jest.mock('../../../../V2/GenericFunctions', () => {
	const originalModule = jest.requireActual('../../../../V2/GenericFunctions');
	return {
		...originalModule,
		slackApiRequest: jest.fn(async function (method: IHttpRequestMethods) {
			if (method === 'POST') {
				return API_RESPONSE;
			}
		}),
	};
});

describe('Test SlackV2, message => post', () => {
	const workflows = ['nodes/Slack/test/v2/node/message/post.workflow.json'];
	const tests = workflowToTests(workflows);

	beforeAll(() => {
		nock.disableNetConnect();
	});

	afterAll(() => {
		nock.restore();
		jest.unmock('../../../../V2/GenericFunctions');
	});

	const nodeTypes = setup(tests);

	const testNode = async (testData: WorkflowTestData, types: INodeTypes) => {
		const { result } = await executeWorkflow(testData, types);

		const resultNodeData = getResultNodeData(result, testData);

		resultNodeData.forEach(({ nodeName, resultData }) => {
			return expect(resultData).toEqual(testData.output.nodeData[nodeName]);
		});

		expect(genericFunctions.slackApiRequest).toHaveBeenCalledTimes(1);
		expect(genericFunctions.slackApiRequest).toHaveBeenCalledWith(
			'POST',
			'/chat.postMessage',
			{
				channel: 'C08514ZPKB8',
				icon_emoji: '😁',
				includeLinkToWorkflow: false,
				link_names: true,
				mrkdwn: true,
				text: 'test message',
				unfurl_links: true,
				unfurl_media: true,
			},
			{},
		);
	};

	for (const testData of tests) {
		test(testData.description, async () => await testNode(testData, nodeTypes));
	}
});
