<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n';
import { usePageRedirectionHelper } from '@/composables/usePageRedirectionHelper';

type Props = {
	limit: number;
	planName?: string;
};

const props = defineProps<Props>();
const visible = defineModel<boolean>();
const pageRedirectionHelper = usePageRedirectionHelper();
const locale = useI18n();

const goToUpgrade = async () => {
	await pageRedirectionHelper.goToUpgrade('rbac', 'upgrade-rbac');
	visible.value = false;
};
</script>
<template>
	<el-dialog
		v-model="visible"
		:title="locale.baseText('projects.settings.role.upgrade.title')"
		width="500"
	>
		<div class="pt-l">
			<i18n-t keypath="projects.settings.role.upgrade.message">
				<template #planName>{{ props.planName }}</template>
				<template #limit>
					{{
						locale.baseText('projects.create.limit', {
							adjustToNumber: props.limit,
							interpolate: { num: String(props.limit) },
						})
					}}
				</template>
			</i18n-t>
		</div>
		<template #footer>
			<bonkxbtButton type="secondary" native-type="button" @click="visible = false">{{
				locale.baseText('generic.cancel')
			}}</bonkxbtButton>
			<bonkxbtButton type="primary" native-type="button" @click="goToUpgrade">{{
				locale.baseText('projects.create.limitReached.link')
			}}</bonkxbtButton>
		</template>
	</el-dialog>
</template>
