<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { Project, ProjectListItem, ProjectSharingData } from '@/types/projects.types';
import ProjectSharing from '@/components/Projects/ProjectSharing.vue';
import { useI18n } from '@/composables/useI18n';

type Props = {
	currentProject: Project | null;
	projects: ProjectListItem[];
};

const props = defineProps<Props>();
const visible = defineModel<boolean>();
const emit = defineEmits<{
	confirmDelete: [value?: string];
}>();

const locale = useI18n();

const selectedProject = ref<ProjectSharingData | null>(null);
const operation = ref<'transfer' | 'wipe' | null>(null);
const wipeConfirmText = ref('');
const isValid = computed(() => {
	if (operation.value === 'transfer') {
		return !!selectedProject.value;
	}
	if (operation.value === 'wipe') {
		return (
			wipeConfirmText.value ===
			locale.baseText('projects.settings.delete.question.wipe.placeholder')
		);
	}
	return false;
});

const onDelete = () => {
	if (!isValid.value) {
		return;
	}

	if (operation.value === 'wipe') {
		selectedProject.value = null;
	}

	emit('confirmDelete', selectedProject.value?.id);
};
</script>
<template>
	<el-dialog
		v-model="visible"
		:title="
			locale.baseText('projects.settings.delete.title', {
				interpolate: { projectName: props.currentProject?.name ?? '' },
			})
		"
		width="500"
	>
		<bonkxbt-text color="text-base">{{ locale.baseText('projects.settings.delete.message') }}</bonkxbt-text>
		<div class="pt-l">
			<el-radio
				:model-value="operation"
				label="transfer"
				class="mb-s"
				@update:model-value="operation = 'transfer'"
			>
				<bonkxbt-text color="text-dark">{{
					locale.baseText('projects.settings.delete.question.transfer.label')
				}}</bonkxbt-text>
			</el-radio>
			<div v-if="operation === 'transfer'" :class="$style.operation">
				<bonkxbt-text color="text-dark">{{
					locale.baseText('projects.settings.delete.question.transfer.title')
				}}</bonkxbt-text>
				<ProjectSharing
					v-model="selectedProject"
					class="pt-2xs"
					:projects="props.projects"
					:empty-options-text="locale.baseText('projects.sharing.noMatchingProjects')"
				/>
			</div>

			<el-radio
				:model-value="operation"
				label="wipe"
				class="mb-s"
				@update:model-value="operation = 'wipe'"
			>
				<bonkxbt-text color="text-dark">{{
					locale.baseText('projects.settings.delete.question.wipe.label')
				}}</bonkxbt-text>
			</el-radio>
			<div v-if="operation === 'wipe'" :class="$style.operation">
				<bonkxbt-input-label :label="locale.baseText('projects.settings.delete.question.wipe.title')">
					<bonkxbt-input
						v-model="wipeConfirmText"
						:placeholder="locale.baseText('projects.settings.delete.question.wipe.placeholder')"
					/>
				</bonkxbt-input-label>
			</div>
		</div>
		<template #footer>
			<bonkxbtButton
				type="danger"
				native-type="button"
				:disabled="!isValid"
				data-test-id="project-settings-delete-confirm-button"
				@click.stop.prevent="onDelete"
				>{{ locale.baseText('projects.settings.danger.deleteProject') }}</bonkxbtButton
			>
		</template>
	</el-dialog>
</template>

<style lang="scss" module>
.operation {
	padding: 0 0 var(--spacing-l) var(--spacing-l);
}
</style>
