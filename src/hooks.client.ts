import { dev } from '$app/environment';

if (dev) {
	const { worker } = await import('./mocks/browser');

	const ignoreKeywords = ['svelte', '/node_modules/', '/src/', '/@id/'];

	await worker.start({
		onUnhandledRequest(request, print) {
			// Do not warn on unhandled internal Svelte requests.
			// Those are not meant to be mocked.
			for (const keyword of ignoreKeywords) {
				if (request.url.includes(keyword)) return;
			}

			print.warning();
		}
	});

	window.__msw = worker;
}
