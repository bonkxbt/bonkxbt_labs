<script lang="ts" setup>
import { computed, ref, onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
import { useEnvironmentsStore } from '@/stores/environments.ee.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useSourceControlStore } from '@/stores/sourceControl.store';
import { useUIStore } from '@/stores/ui.store';
import { useUsersStore } from '@/stores/users.store';
import { useI18n } from '@/composables/useI18n';
import { useTelemetry } from '@/composables/useTelemetry';
import { useToast } from '@/composables/useToast';
import { useMessage } from '@/composables/useMessage';
import { useDocumentTitle } from '@/composables/useDocumentTitle';

import type { IResource } from '@/components/layouts/ResourcesListLayout.vue';
import ResourcesListLayout from '@/components/layouts/ResourcesListLayout.vue';
import VariablesRow from '@/components/VariablesRow.vue';

import { EnterpriseEditionFeature, MODAL_CONFIRM } from '@/constants';
import type { DatatableColumn, EnvironmentVariable } from '@/Interface';
import { uid } from 'bonkxbt-design-system/utils';
import { getResourcePermissions } from '@/permissions';
import type { BaseTextKey } from '@/plugins/i18n';
import { usePageRedirectionHelper } from '@/composables/usePageRedirectionHelper';

const settingsStore = useSettingsStore();
const environmentsStore = useEnvironmentsStore();
const usersStore = useUsersStore();
const uiStore = useUIStore();
const telemetry = useTelemetry();
const i18n = useI18n();
const message = useMessage();
const sourceControlStore = useSourceControlStore();
const documentTitle = useDocumentTitle();
const pageRedirectionHelper = usePageRedirectionHelper();
let sourceControlStoreUnsubscribe = () => {};

const layoutRef = ref<InstanceType<typeof ResourcesListLayout> | null>(null);

const { showError } = useToast();

const TEMPORARY_VARIABLE_UID_BASE = '@tmpvar';

const allVariables = ref<EnvironmentVariable[]>([]);
const editMode = ref<Record<string, boolean>>({});
const loading = ref(false);

const permissions = computed(
	() => getResourcePermissions(usersStore.currentUser?.globalScopes).variable,
);

const isFeatureEnabled = computed(
	() => settingsStore.isEnterpriseFeatureEnabled[EnterpriseEditionFeature.Variables],
);

const variablesToResources = computed((): IResource[] =>
	allVariables.value.map((v) => ({ id: v.id, name: v.key, value: v.value })),
);

const canCreateVariables = computed(() => isFeatureEnabled.value && permissions.value.create);

const datatableColumns = computed<DatatableColumn[]>(() => [
	{
		id: 0,
		path: 'name',
		label: i18n.baseText('variables.table.key'),
		classes: ['variables-key-column'],
	},
	{
		id: 1,
		path: 'value',
		label: i18n.baseText('variables.table.value'),
		classes: ['variables-value-column'],
	},
	{
		id: 2,
		path: 'usage',
		label: i18n.baseText('variables.table.usage'),
		classes: ['variables-usage-column'],
	},
	...(isFeatureEnabled.value
		? [
				{
					id: 3,
					path: 'actions',
					label: '',
				},
			]
		: []),
]);

const contextBasedTranslationKeys = computed(() => uiStore.contextBasedTranslationKeys);

const newlyAddedVariableIds = ref<string[]>([]);

const nameSortFn = (a: IResource, b: IResource, direction: 'asc' | 'desc') => {
	if (`${a.id}`.startsWith(TEMPORARY_VARIABLE_UID_BASE)) {
		return -1;
	} else if (`${b.id}`.startsWith(TEMPORARY_VARIABLE_UID_BASE)) {
		return 1;
	} else if (
		newlyAddedVariableIds.value.includes(a.id) &&
		newlyAddedVariableIds.value.includes(b.id)
	) {
		return newlyAddedVariableIds.value.indexOf(a.id) - newlyAddedVariableIds.value.indexOf(b.id);
	} else if (newlyAddedVariableIds.value.includes(a.id)) {
		return -1;
	} else if (newlyAddedVariableIds.value.includes(b.id)) {
		return 1;
	}

	return direction === 'asc'
		? displayName(a).trim().localeCompare(displayName(b).trim())
		: displayName(b).trim().localeCompare(displayName(a).trim());
};
const sortFns = {
	nameAsc: (a: IResource, b: IResource) => {
		return nameSortFn(a, b, 'asc');
	},
	nameDesc: (a: IResource, b: IResource) => {
		return nameSortFn(a, b, 'desc');
	},
};

function resetNewVariablesList() {
	newlyAddedVariableIds.value = [];
}

const resourceToEnvironmentVariable = (data: IResource): EnvironmentVariable => ({
	id: data.id,
	key: data.name,
	value: 'value' in data ? (data.value ?? '') : '',
});

const environmentVariableToResource = (data: EnvironmentVariable): IResource => ({
	id: data.id,
	name: data.key,
	value: 'value' in data ? data.value : '',
});

async function initialize() {
	if (!isFeatureEnabled.value) return;
	loading.value = true;
	await environmentsStore.fetchAllVariables();

	allVariables.value = [...environmentsStore.variables];
	loading.value = false;
}

function addTemporaryVariable() {
	const temporaryVariable: EnvironmentVariable = {
		id: uid(TEMPORARY_VARIABLE_UID_BASE),
		key: '',
		value: '',
	};

	if (layoutRef.value) {
		// Reset scroll position
		if (layoutRef.value.$refs.listWrapperRef) {
			(layoutRef.value.$refs.listWrapperRef as HTMLDivElement).scrollTop = 0;
		}

		// Reset pagination
		if (layoutRef.value.currentPage !== 1) {
			layoutRef.value.setCurrentPage(1);
		}
	}

	allVariables.value.unshift(temporaryVariable);
	editMode.value[temporaryVariable.id] = true;

	telemetry.track('User clicked add variable button');
}

async function saveVariable(data: IResource) {
	const variable = resourceToEnvironmentVariable(data);
	try {
		if (typeof variable.id === 'string' && variable.id.startsWith(TEMPORARY_VARIABLE_UID_BASE)) {
			const { id, ...rest } = variable;
			const updatedVariable = await environmentsStore.createVariable(rest);
			allVariables.value.unshift(updatedVariable);
			allVariables.value = allVariables.value.filter((variable) => variable.id !== data.id);
			newlyAddedVariableIds.value.unshift(updatedVariable.id);
		} else {
			const updatedVariable = await environmentsStore.updateVariable(variable);
			allVariables.value = allVariables.value.filter((variable) => variable.id !== data.id);
			allVariables.value.push(updatedVariable);
			toggleEditing(environmentVariableToResource(updatedVariable));
		}
	} catch (error) {
		showError(error, i18n.baseText('variables.errors.save'));
	}
}

function toggleEditing(data: IResource) {
	editMode.value = {
		...editMode.value,
		[data.id]: !editMode.value[data.id],
	};
}

function cancelEditing(data: IResource) {
	if (typeof data.id === 'string' && data.id.startsWith(TEMPORARY_VARIABLE_UID_BASE)) {
		allVariables.value = allVariables.value.filter((variable) => variable.id !== data.id);
	} else {
		toggleEditing(data);
	}
}

async function deleteVariable(data: IResource) {
	const variable = resourceToEnvironmentVariable(data);
	try {
		const confirmed = await message.confirm(
			i18n.baseText('variables.modals.deleteConfirm.message', {
				interpolate: { name: variable.key },
			}),
			i18n.baseText('variables.modals.deleteConfirm.title'),
			{
				confirmButtonText: i18n.baseText('variables.modals.deleteConfirm.confirmButton'),
				cancelButtonText: i18n.baseText('variables.modals.deleteConfirm.cancelButton'),
			},
		);

		if (confirmed !== MODAL_CONFIRM) {
			return;
		}

		await environmentsStore.deleteVariable(variable);
		allVariables.value = allVariables.value.filter((variable) => variable.id !== data.id);
	} catch (error) {
		showError(error, i18n.baseText('variables.errors.delete'));
	}
}

function goToUpgrade() {
	void pageRedirectionHelper.goToUpgrade('variables', 'upgrade-variables');
}

function displayName(resource: IResource) {
	return resource.name;
}

onBeforeMount(() => {
	sourceControlStoreUnsubscribe = sourceControlStore.$onAction(({ name, after }) => {
		if (name === 'pullWorkfolder' && after) {
			after(() => {
				void initialize();
			});
		}
	});
});

onBeforeUnmount(() => {
	sourceControlStoreUnsubscribe();
});

onMounted(() => {
	documentTitle.set(i18n.baseText('variables.heading'));
});
</script>

<template>
	<ResourcesListLayout
		ref="layoutRef"
		class="variables-view"
		resource-key="variables"
		:disabled="!isFeatureEnabled"
		:resources="variablesToResources"
		:initialize="initialize"
		:shareable="false"
		:display-name="displayName"
		:sort-fns="sortFns"
		:sort-options="['nameAsc', 'nameDesc']"
		:show-filters-dropdown="false"
		type="datatable"
		:type-props="{ columns: datatableColumns }"
		:loading="loading"
		@sort="resetNewVariablesList"
		@click:add="addTemporaryVariable"
	>
		<template #header>
			<bonkxbt-heading size="2xlarge" class="mb-m">
				{{ i18n.baseText('variables.heading') }}
			</bonkxbt-heading>
		</template>
		<template #add-button>
			<bonkxbt-tooltip placement="top" :disabled="canCreateVariables">
				<div>
					<bonkxbt-button
						size="large"
						block
						:disabled="!canCreateVariables"
						data-test-id="resources-list-add"
						@click="addTemporaryVariable"
					>
						{{ i18n.baseText(`variables.add`) }}
					</bonkxbt-button>
				</div>
				<template #content>
					<span v-if="!isFeatureEnabled">{{
						i18n.baseText(`variables.add.unavailable${allVariables.length === 0 ? '.empty' : ''}`)
					}}</span>
					<span v-else>{{ i18n.baseText('variables.add.onlyOwnerCanCreate') }}</span>
				</template>
			</bonkxbt-tooltip>
		</template>
		<template v-if="!isFeatureEnabled" #preamble>
			<bonkxbt-action-box
				class="mb-m"
				data-test-id="unavailable-resources-list"
				emoji="👋"
				:heading="
					i18n.baseText(contextBasedTranslationKeys.variables.unavailable.title as BaseTextKey)
				"
				:description="
					i18n.baseText(
						contextBasedTranslationKeys.variables.unavailable.description as BaseTextKey,
					)
				"
				:button-text="
					i18n.baseText(contextBasedTranslationKeys.variables.unavailable.button as BaseTextKey)
				"
				button-type="secondary"
				@click:button="goToUpgrade"
			/>
		</template>
		<template v-if="!isFeatureEnabled || (isFeatureEnabled && !canCreateVariables)" #empty>
			<bonkxbt-action-box
				v-if="!isFeatureEnabled"
				data-test-id="unavailable-resources-list"
				emoji="👋"
				:heading="
					i18n.baseText(contextBasedTranslationKeys.variables.unavailable.title as BaseTextKey)
				"
				:description="
					i18n.baseText(
						contextBasedTranslationKeys.variables.unavailable.description as BaseTextKey,
					)
				"
				:button-text="
					i18n.baseText(contextBasedTranslationKeys.variables.unavailable.button as BaseTextKey)
				"
				button-type="secondary"
				@click:button="goToUpgrade"
			/>
			<bonkxbt-action-box
				v-else-if="!canCreateVariables"
				data-test-id="cannot-create-variables"
				emoji="👋"
				:heading="
					i18n.baseText('variables.empty.notAllowedToCreate.heading', {
						interpolate: { name: usersStore.currentUser?.firstName ?? '' },
					})
				"
				:description="i18n.baseText('variables.empty.notAllowedToCreate.description')"
				@click="goToUpgrade"
			/>
		</template>
		<template #default="{ data }">
			<VariablesRow
				:key="data.id"
				:editing="editMode[data.id]"
				:data="data"
				@save="saveVariable"
				@edit="toggleEditing"
				@cancel="cancelEditing"
				@delete="deleteVariable"
			/>
		</template>
	</ResourcesListLayout>
</template>

<style lang="scss" module>
.type-input {
	--max-width: 265px;
}

.sidebarContainer ul {
	padding: 0 !important;
}
</style>

<style lang="scss" scoped>
@use 'bonkxbt-design-system/css/common/var.scss';

.variables-view {
	:deep(.datatable) {
		table {
			table-layout: fixed;
		}

		th,
		td {
			width: 25%;

			@media screen and (max-width: var.$md) {
				width: 33.33%;
			}

			&.variables-value-column,
			&.variables-key-column,
			&.variables-usage-column {
				> div {
					width: 100%;

					> span {
						max-width: 100%;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						height: 18px;
					}

					> div {
						width: 100%;
					}
				}
			}
		}

		.variables-usage-column {
			@media screen and (max-width: var.$md) {
				display: none;
			}
		}
	}
}
</style>
