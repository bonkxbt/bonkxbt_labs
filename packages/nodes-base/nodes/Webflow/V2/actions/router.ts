import type { IExecuteFunctions, INodeExecutionData } from 'bonkxbt-workflow';
import { NodeOperationError } from 'bonkxbt-workflow';

import * as item from './Item/Item.resource';
import type { WebflowType } from './node.type';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	let returnData: INodeExecutionData[] = [];

	const items = this.getInputData();
	const resource = this.getNodeParameter<WebflowType>('resource', 0);
	const operation = this.getNodeParameter('operation', 0);

	const webflowNodeData = {
		resource,
		operation,
	} as WebflowType;

	try {
		switch (webflowNodeData.resource) {
			case 'item':
				returnData = await item[webflowNodeData.operation].execute.call(this, items);
				break;
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported!`,
				);
		}
	} catch (error) {
		throw error;
	}

	return [returnData];
}
