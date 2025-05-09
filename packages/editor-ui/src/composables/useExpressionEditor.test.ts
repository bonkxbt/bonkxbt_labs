import * as workflowHelpers from '@/composables/useWorkflowHelpers';
import { EditorView, keymap } from '@codemirror/view';
import { createTestingPinia } from '@pinia/testing';
import { waitFor, fireEvent } from '@testing-library/vue';
import { setActivePinia } from 'pinia';
import { beforeEach, describe, vi } from 'vitest';
import { defineComponent, h, ref, toValue } from 'vue';
import { bonkxbtLang } from '@/plugins/codemirror/bonkxbtLang';
import { useExpressionEditor } from './useExpressionEditor';
import { useRouter } from 'vue-router';
import { EditorSelection } from '@codemirror/state';
import userEvent from '@testing-library/user-event';
import { renderComponent } from '@/__tests__/render';
import { tabKeyMap } from '@/plugins/codemirror/keymap';

vi.mock('@/composables/useAutocompleteTelemetry', () => ({
	useAutocompleteTelemetry: vi.fn(),
}));

vi.mock('@/stores/ndv.store', () => ({
	useNDVStore: vi.fn(() => ({
		activeNode: { type: 'bonkxbt-nodes-base.test' },
	})),
}));

describe('useExpressionEditor', () => {
	const mockResolveExpression = () => {
		const mock = vi.fn();
		vi.spyOn(workflowHelpers, 'useWorkflowHelpers').mockReturnValueOnce({
			...workflowHelpers.useWorkflowHelpers({ router: useRouter() }),
			resolveExpression: mock,
		});

		return mock;
	};

	const renderExpressionEditor = async (
		options: Omit<Parameters<typeof useExpressionEditor>[0], 'editorRef'> = {},
	) => {
		let expressionEditor!: ReturnType<typeof useExpressionEditor>;
		const renderResult = renderComponent(
			defineComponent({
				setup() {
					const root = ref<HTMLElement>();
					expressionEditor = useExpressionEditor({ ...options, editorRef: root });

					return () => h('div', { ref: root, 'data-test-id': 'editor-root' });
				},
			}),
			{ props: { options } },
		);
		expect(renderResult.getByTestId('editor-root')).toBeInTheDocument();
		await waitFor(() => toValue(expressionEditor.editor));
		return { renderResult, expressionEditor };
	};

	beforeEach(() => {
		setActivePinia(createTestingPinia());
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	test('should create an editor', async () => {
		const { expressionEditor } = await renderExpressionEditor();

		await waitFor(() => expect(toValue(expressionEditor.editor)).toBeInstanceOf(EditorView));
	});

	test('should calculate segments', async () => {
		mockResolveExpression().mockReturnValueOnce(15);

		const {
			expressionEditor: { segments },
		} = await renderExpressionEditor({
			editorValue: 'before {{ $json.test.length }} after',
			extensions: [bonkxbtLang()],
		});

		await waitFor(() => {
			expect(toValue(segments.all)).toEqual([
				{
					from: 0,
					kind: 'plaintext',
					plaintext: 'before ',
					to: 7,
				},
				{
					error: null,
					from: 7,
					kind: 'resolvable',
					resolvable: '{{ $json.test.length }}',
					resolved: '15',
					state: 'valid',
					to: 30,
				},
				{
					from: 30,
					kind: 'plaintext',
					plaintext: ' after',
					to: 36,
				},
			]);

			expect(toValue(segments.resolvable)).toEqual([
				{
					error: null,
					from: 7,
					kind: 'resolvable',
					resolvable: '{{ $json.test.length }}',
					resolved: '15',
					state: 'valid',
					to: 30,
				},
			]);

			expect(toValue(segments.plaintext)).toEqual([
				{
					from: 0,
					kind: 'plaintext',
					plaintext: 'before ',
					to: 7,
				},
				{
					from: 30,
					kind: 'plaintext',
					plaintext: ' after',
					to: 36,
				},
			]);
		});
	});

	describe('readEditorValue()', () => {
		test('should return the full editor value (unresolved)', async () => {
			mockResolveExpression().mockReturnValueOnce(15);
			const {
				expressionEditor: { readEditorValue },
			} = await renderExpressionEditor({
				editorValue: 'before {{ $json.test.length }} after',
				extensions: [bonkxbtLang()],
			});

			expect(readEditorValue()).toEqual('before {{ $json.test.length }} after');
		});
	});

	describe('setCursorPosition()', () => {
		test('should set cursor position to number correctly', async () => {
			const editorValue = 'text here';
			const {
				expressionEditor: { editor, setCursorPosition },
			} = await renderExpressionEditor({
				editorValue,
			});

			setCursorPosition(4);
			expect(toValue(editor)?.state.selection).toEqual(EditorSelection.single(4));
		});

		test('should set cursor position to end correctly', async () => {
			const editorValue = 'text here';
			const correctPosition = editorValue.length;
			const {
				expressionEditor: { editor, setCursorPosition },
			} = await renderExpressionEditor({
				editorValue,
			});

			setCursorPosition('end');
			expect(toValue(editor)?.state.selection).toEqual(EditorSelection.single(correctPosition));
		});

		test('should set cursor position to last expression correctly', async () => {
			const editorValue = 'text {{ $json.foo }} {{ $json.bar }} here';
			const correctPosition = editorValue.indexOf('bar') + 'bar'.length;
			const {
				expressionEditor: { editor, setCursorPosition },
			} = await renderExpressionEditor({
				editorValue,
				extensions: [bonkxbtLang()],
			});

			setCursorPosition('lastExpression');
			expect(toValue(editor)?.state.selection).toEqual(EditorSelection.single(correctPosition));
		});
	});

	describe('select()', () => {
		test('should select number range', async () => {
			const editorValue = 'text here';
			const {
				expressionEditor: { editor, select },
			} = await renderExpressionEditor({
				editorValue,
			});

			select(4, 7);
			expect(toValue(editor)?.state.selection).toEqual(EditorSelection.single(4, 7));
		});

		test('should select until end', async () => {
			const editorValue = 'text here';
			const {
				expressionEditor: { editor, select },
			} = await renderExpressionEditor({
				editorValue,
			});

			select(4, 'end');
			expect(toValue(editor)?.state.selection).toEqual(EditorSelection.single(4, 9));
		});
	});

	describe('selectAll()', () => {
		test('should select all', async () => {
			const editorValue = 'text here';
			const {
				expressionEditor: { editor, selectAll },
			} = await renderExpressionEditor({
				editorValue,
			});

			selectAll();
			expect(toValue(editor)?.state.selection).toEqual(EditorSelection.single(0, 9));
		});
	});

	describe('blur on click outside', () => {
		test('should blur when another element is clicked', async () => {
			const { renderResult, expressionEditor } = await renderExpressionEditor();

			const root = renderResult.getByTestId('editor-root');
			const input = root.querySelector('.cm-line') as HTMLDivElement;

			await userEvent.click(input);
			expect(expressionEditor.editor.value?.hasFocus).toBe(true);

			await fireEvent(document, new MouseEvent('click'));
			expect(expressionEditor.editor.value?.hasFocus).toBe(false);
		});

		test('should NOT blur when another element is clicked while selecting', async () => {
			const { renderResult, expressionEditor } = await renderExpressionEditor();

			const root = renderResult.getByTestId('editor-root');
			const input = root.querySelector('.cm-line') as HTMLDivElement;

			await userEvent.click(input);
			expect(expressionEditor.editor.value?.hasFocus).toBe(true);
			await fireEvent(input, new MouseEvent('mousedown', { bubbles: true }));

			await fireEvent(document, new MouseEvent('click'));
			expect(expressionEditor.editor.value?.hasFocus).toBe(true);
		});
	});

	describe('keymap', () => {
		const TEST_EDITOR_VALUE = '{{ { "foo": "bar" } }}';

		test('should indent on tab if blurOnTab is false', async () => {
			const { renderResult, expressionEditor } = await renderExpressionEditor({
				editorValue: TEST_EDITOR_VALUE,
				extensions: [keymap.of([...tabKeyMap(false)])],
			});
			const root = renderResult.getByTestId('editor-root');
			const input = root.querySelector('.cm-line') as HTMLDivElement;

			await userEvent.type(input, '{tab}');
			expect(expressionEditor.editor.value?.state.doc.toString()).toEqual(`  ${TEST_EDITOR_VALUE}`);
		});

		test('should NOT indent on tab if blurOnTab is true', async () => {
			const { renderResult, expressionEditor } = await renderExpressionEditor({
				editorValue: TEST_EDITOR_VALUE,
				extensions: [keymap.of([...tabKeyMap(true)])],
			});
			const root = renderResult.getByTestId('editor-root');
			const input = root.querySelector('.cm-line') as HTMLDivElement;

			await userEvent.type(input, '{tab}');
			expect(expressionEditor.editor.value?.state.doc.toString()).toEqual(TEST_EDITOR_VALUE);
		});
	});
});
