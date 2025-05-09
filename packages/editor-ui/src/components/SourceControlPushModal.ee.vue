<script lang="ts" setup>
import Modal from './Modal.vue';
import { SOURCE_CONTROL_PUSH_MODAL_KEY, VIEWS } from '@/constants';
import { computed, onMounted, ref } from 'vue';
import type { EventBus } from 'bonkxbt-design-system/utils';
import { useI18n } from '@/composables/useI18n';
import { useLoadingService } from '@/composables/useLoadingService';
import { useToast } from '@/composables/useToast';
import { useSourceControlStore } from '@/stores/sourceControl.store';
import { useUIStore } from '@/stores/ui.store';
import { useRoute } from 'vue-router';
import dateformat from 'dateformat';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import type { BaseTextKey } from '@/plugins/i18n';
import { refDebounced } from '@vueuse/core';
import {
	bonkxbtHeading,
	bonkxbtText,
	bonkxbtLink,
	bonkxbtCheckbox,
	bonkxbtInput,
	bonkxbtIcon,
	bonkxbtButton,
	bonkxbtBadge,
	bonkxbtNotice,
	bonkxbtPopover,
	bonkxbtSelect,
	bonkxbtOption,
	bonkxbtInputLabel,
	bonkxbtInfoTip,
} from 'bonkxbt-design-system';
import {
	SOURCE_CONTROL_FILE_STATUS,
	SOURCE_CONTROL_FILE_TYPE,
	SOURCE_CONTROL_FILE_LOCATION,
	type SourceControlledFileStatus,
	type SourceControlAggregatedFile,
} from '@/types/sourceControl.types';
import { orderBy, groupBy } from 'lodash-es';

const props = defineProps<{
	data: { eventBus: EventBus; status: SourceControlAggregatedFile[] };
}>();

const loadingService = useLoadingService();
const uiStore = useUIStore();
const toast = useToast();
const i18n = useI18n();
const sourceControlStore = useSourceControlStore();
const route = useRoute();

type Changes = {
	tags: SourceControlAggregatedFile[];
	variables: SourceControlAggregatedFile[];
	credentials: SourceControlAggregatedFile[];
	workflows: SourceControlAggregatedFile[];
	currentWorkflow?: SourceControlAggregatedFile;
};

const classifyFilesByType = (
	files: SourceControlAggregatedFile[],
	currentWorkflowId?: string,
): Changes =>
	files.reduce<Changes>(
		(acc, file) => {
			// do not show remote workflows that are not yet created locally during push
			if (
				file.location === SOURCE_CONTROL_FILE_LOCATION.REMOTE &&
				file.type === SOURCE_CONTROL_FILE_TYPE.WORKFLOW &&
				file.status === SOURCE_CONTROL_FILE_STATUS.CREATED
			) {
				return acc;
			}

			if (file.type === SOURCE_CONTROL_FILE_TYPE.VARIABLES) {
				acc.variables.push(file);
				return acc;
			}

			if (file.type === SOURCE_CONTROL_FILE_TYPE.TAGS) {
				acc.tags.push(file);
				return acc;
			}

			if (file.type === SOURCE_CONTROL_FILE_TYPE.WORKFLOW && currentWorkflowId === file.id) {
				acc.currentWorkflow = file;
			}

			if (file.type === SOURCE_CONTROL_FILE_TYPE.WORKFLOW) {
				acc.workflows.push(file);
				return acc;
			}

			if (file.type === SOURCE_CONTROL_FILE_TYPE.CREDENTIAL) {
				acc.credentials.push(file);
				return acc;
			}

			return acc;
		},
		{ tags: [], variables: [], credentials: [], workflows: [], currentWorkflow: undefined },
	);

const userNotices = computed(() => {
	const messages: string[] = [];

	if (changes.value.credentials.length) {
		const { created, deleted, modified } = groupBy(changes.value.credentials, 'status');

		messages.push(
			`${created?.length ?? 0} new credentials added, ${deleted?.length ?? 0} deleted and ${modified?.length ?? 0} changed`,
		);
	}

	if (changes.value.variables.length) {
		messages.push('At least one new variable has been added or modified');
	}

	if (changes.value.tags.length) {
		messages.push('At least one new tag has been added or modified');
	}

	return messages;
});
const workflowId = computed(
	() =>
		([VIEWS.WORKFLOW].includes(route.name as VIEWS) && route.params.name?.toString()) || undefined,
);

const changes = computed(() => classifyFilesByType(props.data.status, workflowId.value));

const selectedChanges = ref<Set<string>>(new Set());
const toggleSelected = (id: string) => {
	if (selectedChanges.value.has(id)) {
		selectedChanges.value.delete(id);
	} else {
		selectedChanges.value.add(id);
	}
};

const maybeSelectCurrentWorkflow = (workflow?: SourceControlAggregatedFile) =>
	workflow && selectedChanges.value.add(workflow.id);
onMounted(() => maybeSelectCurrentWorkflow(changes.value.currentWorkflow));

const filters = ref<{ status?: SourceControlledFileStatus }>({});
const filtersApplied = computed(() => Boolean(Object.keys(filters.value).length));
const resetFilters = () => {
	filters.value = {};
};

const statusFilterOptions: Array<{ label: string; value: SourceControlledFileStatus }> = [
	{
		label: 'New',
		value: SOURCE_CONTROL_FILE_STATUS.CREATED,
	},
	{
		label: 'Modified',
		value: SOURCE_CONTROL_FILE_STATUS.MODIFIED,
	},
	{
		label: 'Deleted',
		value: SOURCE_CONTROL_FILE_STATUS.DELETED,
	},
] as const;

const search = ref('');
const debouncedSearch = refDebounced(search, 250);

const filterCount = computed(() =>
	Object.values(filters.value).reduce((acc, item) => (item ? acc + 1 : acc), 0),
);

const filteredWorkflows = computed(() => {
	const searchQuery = debouncedSearch.value.toLocaleLowerCase();

	return changes.value.workflows.filter((workflow) => {
		if (!workflow.name.toLocaleLowerCase().includes(searchQuery)) {
			return false;
		}

		if (filters.value.status && filters.value.status !== workflow.status) {
			return false;
		}

		return true;
	});
});

const statusPriority: Partial<Record<SourceControlledFileStatus, number>> = {
	[SOURCE_CONTROL_FILE_STATUS.MODIFIED]: 1,
	[SOURCE_CONTROL_FILE_STATUS.RENAMED]: 2,
	[SOURCE_CONTROL_FILE_STATUS.CREATED]: 3,
	[SOURCE_CONTROL_FILE_STATUS.DELETED]: 4,
} as const;
const getPriorityByStatus = (status: SourceControlledFileStatus): number =>
	statusPriority[status] ?? 0;

const sortedWorkflows = computed(() => {
	const sorted = orderBy(
		filteredWorkflows.value,
		[
			// keep the current workflow at the top of the list
			({ id }) => id === changes.value.currentWorkflow?.id,
			({ status }) => getPriorityByStatus(status),
			'updatedAt',
		],
		['desc', 'asc', 'desc'],
	);

	return sorted;
});

const commitMessage = ref('');
const isSubmitDisabled = computed(() => {
	if (!commitMessage.value.trim()) {
		return true;
	}

	const toBePushed =
		changes.value.credentials.length +
		changes.value.tags.length +
		changes.value.variables.length +
		selectedChanges.value.size;
	if (toBePushed <= 0) {
		return true;
	}

	return false;
});

const selectAll = computed(
	() =>
		selectedChanges.value.size > 0 && selectedChanges.value.size === sortedWorkflows.value.length,
);

const selectAllIndeterminate = computed(
	() => selectedChanges.value.size > 0 && selectedChanges.value.size < sortedWorkflows.value.length,
);

function onToggleSelectAll() {
	if (selectAll.value) {
		selectedChanges.value.clear();
	} else {
		selectedChanges.value = new Set(changes.value.workflows.map((file) => file.id));
	}
}

function close() {
	uiStore.closeModal(SOURCE_CONTROL_PUSH_MODAL_KEY);
}

function renderUpdatedAt(file: SourceControlAggregatedFile) {
	const currentYear = new Date().getFullYear().toString();

	return i18n.baseText('settings.sourceControl.lastUpdated', {
		interpolate: {
			date: dateformat(
				file.updatedAt,
				`d mmm${file.updatedAt?.startsWith(currentYear) ? '' : ', yyyy'}`,
			),
			time: dateformat(file.updatedAt, 'HH:MM'),
		},
	});
}

async function onCommitKeyDownEnter() {
	if (!isSubmitDisabled.value) {
		await commitAndPush();
	}
}

const successNotificationMessage = () => {
	const messages: string[] = [];

	if (selectedChanges.value.size) {
		messages.push(
			i18n.baseText('generic.workflow', {
				adjustToNumber: selectedChanges.value.size,
				interpolate: { count: selectedChanges.value.size },
			}),
		);
	}

	if (changes.value.credentials.length) {
		messages.push(
			i18n.baseText('generic.credential', {
				adjustToNumber: changes.value.credentials.length,
				interpolate: { count: changes.value.credentials.length },
			}),
		);
	}

	if (changes.value.variables.length) {
		messages.push(i18n.baseText('generic.variable_plural'));
	}

	if (changes.value.tags.length) {
		messages.push(i18n.baseText('generic.tag_plural'));
	}

	return [
		new Intl.ListFormat(i18n.locale, { style: 'long', type: 'conjunction' }).format(messages),
		i18n.baseText('settings.sourceControl.modals.push.success.description'),
	].join(' ');
};

async function commitAndPush() {
	const files = changes.value.tags
		.concat(changes.value.variables)
		.concat(changes.value.credentials)
		.concat(changes.value.workflows.filter((file) => selectedChanges.value.has(file.id)));
	loadingService.startLoading(i18n.baseText('settings.sourceControl.loading.push'));
	close();

	try {
		await sourceControlStore.pushWorkfolder({
			force: true,
			commitMessage: commitMessage.value,
			fileNames: files,
		});

		toast.showToast({
			title: i18n.baseText('settings.sourceControl.modals.push.success.title'),
			message: successNotificationMessage(),
			type: 'success',
		});
	} catch (error) {
		toast.showError(error, i18n.baseText('error'));
	} finally {
		loadingService.stopLoading();
	}
}

const getStatusText = (status: SourceControlledFileStatus) =>
	i18n.baseText(`settings.sourceControl.status.${status}` as BaseTextKey);
const getStatusTheme = (status: SourceControlledFileStatus) => {
	const statusToBadgeThemeMap: Partial<
		Record<SourceControlledFileStatus, 'success' | 'danger' | 'warning'>
	> = {
		[SOURCE_CONTROL_FILE_STATUS.CREATED]: 'success',
		[SOURCE_CONTROL_FILE_STATUS.DELETED]: 'danger',
		[SOURCE_CONTROL_FILE_STATUS.MODIFIED]: 'warning',
	} as const;
	return statusToBadgeThemeMap[status];
};
</script>

<template>
	<Modal
		width="812px"
		:event-bus="data.eventBus"
		:name="SOURCE_CONTROL_PUSH_MODAL_KEY"
		max-height="80%"
		:custom-class="$style.sourceControlPush"
	>
		<template #header>
			<bonkxbtHeading tag="h1" size="xlarge">
				{{ i18n.baseText('settings.sourceControl.modals.push.title') }}
			</bonkxbtHeading>
			<div class="mt-l">
				<bonkxbtText tag="div">
					{{ i18n.baseText('settings.sourceControl.modals.push.description') }}
					<bonkxbtLink :to="i18n.baseText('settings.sourceControl.docs.using.pushPull.url')">
						{{ i18n.baseText('settings.sourceControl.modals.push.description.learnMore') }}
					</bonkxbtLink>
				</bonkxbtText>

				<bonkxbtNotice v-if="userNotices.length" class="mt-xs" :compact="false">
					<ul class="ml-m">
						<li v-for="notice in userNotices" :key="notice">{{ notice }}</li>
					</ul>
				</bonkxbtNotice>
			</div>

			<div v-if="changes.workflows.length" :class="[$style.filers]" class="mt-l">
				<bonkxbtCheckbox
					:class="$style.selectAll"
					:indeterminate="selectAllIndeterminate"
					:model-value="selectAll"
					data-test-id="source-control-push-modal-toggle-all"
					@update:model-value="onToggleSelectAll"
				>
					<bonkxbtText bold tag="strong">
						{{ i18n.baseText('settings.sourceControl.modals.push.workflowsToCommit') }}
					</bonkxbtText>
					<bonkxbtText tag="strong">
						({{ selectedChanges.size }}/{{ sortedWorkflows.length }})
					</bonkxbtText>
				</bonkxbtCheckbox>
				<bonkxbtPopover trigger="click" width="304" style="align-self: normal">
					<template #reference>
						<bonkxbtButton
							icon="filter"
							type="tertiary"
							style="height: 100%"
							:active="Boolean(filterCount)"
							data-test-id="source-control-filter-dropdown"
						>
							<bonkxbtBadge v-show="filterCount" theme="primary" class="mr-4xs">
								{{ filterCount }}
							</bonkxbtBadge>
							{{ i18n.baseText('forms.resourceFiltersDropdown.filters') }}
						</bonkxbtButton>
					</template>
					<bonkxbtInputLabel
						:label="i18n.baseText('workflows.filters.status')"
						:bold="false"
						size="small"
						color="text-base"
						class="mb-3xs"
					/>
					<bonkxbtSelect v-model="filters.status" data-test-id="source-control-status-filter" clearable>
						<bonkxbtOption
							v-for="option in statusFilterOptions"
							:key="option.label"
							data-test-id="source-control-status-filter-option"
							v-bind="option"
						>
						</bonkxbtOption>
					</bonkxbtSelect>
				</bonkxbtPopover>
				<bonkxbtInput
					v-model="search"
					data-test-id="source-control-push-search"
					:placeholder="i18n.baseText('workflows.search.placeholder')"
					clearable
				>
					<template #prefix>
						<bonkxbtIcon icon="search" />
					</template>
				</bonkxbtInput>
			</div>
		</template>
		<template #content>
			<bonkxbtInfoTip v-if="filtersApplied && !sortedWorkflows.length" :bold="false">
				{{ i18n.baseText('workflows.filters.active') }}
				<bonkxbtLink size="small" data-test-id="source-control-filters-reset" @click="resetFilters">
					{{ i18n.baseText('workflows.filters.active.reset') }}
				</bonkxbtLink>
			</bonkxbtInfoTip>
			<RecycleScroller
				v-if="sortedWorkflows.length"
				:class="[$style.scroller]"
				:items="sortedWorkflows"
				:item-size="69"
				key-field="id"
			>
				<template #default="{ item: file }">
					<bonkxbtCheckbox
						:class="['scopedListItem', $style.listItem]"
						data-test-id="source-control-push-modal-file-checkbox"
						:model-value="selectedChanges.has(file.id)"
						@update:model-value="toggleSelected(file.id)"
					>
						<span>
							<bonkxbtText v-if="file.status === SOURCE_CONTROL_FILE_STATUS.DELETED" color="text-light">
								<span v-if="file.type === SOURCE_CONTROL_FILE_TYPE.WORKFLOW">
									Deleted Workflow:
								</span>
								<span v-if="file.type === SOURCE_CONTROL_FILE_TYPE.CREDENTIAL">
									Deleted Credential:
								</span>
								<strong>{{ file.name || file.id }}</strong>
							</bonkxbtText>
							<bonkxbtText v-else bold> {{ file.name }} </bonkxbtText>
							<bonkxbtText v-if="file.updatedAt" tag="p" class="mt-0" color="text-light" size="small">
								{{ renderUpdatedAt(file) }}
							</bonkxbtText>
						</span>
						<span :class="[$style.badges]">
							<bonkxbtBadge
								v-if="changes.currentWorkflow && file.id === changes.currentWorkflow.id"
								class="mr-2xs"
							>
								Current workflow
							</bonkxbtBadge>
							<bonkxbtBadge :theme="getStatusTheme(file.status)">
								{{ getStatusText(file.status) }}
							</bonkxbtBadge>
						</span>
					</bonkxbtCheckbox>
				</template>
			</RecycleScroller>
		</template>

		<template #footer>
			<bonkxbtText bold tag="p" class="mb-2xs">
				{{ i18n.baseText('settings.sourceControl.modals.push.commitMessage') }}
			</bonkxbtText>
			<bonkxbtInput
				v-model="commitMessage"
				data-test-id="source-control-push-modal-commit"
				:placeholder="i18n.baseText('settings.sourceControl.modals.push.commitMessage.placeholder')"
				@keydown.enter="onCommitKeyDownEnter"
			/>

			<div :class="$style.footer">
				<bonkxbtButton type="tertiary" class="mr-2xs" @click="close">
					{{ i18n.baseText('settings.sourceControl.modals.push.buttons.cancel') }}
				</bonkxbtButton>
				<bonkxbtButton
					data-test-id="source-control-push-modal-submit"
					type="primary"
					:disabled="isSubmitDisabled"
					@click="commitAndPush"
				>
					{{ i18n.baseText('settings.sourceControl.modals.push.buttons.save') }}
				</bonkxbtButton>
			</div>
		</template>
	</Modal>
</template>

<style module lang="scss">
.filers {
	display: flex;
	align-items: center;
	gap: 8px;
}

.selectAll {
	flex-shrink: 0;
	margin-bottom: 0;
}

.scroller {
	max-height: 380px;
}

.listItem {
	align-items: center;
	padding: var(--spacing-xs);
	transition: border 0.3s ease;
	border-radius: var(--border-radius-large);
	border: var(--border-base);

	&:hover {
		border-color: var(--color-foreground-dark);
	}

	:global(.el-checkbox__label) {
		display: flex;
		width: 100%;
		justify-content: space-between;
		align-items: center;
	}

	:global(.el-checkbox__inner) {
		transition: none;
	}
}

.badges {
	display: flex;
}

.footer {
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	margin-top: 20px;
}

.sourceControlPush {
	:global(.el-dialog__header) {
		padding-bottom: var(--spacing-xs);
	}
}
</style>
