<script setup lang="ts">
import { ref, computed, watch, onBeforeMount } from 'vue';
import { EnterpriseEditionFeature } from '@/constants';
import { useProjectsStore } from '@/stores/projects.store';
import type { ProjectSharingData } from '@/types/projects.types';
import ProjectSharing from '@/components/Projects/ProjectSharing.vue';
import type { IFilters } from '../layouts/ResourcesListLayout.vue';
import { useI18n } from '@/composables/useI18n';

type IResourceFiltersType = Record<string, boolean | string | string[]>;

const props = withDefaults(
	defineProps<{
		modelValue?: IResourceFiltersType;
		keys?: string[];
		shareable?: boolean;
		reset?: () => void;
	}>(),
	{
		modelValue: () => ({}),
		keys: () => [],
		shareable: true,
		reset: () => {},
	},
);

const emit = defineEmits<{
	'update:modelValue': [value: IFilters];
	'update:filtersLength': [value: number];
}>();

const selectedProject = ref<ProjectSharingData | null>(null);

const projectsStore = useProjectsStore();

const i18n = useI18n();

const filtersLength = computed(() => {
	let length = 0;

	props.keys.forEach((key) => {
		if (key === 'search') {
			return;
		}

		const value = props.modelValue[key];
		length += (Array.isArray(value) ? value.length > 0 : value !== '') ? 1 : 0;
	});

	return length;
});

const hasFilters = computed(() => filtersLength.value > 0);

const setKeyValue = (key: string, value: unknown) => {
	const filters = {
		...props.modelValue,
		[key]: value,
	} as IFilters;

	emit('update:modelValue', filters);
};

const resetFilters = () => {
	if (props.reset) {
		props.reset();
	} else {
		const filters = { ...props.modelValue } as IFilters;

		props.keys.forEach((key) => {
			filters[key] = Array.isArray(props.modelValue[key]) ? [] : '';
		});

		emit('update:modelValue', filters);
	}
	selectedProject.value = null;
};

watch(filtersLength, (value) => {
	emit('update:filtersLength', value);
});

onBeforeMount(async () => {
	await projectsStore.getAvailableProjects();
	selectedProject.value =
		projectsStore.availableProjects.find(
			(project) => project.id === props.modelValue.homeProject,
		) ?? null;
});
</script>

<template>
	<bonkxbt-popover trigger="click" width="304" size="large">
		<template #reference>
			<bonkxbt-button
				icon="filter"
				type="tertiary"
				:active="hasFilters"
				:class="$style['filter-button']"
				data-test-id="resources-list-filters-trigger"
			>
				<bonkxbt-badge v-show="filtersLength > 0" theme="primary" class="mr-4xs">
					{{ filtersLength }}
				</bonkxbt-badge>
				{{ i18n.baseText('forms.resourceFiltersDropdown.filters') }}
			</bonkxbt-button>
		</template>
		<div :class="$style['filters-dropdown']" data-test-id="resources-list-filters-dropdown">
			<slot :filters="modelValue" :set-key-value="setKeyValue" />
			<enterprise-edition
				v-if="shareable && projectsStore.isProjectHome"
				:features="[EnterpriseEditionFeature.Sharing]"
			>
				<bonkxbt-input-label
					:label="i18n.baseText('forms.resourceFiltersDropdown.owner')"
					:bold="false"
					size="small"
					color="text-base"
					class="mb-3xs"
				/>
				<ProjectSharing
					v-model="selectedProject"
					:projects="projectsStore.availableProjects"
					:placeholder="i18n.baseText('forms.resourceFiltersDropdown.owner.placeholder')"
					:empty-options-text="i18n.baseText('projects.sharing.noMatchingProjects')"
					@update:model-value="setKeyValue('homeProject', ($event as ProjectSharingData).id)"
				/>
			</enterprise-edition>
			<div v-if="hasFilters" :class="[$style['filters-dropdown-footer'], 'mt-s']">
				<bonkxbt-link @click="resetFilters">
					{{ i18n.baseText('forms.resourceFiltersDropdown.reset') }}
				</bonkxbt-link>
			</div>
		</div>
	</bonkxbt-popover>
</template>

<style lang="scss" module>
.filter-button {
	height: 40px;
	align-items: center;
}

.filters-dropdown {
	width: 280px;
}

.filters-dropdown-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>
