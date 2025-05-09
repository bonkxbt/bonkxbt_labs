<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n';
import { computed, useCssModule } from 'vue';
import { NodeConnectionType } from 'bonkxbt-workflow';

const emit = defineEmits<{
	add: [];
	delete: [];
}>();

const props = defineProps<{
	type: NodeConnectionType;
}>();

const $style = useCssModule();

const i18n = useI18n();

const classes = computed(() => ({
	[$style.canvasEdgeToolbar]: true,
}));

const isAddButtonVisible = computed(() => props.type === NodeConnectionType.Main);

function onAdd() {
	emit('add');
}

function onDelete() {
	emit('delete');
}
</script>

<template>
	<div :class="classes" data-test-id="canvas-edge-toolbar">
		<bonkxbtIconButton
			v-if="isAddButtonVisible"
			class="canvas-edge-toolbar-button"
			data-test-id="add-connection-button"
			type="tertiary"
			size="small"
			icon="plus"
			:title="i18n.baseText('node.add')"
			@click="onAdd"
		/>
		<bonkxbtIconButton
			data-test-id="delete-connection-button"
			class="canvas-edge-toolbar-button"
			type="tertiary"
			size="small"
			icon="trash"
			:title="i18n.baseText('node.delete')"
			@click="onDelete"
		/>
	</div>
</template>

<style lang="scss" module>
.canvasEdgeToolbar {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: var(--spacing-2xs);
	pointer-events: all;
}
</style>

<style lang="scss">
[data-theme='dark'] .canvas-edge-toolbar-button {
	--button-background-color: var(--color-background-base);
	--button-hover-background-color: var(--color-background-light);
}

.canvas-edge-toolbar-button {
	border-width: 2px;
}
</style>
