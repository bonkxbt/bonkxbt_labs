<script setup lang="ts">
import { computed, ref } from 'vue';
import type { IbonkxbtPromptResponse, ModalKey } from '@/Interface';
import { VALID_EMAIL_REGEX } from '@/constants';
import Modal from '@/components/Modal.vue';
import { useSettingsStore } from '@/stores/settings.store';
import { useRootStore } from '@/stores/root.store';
import { createEventBus } from 'bonkxbt-design-system/utils';
import { useToast } from '@/composables/useToast';
import { useNpsSurveyStore } from '@/stores/npsSurvey.store';
import { useTelemetry } from '@/composables/useTelemetry';

defineProps<{
	modalName: ModalKey;
}>();

const email = ref('');
const modalBus = createEventBus();

const npsSurveyStore = useNpsSurveyStore();
const rootStore = useRootStore();
const settingsStore = useSettingsStore();

const toast = useToast();
const telemetry = useTelemetry();

const title = computed(() => {
	if (npsSurveyStore.promptsData?.title) {
		return npsSurveyStore.promptsData.title;
	}

	return 'You’re a power user 💪';
});

const description = computed(() => {
	if (npsSurveyStore.promptsData?.message) {
		return npsSurveyStore.promptsData.message;
	}

	return 'Your experience with bonkxbt can help us improve — for you and our entire community.';
});

const isEmailValid = computed(() => {
	return VALID_EMAIL_REGEX.test(String(email.value).toLowerCase());
});

const closeDialog = () => {
	if (!isEmailValid.value) {
		telemetry.track('User closed email modal', {
			instance_id: rootStore.instanceId,
			email: null,
		});
	}
};

const send = async () => {
	if (isEmailValid.value) {
		const response = (await settingsStore.submitContactInfo(email.value)) as IbonkxbtPromptResponse;

		if (response.updated) {
			telemetry.track('User closed email modal', {
				instance_id: rootStore.instanceId,
				email: email.value,
			});
			toast.showMessage({
				title: 'Thanks!',
				message: "It's people like you that help make bonkxbt better",
				type: 'success',
			});
		}
		modalBus.emit('close');
	}
};
</script>

<template>
	<Modal
		:name="modalName"
		:event-bus="modalBus"
		:center="true"
		:close-on-press-escape="false"
		:before-close="closeDialog"
		custom-class="contact-prompt-modal"
		width="460px"
	>
		<template #header>
			<bonkxbt-heading tag="h2" size="xlarge" color="text-dark">{{ title }}</bonkxbt-heading>
		</template>
		<template #content>
			<div :class="$style.description">
				<bonkxbt-text size="medium" color="text-base">{{ description }}</bonkxbt-text>
			</div>
			<div @keyup.enter="send">
				<bonkxbt-input v-model="email" placeholder="Your email address" />
			</div>
			<div :class="$style.disclaimer">
				<bonkxbt-text size="small" color="text-base"
					>David from our product team will get in touch personally</bonkxbt-text
				>
			</div>
		</template>
		<template #footer>
			<div :class="$style.footer">
				<bonkxbt-button label="Send" float="right" :disabled="!isEmailValid" @click="send" />
			</div>
		</template>
	</Modal>
</template>

<style lang="scss" module>
.description {
	margin-bottom: var(--spacing-s);
}

.disclaimer {
	margin-top: var(--spacing-4xs);
}
</style>

<style lang="scss">
.dialog-wrapper {
	.contact-prompt-modal {
		.el-dialog__body {
			padding: 16px 24px 24px;
		}
	}
}
</style>
