// See https://kit.svelte.dev/docs/types#app

import type { SetupWorker } from 'msw/browser';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		__msw?: SetupWorker | undefined;
	}

	const APP_VERSION: string;
}

export {};
