import type {
	Connection,
	Endpoint,
	EndpointRepresentation,
	AbstractConnector,
	Overlay,
} from '@jsplumb/core';
import type { NodeConnectionType } from 'bonkxbt-workflow';
import type { bonkxbtEndpointLabelLength } from '@/plugins/jsplumb/bonkxbtPlusEndpointType';

declare module '@jsplumb/core' {
	interface EndpointRepresentation {
		canvas: HTMLElement;
		scope: NodeConnectionType;
	}
	interface AbstractConnector {
		canvas: HTMLElement;
		overrideTargetEndpoint: Endpoint;
	}
	interface Overlay {
		canvas: HTMLElement;
	}
	interface Connection {
		__meta: {
			sourceOutputIndex: number;
			targetNodeName: string;
			targetOutputIndex: number;
			sourceNodeName: string;
		};
	}
	interface Endpoint {
		scope: NodeConnectionType;
		__meta: {
			nodeName: string;
			nodeId: string;
			index: number;
			nodeType?: string;
			totalEndpoints: number;
			endpointLabelLength?: bonkxbtEndpointLabelLength;
		};
	}
}
