import { dev } from '$app/environment';

if (dev) {
	const { worker } = await import('./mocks/browser');

	await worker.start({
		onUnhandledRequest(request, print) {
			// 外部アクセス以外はモックを挟まない
			if (request.url.substring(0, location.origin.length) === location.origin) return;

			print.warning();
		}
	});

	window.__msw = worker;
}
