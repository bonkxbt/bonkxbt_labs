<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useCanvasStore } from '@/stores/canvas.store';
import KeyboardShortcutTooltip from '@/components/KeyboardShortcutTooltip.vue';
import { useDeviceSupport } from 'bonkxbt-design-system';
import { useI18n } from '@/composables/useI18n';

const canvasStore = useCanvasStore();
const { zoomToFit, zoomIn, zoomOut, resetZoom } = canvasStore;
const { nodeViewScale, isDemo } = storeToRefs(canvasStore);
const deviceSupport = useDeviceSupport();
const i18n = useI18n();

const keyDown = (e: KeyboardEvent) => {
	const isCtrlKeyPressed = deviceSupport.isCtrlKeyPressed(e);
	if ((e.key === '=' || e.key === '+') && !isCtrlKeyPressed) {
		zoomIn();
	} else if ((e.key === '_' || e.key === '-') && !isCtrlKeyPressed) {
		zoomOut();
	} else if (e.key === '0' && !isCtrlKeyPressed) {
		resetZoom();
	} else if (e.key === '1' && !isCtrlKeyPressed) {
		zoomToFit();
	}
};

onBeforeMount(() => {
	document.addEventListener('keydown', keyDown);
});

onBeforeUnmount(() => {
	document.removeEventListener('keydown', keyDown);
});
</script>

<template>
	<div
		:class="{
			[$style.zoomMenu]: true,
			[$style.regularZoomMenu]: !isDemo,
			[$style.demoZoomMenu]: isDemo,
		}"
	>
		<KeyboardShortcutTooltip
			:label="i18n.baseText('nodeView.zoomToFit')"
			:shortcut="{ keys: ['1'] }"
		>
			<bonkxbt-icon-button
				type="tertiary"
				size="large"
				icon="expand"
				data-test-id="zoom-to-fit"
				@click="zoomToFit"
			/>
		</KeyboardShortcutTooltip>
		<KeyboardShortcutTooltip :label="i18n.baseText('nodeView.zoomIn')" :shortcut="{ keys: ['+'] }">
			<bonkxbt-icon-button
				type="tertiary"
				size="large"
				icon="search-plus"
				data-test-id="zoom-in-button"
				@click="zoomIn"
			/>
		</KeyboardShortcutTooltip>
		<KeyboardShortcutTooltip :label="i18n.baseText('nodeView.zoomOut')" :shortcut="{ keys: ['-'] }">
			<bonkxbt-icon-button
				type="tertiary"
				size="large"
				icon="search-minus"
				data-test-id="zoom-out-button"
				@click="zoomOut"
			/>
		</KeyboardShortcutTooltip>
		<KeyboardShortcutTooltip
			:label="i18n.baseText('nodeView.resetZoom')"
			:shortcut="{ keys: ['0'] }"
		>
			<bonkxbt-icon-button
				v-if="nodeViewScale !== 1 && !isDemo"
				type="tertiary"
				size="large"
				icon="undo"
				data-test-id="reset-zoom-button"
				@click="resetZoom"
			/>
		</KeyboardShortcutTooltip>
	</div>
</template>

<style lang="scss" module>
.zoomMenu {
	position: absolute;
	bottom: var(--spacing-s);
	left: var(--spacing-s);
	line-height: 25px;
	color: #444;
	padding-right: 5px;

	button {
		border: var(--border-base);
	}

	> * {
		+ * {
			margin-left: var(--spacing-3xs);
		}

		&:hover {
			transform: scale(1.1);
		}
	}
}

.regularZoomMenu {
	@media (max-width: $breakpoint-2xs) {
		bottom: 90px;
	}
}

.demoZoomMenu {
	left: 10px;
	bottom: 10px;
}
</style>
