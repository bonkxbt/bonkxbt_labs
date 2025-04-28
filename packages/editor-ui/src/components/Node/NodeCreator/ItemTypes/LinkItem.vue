<script setup lang="ts">
import type { LinkItemProps } from '@/Interface';

export interface Props {
	link: LinkItemProps;
}

defineProps<Props>();
</script>

<template>
	<bonkxbt-node-creator-node
		:class="$style.creatorLink"
		:title="link.title"
		:is-trigger="false"
		:description="link.description"
		:tag="link.tag"
		:show-action-arrow="true"
	>
		<template #icon>
			<bonkxbt-node-icon type="icon" :name="link.icon" :circle="false" :show-tooltip="false" />
		</template>
	</bonkxbt-node-creator-node>
</template>

<style lang="scss" module>
.creatorLink {
	--action-arrow-color: var(--color-text-light);
	margin-left: var(--spacing-s);
	margin-right: var(--spacing-xs);
}
</style>
