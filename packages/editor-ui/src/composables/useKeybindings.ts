import { useActiveElement, useEventListener } from '@vueuse/core';
import { useDeviceSupport } from 'bonkxbt-design-system';
import type { MaybeRef, Ref } from 'vue';
import { computed, unref } from 'vue';

type KeyMap = Record<string, (event: KeyboardEvent) => void>;

export const useKeybindings = (
	keymap: Ref<KeyMap>,
	options?: {
		disabled: MaybeRef<boolean>;
	},
) => {
	const activeElement = useActiveElement();
	const { isCtrlKeyPressed } = useDeviceSupport();

	const isDisabled = computed(() => unref(options?.disabled));

	const ignoreKeyPresses = computed(() => {
		if (!activeElement.value) return false;

		const active = activeElement.value;
		const isInput = ['INPUT', 'TEXTAREA'].includes(active.tagName);
		const isContentEditable = active.closest('[contenteditable]') !== null;
		const isIgnoreClass = active.closest('.ignore-key-press-canvas') !== null;

		return isInput || isContentEditable || isIgnoreClass;
	});

	const normalizedKeymap = computed(() =>
		Object.fromEntries(
			Object.entries(keymap.value)
				.map(([shortcut, handler]) => {
					const shortcuts = shortcut.split('|');
					return shortcuts.map((s) => [normalizeShortcutString(s), handler]);
				})
				.flat(),
		),
	);

	function shortcutPartsToString(parts: string[]) {
		return parts
			.map((key) => key.toLowerCase())
			.sort((a, b) => a.localeCompare(b))
			.join('+');
	}

	function normalizeShortcutString(shortcut: string) {
		if (shortcut.length === 1) {
			return shortcut.toLowerCase();
		}

		const splitChars = ['+', '_', '-'];
		const splitCharsRegEx = splitChars.reduce((acc, char) => {
			if (shortcut.startsWith(char) || shortcut.endsWith(char)) {
				return acc;
			}

			return char + acc;
		}, '');

		return shortcutPartsToString(shortcut.split(new RegExp(`[${splitCharsRegEx}]`)));
	}

	function toShortcutString(event: KeyboardEvent) {
		const { shiftKey, altKey } = event;
		const ctrlKey = isCtrlKeyPressed(event);
		const keys = [event.key];
		const modifiers: string[] = [];

		if (shiftKey) {
			modifiers.push('shift');
		}

		if (ctrlKey) {
			modifiers.push('ctrl');
		}

		if (altKey) {
			modifiers.push('alt');
		}

		return shortcutPartsToString([...modifiers, ...keys]);
	}

	function onKeyDown(event: KeyboardEvent) {
		if (ignoreKeyPresses.value || isDisabled.value) return;

		const shortcutString = toShortcutString(event);

		const handler = normalizedKeymap.value[shortcutString];

		if (handler) {
			event.preventDefault();
			event.stopPropagation();
			handler(event);
		}
	}

	useEventListener(document, 'keydown', onKeyDown);
};
