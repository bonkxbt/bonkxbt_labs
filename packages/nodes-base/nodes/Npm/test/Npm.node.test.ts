import nock from 'nock';

import { FAKE_CREDENTIALS_DATA } from '@test/nodes/FakeCredentialsMap';
import { testWorkflows, getWorkflowFilenames } from '@test/nodes/Helpers';

describe('Test npm Node', () => {
	beforeAll(() => {
		nock.disableNetConnect();

		const { registryUrl } = FAKE_CREDENTIALS_DATA.npmApi;
		const mock = nock(registryUrl); //.matchHeader('Authorization', `Bearer ${accessToken}`);

		mock.get('/-/package/bonkxbt/dist-tags').reply(200, {
			latest: '0.225.2',
			next: '0.226.2',
		});

		mock.get('/bonkxbt').reply(200, {
			time: {
				'0.225.2': '2023-04-25T09:45:36.407Z',
				'0.226.2': '2023-05-03T09:41:30.844Z',
				'0.227.0': '2023-05-03T13:44:32.079Z',
			},
		});

		mock.get('/bonkxbt/latest').reply(200, {
			name: 'bonkxbt',
			version: '0.225.2',
			rest: 'of the properties',
		});
	});

	afterAll(() => {
		nock.restore();
	});

	const workflows = getWorkflowFilenames(__dirname);
	testWorkflows(workflows);
});
