<script setup lang="ts">
import type { Ref } from 'vue';
import { provide, watch, computed, ref, watchEffect } from 'vue';
import { ChatOptionsSymbol, ChatSymbol } from '@bonkxbt/chat/constants';
import type { Router } from 'vue-router';
import { useRouter } from 'vue-router';
import { chatEventBus } from '@bonkxbt/chat/event-buses';
import { VIEWS } from '@/constants';
import { v4 as uuid } from 'uuid';

// Components
import ChatMessagesPanel from './components/ChatMessagesPanel.vue';
import ChatLogsPanel from './components/ChatLogsPanel.vue';

// Composables
import { useChatTrigger } from './composables/useChatTrigger';
import { useChatMessaging } from './composables/useChatMessaging';
import { useResize } from './composables/useResize';
import { useI18n } from '@/composables/useI18n';
import { useNodeHelpers } from '@/composables/useNodeHelpers';
import { useRunWorkflow } from '@/composables/useRunWorkflow';

// Types
import type { Chat, ChatMessage, ChatOptions } from '@bonkxbt/chat/types';
import type { RunWorkflowChatPayload } from './composables/useChatMessaging';
import { useNodeTypesStore } from '@/stores/nodeTypes.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { useWorkflowsStore } from '@/stores/workflows.store';

const workflowsStore = useWorkflowsStore();
const canvasStore = useCanvasStore();
const nodeTypesStore = useNodeTypesStore();
const nodeHelpers = useNodeHelpers();
const router = useRouter();

// Component state
const messages = ref<ChatMessage[]>([]);
const currentSessionId = ref<string>(uuid().replace(/-/g, ''));
const isDisabled = ref(false);
const container = ref<HTMLElement>();

// Computed properties
const workflow = computed(() => workflowsStore.getCurrentWorkflow());

const allConnections = computed(() => workflowsStore.allConnections);
const isChatOpen = computed(() => {
	const result = workflowsStore.isChatPanelOpen;
	return result;
});
const canvasNodes = computed(() => workflowsStore.allNodes);
const isLogsOpen = computed(() => workflowsStore.isLogsPanelOpen);
const previousChatMessages = computed(() => workflowsStore.getPastChatMessages);
const resultData = computed(() => workflowsStore.getWorkflowRunData);
// Expose internal state for testing
defineExpose({
	messages,
	currentSessionId,
	isDisabled,
	workflow,
});

const { runWorkflow } = useRunWorkflow({ router });

// Initialize features with injected dependencies
const {
	chatTriggerNode,
	connectedNode,
	allowFileUploads,
	allowedFilesMimeTypes,
	setChatTriggerNode,
	setConnectedNode,
} = useChatTrigger({
	workflow,
	canvasNodes,
	getNodeByName: workflowsStore.getNodeByName,
	getNodeType: nodeTypesStore.getNodeType,
});

const { sendMessage, getChatMessages, isLoading } = useChatMessaging({
	chatTrigger: chatTriggerNode,
	connectedNode,
	messages,
	sessionId: currentSessionId,
	workflow,
	executionResultData: computed(() => workflowsStore.getWorkflowExecution?.data?.resultData),
	getWorkflowResultDataByNodeName: workflowsStore.getWorkflowResultDataByNodeName,
	onRunChatWorkflow,
});

const {
	height,
	chatWidth,
	rootStyles,
	logsWidth,
	onResizeDebounced,
	onResizeChatDebounced,
	onWindowResize,
} = useResize(container);

// Extracted pure functions for better testability
function createChatConfig(params: {
	messages: Chat['messages'];
	sendMessage: Chat['sendMessage'];
	currentSessionId: Chat['currentSessionId'];
	isLoading: Ref<boolean>;
	isDisabled: Ref<boolean>;
	allowFileUploads: Ref<boolean>;
	locale: ReturnType<typeof useI18n>;
}): { chatConfig: Chat; chatOptions: ChatOptions } {
	const chatConfig: Chat = {
		messages: params.messages,
		sendMessage: params.sendMessage,
		initialMessages: ref([]),
		currentSessionId: params.currentSessionId,
		waitingForResponse: params.isLoading,
	};

	const chatOptions: ChatOptions = {
		i18n: {
			en: {
				title: '',
				footer: '',
				subtitle: '',
				inputPlaceholder: params.locale.baseText('chat.window.chat.placeholder'),
				getStarted: '',
				closeButtonTooltip: '',
			},
		},
		webhookUrl: '',
		mode: 'window',
		showWindowCloseButton: true,
		disabled: params.isDisabled,
		allowFileUploads: params.allowFileUploads,
		allowedFilesMimeTypes,
	};

	return { chatConfig, chatOptions };
}

function displayExecution(params: { router: Router; workflowId: string; executionId: string }) {
	const route = params.router.resolve({
		name: VIEWS.EXECUTION_PREVIEW,
		params: { name: params.workflowId, executionId: params.executionId },
	});
	window.open(route.href, '_blank');
}

function refreshSession(params: { messages: Ref<ChatMessage[]>; currentSessionId: Ref<string> }) {
	workflowsStore.setWorkflowExecutionData(null);
	nodeHelpers.updateNodesExecutionIssues();
	params.messages.value = [];
	params.currentSessionId.value = uuid().replace(/-/g, '');
}

// Event handlers
const handleDisplayExecution = (executionId: string) => {
	displayExecution({
		router,
		workflowId: workflow.value.id,
		executionId,
	});
};

const handleRefreshSession = () => {
	refreshSession({
		messages,
		currentSessionId,
	});
};

const closePanel = () => {
	workflowsStore.setPanelOpen('chat', false);
};

// This function creates a promise that resolves when the workflow execution completes
// It's used to handle the loading state while waiting for the workflow to finish
async function createExecutionPromise() {
	let resolvePromise: () => void;
	const promise = new Promise<void>((resolve) => {
		resolvePromise = resolve;
	});

	// Watch for changes in the workflow execution status
	const stopWatch = watch(
		() => workflowsStore.getWorkflowExecution?.status,
		(newStatus) => {
			// If the status is no longer 'running', resolve the promise
			if (newStatus && newStatus !== 'running') {
				resolvePromise();
				// Stop the watcher when the promise is resolved
				stopWatch();
			}
		},
		{ immediate: true }, // Check the status immediately when the watcher is set up
	);

	// Return the promise, which will resolve when the workflow execution is complete
	// This allows the caller to await the execution and handle the loading state appropriately
	return await promise;
}

async function onRunChatWorkflow(payload: RunWorkflowChatPayload) {
	try {
		const response = await runWorkflow({
			triggerNode: payload.triggerNode,
			nodeData: payload.nodeData,
			source: payload.source,
		});

		if (response) {
			await createExecutionPromise();
			workflowsStore.appendChatMessage(payload.message);
			return response;
		}
		return;
	} catch (error) {
		throw error;
	}
}

// Initialize chat config
const { chatConfig, chatOptions } = createChatConfig({
	messages,
	sendMessage,
	currentSessionId,
	isLoading,
	isDisabled,
	allowFileUploads,
	locale: useI18n(),
});

// Provide chat context
provide(ChatSymbol, chatConfig);
provide(ChatOptionsSymbol, chatOptions);

// Watchers
watch(
	() => isChatOpen.value,
	(isOpen) => {
		if (isOpen) {
			setChatTriggerNode();
			setConnectedNode();

			if (messages.value.length === 0) {
				messages.value = getChatMessages();
			}

			setTimeout(() => {
				onWindowResize();
				chatEventBus.emit('focusInput');
			}, 0);
		}
	},
	{ immediate: true },
);

watch(
	() => allConnections.value,
	() => {
		if (canvasStore.isLoading) return;
		setTimeout(() => {
			if (!chatTriggerNode.value) {
				setChatTriggerNode();
			}
			setConnectedNode();
		}, 0);
	},
	{ deep: true },
);

watchEffect(() => {
	canvasStore.setPanelHeight(isChatOpen.value || isLogsOpen.value ? height.value : 0);
});
</script>

<template>
	<bonkxbtResizeWrapper
		v-if="chatTriggerNode"
		:is-resizing-enabled="isChatOpen || isLogsOpen"
		:supported-directions="['top']"
		:class="[$style.resizeWrapper, !isChatOpen && !isLogsOpen && $style.empty]"
		:height="height"
		:style="rootStyles"
		@resize="onResizeDebounced"
	>
		<div ref="container" :class="[$style.container, 'ignore-key-press-canvas']" tabindex="0">
			<div v-if="isChatOpen || isLogsOpen" :class="$style.chatResizer">
				<bonkxbt-resize-wrapper
					v-if="isChatOpen"
					:supported-directions="['right']"
					:width="chatWidth"
					:class="$style.chat"
					@resize="onResizeChatDebounced"
				>
					<div :class="$style.inner">
						<ChatMessagesPanel
							data-test-id="canvas-chat"
							:messages="messages"
							:session-id="currentSessionId"
							:past-chat-messages="previousChatMessages"
							:show-close-button="!connectedNode"
							@close="closePanel"
							@refresh-session="handleRefreshSession"
							@display-execution="handleDisplayExecution"
							@send-message="sendMessage"
						/>
					</div>
				</bonkxbt-resize-wrapper>
				<div v-if="isLogsOpen && connectedNode" :class="$style.logs">
					<ChatLogsPanel
						:key="`${resultData?.length ?? messages?.length}`"
						:workflow="workflow"
						data-test-id="canvas-chat-logs"
						:node="connectedNode"
						:slim="logsWidth < 700"
						@close="closePanel"
					/>
				</div>
			</div>
		</div>
	</bonkxbtResizeWrapper>
</template>

<style lang="scss" module>
.resizeWrapper {
	height: var(--panel-height);
	min-height: 4rem;
	max-height: 90vh;
	flex-basis: content;
	border-top: 1px solid var(--color-foreground-base);

	&.empty {
		height: auto;
		min-height: 0;
		flex-basis: 0;
	}
}

.container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.chatResizer {
	display: flex;
	width: 100%;
	height: 100%;
	max-width: 100%;
}

.footer {
	border-top: 1px solid var(--color-foreground-base);
	width: 100%;
	background-color: var(--color-background-light);
	display: flex;
	padding: var(--spacing-2xs);
	gap: var(--spacing-2xs);
}

.chat {
	width: var(--chat-width);
	flex-shrink: 0;
	border-right: 1px solid var(--color-foreground-base);
	max-width: 100%;

	&:only-child {
		width: 100%;
	}
}

.inner {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	height: 100%;
	width: 100%;
}

.logs {
	flex-grow: 1;
	flex-shrink: 1;
	background-color: var(--color-background-light);
}
</style>
