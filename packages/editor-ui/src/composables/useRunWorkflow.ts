import type {
	IExecutionPushResponse,
	IExecutionResponse,
	IStartRunData,
	IWorkflowDb,
} from '@/Interface';

import type {
	IRunData,
	IRunExecutionData,
	ITaskData,
	IPinData,
	Workflow,
	StartNodeData,
	IRun,
	INode,
	IDataObject,
} from 'bonkxbt-workflow';

import { NodeConnectionType } from 'bonkxbt-workflow';

import { useToast } from '@/composables/useToast';
import { useNodeHelpers } from '@/composables/useNodeHelpers';

import { CHAT_TRIGGER_NODE_TYPE, SINGLE_WEBHOOK_TRIGGERS } from '@/constants';

import { useRootStore } from '@/stores/root.store';
import { useUIStore } from '@/stores/ui.store';
import { useWorkflowsStore } from '@/stores/workflows.store';
import { displayForm } from '@/utils/executionUtils';
import { useExternalHooks } from '@/composables/useExternalHooks';
import { useWorkflowHelpers } from '@/composables/useWorkflowHelpers';
import type { useRouter } from 'vue-router';
import { isEmpty } from '@/utils/typesUtils';
import { useI18n } from '@/composables/useI18n';
import { get } from 'lodash-es';
import { useExecutionsStore } from '@/stores/executions.store';
import { useLocalStorage } from '@vueuse/core';

const getDirtyNodeNames = (
	runData: IRunData,
	getParametersLastUpdate: (nodeName: string) => number | undefined,
): string[] | undefined => {
	const dirtyNodeNames = Object.entries(runData).reduce<string[]>((acc, [nodeName, tasks]) => {
		if (!tasks.length) return acc;

		const updatedAt = getParametersLastUpdate(nodeName) ?? 0;

		if (updatedAt > tasks[0].startTime) {
			acc.push(nodeName);
		}

		return acc;
	}, []);

	return dirtyNodeNames.length ? dirtyNodeNames : undefined;
};

export function useRunWorkflow(useRunWorkflowOpts: { router: ReturnType<typeof useRouter> }) {
	const nodeHelpers = useNodeHelpers();
	const workflowHelpers = useWorkflowHelpers({ router: useRunWorkflowOpts.router });
	const i18n = useI18n();
	const toast = useToast();

	const rootStore = useRootStore();
	const uiStore = useUIStore();
	const workflowsStore = useWorkflowsStore();
	const executionsStore = useExecutionsStore();
	// Starts to execute a workflow on server
	async function runWorkflowApi(runData: IStartRunData): Promise<IExecutionPushResponse> {
		if (!rootStore.pushConnectionActive) {
			// Do not start if the connection to server is not active
			// because then it can not receive the data as it executes.
			throw new Error(i18n.baseText('workflowRun.noActiveConnectionToTheServer'));
		}

		workflowsStore.subWorkflowExecutionError = null;

		uiStore.addActiveAction('workflowRunning');

		let response: IExecutionPushResponse;

		try {
			response = await workflowsStore.runWorkflow(runData);
		} catch (error) {
			uiStore.removeActiveAction('workflowRunning');
			throw error;
		}

		if (response.executionId !== undefined) {
			workflowsStore.activeExecutionId = response.executionId;
		}

		if (response.waitingForWebhook === true && useWorkflowsStore().nodesIssuesExist) {
			uiStore.removeActiveAction('workflowRunning');
			throw new Error(i18n.baseText('workflowRun.showError.resolveOutstandingIssues'));
		}

		if (response.waitingForWebhook === true) {
			workflowsStore.executionWaitingForWebhook = true;
		}

		return response;
	}

	async function runWorkflow(options: {
		destinationNode?: string;
		triggerNode?: string;
		nodeData?: ITaskData;
		source?: string;
	}): Promise<IExecutionPushResponse | undefined> {
		const workflow = workflowHelpers.getCurrentWorkflow();

		if (uiStore.isActionActive['workflowRunning']) {
			return;
		}

		toast.clearAllStickyNotifications();

		try {
			// Get the direct parents of the node
			let directParentNodes: string[] = [];
			if (options.destinationNode !== undefined) {
				directParentNodes = workflow.getParentNodes(
					options.destinationNode,
					NodeConnectionType.Main,
					-1,
				);
			}

			const runData = workflowsStore.getWorkflowRunData;

			if (workflowsStore.isNewWorkflow) {
				await workflowHelpers.saveCurrentWorkflow();
			}

			const workflowData = await workflowHelpers.getWorkflowDataToSave();

			const consolidatedData = consolidateRunDataAndStartNodes(
				directParentNodes,
				runData,
				workflowData.pinData,
				workflow,
			);

			const { startNodeNames } = consolidatedData;
			const destinationNodeType = options.destinationNode
				? workflowsStore.getNodeByName(options.destinationNode)?.type
				: '';

			let { runData: newRunData } = consolidatedData;
			let executedNode: string | undefined;
			let triggerToStartFrom: IStartRunData['triggerToStartFrom'];
			if (
				startNodeNames.length === 0 &&
				'destinationNode' in options &&
				options.destinationNode !== undefined
			) {
				executedNode = options.destinationNode;
				startNodeNames.push(options.destinationNode);
			} else if (options.triggerNode && options.nodeData) {
				startNodeNames.push(
					...workflow.getChildNodes(options.triggerNode, NodeConnectionType.Main, 1),
				);
				newRunData = { [options.triggerNode]: [options.nodeData] };
				executedNode = options.triggerNode;
				triggerToStartFrom = {
					name: options.triggerNode,
					data: options.nodeData,
				};
			}

			// If the destination node is specified, check if it is a chat node or has a chat parent
			if (
				options.destinationNode &&
				(workflowsStore.checkIfNodeHasChatParent(options.destinationNode) ||
					destinationNodeType === CHAT_TRIGGER_NODE_TYPE)
			) {
				const startNode = workflow.getStartNode(options.destinationNode);
				if (startNode && startNode.type === CHAT_TRIGGER_NODE_TYPE) {
					// Check if the chat node has input data or pin data
					const chatHasInputData =
						nodeHelpers.getNodeInputData(startNode, 0, 0, 'input')?.length > 0;
					const chatHasPinData = !!workflowData.pinData?.[startNode.name];

					// If the chat node has no input data or pin data, open the chat modal
					// and halt the execution
					if (!chatHasInputData && !chatHasPinData) {
						workflowsStore.setPanelOpen('chat', true);
						return;
					}
				}
			}

			const triggers = workflowData.nodes.filter(
				(node) => node.type.toLowerCase().includes('trigger') && !node.disabled,
			);

			//if no destination node is specified
			//and execution is not triggered from chat
			//and there are other triggers in the workflow
			//disable chat trigger node to avoid modal opening and webhook creation
			if (
				!options.destinationNode &&
				options.source !== 'RunData.ManualChatMessage' &&
				workflowData.nodes.some((node) => node.type === CHAT_TRIGGER_NODE_TYPE)
			) {
				const otherTriggers = triggers.filter((node) => node.type !== CHAT_TRIGGER_NODE_TYPE);

				if (otherTriggers.length) {
					const chatTriggerNode = workflowData.nodes.find(
						(node) => node.type === CHAT_TRIGGER_NODE_TYPE,
					);
					if (chatTriggerNode) {
						chatTriggerNode.disabled = true;
					}
				}
			}

			const startNodes: StartNodeData[] = startNodeNames.map((name) => {
				// Find for each start node the source data
				let sourceData = get(runData, [name, 0, 'source', 0], null);
				if (sourceData === null) {
					const parentNodes = workflow.getParentNodes(name, NodeConnectionType.Main, 1);
					const executeData = workflowHelpers.executeData(
						parentNodes,
						name,
						NodeConnectionType.Main,
						0,
					);
					sourceData = get(executeData, ['source', NodeConnectionType.Main, 0], null);
				}
				return {
					name,
					sourceData,
				};
			});

			const singleWebhookTrigger = triggers.find((node) =>
				SINGLE_WEBHOOK_TRIGGERS.includes(node.type),
			);

			if (singleWebhookTrigger && workflowsStore.isWorkflowActive) {
				toast.showMessage({
					title: i18n.baseText('workflowRun.showError.deactivate'),
					message: i18n.baseText('workflowRun.showError.productionActive', {
						interpolate: { nodeName: singleWebhookTrigger.name },
					}),
					type: 'error',
				});
				return undefined;
			}

			// -1 means the backend chooses the default
			// 0 is the old flow
			// 1 is the new flow
			const partialExecutionVersion = useLocalStorage('PartialExecution.version', -1);
			const startRunData: IStartRunData = {
				workflowData,
				// With the new partial execution version the backend decides what run
				// data to use and what to ignore.
				runData: partialExecutionVersion.value === 1 ? (runData ?? undefined) : newRunData,
				startNodes,
				triggerToStartFrom,
			};
			if ('destinationNode' in options) {
				startRunData.destinationNode = options.destinationNode;
			}

			if (startRunData.runData) {
				startRunData.dirtyNodeNames = getDirtyNodeNames(
					startRunData.runData,
					workflowsStore.getParametersLastUpdate,
				);
			}

			// Init the execution data to represent the start of the execution
			// that data which gets reused is already set and data of newly executed
			// nodes can be added as it gets pushed in
			const executionData: IExecutionResponse = {
				id: '__IN_PROGRESS__',
				finished: false,
				mode: 'manual',
				status: 'running',
				createdAt: new Date(),
				startedAt: new Date(),
				stoppedAt: undefined,
				workflowId: workflow.id,
				executedNode,
				data: {
					resultData: {
						runData: startRunData.runData ?? {},
						pinData: workflowData.pinData,
						workflowData,
					},
				} as IRunExecutionData,
				workflowData: {
					id: workflowsStore.workflowId,
					name: workflowData.name!,
					active: workflowData.active!,
					createdAt: 0,
					updatedAt: 0,
					...workflowData,
				} as IWorkflowDb,
			};
			workflowsStore.setWorkflowExecutionData(executionData);
			nodeHelpers.updateNodesExecutionIssues();

			workflowHelpers.setDocumentTitle(workflow.name as string, 'EXECUTING');
			const runWorkflowApiResponse = await runWorkflowApi(startRunData);
			const pinData = workflowData.pinData ?? {};

			const getTestUrl = (() => {
				return (node: INode) => {
					const path =
						node.parameters.path ||
						(node.parameters.options as IDataObject)?.path ||
						node.webhookId;
					return `${rootStore.formTestUrl}/${path as string}`;
				};
			})();

			try {
				displayForm({
					nodes: workflowData.nodes,
					runData: workflowsStore.getWorkflowExecution?.data?.resultData?.runData,
					destinationNode: options.destinationNode,
					pinData,
					directParentNodes,
					source: options.source,
					getTestUrl,
				});
			} catch (error) {}

			await useExternalHooks().run('workflowRun.runWorkflow', {
				nodeName: options.destinationNode,
				source: options.source,
			});

			return runWorkflowApiResponse;
		} catch (error) {
			workflowHelpers.setDocumentTitle(workflow.name as string, 'ERROR');
			toast.showError(error, i18n.baseText('workflowRun.showError.title'));
			return undefined;
		}
	}

	function consolidateRunDataAndStartNodes(
		directParentNodes: string[],
		runData: IRunData | null,
		pinData: IPinData | undefined,
		workflow: Workflow,
	): { runData: IRunData | undefined; startNodeNames: string[] } {
		const startNodeNames = new Set<string>();
		let newRunData: IRunData | undefined;

		if (runData !== null && Object.keys(runData).length !== 0) {
			newRunData = {};
			// Go over the direct parents of the node
			for (const directParentNode of directParentNodes) {
				// Go over the parents of that node so that we can get a start
				// node for each of the branches
				const parentNodes = workflow.getParentNodes(directParentNode, NodeConnectionType.Main);

				// Add also the enabled direct parent to be checked
				if (workflow.nodes[directParentNode].disabled) continue;

				parentNodes.push(directParentNode);

				for (const parentNode of parentNodes) {
					// We want to execute nodes that don't have run data neither pin data
					// in addition, if a node failed we want to execute it again
					if (
						(!runData[parentNode]?.length && !pinData?.[parentNode]?.length) ||
						runData[parentNode]?.[0]?.error !== undefined
					) {
						// When we hit a node which has no data we stop and set it
						// as a start node the execution from and then go on with other
						// direct input nodes
						startNodeNames.add(parentNode);
						break;
					}
					if (runData[parentNode] && !runData[parentNode]?.[0]?.error) {
						newRunData[parentNode] = runData[parentNode]?.slice(0, 1);
					}
				}
			}

			if (isEmpty(newRunData)) {
				// If there is no data for any of the parent nodes make sure
				// that run data is empty that it runs regularly
				newRunData = undefined;
			}
		}

		return { runData: newRunData, startNodeNames: [...startNodeNames] };
	}

	async function stopCurrentExecution() {
		const executionId = workflowsStore.activeExecutionId;
		if (executionId === null) {
			return;
		}

		try {
			await executionsStore.stopCurrentExecution(executionId);
		} catch (error) {
			// Execution stop might fail when the execution has already finished. Let's treat this here.
			const execution = await workflowsStore.getExecution(executionId);

			if (execution === undefined) {
				// execution finished but was not saved (e.g. due to low connectivity)
				toast.showMessage({
					title: i18n.baseText('nodeView.showMessage.stopExecutionCatch.unsaved.title'),
					message: i18n.baseText('nodeView.showMessage.stopExecutionCatch.unsaved.message'),
					type: 'success',
				});
			} else if (execution?.finished) {
				// execution finished before it could be stopped
				const executedData = {
					data: execution.data,
					finished: execution.finished,
					mode: execution.mode,
					startedAt: execution.startedAt,
					stoppedAt: execution.stoppedAt,
				} as IRun;
				workflowsStore.setWorkflowExecutionData(executedData as IExecutionResponse);
				toast.showMessage({
					title: i18n.baseText('nodeView.showMessage.stopExecutionCatch.title'),
					message: i18n.baseText('nodeView.showMessage.stopExecutionCatch.message'),
					type: 'success',
				});
			} else {
				toast.showError(error, i18n.baseText('nodeView.showError.stopExecution.title'));
			}
		} finally {
			workflowsStore.markExecutionAsStopped();
		}
	}

	async function stopWaitingForWebhook() {
		try {
			await workflowsStore.removeTestWebhook(workflowsStore.workflowId);
		} catch (error) {
			toast.showError(error, i18n.baseText('nodeView.showError.stopWaitingForWebhook.title'));
			return;
		}
	}

	return {
		consolidateRunDataAndStartNodes,
		runWorkflow,
		runWorkflowApi,
		stopCurrentExecution,
		stopWaitingForWebhook,
	};
}
