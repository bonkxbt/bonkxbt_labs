import { DateTime } from 'luxon';
import type {
	IPollFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'bonkxbt-workflow';
import { NodeConnectionType } from 'bonkxbt-workflow';

import {
	googleApiRequest,
	googleApiRequestAllItems,
	parseRawEmail,
	prepareQuery,
	simplifyOutput,
} from './GenericFunctions';

export class GmailTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Gmail Trigger',
		name: 'gmailTrigger',
		icon: 'file:gmail.svg',
		group: ['trigger'],
		version: [1, 1.1, 1.2],
		description:
			'Fetches emails from Gmail and starts the workflow on specified polling intervals.',
		subtitle: '={{"Gmail Trigger"}}',
		defaults: {
			name: 'Gmail Trigger',
		},
		credentials: [
			{
				name: 'googleApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['serviceAccount'],
					},
				},
			},
			{
				name: 'gmailOAuth2',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		polling: true,
		inputs: [],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						// eslint-disable-next-line bonkxbt-nodes-base/node-param-display-name-miscased
						name: 'OAuth2 (recommended)',
						value: 'oAuth2',
					},
					{
						name: 'Service Account',
						value: 'serviceAccount',
					},
				],
				default: 'oAuth2',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				default: 'messageReceived',
				options: [
					{
						name: 'Message Received',
						value: 'messageReceived',
					},
				],
			},
			{
				displayName: 'Simplify',
				name: 'simple',
				type: 'boolean',
				default: true,
				description:
					'Whether to return a simplified version of the response instead of the raw data',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				options: [
					{
						displayName: 'Include Spam and Trash',
						name: 'includeSpamTrash',
						type: 'boolean',
						default: false,
						description: 'Whether to include messages from SPAM and TRASH in the results',
					},
					{
						displayName: 'Include Drafts',
						name: 'includeDrafts',
						type: 'boolean',
						default: false,
						description: 'Whether to include email drafts in the results',
					},
					{
						displayName: 'Label Names or IDs',
						name: 'labelIds',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getLabels',
						},
						default: [],
						description:
							'Only return messages with labels that match all of the specified label IDs. Choose from the list, or specify IDs using an <a href="https://docs.bonkxbt.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Search',
						name: 'q',
						type: 'string',
						default: '',
						placeholder: 'has:attachment',
						hint: 'Use the same format as in the Gmail search box. <a href="https://support.google.com/mail/answer/7190?hl=en">More info</a>.',
						description: 'Only return messages matching the specified query',
					},
					{
						displayName: 'Read Status',
						name: 'readStatus',
						type: 'options',
						default: 'unread',
						hint: 'Filter emails by whether they have been read or not',
						options: [
							{
								// eslint-disable-next-line bonkxbt-nodes-base/node-param-display-name-miscased
								name: 'Unread and read emails',
								value: 'both',
							},
							{
								// eslint-disable-next-line bonkxbt-nodes-base/node-param-display-name-miscased
								name: 'Unread emails only',
								value: 'unread',
							},
							{
								// eslint-disable-next-line bonkxbt-nodes-base/node-param-display-name-miscased
								name: 'Read emails only',
								value: 'read',
							},
						],
					},
					{
						displayName: 'Sender',
						name: 'sender',
						type: 'string',
						default: '',
						description: 'Sender name or email to filter by',
						hint: 'Enter an email or part of a sender name',
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: {
					hide: {
						simple: [true],
					},
				},
				options: [
					{
						displayName: 'Attachment Prefix',
						name: 'dataPropertyAttachmentsPrefixName',
						type: 'string',
						default: 'attachment_',
						description:
							"Prefix for name of the binary property to which to write the attachment. An index starting with 0 will be added. So if name is 'attachment_' the first attachment is saved to 'attachment_0'.",
					},
					{
						displayName: 'Download Attachments',
						name: 'downloadAttachments',
						type: 'boolean',
						default: false,
						description: "Whether the email's attachments will be downloaded",
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			// Get all the labels to display them to user so that they can
			// select them easily
			async getLabels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];

				const labels = await googleApiRequestAllItems.call(
					this,
					'labels',
					'GET',
					'/gmail/v1/users/me/labels',
				);

				for (const label of labels) {
					returnData.push({
						name: label.name,
						value: label.id,
					});
				}

				return returnData.sort((a, b) => {
					if (a.name < b.name) {
						return -1;
					}
					if (a.name > b.name) {
						return 1;
					}
					return 0;
				});
			},
		},
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const workflowStaticData = this.getWorkflowStaticData('node');
		const node = this.getNode();

		let nodeStaticData = workflowStaticData;
		if (node.typeVersion > 1) {
			const nodeName = node.name;
			if (workflowStaticData[nodeName] === undefined) {
				workflowStaticData[nodeName] = {} as IDataObject;
				nodeStaticData = workflowStaticData[nodeName] as IDataObject;
			} else {
				nodeStaticData = workflowStaticData[nodeName] as IDataObject;
			}
		}

		let responseData;

		const now = Math.floor(DateTime.now().toSeconds()).toString();
		const startDate = (nodeStaticData.lastTimeChecked as string) || +now;
		const endDate = +now;

		const options = this.getNodeParameter('options', {}) as IDataObject;
		const filters = this.getNodeParameter('filters', {}) as IDataObject;

		try {
			const qs: IDataObject = {};
			filters.receivedAfter = startDate;

			if (this.getMode() === 'manual') {
				qs.maxResults = 1;
				delete filters.receivedAfter;
			}

			Object.assign(qs, prepareQuery.call(this, filters, 0), options);

			responseData = await googleApiRequest.call(
				this,
				'GET',
				'/gmail/v1/users/me/messages',
				{},
				qs,
			);
			responseData = responseData.messages;

			if (!responseData?.length) {
				nodeStaticData.lastTimeChecked = endDate;
				return null;
			}

			const simple = this.getNodeParameter('simple') as boolean;

			if (simple) {
				qs.format = 'metadata';
				qs.metadataHeaders = ['From', 'To', 'Cc', 'Bcc', 'Subject'];
			} else {
				qs.format = 'raw';
			}

			let includeDrafts;
			if (node.typeVersion > 1.1) {
				includeDrafts = (qs.includeDrafts as boolean) ?? false;
			} else {
				includeDrafts = (qs.includeDrafts as boolean) ?? true;
			}
			delete qs.includeDrafts;
			const withoutDrafts = [];

			for (let i = 0; i < responseData.length; i++) {
				responseData[i] = await googleApiRequest.call(
					this,
					'GET',
					`/gmail/v1/users/me/messages/${responseData[i].id}`,
					{},
					qs,
				);
				if (!includeDrafts) {
					if (responseData[i].labelIds.includes('DRAFT')) {
						continue;
					}
				}
				if (!simple && responseData?.length) {
					const dataPropertyNameDownload =
						(options.dataPropertyAttachmentsPrefixName as string) || 'attachment_';

					responseData[i] = await parseRawEmail.call(
						this,
						responseData[i],
						dataPropertyNameDownload,
					);
				}
				withoutDrafts.push(responseData[i]);
			}

			if (!includeDrafts) {
				responseData = withoutDrafts;
			}

			if (simple && responseData?.length) {
				responseData = this.helpers.returnJsonArray(
					await simplifyOutput.call(this, responseData as IDataObject[]),
				);
			}
		} catch (error) {
			if (this.getMode() === 'manual' || !nodeStaticData.lastTimeChecked) {
				throw error;
			}
			const workflow = this.getWorkflow();
			this.logger.error(
				`There was a problem in '${node.name}' node in workflow '${workflow.id}': '${error.description}'`,
				{
					node: node.name,
					workflowId: workflow.id,
					error,
				},
			);
		}
		if (!responseData?.length) {
			nodeStaticData.lastTimeChecked = endDate;
			return null;
		}

		const emailsWithInvalidDate = new Set<string>();
		const getEmailDateAsSeconds = (email: IDataObject): number => {
			let date;
			if (email.internalDate) {
				date = +(email.internalDate as string) / 1000;
			} else if (email.date) {
				date = +DateTime.fromJSDate(new Date(email.date as string)).toSeconds();
			} else {
				date = +DateTime.fromJSDate(
					new Date((email?.headers as IDataObject)?.date as string),
				).toSeconds();
			}

			if (!date || isNaN(date)) {
				emailsWithInvalidDate.add(email.id as string);
				return +startDate;
			}

			return date;
		};

		const lastEmailDate = (responseData as IDataObject[]).reduce((lastDate, { json }) => {
			const emailDate = getEmailDateAsSeconds(json as IDataObject);
			return emailDate > lastDate ? emailDate : lastDate;
		}, 0);

		const nextPollPossibleDuplicates = (responseData as IDataObject[]).reduce(
			(duplicates, { json }) => {
				const emailDate = getEmailDateAsSeconds(json as IDataObject);
				return emailDate <= lastEmailDate
					? duplicates.concat((json as IDataObject).id as string)
					: duplicates;
			},
			Array.from(emailsWithInvalidDate),
		);

		const possibleDuplicates = (nodeStaticData.possibleDuplicates as string[]) || [];
		if (possibleDuplicates.length) {
			responseData = (responseData as IDataObject[]).filter(({ json }) => {
				const { id } = json as IDataObject;
				return !possibleDuplicates.includes(id as string);
			});
		}

		nodeStaticData.possibleDuplicates = nextPollPossibleDuplicates;
		nodeStaticData.lastTimeChecked = lastEmailDate || endDate;

		if (Array.isArray(responseData) && responseData.length) {
			return [responseData as INodeExecutionData[]];
		}

		return null;
	}
}
