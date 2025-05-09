import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';
import svgLoader from 'vite-svg-loader';

import { vitestConfig } from '../design-system/vite.config.mts';
import icons from 'unplugin-icons/vite';
import iconsResolver from 'unplugin-icons/resolver';
import components from 'unplugin-vue-components/vite';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import legacy from '@vitejs/plugin-legacy';
import browserslist from 'browserslist';

const publicPath = process.env.VUE_APP_PUBLIC_PATH || '/';

const { NODE_ENV } = process.env;

const browsers = browserslist.loadConfig({ path: process.cwd() });

const alias = [
	{ find: '@', replacement: resolve(__dirname, 'src') },
	{ find: 'stream', replacement: 'stream-browserify' },
	{
		find: /^bonkxbt-design-system$/,
		replacement: resolve(__dirname, '..', 'design-system', 'src', 'main.ts'),
	},
	{
		find: /^bonkxbt-design-system\//,
		replacement: resolve(__dirname, '..', 'design-system', 'src') + '/',
	},
	{
		find: /^@bonkxbt\/chat$/,
		replacement: resolve(__dirname, '..', '@bonkxbt', 'chat', 'src', 'index.ts'),
	},
	{
		find: /^@bonkxbt\/chat\//,
		replacement: resolve(__dirname, '..', '@bonkxbt', 'chat', 'src') + '/',
	},
	...['orderBy', 'camelCase', 'cloneDeep', 'startCase'].map((name) => ({
		find: new RegExp(`^lodash.${name}$`, 'i'),
		replacement: `lodash-es/${name}`,
	})),
	{
		find: /^lodash\.(.+)$/,
		replacement: 'lodash-es/$1',
	},
];

const plugins = [
	icons({
		compiler: 'vue3',
		autoInstall: true,
	}),
	components({
		dts: './src/components.d.ts',
		resolvers: [
			iconsResolver({
				prefix: 'icon',
			}),
		],
	}),
	vue(),
	svgLoader(),
	legacy({
		modernTargets: browsers,
		modernPolyfills: true,
		renderLegacyChunks: false,
	}),
];

const { RELEASE: release } = process.env;

export default mergeConfig(
	defineConfig({
		define: {
			// This causes test to fail but is required for actually running it
			// ...(NODE_ENV !== 'test' ? { 'global': 'globalThis' } : {}),
			...(NODE_ENV === 'development' ? { 'process.env': {} } : {}),
			BASE_PATH: `'${publicPath}'`,
		},
		plugins,
		resolve: { alias },
		base: publicPath,
		envPrefix: 'VUE_APP',
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: '\n@use "@/bonkxbt-theme-variables.scss" as *;\n',
				},
			},
		},
		build: {
			minify: !!release,
			sourcemap: !!release,
			target: browserslistToEsbuild(browsers),
		},
	}),
	vitestConfig,
);
