<script setup lang="ts">
import { history } from '@codemirror/commands';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { linter as createLinter, lintGutter } from '@codemirror/lint';
import type { Extension } from '@codemirror/state';
import { EditorState, Prec } from '@codemirror/state';
import type { ViewUpdate } from '@codemirror/view';
import {
	EditorView,
	dropCursor,
	highlightActiveLine,
	highlightActiveLineGutter,
	keymap,
	lineNumbers,
} from '@codemirror/view';

import { codeNodeEditorTheme } from '../CodeNodeEditor/theme';
import {
	autocompleteKeyMap,
	enterKeyMap,
	historyKeyMap,
	tabKeyMap,
} from '@/plugins/codemirror/keymap';
import { bonkxbtAutocompletion } from '@/plugins/codemirror/bonkxbtLang';
import { computed, onMounted, ref, watch } from 'vue';
import { mappingDropCursor } from '@/plugins/codemirror/dragAndDrop';

type Props = {
	modelValue: string;
	isReadOnly?: boolean;
	fillParent?: boolean;
	rows?: number;
};

const props = withDefaults(defineProps<Props>(), { fillParent: false, isReadOnly: false, rows: 4 });
const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const jsonEditorRef = ref<HTMLDivElement>();
const editor = ref<EditorView | null>(null);
const editorState = ref<EditorState | null>(null);

const extensions = computed(() => {
	const extensionsToApply: Extension[] = [
		json(),
		lineNumbers(),
		EditorView.lineWrapping,
		EditorState.readOnly.of(props.isReadOnly),
		codeNodeEditorTheme({
			isReadOnly: props.isReadOnly,
			maxHeight: props.fillParent ? '100%' : '40vh',
			minHeight: '20vh',
			rows: props.rows,
		}),
	];
	if (!props.isReadOnly) {
		extensionsToApply.push(
			history(),
			Prec.highest(
				keymap.of([...tabKeyMap(), ...enterKeyMap, ...historyKeyMap, ...autocompleteKeyMap]),
			),
			createLinter(jsonParseLinter()),
			lintGutter(),
			bonkxbtAutocompletion(),
			indentOnInput(),
			highlightActiveLine(),
			highlightActiveLineGutter(),
			foldGutter(),
			dropCursor(),
			bracketMatching(),
			mappingDropCursor(),
			EditorView.updateListener.of((viewUpdate: ViewUpdate) => {
				if (!viewUpdate.docChanged || !editor.value) return;
				emit('update:modelValue', editor.value?.state.doc.toString());
			}),
		);
	}
	return extensionsToApply;
});

onMounted(() => {
	createEditor();
});

watch(
	() => props.modelValue,
	(newValue: string) => {
		const editorValue = editor.value?.state?.doc.toString();

		// If model value changes from outside the component
		if (editorValue && editorValue.length !== newValue.length && editorValue !== newValue) {
			destroyEditor();
			createEditor();
		}
	},
);

function createEditor() {
	const state = EditorState.create({ doc: props.modelValue, extensions: extensions.value });
	const parent = jsonEditorRef.value;

	editor.value = new EditorView({ parent, state });
	editorState.value = editor.value.state;
}

function destroyEditor() {
	editor.value?.destroy();
}
</script>

<template>
	<div :class="[$style['editor-container'], $style.fillHeight]">
		<div ref="jsonEditorRef" :class="['ph-no-capture', $style.fillHeight]"></div>
		<slot name="suffix" />
	</div>
</template>

<style lang="scss" module>
.editor-container {
	position: relative;
}

.fillHeight {
	height: 100%;
}
</style>
