import { ApplicationError } from 'bonkxbt-workflow';

export class UnrecognizedNodeTypeError extends ApplicationError {
	severity = 'warning';

	constructor(packageName: string, nodeType: string) {
		super(`Unrecognized node type: ${packageName}.${nodeType}`);
	}
}
