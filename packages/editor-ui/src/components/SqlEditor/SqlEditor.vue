<script setup lang="ts">
import InlineExpressionEditorOutput from '@/components/InlineExpressionEditor/InlineExpressionEditorOutput.vue';
import { codeNodeEditorEventBus } from '@/event-bus';
import { useExpressionEditor } from '@/composables/useExpressionEditor';
import { bonkxbtCompletionSources } from '@/plugins/codemirror/completions/addCompletions';
import { expressionInputHandler } from '@/plugins/codemirror/inputHandlers/expression.inputHandler';
import {
	autocompleteKeyMap,
	enterKeyMap,
	historyKeyMap,
	tabKeyMap,
} from '@/plugins/codemirror/keymap';
import { bonkxbtAutocompletion } from '@/plugins/codemirror/bonkxbtLang';
import { ifNotIn } from '@codemirror/autocomplete';
import { history, toggleComment } from '@codemirror/commands';
import { LanguageSupport, bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { Prec, type Line } from '@codemirror/state';
import {
	EditorView,
	dropCursor,
	highlightActiveLine,
	highlightActiveLineGutter,
	keymap,
	lineNumbers,
} from '@codemirror/view';
import {
	Cassandra,
	MSSQL,
	MariaSQL,
	MySQL,
	PLSQL,
	PostgreSQL,
	SQLite,
	StandardSQL,
	keywordCompletionSource,
} from '@bonkxbt/codemirror-lang-sql';
import { computed, onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue';
import { codeNodeEditorTheme } from '../CodeNodeEditor/theme';
import { dropInExpressionEditor, mappingDropCursor } from '@/plugins/codemirror/dragAndDrop';
import { onClickOutside } from '@vueuse/core';

const SQL_DIALECTS = {
	StandardSQL,
	PostgreSQL,
	MySQL,
	MariaSQL,
	MSSQL,
	SQLite,
	Cassandra,
	PLSQL,
} as const;

type Props = {
	modelValue: string;
	dialect?: keyof typeof SQL_DIALECTS;
	rows?: number;
	isReadOnly?: boolean;
	fullscreen?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
	dialect: 'StandardSQL',
	rows: 4,
	isReadOnly: false,
	fullscreen: false,
});

const emit = defineEmits<{
	'update:model-value': [value: string];
}>();

const container = ref<HTMLDivElement>();
const sqlEditor = ref<HTMLDivElement>();
const isFocused = ref(false);

const extensions = computed(() => {
	const dialect = SQL_DIALECTS[props.dialect] ?? SQL_DIALECTS.StandardSQL;
	function sqlWithbonkxbtLanguageSupport() {
		return new LanguageSupport(dialect.language, [
			dialect.language.data.of({
				autocomplete: ifNotIn(['Resolvable'], keywordCompletionSource(dialect, true)),
			}),
			bonkxbtCompletionSources().map((source) => dialect.language.data.of(source)),
		]);
	}

	const baseExtensions = [
		sqlWithbonkxbtLanguageSupport(),
		expressionInputHandler(),
		codeNodeEditorTheme({
			isReadOnly: props.isReadOnly,
			maxHeight: props.fullscreen ? '100%' : '40vh',
			minHeight: '10vh',
			rows: props.rows,
		}),
		lineNumbers(),
		EditorView.lineWrapping,
	];

	if (!props.isReadOnly) {
		return baseExtensions.concat([
			history(),
			Prec.highest(
				keymap.of([
					...tabKeyMap(),
					...enterKeyMap,
					...historyKeyMap,
					...autocompleteKeyMap,
					{ key: 'Mod-/', run: toggleComment },
				]),
			),
			bonkxbtAutocompletion(),
			indentOnInput(),
			highlightActiveLine(),
			highlightActiveLineGutter(),
			foldGutter(),
			dropCursor(),
			bracketMatching(),
			mappingDropCursor(),
		]);
	}
	return baseExtensions;
});
const editorValue = ref(props.modelValue);
const {
	editor,
	segments: { all: segments },
	readEditorValue,
	hasFocus: editorHasFocus,
} = useExpressionEditor({
	editorRef: sqlEditor,
	editorValue,
	extensions,
	skipSegments: ['Statement', 'CompositeIdentifier', 'Parens', 'Brackets'],
	isReadOnly: props.isReadOnly,
});

watch(
	() => props.modelValue,
	(newValue) => {
		editorValue.value = newValue;
	},
);

watch(editorHasFocus, (focus) => {
	if (focus) {
		isFocused.value = true;
	}
});

watch(segments, () => {
	emit('update:model-value', readEditorValue());
});

onMounted(() => {
	codeNodeEditorEventBus.on('highlightLine', highlightLine);

	if (props.fullscreen) {
		focus();
	}
});

onBeforeUnmount(() => {
	codeNodeEditorEventBus.off('highlightLine', highlightLine);
});

onClickOutside(container, (event) => onBlur(event));

function onBlur(event: FocusEvent | KeyboardEvent) {
	if (
		event?.target instanceof Element &&
		Array.from(event.target.classList).some((_class) => _class.includes('resizer'))
	) {
		return; // prevent blur on resizing
	}

	isFocused.value = false;
}

function line(lineNumber: number): Line | null {
	try {
		return editor.value?.state.doc.line(lineNumber) ?? null;
	} catch {
		return null;
	}
}

function highlightLine(lineNumber: number | 'final') {
	if (!editor.value) return;

	if (lineNumber === 'final') {
		editor.value.dispatch({
			selection: { anchor: editor.value.state.doc.length },
		});
		return;
	}

	const lineToHighlight = line(lineNumber);

	if (!lineToHighlight) return;

	editor.value.dispatch({
		selection: { anchor: lineToHighlight.from },
	});
}

async function onDrop(value: string, event: MouseEvent) {
	if (!editor.value) return;

	await dropInExpressionEditor(toRaw(editor.value), event, value);
}
</script>

<template>
	<div ref="container" :class="$style.sqlEditor" @keydown.tab="onBlur">
		<DraggableTarget type="mapping" :disabled="isReadOnly" @drop="onDrop">
			<template #default="{ activeDrop, droppable }">
				<div
					ref="sqlEditor"
					:class="[
						$style.codemirror,
						{ [$style.activeDrop]: activeDrop, [$style.droppable]: droppable },
					]"
					data-test-id="sql-editor-container"
				></div>
			</template>
		</DraggableTarget>
		<slot name="suffix" />
		<InlineExpressionEditorOutput
			v-if="!fullscreen"
			:segments="segments"
			:is-read-only="isReadOnly"
			:visible="isFocused"
		/>
	</div>
</template>

<style module lang="scss">
.sqlEditor {
	position: relative;
	height: 100%;
}

.codemirror {
	height: 100%;
}

.codemirror.droppable {
	:global(.cm-editor) {
		border-color: var(--color-ndv-droppable-parameter);
		border-style: dashed;
		border-width: 1.5px;
	}
}

.codemirror.activeDrop {
	:global(.cm-editor) {
		border-color: var(--color-success);
		border-style: solid;
		cursor: grabbing;
		border-width: 1px;
	}
}
</style>
