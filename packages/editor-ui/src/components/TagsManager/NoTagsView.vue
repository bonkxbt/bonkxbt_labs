<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import type { BaseTextKey } from '@/plugins/i18n';

type Props = {
	titleLocaleKey: BaseTextKey;
	descriptionLocaleKey: BaseTextKey;
};

withDefaults(defineProps<Props>(), {
	titleLocaleKey: 'noTagsView.readyToOrganizeYourWorkflows',
	descriptionLocaleKey: 'noTagsView.withWorkflowTagsYouReFree',
});

const i18n = useI18n();
</script>

<template>
	<div :class="$style.container">
		<el-col class="notags" :span="16">
			<div class="icon">🗄️</div>
			<div>
				<div class="mb-s">
					<bonkxbt-heading size="large">
						{{ i18n.baseText(titleLocaleKey) }}
					</bonkxbt-heading>
				</div>
				<div class="description">
					{{ i18n.baseText(descriptionLocaleKey) }}
				</div>
			</div>
			<bonkxbt-button label="Create a tag" size="large" @click="$emit('enableCreate')" />
		</el-col>
	</div>
</template>

<style lang="scss" module>
$--footer-spacing: 45px;

.container {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: $--footer-spacing;
}
</style>

<style lang="scss" scoped>
.notags {
	word-break: normal;
	text-align: center;

	> * {
		margin-bottom: 32px;
	}
}

.icon {
	font-size: 36px;
	line-height: 14px;
}

.description {
	font-size: 14px;
	line-height: 21px;
}
</style>
