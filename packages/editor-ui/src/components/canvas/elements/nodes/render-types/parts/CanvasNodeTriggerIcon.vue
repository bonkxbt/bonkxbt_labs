<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n';

const i18n = useI18n();
</script>

<template>
	<bonkxbtTooltip placement="bottom">
		<template #content>
			<span v-bonkxbt-html="i18n.baseText('node.thisIsATriggerNode')" />
		</template>
		<div :class="$style.triggerIcon">
			<FontAwesomeIcon icon="bolt" size="lg" />
		</div>
	</bonkxbtTooltip>
</template>

<style lang="scss" module>
.triggerIcon {
	position: absolute;
	right: 100%;
	margin: auto;
	color: var(--color-primary);
	padding: var(--spacing-2xs);
}
</style>
