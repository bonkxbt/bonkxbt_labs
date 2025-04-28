<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from '@/composables/useI18n';

const props = defineProps<{
	runningExecutionsCount: number;
	concurrencyCap: number;
	isCloudDeployment?: boolean;
}>();

const emit = defineEmits<{
	goToUpgrade: [];
}>();

const i18n = useI18n();

const tooltipText = computed(() =>
	i18n.baseText('executionsList.activeExecutions.tooltip', {
		interpolate: {
			running: props.runningExecutionsCount,
			cap: props.concurrencyCap,
		},
	}),
);

const headerText = computed(() => {
	if (props.runningExecutionsCount === 0) {
		return i18n.baseText('executionsList.activeExecutions.none');
	}
	return i18n.baseText('executionsList.activeExecutions.header', {
		interpolate: {
			running: props.runningExecutionsCount,
			cap: props.concurrencyCap,
		},
	});
});
</script>

<template>
	<div data-test-id="concurrent-executions-header">
		<bonkxbt-tooltip>
			<template #content>
				<div :class="$style.tooltip">
					{{ tooltipText }}
					<bonkxbtLink
						v-if="props.isCloudDeployment"
						bold
						size="small"
						:class="$style.link"
						@click="emit('goToUpgrade')"
					>
						{{ i18n.baseText('generic.upgradeNow') }}
					</bonkxbtLink>
					<bonkxbtLink
						v-else
						:class="$style.link"
						:href="i18n.baseText('executions.concurrency.docsLink')"
						target="_blank"
						>{{ i18n.baseText('generic.viewDocs') }}</bonkxbtLink
					>
				</div>
			</template>
			<font-awesome-icon icon="info-circle" class="mr-2xs" />
		</bonkxbt-tooltip>
		<bonkxbt-text>{{ headerText }}</bonkxbt-text>
	</div>
</template>

<style lang="scss" module>
.tooltip {
	display: flex;
	flex-direction: column;
}
.link {
	margin-top: var(--spacing-xs);
}
</style>
