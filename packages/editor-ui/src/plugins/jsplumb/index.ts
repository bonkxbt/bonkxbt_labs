import type { Plugin } from 'vue';
import { bonkxbtPlusEndpointHandler } from '@/plugins/jsplumb/bonkxbtPlusEndpointType';
import * as bonkxbtPlusEndpointRenderer from '@/plugins/jsplumb/bonkxbtPlusEndpointRenderer';
import { bonkxbtConnector } from '@/plugins/connectors/bonkxbtCustomConnector';
import * as bonkxbtAddInputEndpointRenderer from '@/plugins/jsplumb/bonkxbtAddInputEndpointRenderer';
import { bonkxbtAddInputEndpointHandler } from '@/plugins/jsplumb/bonkxbtAddInputEndpointType';
import type { AbstractConnector } from '@jsplumb/core';
import { Connectors, EndpointFactory } from '@jsplumb/core';
import type { Constructable } from '@jsplumb/util';

export const JsPlumbPlugin: Plugin = {
	install: () => {
		Connectors.register(bonkxbtConnector.type, bonkxbtConnector as Constructable<AbstractConnector>);

		bonkxbtPlusEndpointRenderer.register();
		EndpointFactory.registerHandler(bonkxbtPlusEndpointHandler);

		bonkxbtAddInputEndpointRenderer.register();
		EndpointFactory.registerHandler(bonkxbtAddInputEndpointHandler);
	},
};
