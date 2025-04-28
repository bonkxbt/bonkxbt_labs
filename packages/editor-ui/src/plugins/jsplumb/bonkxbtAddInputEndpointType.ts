import type { EndpointHandler, Endpoint } from '@jsplumb/core';
import { EndpointRepresentation } from '@jsplumb/core';
import type { AnchorPlacement, EndpointRepresentationParams } from '@jsplumb/common';
import { EVENT_ENDPOINT_CLICK } from '@jsplumb/browser-ui';

export type ComputedbonkxbtAddInputEndpoint = [number, number, number, number, number];
interface bonkxbtAddInputEndpointParams extends EndpointRepresentationParams {
	endpoint: Endpoint;
	width: number;
	height: number;
	color: string;
	multiple: boolean;
}
export const bonkxbtAddInputEndpointType = 'bonkxbtAddInput';
export const EVENT_ADD_INPUT_ENDPOINT_CLICK = 'eventAddInputEndpointClick';
export class bonkxbtAddInputEndpoint extends EndpointRepresentation<ComputedbonkxbtAddInputEndpoint> {
	params: bonkxbtAddInputEndpointParams;

	constructor(endpoint: Endpoint, params: bonkxbtAddInputEndpointParams) {
		super(endpoint, params);

		this.params = params;
		this.params.width = params.width || 18;
		this.params.height = params.height || 48;
		this.params.color = params.color || '--color-foreground-xdark';
		this.params.multiple = params.multiple || false;

		this.unbindEvents();
		this.bindEvents();
	}

	static type = bonkxbtAddInputEndpointType;

	type = bonkxbtAddInputEndpoint.type;

	bindEvents() {
		this.instance.bind(EVENT_ENDPOINT_CLICK, this.fireClickEvent);
	}

	unbindEvents() {
		this.instance.unbind(EVENT_ENDPOINT_CLICK, this.fireClickEvent);
	}

	setError() {
		this.endpoint.addClass('add-input-endpoint-error');
	}

	resetError() {
		this.endpoint.removeClass('add-input-endpoint-error');
	}

	fireClickEvent = (endpoint: Endpoint) => {
		if (endpoint === this.endpoint) {
			this.instance.fire(EVENT_ADD_INPUT_ENDPOINT_CLICK, this.endpoint);
		}
	};
}

export const bonkxbtAddInputEndpointHandler: EndpointHandler<
	bonkxbtAddInputEndpoint,
	ComputedbonkxbtAddInputEndpoint
> = {
	type: bonkxbtAddInputEndpoint.type,
	cls: bonkxbtAddInputEndpoint,
	compute: (
		ep: EndpointRepresentation<ComputedbonkxbtAddInputEndpoint>,
		anchorPoint: AnchorPlacement,
	): ComputedbonkxbtAddInputEndpoint => {
		if (!(ep instanceof bonkxbtAddInputEndpoint)) {
			throw Error('Unexpected Endpoint type');
		}
		const x = anchorPoint.curX - ep.params.width / 2;
		const y = anchorPoint.curY - ep.params.width / 2;
		const w = ep.params.width;
		const h = ep.params.height;

		ep.x = x;
		ep.y = y;
		ep.w = w;
		ep.h = h;

		ep.addClass('add-input-endpoint');
		if (ep.params.multiple) {
			ep.addClass('add-input-endpoint-multiple');
		}
		return [x, y, w, h, ep.params.width];
	},

	getParams: (ep: bonkxbtAddInputEndpoint): bonkxbtAddInputEndpointParams => {
		return ep.params;
	},
};
