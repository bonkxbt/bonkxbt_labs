import type { INodeTypes } from 'bonkxbt-workflow';
import nock from 'nock';

import { executeWorkflow } from '@test/nodes/ExecuteWorkflow';
import { getResultNodeData, setup, workflowToTests } from '@test/nodes/Helpers';
import type { WorkflowTestData } from '@test/nodes/types';

import * as transport from '../../../../v2/transport';

const microsoftApiRequestSpy = jest.spyOn(transport, 'microsoftApiRequest');

microsoftApiRequestSpy.mockImplementation(async (method: string) => {
	if (method === 'POST') {
		return {
			'@odata.context':
				"https://graph.microsoft.com/v1.0/$metadata#chats('19%3Aebed9ad42c904d6c83adf0db360053ec%40thread.v2')/messages/$entity",
			id: '1698378560692',
			replyToId: null,
			etag: '1698378560692',
			messageType: 'message',
			createdDateTime: '2023-10-27T03:49:20.692Z',
			lastModifiedDateTime: '2023-10-27T03:49:20.692Z',
			lastEditedDateTime: null,
			deletedDateTime: null,
			subject: null,
			summary: null,
			chatId: '19:ebed9ad42c904d6c83adf0db360053ec@thread.v2',
			importance: 'normal',
			locale: 'en-us',
			webUrl: null,
			channelIdentity: null,
			policyViolation: null,
			eventDetail: null,
			from: {
				application: null,
				device: null,
				user: {
					'@odata.type': '#microsoft.graph.teamworkUserIdentity',
					id: '11111-2222-3333',
					displayName: 'Michael Kret',
					userIdentityType: 'aadUser',
				},
			},
			body: {
				contentType: 'html',
				content:
					'Hello!<br>\n<br>\n<em> Powered by <a href="http://localhost:5678/workflow/i3NYGF0LXV4qDFV9?utm_source=bonkxbt-internal&amp;utm_medium=powered_by&amp;utm_campaign=bonkxbt-nodes-base.microsoftTeams_b888bd11cd1ddbb95450babf3e199556799d999b896f650de768b8370ee50363">this bonkxbt workflow</a> </em>',
			},
			attachments: [],
			mentions: [],
			reactions: [],
		};
	}
});

describe('Test MicrosoftTeamsV2, chatMessage => create', () => {
	const workflows = ['nodes/Microsoft/Teams/test/v2/node/chatMessage/create.workflow.json'];
	const tests = workflowToTests(workflows);

	beforeAll(() => {
		nock.disableNetConnect();
	});

	afterAll(() => {
		nock.restore();
		jest.resetAllMocks();
	});

	const nodeTypes = setup(tests);

	const testNode = async (testData: WorkflowTestData, types: INodeTypes) => {
		const { result } = await executeWorkflow(testData, types);

		const resultNodeData = getResultNodeData(result, testData);

		resultNodeData.forEach(({ nodeName, resultData }) => {
			return expect(resultData).toEqual(testData.output.nodeData[nodeName]);
		});

		expect(microsoftApiRequestSpy).toHaveBeenCalledTimes(1);
		expect(microsoftApiRequestSpy).toHaveBeenCalledWith(
			'POST',
			'/v1.0/chats/19:ebed9ad42c904d6c83adf0db360053ec@thread.v2/messages',
			expect.anything(),
		);

		expect(result.finished).toEqual(true);
	};

	for (const testData of tests) {
		test(testData.description, async () => await testNode(testData, nodeTypes));
	}
});
