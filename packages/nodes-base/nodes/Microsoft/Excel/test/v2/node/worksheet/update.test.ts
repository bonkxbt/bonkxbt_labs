import type { IHttpRequestMethods } from 'bonkxbt-workflow';
import nock from 'nock';

import { equalityTest, setup, workflowToTests } from '@test/nodes/Helpers';

jest.mock('../../../../v2/transport', () => {
	const originalModule = jest.requireActual('../../../../v2/transport');
	return {
		...originalModule,
		microsoftApiRequest: jest.fn(async function (method: IHttpRequestMethods, resource: string) {
			if (method === 'GET' && resource.includes('usedRange')) {
				return {
					address: 'Sheet4!A1:D6',
					values: [
						['id', 'name', 'age', 'data'],
						[1, 'Sam', 33, 'data 1'],
						[2, 'Jon', 44, 'data 2'],
						[3, 'Ron', 55, 'data 3'],
					],
				};
			}

			if (method === 'PATCH' && resource.includes('{A0883CFE-D27E-4ECC-B94B-981830AAD55B}')) {
				return {
					values: [
						['id', 'name', 'age', 'data'],
						[1, 'Sam', 33, 'data 1'],
						[2, 'Jon', 44, 'data 2'],
						[3, 'Sam', 34, 'data 4'],
					],
				};
			}

			if (method === 'PATCH' && resource.includes('{426949D7-797F-43A9-A8A4-8FE283495A82}')) {
				return {
					values: [
						['id', 'name', 'age', 'data'],
						[1, 'Sam', 33, 'data 1'],
						[2, 'Jon', 44, 'data 2'],
						[3, 'Don', 37, 'data 44'],
					],
				};
			}
		}),
	};
});

describe('Test MicrosoftExcelV2, worksheet => update', () => {
	const workflows = ['nodes/Microsoft/Excel/test/v2/node/worksheet/update.workflow.json'];
	const tests = workflowToTests(workflows);

	beforeAll(() => {
		nock.disableNetConnect();
	});

	afterAll(() => {
		nock.restore();
		jest.unmock('../../../../v2/transport');
	});

	const nodeTypes = setup(tests);

	for (const testData of tests) {
		test(testData.description, async () => await equalityTest(testData, nodeTypes));
	}
});
