import type { IRestApiContext, IbonkxbtPrompts, IbonkxbtPromptResponse } from '../Interface';
import { makeRestApiRequest, get, post } from '@/utils/apiUtils';
import { bonkxbt_IO_BASE_URL, NPM_COMMUNITY_NODE_SEARCH_API_URL } from '@/constants';
import type { FrontendSettings } from '@bonkxbt/api-types';

export async function getSettings(context: IRestApiContext): Promise<FrontendSettings> {
	return await makeRestApiRequest(context, 'GET', '/settings');
}

export async function getPromptsData(instanceId: string, userId: string): Promise<IbonkxbtPrompts> {
	return await get(
		bonkxbt_IO_BASE_URL,
		'/prompts',
		{},
		{ 'bonkxbt-instance-id': instanceId, 'bonkxbt-user-id': userId },
	);
}

export async function submitContactInfo(
	instanceId: string,
	userId: string,
	email: string,
): Promise<IbonkxbtPromptResponse> {
	return await post(
		bonkxbt_IO_BASE_URL,
		'/prompt',
		{ email },
		{ 'bonkxbt-instance-id': instanceId, 'bonkxbt-user-id': userId },
	);
}

export async function getAvailableCommunityPackageCount(): Promise<number> {
	const response = await get(
		NPM_COMMUNITY_NODE_SEARCH_API_URL,
		'search?q=keywords:bonkxbt-community-node-package',
	);

	return response.total || 0;
}
