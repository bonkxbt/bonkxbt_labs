/* eslint-disable @typescript-eslint/naming-convention */
import type { bonkxbtLocale } from 'bonkxbt-design-system/types';

export default {
	'generic.retry': 'Retry',
	'nds.auth.roles.owner': 'Owner',
	'nds.userInfo.you': '(you)',
	'nds.userSelect.selectUser': 'Select User',
	'nds.userSelect.noMatchingUsers': 'No matching users',
	'notice.showMore': 'Show more',
	'notice.showLess': 'Show less',
	'formInput.validator.fieldRequired': 'This field is required',
	'formInput.validator.minCharactersRequired': 'Must be at least {minimum} characters',
	'formInput.validator.maxCharactersRequired': 'Must be at most {maximum} characters',
	'formInput.validator.oneNumbersRequired': (config: { minimum: number }) => {
		return `Must have at least ${config.minimum} number${config.minimum > 1 ? 's' : ''}`;
	},
	'formInput.validator.validEmailRequired': 'Must be a valid email',
	'formInput.validator.uppercaseCharsRequired': (config: { minimum: number }) =>
		`Must have at least ${config.minimum} uppercase character${config.minimum > 1 ? 's' : ''}`,
	'formInput.validator.defaultPasswordRequirements':
		'8+ characters, at least 1 number and 1 capital letter',
	'sticky.markdownHint':
		'You can style with <a href="https://docs.bonkxbt.io/workflows/sticky-notes/" target="_blank">Markdown</a>',
	'tags.showMore': (count: number) => `+${count} more`,
	'datatable.pageSize': 'Page size',
	'codeDiff.couldNotReplace': 'Could not replace code',
	'codeDiff.codeReplaced': 'Code replaced',
	'codeDiff.replaceMyCode': 'Replace my code',
	'codeDiff.replacing': 'Replacing...',
	'codeDiff.undo': 'Undo',
	'betaTag.beta': 'beta',
	'askAssistantButton.askAssistant': 'Ask Assistant',
	'assistantChat.errorParsingMarkdown': 'Error parsing markdown content',
	'assistantChat.aiAssistantLabel': 'AI Assistant',
	'assistantChat.aiAssistantName': 'Assistant',
	'assistantChat.sessionEndMessage.1':
		'This Assistant session has ended. To start a new session with the Assistant, click an',
	'assistantChat.sessionEndMessage.2': 'button in bonkxbt',
	'assistantChat.you': 'You',
	'assistantChat.quickRepliesTitle': 'Quick reply 👇',
	'assistantChat.placeholder.1': () =>
		'I can answer most questions about building workflows in bonkxbt.',
	'assistantChat.placeholder.2': 'For specific tasks, you’ll see the',
	'assistantChat.placeholder.3': 'button in the UI.',
	'assistantChat.placeholder.4': 'How can I help?',
	'assistantChat.inputPlaceholder': 'Enter your response...',
	'assistantChat.copy': 'Copy',
	'assistantChat.copied': 'Copied',
	'inlineAskAssistantButton.asked': 'Asked',
} as bonkxbtLocale;
