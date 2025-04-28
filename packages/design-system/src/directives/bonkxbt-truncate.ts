import type { DirectiveBinding, ObjectDirective } from 'vue';

import { truncate } from '../utils/string';

/**
 * Custom directive `bonkxbtTruncate` to truncate text content of an HTML element.
 *
 * Usage:
 * In your Vue template, use the directive `v-bonkxbt-truncate` with an argument to specify the length to truncate to.
 *
 * Example:
 * <p v-bonkxbt-truncate:10>Some long text that will be truncated</p>
 *
 * This will truncate the text content of the paragraph to 10 characters.
 *
 * Hint: Do not use it on components
 * https://vuejs.org/guide/reusability/custom-directives#usage-on-components
 */

export const bonkxbtTruncate: ObjectDirective = {
	mounted(el: HTMLElement, binding: DirectiveBinding) {
		el.textContent = truncate(el.textContent ?? '', Number(binding.arg) || undefined);
	},
	updated(el: HTMLElement, binding: DirectiveBinding) {
		el.textContent = truncate(el.textContent ?? '', Number(binding.arg) || undefined);
	},
};
