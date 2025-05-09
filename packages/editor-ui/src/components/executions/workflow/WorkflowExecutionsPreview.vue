<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElDropdown } from 'element-plus';
import { useExecutionDebugging } from '@/composables/useExecutionDebugging';
import { useMessage } from '@/composables/useMessage';
import WorkflowExecutionAnnotationPanel from '@/components/executions/workflow/WorkflowExecutionAnnotationPanel.ee.vue';
import WorkflowPreview from '@/components/WorkflowPreview.vue';
import { EnterpriseEditionFeature, MODAL_CONFIRM, VIEWS } from '@/constants';
import type { ExecutionSummary } from 'bonkxbt-workflow';
import type { IExecutionUIData } from '@/composables/useExecutionHelpers';
import { useExecutionHelpers } from '@/composables/useExecutionHelpers';
import { useWorkflowsStore } from '@/stores/workflows.store';
import { useI18n } from '@/composables/useI18n';
import { getResourcePermissions } from '@/permissions';
import { useSettingsStore } from '@/stores/settings.store';

type RetryDropdownRef = InstanceType<typeof ElDropdown>;

const props = defineProps<{
	execution: ExecutionSummary;
}>();

const emit = defineEmits<{
	deleteCurrentExecution: [];
	retryExecution: Array<{ execution: ExecutionSummary; command: string }>;
	stopExecution: [];
}>();

const route = useRoute();
const locale = useI18n();

const executionHelpers = useExecutionHelpers();
const message = useMessage();
const executionDebugging = useExecutionDebugging();
const workflowsStore = useWorkflowsStore();
const settingsStore = useSettingsStore();

const retryDropdownRef = ref<RetryDropdownRef | null>(null);
const workflowId = computed(() => route.params.name as string);
const workflowPermissions = computed(
	() => getResourcePermissions(workflowsStore.getWorkflowById(workflowId.value)?.scopes).workflow,
);
const executionId = computed(() => route.params.executionId as string);
const executionUIDetails = computed<IExecutionUIData | null>(() =>
	props.execution ? executionHelpers.getUIDetails(props.execution) : null,
);
const debugButtonData = computed(() =>
	props.execution?.status === 'success'
		? {
				text: locale.baseText('executionsList.debug.button.copyToEditor'),
				type: 'secondary',
			}
		: {
				text: locale.baseText('executionsList.debug.button.debugInEditor'),
				type: 'primary',
			},
);
const isRetriable = computed(
	() => !!props.execution && executionHelpers.isExecutionRetriable(props.execution),
);

const isAnnotationEnabled = computed(
	() => settingsStore.isEnterpriseFeatureEnabled[EnterpriseEditionFeature.AdvancedExecutionFilters],
);

const hasAnnotation = computed(
	() =>
		!!props.execution?.annotation &&
		(props.execution?.annotation.vote || props.execution?.annotation.tags.length > 0),
);

async function onDeleteExecution(): Promise<void> {
	// Prepend the message with a note about annotations if they exist
	const confirmationText = [
		hasAnnotation.value && locale.baseText('executionDetails.confirmMessage.annotationsNote'),
		locale.baseText('executionDetails.confirmMessage.message'),
	]
		.filter(Boolean)
		.join(' ');

	const deleteConfirmed = await message.confirm(
		confirmationText,
		locale.baseText('executionDetails.confirmMessage.headline'),
		{
			type: 'warning',
			confirmButtonText: locale.baseText('executionDetails.confirmMessage.confirmButtonText'),
			cancelButtonText: '',
		},
	);
	if (deleteConfirmed !== MODAL_CONFIRM) {
		return;
	}
	emit('deleteCurrentExecution');
}

function handleRetryClick(command: string) {
	emit('retryExecution', { execution: props.execution, command });
}

function handleStopClick() {
	emit('stopExecution');
}

function onRetryButtonBlur(event: FocusEvent) {
	// Hide dropdown when clicking outside of current document
	if (retryDropdownRef.value && event.relatedTarget === null) {
		retryDropdownRef.value.handleClose();
	}
}
</script>

<template>
	<div v-if="executionUIDetails?.name === 'new'" :class="$style.newInfo">
		<bonkxbtText :class="$style.newMessage" color="text-light">
			{{ locale.baseText('executionDetails.newMessage') }}
		</bonkxbtText>
		<bonkxbtButton class="mt-l" type="tertiary" @click="handleStopClick">
			{{ locale.baseText('executionsList.stopExecution') }}
		</bonkxbtButton>
	</div>
	<div v-else-if="executionUIDetails?.name === 'running'" :class="$style.runningInfo">
		<div :class="$style.spinner">
			<bonkxbtSpinner type="ring" />
		</div>
		<bonkxbtText :class="$style.runningMessage" color="text-light">
			{{ locale.baseText('executionDetails.runningMessage') }}
		</bonkxbtText>
		<bonkxbtButton
			data-test-id="stop-execution"
			class="mt-l"
			type="tertiary"
			:disabled="!workflowPermissions.execute"
			@click="handleStopClick"
		>
			{{ locale.baseText('executionsList.stopExecution') }}
		</bonkxbtButton>
	</div>
	<div v-else-if="executionUIDetails" :class="$style.previewContainer">
		<div
			v-if="execution"
			:class="$style.executionDetails"
			:data-test-id="`execution-preview-details-${executionId}`"
		>
			<WorkflowExecutionAnnotationPanel v-if="isAnnotationEnabled && execution" />
			<div>
				<bonkxbtText size="large" color="text-base" :bold="true" data-test-id="execution-time">{{
					executionUIDetails?.startTime
				}}</bonkxbtText
				><br />
				<bonkxbtSpinner
					v-if="executionUIDetails?.name === 'running'"
					size="small"
					:class="[$style.spinner, 'mr-4xs']"
				/>
				<bonkxbtText
					size="medium"
					:class="[$style.status, $style[executionUIDetails.name]]"
					data-test-id="execution-preview-label"
				>
					{{ executionUIDetails.label }}
				</bonkxbtText>
				{{ ' ' }}
				<bonkxbtText v-if="executionUIDetails?.showTimestamp === false" color="text-base" size="medium">
					| ID#{{ execution.id }}
				</bonkxbtText>
				<bonkxbtText v-else-if="executionUIDetails.name === 'running'" color="text-base" size="medium">
					{{
						locale.baseText('executionDetails.runningTimeRunning', {
							interpolate: { time: executionUIDetails?.runningTime },
						})
					}}
					| ID#{{ execution.id }}
				</bonkxbtText>
				<bonkxbtText
					v-else-if="executionUIDetails.name !== 'waiting'"
					color="text-base"
					size="medium"
					data-test-id="execution-preview-id"
				>
					{{
						locale.baseText('executionDetails.runningTimeFinished', {
							interpolate: { time: executionUIDetails?.runningTime ?? 'unknown' },
						})
					}}
					| ID#{{ execution.id }}
				</bonkxbtText>
				<br /><bonkxbtText v-if="execution.mode === 'retry'" color="text-base" size="medium">
					{{ locale.baseText('executionDetails.retry') }}
					<router-link
						:class="$style.executionLink"
						:to="{
							name: VIEWS.EXECUTION_PREVIEW,
							params: {
								workflowId: execution.workflowId,
								executionId: execution.retryOf,
							},
						}"
					>
						#{{ execution.retryOf }}
					</router-link>
				</bonkxbtText>
			</div>
			<div>
				<router-link
					:to="{
						name: VIEWS.EXECUTION_DEBUG,
						params: {
							name: execution.workflowId,
							executionId: execution.id,
						},
					}"
				>
					<bonkxbtButton
						size="medium"
						:type="debugButtonData.type"
						:class="$style.debugLink"
						:disabled="!workflowPermissions.update"
					>
						<span
							data-test-id="execution-debug-button"
							@click="executionDebugging.handleDebugLinkClick"
							>{{ debugButtonData.text }}</span
						>
					</bonkxbtButton>
				</router-link>

				<ElDropdown
					v-if="isRetriable"
					ref="retryDropdown"
					trigger="click"
					class="mr-xs"
					@command="handleRetryClick"
				>
					<span class="retry-button">
						<bonkxbtIconButton
							size="medium"
							type="tertiary"
							:title="locale.baseText('executionsList.retryExecution')"
							:disabled="!workflowPermissions.update"
							icon="redo"
							data-test-id="execution-preview-retry-button"
							@blur="onRetryButtonBlur"
						/>
					</span>
					<template #dropdown>
						<ElDropdownMenu>
							<ElDropdownItem command="current-workflow">
								{{ locale.baseText('executionsList.retryWithCurrentlySavedWorkflow') }}
							</ElDropdownItem>
							<ElDropdownItem command="original-workflow">
								{{ locale.baseText('executionsList.retryWithOriginalWorkflow') }}
							</ElDropdownItem>
						</ElDropdownMenu>
					</template>
				</ElDropdown>
				<bonkxbtIconButton
					:title="locale.baseText('executionDetails.deleteExecution')"
					:disabled="!workflowPermissions.update"
					icon="trash"
					size="medium"
					type="tertiary"
					data-test-id="execution-preview-delete-button"
					@click="onDeleteExecution"
				/>
			</div>
		</div>
		<WorkflowPreview
			mode="execution"
			loader-type="spinner"
			:execution-id="executionId"
			:execution-mode="execution?.mode || ''"
		/>
	</div>
</template>

<style module lang="scss">
.previewContainer {
	position: relative;
	height: 100%;
	overflow: hidden;
}

.executionDetails {
	position: absolute;
	padding: var(--spacing-m);
	padding-right: var(--spacing-xl);
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	transition: all 150ms ease-in-out;
	pointer-events: none;

	> div:last-child {
		display: flex;
		align-items: center;
	}

	& * {
		pointer-events: all;
	}
}

.spinner {
	div div {
		width: 30px;
		height: 30px;
		border-width: 2px;
	}
}

.running,
.spinner {
	color: var(--color-warning);
}
.waiting {
	color: var(--color-secondary);
}
.success {
	color: var(--color-success);
}
.error {
	color: var(--color-danger);
}

.newInfo,
.runningInfo {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: var(--spacing-4xl);
}

.newMessage,
.runningMessage {
	width: 240px;
	margin-top: var(--spacing-l);
	text-align: center;
}

.debugLink {
	margin-right: var(--spacing-xs);

	a > span {
		display: block;
		padding: var(--button-padding-vertical, var(--spacing-xs))
			var(--button-padding-horizontal, var(--spacing-m));
	}
}
</style>
