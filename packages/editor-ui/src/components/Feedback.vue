<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n';

const emit = defineEmits<{
	'update:modelValue': [feedback: 'positive' | 'negative'];
}>();

defineProps<{
	modelValue?: 'positive' | 'negative';
}>();

const i18n = useI18n();

function onFeedback(feedback: 'positive' | 'negative') {
	emit('update:modelValue', feedback);
}
</script>
<template>
	<div class="feedback">
		<bonkxbtText v-if="!modelValue" class="mr-2xs">
			{{ i18n.baseText('feedback.title') }}
		</bonkxbtText>
		<bonkxbtText v-else :color="modelValue === 'positive' ? 'success' : 'danger'">
			<FontAwesomeIcon
				:icon="modelValue === 'positive' ? 'thumbs-up' : 'thumbs-down'"
				class="mr-2xs"
			/>
			{{ i18n.baseText(`feedback.${modelValue}`) }}
		</bonkxbtText>
		<bonkxbtTooltip v-if="!modelValue" :content="i18n.baseText('feedback.positive')">
			<span
				class="feedback-button"
				data-test-id="feedback-button-positive"
				@click="onFeedback('positive')"
			>
				<FontAwesomeIcon icon="thumbs-up" />
			</span>
		</bonkxbtTooltip>
		<bonkxbtTooltip v-if="!modelValue" :content="i18n.baseText('feedback.negative')">
			<span
				class="feedback-button"
				data-test-id="feedback-button-negative"
				@click="onFeedback('negative')"
			>
				<FontAwesomeIcon icon="thumbs-down" />
			</span>
		</bonkxbtTooltip>
	</div>
</template>

<style lang="scss">
.feedback {
	display: flex;
	align-items: center;
	gap: var(--spacing-4xs);

	.feedback-button {
		cursor: pointer;
		width: var(--spacing-l);
		height: var(--spacing-l);
		color: var(--color-text-light);
		display: flex;
		justify-content: center;
		align-items: center;

		&:hover {
			color: var(--color-primary);
		}
	}
}
</style>
