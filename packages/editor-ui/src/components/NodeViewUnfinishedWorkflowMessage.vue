<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n';
const i18 = useI18n();
</script>

<template>
	<div>
		<a data-action="reload">{{ i18.baseText('nodeView.refresh') }}</a>
		{{ i18.baseText('nodeView.toSeeTheLatestStatus') }}.
		<br />
		<a
			href="https://docs.bonkxbt.io/integrations/builtin/core-nodes/bonkxbt-nodes-base.wait/"
			target="_blank"
		>
			{{ i18.baseText('nodeView.moreInfo') }}
		</a>
	</div>
</template>
