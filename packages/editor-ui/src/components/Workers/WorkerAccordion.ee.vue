<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
	defineProps<{
		icon?: string;
		iconColor?: string;
		initialExpanded?: boolean;
	}>(),
	{
		icon: 'tasks',
		iconColor: 'black',
		initialExpanded: true,
	},
);

const expanded = ref<boolean>(props.initialExpanded);

function toggle() {
	expanded.value = !expanded.value;
}
</script>

<template>
	<div :class="['accordion', $style.container]">
		<div :class="{ [$style.header]: true, [$style.expanded]: expanded }" @click="toggle">
			<bonkxbt-icon :icon="icon" :color="iconColor" size="small" class="mr-2xs" />
			<bonkxbt-text :class="$style.headerText" color="text-base" size="small" align="left" bold>
				<slot name="title"></slot>
			</bonkxbt-text>
			<bonkxbt-icon :icon="expanded ? 'chevron-up' : 'chevron-down'" bold />
		</div>
		<div v-if="expanded" :class="{ [$style.description]: true, [$style.collapsed]: !expanded }">
			<slot name="content"></slot>
		</div>
	</div>
</template>

<style lang="scss" module>
.container {
	width: 100%;
}

.header {
	cursor: pointer;
	display: flex;
	padding-top: var(--spacing-s);
	align-items: center;

	.headerText {
		flex-grow: 1;
	}
}

.expanded {
	padding: var(--spacing-s) 0 0 0;
}

.description {
	display: flex;
	padding: 0 var(--spacing-s) var(--spacing-s) var(--spacing-s);

	b {
		font-weight: var(--font-weight-bold);
	}
}
</style>
