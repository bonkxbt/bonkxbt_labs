import type { PushMessage } from '@bonkxbt/api-types';

export type PushMessageQueueItem = {
	message: PushMessage;
	retriesLeft: number;
};
