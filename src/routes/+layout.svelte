<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import '../app.css';
	import { DarkMode, Navbar, NavBrand, NavHamburger, NavLi, NavUl, Modal } from 'flowbite-svelte';

	const appVersion = APP_VERSION;
	let isOpenedAppInfo = false;

	$: activeUrl = $page.url.pathname;

	let mocking = false;
	function stopMock() {
		window.__msw.stop();
		delete window.__msw;
		mocking = false;
	}
	onMount(() => {
		if (window.__msw) mocking = true;
	});
</script>

<div class="flex h-screen flex-col">
	<Navbar color="indigo" shadow fluid class="z-10">
		<NavBrand>
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
				Development Support AI Tools
			</span>
		</NavBrand>
		<NavHamburger />
		<NavUl {activeUrl}>
			<NavLi href="/">要件定義AI</NavLi>
			<!-- <NavLi href="/repair">部分修正</NavLi>
			<NavLi href="/variation">バリエーション生成</NavLi>
			<NavLi href="/billing">課金額記録</NavLi> -->
			<NavLi nonActiveClass="cursor-pointer" on:click={() => (isOpenedAppInfo = true)}
				>バージョン情報</NavLi
			>
			{#if dev && mocking}
				<NavLi on:click={stopMock} nonActiveClass="cursor-pointer">Disable MSW</NavLi>
			{/if}
			<NavLi>
				<DarkMode
					btnClass="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 
					focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 
					rounded-lg text-lg"
				/>
			</NavLi>
		</NavUl>
	</Navbar>

	<div
		class="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 text-black dark:bg-slate-900 dark:text-gray-100 print:overflow-visible print:bg-white print:text-black"
	>
		<slot />
	</div>
</div>

<Modal bind:open={isOpenedAppInfo} title="このシステムについて" outsideclose>
	<p>Development Support AI Tools ver.{appVersion}</p>
	<p>Copyright &copy; 2024 Umeda.</p>
</Modal>
