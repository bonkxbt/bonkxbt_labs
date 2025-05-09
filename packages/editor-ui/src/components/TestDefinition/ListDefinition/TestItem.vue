<script setup lang="ts">
import type { TestListItem } from '@/components/TestDefinition/types';
import { useI18n } from '@/composables/useI18n';
import bonkxbtIconButton from 'bonkxbt-design-system/components/bonkxbtIconButton';

export interface TestItemProps {
	test: TestListItem;
}

const props = defineProps<TestItemProps>();
const locale = useI18n();

const emit = defineEmits<{
	'run-test': [testId: string];
	'view-details': [testId: string];
	'edit-test': [testId: string];
	'delete-test': [testId: string];
}>();

const actions = [
	{
		icon: 'play',
		event: () => emit('run-test', props.test.id),
		tooltip: locale.baseText('testDefinition.runTest'),
	},
	{
		icon: 'list',
		event: () => emit('view-details', props.test.id),
		tooltip: locale.baseText('testDefinition.viewDetails'),
	},
	{
		icon: 'pen',
		event: () => emit('edit-test', props.test.id),
		tooltip: locale.baseText('testDefinition.editTest'),
	},
	{
		icon: 'trash',
		event: () => emit('delete-test', props.test.id),
		tooltip: locale.baseText('testDefinition.deleteTest'),
	},
];
</script>

<template>
	<div :class="$style.testItem" @click="$emit('view-details', test.id)">
		<div :class="$style.testInfo">
			<div :class="$style.testName">
				{{ test.name }}
				<bonkxbt-tag v-if="test.tagName" :text="test.tagName" />
			</div>
			<div :class="$style.testCases">
				{{ locale.baseText('testDefinition.list.testCases', { adjustToNumber: test.testCases }) }}
				<bonkxbt-loading v-if="!test.execution.lastRun" :loading="true" :rows="1" />
				<span v-else>{{
					locale.baseText('testDefinition.list.lastRun', {
						interpolate: { lastRun: test.execution.lastRun },
					})
				}}</span>
			</div>
		</div>

		<div :class="$style.metrics">
			<div :class="$style.metric">
				{{
					locale.baseText('testDefinition.list.errorRate', {
						interpolate: { errorRate: test.execution.errorRate ?? '-' },
					})
				}}
			</div>
			<div v-for="(value, key) in test.execution.metrics" :key="key" :class="$style.metric">
				{{ key }}: {{ value ?? '-' }}
			</div>
		</div>

		<div :class="$style.actions">
			<bonkxbt-tooltip v-for="action in actions" :key="action.icon" placement="top" :show-after="1000">
				<template #content>
					{{ action.tooltip }}
				</template>
				<component
					:is="bonkxbtIconButton"
					:icon="action.icon"
					type="tertiary"
					size="mini"
					@click.stop="action.event"
				/>
			</bonkxbt-tooltip>
		</div>
	</div>
</template>

<style module lang="scss">
.testItem {
	display: flex;
	align-items: center;
	padding: var(--spacing-s) var(--spacing-s) var(--spacing-s) var(--spacing-xl);
	border: 1px solid var(--color-foreground-base);
	border-radius: var(--border-radius-base);
	background-color: var(--color-background-light);
	cursor: pointer;

	&:hover {
		background-color: var(--color-background-base);
	}
}

.testInfo {
	display: flex;
	flex: 1;
	gap: var(--spacing-2xs);
}

.testName {
	display: flex;
	align-items: center;
	gap: var(--spacing-2xs);
	font-weight: var(--font-weight-bold);
	margin-bottom: var(--spacing-4xs);
	font-size: var(--font-size-s);
}

.testCases {
	color: var(--color-text-base);
	font-size: var(--font-size-2xs);
	display: flex;
	align-items: center;
	gap: var(--spacing-2xs);
}

.metrics {
	display: flex;
	gap: var(--spacing-l);
	margin: 0 var(--spacing-l);
}

.metric {
	font-size: var(--font-size-2xs);
	color: var(--color-text-dark);
	white-space: nowrap;
}

.actions {
	display: flex;
	gap: var(--spacing-xs);
	--color-button-secondary-font: var(--color-callout-info-icon);
}
</style>
