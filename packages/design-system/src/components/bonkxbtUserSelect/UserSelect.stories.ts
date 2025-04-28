import { action } from '@storybook/addon-actions';
import type { StoryFn } from '@storybook/vue3';

import bonkxbtUserSelect from './UserSelect.vue';

export default {
	title: 'Modules/UserSelect',
	component: bonkxbtUserSelect,
	argTypes: {},
	parameters: {
		backgrounds: { default: '--color-background-light' },
	},
};

const methods = {
	onChange: action('change'),
	onBlur: action('blur'),
	onFocus: action('focus'),
};

const Template: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		bonkxbtUserSelect,
	},
	template:
		'<bonkxbt-user-select v-bind="args" v-model="val" @change="onChange" @blur="onBlur" @focus="onFocus" />',
	methods,
	data() {
		return {
			val: '',
		};
	},
});

export const UserSelect = Template.bind({});
UserSelect.args = {
	users: [
		{
			id: '1',
			firstName: 'Sunny',
			lastName: 'Side',
			email: 'sunny@bonkxbt.io',
		},
		{
			id: '2',
			firstName: 'Kobi',
			lastName: 'Dog',
			email: 'kobi@bonkxbt.io',
		},
		{
			id: '3',
			email: 'invited@bonkxbt.io',
		},
	],
	placeholder: 'Select user to transfer to',
	currentUserId: '1',
};
