import { dev } from '$app/environment';

if (dev) {
	const { server } = await import('./mocks/server');

	server.listen();
}
