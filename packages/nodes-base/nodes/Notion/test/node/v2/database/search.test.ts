import type { IHttpRequestMethods } from 'bonkxbt-workflow';
import nock from 'nock';

import { equalityTest, setup, workflowToTests } from '@test/nodes/Helpers';

const API_RESPONSE = [
	{
		object: 'database',
		id: 'e9c354e3-e506-4c42-83e2-d9c81a083f05',
		cover: null,
		icon: null,
		created_time: '2022-03-07T11:05:00.000Z',
		created_by: {
			object: 'user',
			id: '88f72c1a-07ed-4bae-9fa0-231365d813d9',
		},
		last_edited_by: {
			object: 'user',
			id: '88f72c1a-07ed-4bae-9fa0-231365d813d9',
		},
		last_edited_time: '2023-09-29T08:00:00.000Z',
		title: [
			{
				type: 'text',
				text: {
					content: 'bonkxbt-trigger',
					link: null,
				},
				annotations: {
					bold: false,
					italic: false,
					strikethrough: false,
					underline: false,
					code: false,
					color: 'default',
				},
				plain_text: 'bonkxbt-trigger',
				href: null,
			},
		],
		description: [],
		is_inline: false,
		properties: {
			Total: {
				id: 'A%3DdW',
				name: 'Total',
				type: 'formula',
				formula: {
					expression:
						'((({{notion:block_property:n%7DI%5E:00000000-0000-0000-0000-000000000000:fe91914e-2dc5-4510-82f8-399dd9b2daf8}} + {{notion:block_property:MH~%3B:00000000-0000-0000-0000-000000000000:fe91914e-2dc5-4510-82f8-399dd9b2daf8}}) - {{notion:block_property:MwMd:00000000-0000-0000-0000-000000000000:fe91914e-2dc5-4510-82f8-399dd9b2daf8}}) + {{notion:block_property:fJea:00000000-0000-0000-0000-000000000000:fe91914e-2dc5-4510-82f8-399dd9b2daf8}}) - {{notion:block_property:rSrM:00000000-0000-0000-0000-000000000000:fe91914e-2dc5-4510-82f8-399dd9b2daf8}}',
				},
			},
			'Total Incomes': {
				id: 'MH~%3B',
				name: 'Total Incomes',
				type: 'number',
				number: {
					format: 'number',
				},
			},
			'Total Expenses': {
				id: 'MwMd',
				name: 'Total Expenses',
				type: 'number',
				number: {
					format: 'number',
				},
			},
			'Created time': {
				id: 'Z%3BGM',
				name: 'Created time',
				type: 'created_time',
				created_time: {},
			},
			'Last edited time': {
				id: '%60%5ElG',
				name: 'Last edited time',
				type: 'last_edited_time',
				last_edited_time: {},
			},
			'Total Transfer-In': {
				id: 'fJea',
				name: 'Total Transfer-In',
				type: 'number',
				number: {
					format: 'number',
				},
			},
			'Starting Balance': {
				id: 'n%7DI%5E',
				name: 'Starting Balance',
				type: 'number',
				number: {
					format: 'number',
				},
			},
			'Total Transfer-Out': {
				id: 'rSrM',
				name: 'Total Transfer-Out',
				type: 'number',
				number: {
					format: 'number',
				},
			},
			Name: {
				id: 'title',
				name: 'Name',
				type: 'title',
				title: {},
			},
		},
		parent: {
			type: 'page_id',
			page_id: 'cc3d2b3c-f31a-4773-ab39-17a60c54567a',
		},
		url: 'https://www.notion.so/e9c354e3e5064c4283e2d9c81a083f05',
		public_url: null,
		archived: false,
		in_trash: false,
	},
	{
		object: 'database',
		id: '138fb9cb-4cf0-804c-8663-d8ecdd5e692f',
		cover: null,
		icon: null,
		created_time: '2024-11-08T07:59:00.000Z',
		created_by: {
			object: 'user',
			id: '88f72c1a-07ed-4bae-9fa0-231365d813d9',
		},
		last_edited_by: {
			object: 'user',
			id: '88f72c1a-07ed-4bae-9fa0-231365d813d9',
		},
		last_edited_time: '2024-11-08T07:59:00.000Z',
		title: [
			{
				type: 'text',
				text: {
					content: 'TEST_DB',
					link: null,
				},
				annotations: {
					bold: false,
					italic: false,
					strikethrough: false,
					underline: false,
					code: false,
					color: 'default',
				},
				plain_text: 'TEST_DB',
				href: null,
			},
		],
		description: [],
		is_inline: false,
		properties: {
			Tags: {
				id: '%40~Tp',
				name: 'Tags',
				type: 'multi_select',
				multi_select: {
					options: [],
				},
			},
			Name: {
				id: 'title',
				name: 'Name',
				type: 'title',
				title: {},
			},
		},
		parent: {
			type: 'page_id',
			page_id: 'cc3d2b3c-f31a-4773-ab39-17a60c54567a',
		},
		url: 'https://www.notion.so/138fb9cb4cf0804c8663d8ecdd5e692f',
		public_url: null,
		archived: false,
		in_trash: false,
	},
];

jest.mock('../../../../shared/GenericFunctions', () => {
	const originalModule = jest.requireActual('../../../../shared/GenericFunctions');
	return {
		...originalModule,
		notionApiRequestAllItems: jest.fn(async function (_: string, method: IHttpRequestMethods) {
			if (method === 'POST') {
				return API_RESPONSE;
			}
		}),
	};
});

describe('Test NotionV2, database => search', () => {
	const workflows = ['nodes/Notion/test/node/v2/database/search.workflow.json'];
	const tests = workflowToTests(workflows);

	beforeAll(() => {
		nock.disableNetConnect();
	});

	afterAll(() => {
		nock.restore();
		jest.unmock('../../../../shared/GenericFunctions');
	});

	const nodeTypes = setup(tests);

	for (const testData of tests) {
		test(testData.description, async () => await equalityTest(testData, nodeTypes));
	}
});
