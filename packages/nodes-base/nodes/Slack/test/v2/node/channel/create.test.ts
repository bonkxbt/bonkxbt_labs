import type { IHttpRequestMethods, INodeTypes, WorkflowTestData } from 'bonkxbt-workflow';
import nock from 'nock';

import { getResultNodeData, setup, workflowToTests } from '@test/nodes/Helpers';

import { executeWorkflow } from '../../../../../../test/nodes/ExecuteWorkflow';
import * as genericFunctions from '../../../../V2/GenericFunctions';

const API_RESPONSE = {
	ok: true,
	channel: {
		id: 'C085WNEHP4Y',
		name: 'test-003',
		is_channel: true,
		is_group: false,
		is_im: false,
		is_mpim: false,
		is_private: false,
		created: 1734325731,
		is_archived: false,
		is_general: false,
		unlinked: 0,
		name_normalized: 'test-003',
		is_shared: false,
		is_org_shared: false,
		is_pending_ext_shared: false,
		pending_shared: [],
		context_team_id: 'T0364MSFHV2',
		updated: 1734325731240,
		parent_conversation: null,
		creator: 'U0362BXQYJW',
		is_ext_shared: false,
		shared_team_ids: ['T0364MSFHV2'],
		pending_connected_team_ids: [],
		is_member: true,
		last_read: '0000000000.000000',
		topic: {
			value: '',
			creator: '',
			last_set: 0,
		},
		purpose: {
			value: '',
			creator: '',
			last_set: 0,
		},
		previous_names: [],
		priority: 0,
	},
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

describe('Test SlackV2, channel => create', () => {
	const workflows = ['nodes/Slack/test/v2/node/channel/create.workflow.json'];
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
			'/conversations.create',
			{ is_private: false, name: 'test-003' },
			{},
		);
	};

	for (const testData of tests) {
		test(testData.description, async () => await testNode(testData, nodeTypes));
	}
});
