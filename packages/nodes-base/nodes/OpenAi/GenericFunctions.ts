import type {
	IExecuteSingleFunctions,
	IbonkxbtHttpFullResponse,
	INodeExecutionData,
	JsonObject,
} from 'bonkxbt-workflow';
import { NodeApiError } from 'bonkxbt-workflow';

export async function sendErrorPostReceive(
	this: IExecuteSingleFunctions,
	data: INodeExecutionData[],
	response: IbonkxbtHttpFullResponse,
): Promise<INodeExecutionData[]> {
	if (String(response.statusCode).startsWith('4') || String(response.statusCode).startsWith('5')) {
		throw new NodeApiError(this.getNode(), response as unknown as JsonObject);
	}
	return data;
}
