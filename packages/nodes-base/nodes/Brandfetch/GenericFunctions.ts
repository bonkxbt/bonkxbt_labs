import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	JsonObject,
} from 'bonkxbt-workflow';
import { NodeApiError } from 'bonkxbt-workflow';

export async function brandfetchApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: any = {},
	qs: IDataObject = {},
	uri?: string,
	option: IDataObject = {},
): Promise<any> {
	try {
		let options: IRequestOptions = {
			method: method as IHttpRequestMethods,
			qs,
			body,
			url: uri || `https://api.brandfetch.io/v2${resource}`,
			json: true,
		};

		options = Object.assign({}, options, option);

		if (this.getNodeParameter('operation', 0) === 'logo' && options.json === false) {
			delete options.headers;
		}

		if (!Object.keys(body as IDataObject).length) {
			delete options.body;
		}
		if (!Object.keys(qs).length) {
			delete options.qs;
		}

		const response = await this.helpers.requestWithAuthentication.call(
			this,
			'brandfetchApi',
			options,
		);

		if (response.statusCode && response.statusCode !== 200) {
			throw new NodeApiError(this.getNode(), response as JsonObject);
		}

		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function fetchAndPrepareBinaryData(
	this: IExecuteFunctions,
	ibonkxbtType: string,
	ibonkxbtFormat: string,
	logoFormats: IDataObject,
	domain: string,
	newItem: INodeExecutionData,
) {
	const data = await brandfetchApiRequest.call(this, 'GET', '', {}, {}, logoFormats.src as string, {
		json: false,
		encoding: null,
	});

	newItem.binary![`${ibonkxbtType}_${ibonkxbtFormat}`] = await this.helpers.prepareBinaryData(
		Buffer.from(data),
		`${ibonkxbtType}_${domain}.${ibonkxbtFormat}`,
	);
}
