import { getCredentialSaveButton, saveCredential } from '../../composables/modals/credential-modal';
import { getVisibleSelect } from '../../utils';
import { BasePage } from '../base';

export class CredentialsModal extends BasePage {
	getters = {
		newCredentialModal: () => cy.getByTestId('selectCredential-modal', { timeout: 5000 }),
		editCredentialModal: () => cy.getByTestId('editCredential-modal', { timeout: 5000 }),
		newCredentialTypeSelect: () => cy.getByTestId('new-credential-type-select'),
		newCredentialTypeOption: (credentialType: string) =>
			cy.getByTestId('new-credential-type-select-option').contains(credentialType),
		newCredentialTypeButton: () => cy.getByTestId('new-credential-type-button'),
		connectionParameter: (fieldName: string) =>
			this.getters.credentialInputs().find(`:contains('${fieldName}') .bonkxbt-input input`),
		name: () => cy.getByTestId('credential-name'),
		nameInput: () => cy.getByTestId('credential-name').find('input'),
		deleteButton: () => cy.getByTestId('credential-delete-button'),
		closeButton: () => this.getters.editCredentialModal().find('.el-dialog__close').first(),
		oauthConnectButton: () => cy.getByTestId('oauth-connect-button'),
		oauthConnectSuccessBanner: () => cy.getByTestId('oauth-connect-success-banner'),
		credentialsEditModal: () => cy.getByTestId('credential-edit-dialog'),
		credentialsAuthTypeSelector: () => cy.getByTestId('node-auth-type-selector'),
		credentialAuthTypeRadioButtons: () =>
			this.getters.credentialsAuthTypeSelector().find('label.el-radio'),
		credentialInputs: () => cy.getByTestId('credential-connection-parameter'),
		menu: () => this.getters.editCredentialModal().get('.menu-container'),
		menuItem: (name: string) => this.getters.menu().get('.bonkxbt-menu-item').contains(name),
		usersSelect: () => cy.getByTestId('project-sharing-select').filter(':visible'),
		testSuccessTag: () => cy.getByTestId('credentials-config-container-test-success'),
	};

	actions = {
		addUser: (email: string) => {
			this.getters.usersSelect().click();
			getVisibleSelect().contains(email.toLowerCase()).click();
		},
		setName: (name: string) => {
			this.getters.name().click();
			this.getters.nameInput().clear().type(name);
		},
		save: (test = false) => {
			cy.intercept('POST', '/rest/credentials').as('saveCredential');
			saveCredential();

			cy.wait('@saveCredential');
			if (test) cy.wait('@testCredential');
			getCredentialSaveButton().should('contain.text', 'Saved');
		},
		saveSharing: () => {
			cy.intercept('PUT', '/rest/credentials/*/share').as('shareCredential');
			saveCredential();
			cy.wait('@shareCredential');
			getCredentialSaveButton().should('contain.text', 'Saved');
		},
		close: () => {
			this.getters.closeButton().click();
		},
		fillCredentialsForm: (closeModal = true) => {
			this.getters.credentialsEditModal().should('be.visible');
			this.getters.credentialInputs().should('have.length.greaterThan', 0);
			this.getters
				.credentialInputs()
				.find('input[type=text], input[type=password]')
				.each(($el) => {
					cy.wrap($el).type('test');
				});
			saveCredential();
			if (closeModal) {
				this.getters.closeButton().click();
			}
		},
		fillField: (fieldName: string, value: string) => {
			this.getters
				.credentialInputs()
				.getByTestId(`parameter-input-${fieldName}`)
				.find('input')
				.type(value);
		},
		createNewCredential: (type: string, closeModal = true) => {
			this.getters.newCredentialModal().should('be.visible');
			this.getters.newCredentialTypeSelect().should('be.visible');
			this.getters.newCredentialTypeOption(type).click();
			this.getters.newCredentialTypeButton().click();
			this.actions.fillCredentialsForm(closeModal);
		},
		renameCredential: (newName: string) => {
			this.getters.nameInput().type('{selectall}');
			this.getters.nameInput().type(newName);
			this.getters.nameInput().type('{enter}');
		},
		changeTab: (tabName: 'Sharing') => {
			this.getters.menuItem(tabName).click();
		},
	};
}
