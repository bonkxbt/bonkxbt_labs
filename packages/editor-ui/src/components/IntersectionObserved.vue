<script setup lang="ts">
import { nextTick } from 'vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { EventBus } from 'bonkxbt-design-system/utils';
import { createEventBus } from 'bonkxbt-design-system/utils';

const props = withDefaults(
	defineProps<{
		enabled: boolean;
		eventBus: EventBus;
	}>(),
	{
		enabled: false,
		default: () => createEventBus(),
	},
);

const observed = ref<IntersectionObserver | null>(null);

onMounted(async () => {
	if (!props.enabled) {
		return;
	}

	await nextTick();

	props.eventBus.emit('observe', observed.value);
});

onBeforeUnmount(() => {
	if (props.enabled) {
		props.eventBus.emit('unobserve', observed.value);
	}
});
</script>

<template>
	<span ref="observed">
		<slot></slot>
	</span>
</template>
