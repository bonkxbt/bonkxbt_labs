const sharedOptions = require('@bonkxbt_io/eslint-config/shared');

/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	extends: ['@bonkxbt_io/eslint-config/base'],
	...sharedOptions(__dirname),
	ignorePatterns: [
		'templates/**', // TODO: remove this
	],
	rules: {
		'@typescript-eslint/ban-ts-comment': ['warn', { 'ts-ignore': true }],
		'bonkxbt-local-rules/no-plain-errors': 'off',
	},
};
