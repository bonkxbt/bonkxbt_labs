<script lang="ts" setup>
import Modal from '@/components/Modal.vue';
import { IMPORT_CURL_MODAL_KEY } from '@/constants';
import { onMounted, ref } from 'vue';
import { useUIStore } from '@/stores/ui.store';
import { createEventBus } from 'bonkxbt-design-system/utils';
import { useTelemetry } from '@/composables/useTelemetry';
import { useI18n } from '@/composables/useI18n';
import { useImportCurlCommand } from '@/composables/useImportCurlCommand';

const telemetry = useTelemetry();
const i18n = useI18n();

const uiStore = useUIStore();

const curlCommand = ref('');
const modalBus = createEventBus();

const inputRef = ref<HTMLTextAreaElement | null>(null);

const { importCurlCommand } = useImportCurlCommand({
	onImportSuccess,
	onImportFailure,
	onAfterImport,
});

onMounted(() => {
	curlCommand.value = (uiStore.modalsById[IMPORT_CURL_MODAL_KEY].data?.curlCommand as string) ?? '';

	setTimeout(() => {
		inputRef.value?.focus();
	});
});

function onInput(value: string): void {
	curlCommand.value = value;
}

function closeDialog(): void {
	modalBus.emit('close');
}

function onImportSuccess() {
	sendTelemetry();
	closeDialog();
}

function onImportFailure(data: { invalidProtocol: boolean; protocol?: string }) {
	sendTelemetry({ success: false, ...data });
}

function onAfterImport() {
	uiStore.setModalData({
		name: IMPORT_CURL_MODAL_KEY,
		data: { curlCommand: curlCommand.value },
	});
}

function sendTelemetry(
	data: { success: boolean; invalidProtocol: boolean; protocol?: string } = {
		success: true,
		invalidProtocol: false,
		protocol: '',
	},
): void {
	telemetry.track('User imported curl command', {
		success: data.success,
		invalidProtocol: data.invalidProtocol,
		protocol: data.protocol,
	});
}

async function onImport() {
	await importCurlCommand(curlCommand);
}
</script>

<template>
	<Modal
		width="700px"
		:title="i18n.baseText('importCurlModal.title')"
		:event-bus="modalBus"
		:name="IMPORT_CURL_MODAL_KEY"
		:center="true"
	>
		<template #content>
			<div :class="$style.container">
				<bonkxbtInputLabel :label="i18n.baseText('importCurlModal.input.label')" color="text-dark">
					<bonkxbtInput
						ref="inputRef"
						:model-value="curlCommand"
						type="textarea"
						:rows="5"
						:placeholder="i18n.baseText('importCurlModal.input.placeholder')"
						@update:model-value="onInput"
						@focus="$event.target.select()"
					/>
				</bonkxbtInputLabel>
			</div>
		</template>
		<template #footer>
			<div :class="$style.modalFooter">
				<bonkxbtNotice
					:class="$style.notice"
					:content="i18n.baseText('ImportCurlModal.notice.content')"
				/>
				<div>
					<bonkxbtButton
						float="right"
						:label="i18n.baseText('importCurlModal.button.label')"
						@click="onImport"
					/>
				</div>
			</div>
		</template>
	</Modal>
</template>

<style module lang="scss">
.modalFooter {
	justify-content: space-between;
	display: flex;
	flex-direction: row;
}

.notice {
	margin: 0;
}

.container > * {
	margin-bottom: var(--spacing-s);
	&:last-child {
		margin-bottom: 0;
	}
}
</style>
