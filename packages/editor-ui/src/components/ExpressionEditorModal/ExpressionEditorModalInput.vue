<script setup lang="ts">
import { history } from '@codemirror/commands';
import { Prec } from '@codemirror/state';
import { dropCursor, EditorView, keymap } from '@codemirror/view';
import { computed, onMounted, ref, watch } from 'vue';

import { expressionInputHandler } from '@/plugins/codemirror/inputHandlers/expression.inputHandler';
import { bonkxbtAutocompletion, bonkxbtLang } from '@/plugins/codemirror/bonkxbtLang';
import { forceParse } from '@/utils/forceParse';
import { completionStatus } from '@codemirror/autocomplete';
import { inputTheme } from './theme';

import { useExpressionEditor } from '@/composables/useExpressionEditor';
import {
	autocompleteKeyMap,
	enterKeyMap,
	historyKeyMap,
	tabKeyMap,
} from '@/plugins/codemirror/keymap';
import { infoBoxTooltips } from '@/plugins/codemirror/tooltips/InfoBoxTooltip';
import type { Segment } from '@/types/expressions';
import { removeExpressionPrefix } from '@/utils/expressions';
import { mappingDropCursor } from '@/plugins/codemirror/dragAndDrop';

type Props = {
	modelValue: string;
	path: string;
	isReadOnly?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
	isReadOnly: false,
});

const emit = defineEmits<{
	change: [value: { value: string; segments: Segment[] }];
	focus: [];
	close: [];
}>();

const root = ref<HTMLElement>();
const extensions = computed(() => [
	inputTheme(props.isReadOnly),
	Prec.highest(
		keymap.of([
			...tabKeyMap(),
			...historyKeyMap,
			...enterKeyMap,
			...autocompleteKeyMap,
			{
				any: (view, event) => {
					if (event.key === 'Escape' && completionStatus(view.state) === null) {
						event.stopPropagation();
						emit('close');
					}

					return false;
				},
			},
		]),
	),
	bonkxbtLang(),
	bonkxbtAutocompletion(),
	mappingDropCursor(),
	dropCursor(),
	history(),
	expressionInputHandler(),
	EditorView.lineWrapping,
	EditorView.domEventHandlers({ scroll: forceParse }),
	infoBoxTooltips(),
]);
const editorValue = ref<string>(removeExpressionPrefix(props.modelValue));
const { segments, readEditorValue, editor, hasFocus, focus } = useExpressionEditor({
	editorRef: root,
	editorValue,
	extensions,
	isReadOnly: computed(() => props.isReadOnly),
	autocompleteTelemetry: { enabled: true, parameterPath: props.path },
});

watch(
	() => props.modelValue,
	(newValue) => {
		editorValue.value = removeExpressionPrefix(newValue);
	},
);

watch(segments.display, (newSegments) => {
	emit('change', {
		value: '=' + readEditorValue(),
		segments: newSegments,
	});
});

watch(hasFocus, (focused) => {
	if (focused) {
		emit('focus');
	}
});

onMounted(() => {
	focus();
});

defineExpose({ editor });
</script>

<template>
	<div ref="root" :class="$style.editor" @keydown.stop></div>
</template>

<style lang="scss" module>
.editor {
	:global(.cm-content) {
		border-radius: var(--border-radius-base);
		&[aria-readonly='true'] {
			--disabled-fill: var(--color-background-base);
			background-color: var(--disabled-fill, var(--color-background-light));
			color: var(--disabled-color, var(--color-text-base));
			cursor: not-allowed;
		}
	}
}
</style>
