import { sveltekit } from '@sveltejs/kit/vite';

import msw from '@iodigital/vite-plugin-msw';
import { defineConfig } from 'vitest/config';

import { handlers } from './src/mocks/handlers';

export default defineConfig({
	plugins: [sveltekit(), msw({ handlers })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version)
	}
});
