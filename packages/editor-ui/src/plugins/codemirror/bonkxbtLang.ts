import { parserWithMetaData as bonkxbtParser } from '@bonkxbt/codemirror-lang';
import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { parseMixed } from '@lezer/common';
import { javascriptLanguage } from '@codemirror/lang-javascript';

import { bonkxbtCompletionSources } from './completions/addCompletions';
import { autocompletion } from '@codemirror/autocomplete';

const bonkxbtParserWithNestedJsParser = bonkxbtParser.configure({
	wrap: parseMixed((node) => {
		if (node.type.isTop) return null;

		return node.name === 'Resolvable'
			? { parser: javascriptLanguage.parser, overlay: (node) => node.type.name === 'Resolvable' }
			: null;
	}),
});

const bonkxbtLanguage = LRLanguage.define({ parser: bonkxbtParserWithNestedJsParser });

export function bonkxbtLang() {
	return new LanguageSupport(bonkxbtLanguage, [
		bonkxbtLanguage.data.of({ closeBrackets: { brackets: ['{', '('] } }),
		...bonkxbtCompletionSources().map((source) => bonkxbtLanguage.data.of(source)),
	]);
}

export const bonkxbtAutocompletion = () =>
	autocompletion({ icons: false, aboveCursor: true, closeOnBlur: false });
