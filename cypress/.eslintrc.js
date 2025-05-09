const sharedOptions = require('@bonkxbt_io/eslint-config/shared');

/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	extends: ['@bonkxbt_io/eslint-config/base', 'plugin:cypress/recommended'],

	...sharedOptions(__dirname),

	plugins: ['cypress'],

	env: {
		'cypress/globals': true,
	},

	rules: {
		// TODO: remove these rules
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unsafe-argument': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-member-access': 'off',
		'@typescript-eslint/no-unsafe-return': 'off',
		'@typescript-eslint/no-unused-expressions': 'off',
		'@typescript-eslint/no-use-before-define': 'off',
		'@typescript-eslint/promise-function-async': 'off',
		'bonkxbt-local-rules/no-uncaught-json-parse': 'off',

		'cypress/no-assigning-return-values': 'warn',
		'cypress/no-unnecessary-waiting': 'warn',
		'cypress/unsafe-to-chain-command': 'warn',
	},
};
