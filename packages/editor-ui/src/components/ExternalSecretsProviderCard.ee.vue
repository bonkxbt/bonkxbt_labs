<script lang="ts" setup>
import type { ExternalSecretsProvider } from '@/Interface';
import ExternalSecretsProviderIbonkxbt from '@/components/ExternalSecretsProviderIbonkxbt.ee.vue';
import ExternalSecretsProviderConnectionSwitch from '@/components/ExternalSecretsProviderConnectionSwitch.ee.vue';
import { useExternalSecretsStore } from '@/stores/externalSecrets.ee.store';
import { useUIStore } from '@/stores/ui.store';
import { useToast } from '@/composables/useToast';
import { useI18n } from '@/composables/useI18n';
import { useExternalSecretsProvider } from '@/composables/useExternalSecretsProvider';
import { EXTERNAL_SECRETS_PROVIDER_MODAL_KEY } from '@/constants';
import { DateTime } from 'luxon';
import { computed, nextTick, onMounted, toRef } from 'vue';
import { isDateObject } from '@/utils/typeGuards';

const props = defineProps<{
	provider: ExternalSecretsProvider;
}>();

const externalSecretsStore = useExternalSecretsStore();
const i18n = useI18n();
const uiStore = useUIStore();
const toast = useToast();

const provider = toRef(props, 'provider');
const providerData = computed(() => provider.value.data ?? {});
const { connectionState, testConnection, setConnectionState } = useExternalSecretsProvider(
	provider,
	providerData,
);

const actionDropdownOptions = computed(() => [
	{
		value: 'setup',
		label: i18n.baseText('settings.externalSecrets.card.actionDropdown.setup'),
	},
	...(props.provider.connected
		? [
				{
					value: 'reload',
					label: i18n.baseText('settings.externalSecrets.card.actionDropdown.reload'),
				},
			]
		: []),
]);

const canConnect = computed(() => {
	return props.provider.connected || Object.keys(providerData.value).length > 0;
});

const formattedDate = computed(() => {
	return DateTime.fromISO(
		isDateObject(provider.value.connectedAt)
			? provider.value.connectedAt.toISOString()
			: provider.value.connectedAt || new Date().toISOString(),
	).toFormat('dd LLL yyyy');
});

onMounted(() => {
	setConnectionState(props.provider.state);
});

async function onBeforeConnectionUpdate() {
	if (props.provider.connected) {
		return true;
	}

	await externalSecretsStore.getProvider(props.provider.name);
	await nextTick();
	const status = await testConnection();

	return status !== 'error';
}

function openExternalSecretProvider() {
	uiStore.openModalWithData({
		name: EXTERNAL_SECRETS_PROVIDER_MODAL_KEY,
		data: { name: props.provider.name },
	});
}

async function reloadProvider() {
	try {
		await externalSecretsStore.reloadProvider(props.provider.name);
		toast.showMessage({
			title: i18n.baseText('settings.externalSecrets.card.reload.success.title'),
			message: i18n.baseText('settings.externalSecrets.card.reload.success.description', {
				interpolate: { provider: props.provider.displayName },
			}),
			type: 'success',
		});
	} catch (error) {
		toast.showError(error, i18n.baseText('error'));
	}
}

async function onActionDropdownClick(id: string) {
	switch (id) {
		case 'setup':
			openExternalSecretProvider();
			break;
		case 'reload':
			await reloadProvider();
			break;
	}
}
</script>

<template>
	<bonkxbt-card :class="$style.card">
		<div :class="$style.cardBody">
			<ExternalSecretsProviderIbonkxbt :class="$style.cardIbonkxbt" :provider="provider" />
			<div :class="$style.cardContent">
				<bonkxbt-text bold>{{ provider.displayName }}</bonkxbt-text>
				<bonkxbt-text v-if="provider.connected" color="text-light" size="small">
					<span>
						{{
							i18n.baseText('settings.externalSecrets.card.secretsCount', {
								interpolate: {
									count: `${externalSecretsStore.secrets[provider.name]?.length}`,
								},
							})
						}}
					</span>
					|
					<span>
						{{
							i18n.baseText('settings.externalSecrets.card.connectedAt', {
								interpolate: {
									date: formattedDate,
								},
							})
						}}
					</span>
				</bonkxbt-text>
			</div>
			<div v-if="provider.name === 'infisical'">
				<font-awesome-icon
					:class="$style['warningTriangle']"
					icon="exclamation-triangle"
				></font-awesome-icon>
				<bonkxbtBadge class="mr-xs" theme="tertiary" bold data-test-id="card-badge">
					{{ i18n.baseText('settings.externalSecrets.card.deprecated') }}
				</bonkxbtBadge>
			</div>
			<div v-if="canConnect" :class="$style.cardActions">
				<ExternalSecretsProviderConnectionSwitch
					:provider="provider"
					:before-update="onBeforeConnectionUpdate"
					:disabled="connectionState === 'error' && !provider.connected"
				/>
				<bonkxbt-action-toggle
					class="ml-s"
					theme="dark"
					:actions="actionDropdownOptions"
					@action="onActionDropdownClick"
				/>
			</div>
			<bonkxbt-button v-else type="tertiary" @click="openExternalSecretProvider()">
				{{ i18n.baseText('settings.externalSecrets.card.setUp') }}
			</bonkxbt-button>
		</div>
	</bonkxbt-card>
</template>

<style lang="scss" module>
.card {
	position: relative;
	margin-bottom: var(--spacing-2xs);
}

.cardIbonkxbt {
	width: 28px;
	height: 28px;
}

.cardBody {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.cardContent {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	margin-left: var(--spacing-s);
}

.cardActions {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-left: var(--spacing-s);
}

.warningTriangle {
	color: var(--color-warning);
	margin-right: var(--spacing-2xs);
}
</style>
