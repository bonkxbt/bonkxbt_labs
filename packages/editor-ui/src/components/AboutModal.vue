<script setup lang="ts">
import { createEventBus } from 'bonkxbt-design-system/utils';
import Modal from './Modal.vue';
import { ABOUT_MODAL_KEY } from '../constants';
import { useRootStore } from '@/stores/root.store';
import { useToast } from '@/composables/useToast';
import { useClipboard } from '@/composables/useClipboard';
import { useDebugInfo } from '@/composables/useDebugInfo';
import { useI18n } from '@/composables/useI18n';

const modalBus = createEventBus();
const toast = useToast();
const i18n = useI18n();
const debugInfo = useDebugInfo();
const clipboard = useClipboard();
const rootStore = useRootStore();

const closeDialog = () => {
	modalBus.emit('close');
};

const copyDebugInfoToClipboard = async () => {
	toast.showToast({
		title: i18n.baseText('about.debug.toast.title'),
		message: i18n.baseText('about.debug.toast.message'),
		type: 'info',
		duration: 5000,
	});
	await clipboard.copy(debugInfo.generateDebugInfo());
};
</script>

<template>
	<Modal
		max-width="540px"
		:title="i18n.baseText('about.aboutbonkxbt')"
		:event-bus="modalBus"
		:name="ABOUT_MODAL_KEY"
		:center="true"
	>
		<template #content>
			<div :class="$style.container">
				<el-row>
					<el-col :span="8" class="info-name">
						<bonkxbt-text>{{ i18n.baseText('about.bonkxbtVersion') }}</bonkxbt-text>
					</el-col>
					<el-col :span="16">
						<bonkxbt-text>{{ rootStore.versionCli }}</bonkxbt-text>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="8" class="info-name">
						<bonkxbt-text>{{ i18n.baseText('about.sourceCode') }}</bonkxbt-text>
					</el-col>
					<el-col :span="16">
						<bonkxbt-link to="https://github.com/bonkxbt-io/bonkxbt">https://github.com/bonkxbt-io/bonkxbt</bonkxbt-link>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="8" class="info-name">
						<bonkxbt-text>{{ i18n.baseText('about.license') }}</bonkxbt-text>
					</el-col>
					<el-col :span="16">
						<bonkxbt-link to="https://github.com/bonkxbt-io/bonkxbt/blob/master/LICENSE.md">
							{{ i18n.baseText('about.bonkxbtLicense') }}
						</bonkxbt-link>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="8" class="info-name">
						<bonkxbt-text>{{ i18n.baseText('about.instanceID') }}</bonkxbt-text>
					</el-col>
					<el-col :span="16">
						<bonkxbt-text>{{ rootStore.instanceId }}</bonkxbt-text>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="8" class="info-name">
						<bonkxbt-text>{{ i18n.baseText('about.debug.title') }}</bonkxbt-text>
					</el-col>
					<el-col :span="16">
						<div :class="$style.debugInfo" @click="copyDebugInfoToClipboard">
							<bonkxbt-link>{{ i18n.baseText('about.debug.message') }}</bonkxbt-link>
						</div>
					</el-col>
				</el-row>
			</div>
		</template>

		<template #footer>
			<div class="action-buttons">
				<bonkxbt-button
					float="right"
					:label="i18n.baseText('about.close')"
					data-test-id="close-about-modal-button"
					@click="closeDialog"
				/>
			</div>
		</template>
	</Modal>
</template>

<style module lang="scss">
.container > * {
	margin-bottom: var(--spacing-s);
	overflow-wrap: break-word;
}
</style>
