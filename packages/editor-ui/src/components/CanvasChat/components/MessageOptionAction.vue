<script setup lang="ts">
import type { PropType } from 'vue';

defineProps({
	label: {
		type: String,
		required: true,
	},
	icon: {
		type: String,
		required: true,
	},
	placement: {
		type: String as PropType<'left' | 'right' | 'top' | 'bottom'>,
		default: 'top',
	},
});
</script>

<template>
	<div :class="$style.container">
		<bonkxbt-tooltip :placement="placement">
			<template #content>
				{{ label }}
			</template>
			<bonkxbt-icon :class="$style.icon" :icon="icon" size="xsmall" @click="$attrs.onClick" />
		</bonkxbt-tooltip>
	</div>
</template>

<style lang="scss" module>
.container {
	display: inline-flex;
	align-items: center;
	margin: 0 var(--spacing-4xs);
}

.icon {
	color: var(--color-foreground-dark);
	cursor: pointer;

	&:hover {
		color: var(--color-primary);
	}
}
</style>
