import { ApplicationError } from 'bonkxbt-workflow';

export class UnrecognizedCredentialTypeError extends ApplicationError {
	severity = 'warning';

	constructor(credentialType: string) {
		super(`Unrecognized credential type: ${credentialType}`);
	}
}
