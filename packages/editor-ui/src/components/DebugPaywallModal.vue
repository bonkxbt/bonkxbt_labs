<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n';
import Modal from '@/components/Modal.vue';

const props = defineProps<{
	modalName: string;
	data: { title: string; footerButtonAction: () => void };
}>();

const i18n = useI18n();
</script>

<template>
	<Modal width="500px" :title="props.data.title" :name="props.modalName">
		<template #content>
			<bonkxbt-text>
				{{ i18n.baseText('executionsList.debug.paywall.content') }}
				<br />
				<bonkxbt-link :to="i18n.baseText('executionsList.debug.paywall.link.url')" new-window>
					{{ i18n.baseText('executionsList.debug.paywall.link.text') }}
				</bonkxbt-link>
			</bonkxbt-text>
		</template>
		<template #footer>
			<div :class="$style.footer">
				<bonkxbt-button @click="props.data.footerButtonAction">
					{{ i18n.baseText('generic.seePlans') }}
				</bonkxbt-button>
			</div>
		</template>
	</Modal>
</template>

<style module lang="scss">
.footer {
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
}
</style>
