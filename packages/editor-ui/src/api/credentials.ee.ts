import type { ICredentialsResponse, IRestApiContext, IShareCredentialsPayload } from '@/Interface';
import { makeRestApiRequest } from '@/utils/apiUtils';
import type { IDataObject } from 'bonkxbt-workflow';

export async function setCredentialSharedWith(
	context: IRestApiContext,
	id: string,
	data: IShareCredentialsPayload,
): Promise<ICredentialsResponse> {
	return await makeRestApiRequest(
		context,
		'PUT',
		`/credentials/${id}/share`,
		data as unknown as IDataObject,
	);
}

export async function moveCredentialToProject(
	context: IRestApiContext,
	id: string,
	destinationProjectId: string,
): Promise<void> {
	return await makeRestApiRequest(context, 'PUT', `/credentials/${id}/transfer`, {
		destinationProjectId,
	});
}
