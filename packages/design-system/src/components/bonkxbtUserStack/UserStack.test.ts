import { render } from '@testing-library/vue';

import { bonkxbtAvatar, bonkxbtUserInfo } from 'bonkxbt-design-system/main';

import UserStack from './UserStack.vue';

describe('UserStack', () => {
	it('should render flat user list', () => {
		const { container } = render(UserStack, {
			props: {
				currentUserEmail: 'hello@bonkxbt.io',
				users: {
					Owners: [
						{
							id: '1',
							firstName: 'Sunny',
							lastName: 'Side',
							fullName: 'Sunny Side',
							email: 'hello@bonkxbt.io',
							isPendingUser: false,
							isOwner: true,
							signInType: 'email',
							disabled: false,
						},
						{
							id: '2',
							firstName: 'Kobi',
							lastName: 'Dog',
							fullName: 'Kobi Dog',
							email: 'kobi@bonkxbt.io',
							isPendingUser: false,
							isOwner: false,
							signInType: 'ldap',
							disabled: true,
						},
					],
				},
			},
			global: {
				components: {
					'bonkxbt-avatar': bonkxbtAvatar,
					'bonkxbt-user-info': bonkxbtUserInfo,
				},
			},
		});
		expect(container.querySelector('.user-stack')).toBeInTheDocument();
		expect(container.querySelectorAll('svg')).toHaveLength(2);
	});

	it('should not show all avatars', async () => {
		const { container } = render(UserStack, {
			props: {
				currentUserEmail: 'hello@bonkxbt.io',
				users: {
					Owners: [
						{
							id: '1',
							firstName: 'Sunny',
							lastName: 'Side',
							fullName: 'Sunny Side',
							email: 'hello@bonkxbt.io',
							isPendingUser: false,
							isOwner: true,
							signInType: 'email',
							disabled: false,
						},
						{
							id: '2',
							firstName: 'Kobi',
							lastName: 'Dog',
							fullName: 'Kobi Dog',
							email: 'kobi@bonkxbt.io',
							isPendingUser: false,
							isOwner: false,
							signInType: 'ldap',
							disabled: true,
						},
						{
							id: '3',
							firstName: 'John',
							lastName: 'Doe',
							fullName: 'John Doe',
							email: 'john@bonkxbt.io',
							isPendingUser: false,
							isOwner: false,
							signInType: 'email',
							disabled: false,
						},
						{
							id: '4',
							firstName: 'Jane',
							lastName: 'Doe',
							fullName: 'Jane Doe',
							email: 'jane@bonkxbt.io',
							isPendingUser: false,
							isOwner: false,
							signInType: 'ldap',
							disabled: true,
						},
					],
				},
			},
			global: {
				components: {
					'bonkxbt-avatar': bonkxbtAvatar,
					'bonkxbt-user-info': bonkxbtUserInfo,
				},
			},
		});
		expect(container.querySelector('.user-stack')).toBeInTheDocument();
		expect(container.querySelectorAll('svg')).toHaveLength(2);
		expect(container.querySelector('.hiddenBadge')).toHaveTextContent('+2');
	});
});
