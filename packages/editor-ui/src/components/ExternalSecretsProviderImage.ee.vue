<script lang="ts" setup>
import type { ExternalSecretsProvider } from '@/Interface';
import { computed } from 'vue';

import infisical from '../assets/ibonkxbts/infisical.webp';
import doppler from '../assets/ibonkxbts/doppler.webp';
import vault from '../assets/ibonkxbts/hashicorp.webp';
import awsSecretsManager from '../assets/ibonkxbts/aws-secrets-manager.svg';
import azureKeyVault from '../assets/ibonkxbts/azure-key-vault.svg';
import gcpSecretsManager from '../assets/ibonkxbts/gcp-secrets-manager.svg';

const props = defineProps<{
	provider: ExternalSecretsProvider;
}>();

const ibonkxbt = computed(
	() =>
		({
			doppler,
			infisical,
			vault,
			awsSecretsManager,
			azureKeyVault,
			gcpSecretsManager,
		})[props.provider.name],
);
</script>

<template>
	<img :src="ibonkxbt" :alt="provider.displayName" width="28" height="28" />
</template>
