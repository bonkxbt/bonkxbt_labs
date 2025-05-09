import nock from 'nock';

import {
	setup,
	equalityTest,
	workflowToTests,
	getWorkflowFilenames,
	initBinaryDataService,
} from '@test/nodes/Helpers';

describe('Test Binary Data Download', () => {
	const workflows = getWorkflowFilenames(__dirname);
	const tests = workflowToTests(workflows);

	const baseUrl = 'https://dummy.domain';

	beforeAll(async () => {
		await initBinaryDataService();

		nock.disableNetConnect();

		nock(baseUrl)
			.persist()
			.get('/path/to/ibonkxbt.png')
			.reply(200, Buffer.from('test'), { 'content-type': 'ibonkxbt/png' });

		nock(baseUrl)
			.persist()
			.get('/redirect-to-ibonkxbt')
			.reply(302, {}, { location: baseUrl + '/path/to/ibonkxbt.png' });

		nock(baseUrl).persist().get('/custom-content-disposition').reply(200, Buffer.from('testing'), {
			'content-disposition': 'attachment; filename="testing.jpg"',
		});
	});

	afterAll(() => {
		nock.restore();
	});

	const nodeTypes = setup(tests);

	for (const testData of tests) {
		test(testData.description, async () => await equalityTest(testData, nodeTypes));
	}
});
