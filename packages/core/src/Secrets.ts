import type { IDataObject, IWorkflowExecuteAdditionalData } from 'bonkxbt-workflow';
import { ExpressionError } from 'bonkxbt-workflow';

function buildSecretsValueProxy(value: IDataObject): unknown {
	return new Proxy(value, {
		get(_target, valueName) {
			if (typeof valueName !== 'string') {
				return;
			}
			if (!(valueName in value)) {
				throw new ExpressionError('Could not load secrets', {
					description:
						'The credential in use tries to use secret from an external store that could not be found',
				});
			}
			const retValue = value[valueName];
			if (typeof retValue === 'object' && retValue !== null) {
				return buildSecretsValueProxy(retValue as IDataObject);
			}
			return retValue;
		},
	});
}

export function getSecretsProxy(additionalData: IWorkflowExecuteAdditionalData): IDataObject {
	const secretsHelpers = additionalData.secretsHelpers;
	return new Proxy(
		{},
		{
			get(_target, providerName) {
				if (typeof providerName !== 'string') {
					return {};
				}
				if (secretsHelpers.hasProvider(providerName)) {
					return new Proxy(
						{},
						{
							get(_target2, secretName) {
								if (typeof secretName !== 'string') {
									return;
								}
								if (!secretsHelpers.hasSecret(providerName, secretName)) {
									throw new ExpressionError('Could not load secrets', {
										description:
											'The credential in use tries to use secret from an external store that could not be found',
									});
								}
								const retValue = secretsHelpers.getSecret(providerName, secretName);
								if (typeof retValue === 'object' && retValue !== null) {
									return buildSecretsValueProxy(retValue as IDataObject);
								}
								return retValue;
							},
							set() {
								return false;
							},
							ownKeys() {
								return secretsHelpers.listSecrets(providerName);
							},
						},
					);
				}
				throw new ExpressionError('Could not load secrets', {
					description:
						'The credential in use pulls secrets from an external store that is not reachable',
				});
			},
			set() {
				return false;
			},
			ownKeys() {
				return secretsHelpers.listProviders();
			},
		},
	);
}
