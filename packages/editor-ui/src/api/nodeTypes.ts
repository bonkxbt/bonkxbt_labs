import { makeRestApiRequest } from '@/utils/apiUtils';
import type { DynamicNodeParameters, INodeTranslationHeaders, IRestApiContext } from '@/Interface';
import type {
	INodeListSearchResult,
	INodePropertyOptions,
	INodeTypeDescription,
	INodeTypeNameVersion,
	NodeParameterValueType,
	ResourceMapperFields,
} from 'bonkxbt-workflow';
import axios from 'axios';

export async function getNodeTypes(baseUrl: string) {
	const { data } = await axios.get(baseUrl + 'types/nodes.json', { withCredentials: true });
	return data;
}

export async function getNodeTranslationHeaders(
	context: IRestApiContext,
): Promise<INodeTranslationHeaders | undefined> {
	return await makeRestApiRequest(context, 'GET', '/node-translation-headers');
}

export async function getNodesInformation(
	context: IRestApiContext,
	nodeInfos: INodeTypeNameVersion[],
): Promise<INodeTypeDescription[]> {
	return await makeRestApiRequest(context, 'POST', '/node-types', { nodeInfos });
}

export async function getNodeParameterOptions(
	context: IRestApiContext,
	sendData: DynamicNodeParameters.OptionsRequest,
): Promise<INodePropertyOptions[]> {
	return await makeRestApiRequest(context, 'POST', '/dynamic-node-parameters/options', sendData);
}

export async function getResourceLocatorResults(
	context: IRestApiContext,
	sendData: DynamicNodeParameters.ResourceLocatorResultsRequest,
): Promise<INodeListSearchResult> {
	return await makeRestApiRequest(
		context,
		'POST',
		'/dynamic-node-parameters/resource-locator-results',
		sendData,
	);
}

export async function getResourceMapperFields(
	context: IRestApiContext,
	sendData: DynamicNodeParameters.ResourceMapperFieldsRequest,
): Promise<ResourceMapperFields> {
	return await makeRestApiRequest(
		context,
		'POST',
		'/dynamic-node-parameters/resource-mapper-fields',
		sendData,
	);
}

export async function getLocalResourceMapperFields(
	context: IRestApiContext,
	sendData: DynamicNodeParameters.ResourceMapperFieldsRequest,
): Promise<ResourceMapperFields> {
	return await makeRestApiRequest(
		context,
		'POST',
		'/dynamic-node-parameters/local-resource-mapper-fields',
		sendData,
	);
}

export async function getNodeParameterActionResult(
	context: IRestApiContext,
	sendData: DynamicNodeParameters.ActionResultRequest,
): Promise<NodeParameterValueType> {
	return await makeRestApiRequest(
		context,
		'POST',
		'/dynamic-node-parameters/action-result',
		sendData,
	);
}
