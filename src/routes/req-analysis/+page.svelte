<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Textarea,
		Button,
		Listgroup,
		ListgroupItem,
		Heading,
		Alert,
		Label,
		Card,
		P,
		Checkbox,
		Spinner
	} from 'flowbite-svelte';

	import Presets from '$lib/components/Presets.svelte';
	import {
		translateRequirementsToDefinitions,
		type TranslateResults
	} from '$lib/req-to-defs/translator';

	type RequestData = {
		description: string;
		requirements: string;
	};
	let initialRequestData: RequestData = {
		description: '個人情報を含む企業の機密データを扱うSaaS型のWebサービスを開発する。',
		requirements: 'OWASP10に基づきセキュリティを確保してほしい。通信方法やパスワード保管方法など。'
	};
	let requestData: RequestData = {
		description: '',
		requirements: ''
	};

	let results: TranslateResults = {
		definitions: { summary: '要件定義のサマリーがここに表示されます', requirementDefinitions: [] },
		price: 0
	};
	const types: { [k: string]: string } = {
		functional: '機能',
		'non-functional': '非機能',
		note: '備考',
		'example-code': 'コード例'
	};

	let streaming = false;
	let processing = false;
	let error = '';

	async function translate() {
		if (processing) return;
		processing = true;
		results = await translateRequirementsToDefinitions(
			requestData.description,
			requestData.requirements,
			streaming ? (table) => (results.definitions = table) : undefined
		);
		if (!results) {
			processing = false;
			error = 'AIの推論処理に失敗しました。APIキーなど設定を確認ください。';
			return;
		}
		processing = false;
	}

	onMount(() => {
		if (!window.__msw) streaming = true;
	});
</script>

<div class="container m-auto flex max-w-5xl flex-col gap-8 py-6">
	<Heading tag="h2" class="print:text-gray-800">要件定義AI</Heading>
	<Card size="xl" class="gap-4 print:border-gray-300 print:bg-white">
		<Presets
			storageKey="ReqAnalysisPreset"
			bind:data={requestData}
			initPresetData={initialRequestData}
			initPresetName="デフォルト"
		/>
		<form on:submit|preventDefault={translate} class="flex flex-col gap-4 print:hidden">
			<Label for="description">システム説明</Label>
			<Textarea
				bind:value={requestData.description}
				id="description"
				class="bg-white dark:bg-gray-800"
			/>
			<Label for="requirements">要求分析</Label>
			<Textarea bind:value={requestData.requirements} id="requirements">
				<div slot="footer" class="flex items-center justify-between">
					<div class="flex flex-row items-center gap-4">
						<Button type="submit" disabled={processing}>要件定義に変換</Button>
						{#if results.price > 0}
							<P size="sm" italic>Charged ${results.price.toFixed(4)}</P>
						{/if}
					</div>
					<div></div>
				</div>
			</Textarea>
			<Checkbox bind:checked={streaming}>翻訳結果をストリーミング表示する</Checkbox>
			{#if error}
				<Alert>{error}</Alert>
			{/if}
		</form>
		<div class="hidden flex-col gap-6 print:flex">
			<div class="flex flex-col gap-4">
				<Heading tag="h5" color="text-neutral-700">システム説明</Heading>
				<P color="text-black">{requestData.description}</P>
			</div>
			<div class="flex flex-col gap-4">
				<Heading tag="h5" color="text-neutral-700">要求分析</Heading>
				<P color="text-black">{requestData.requirements}</P>
			</div>
		</div>
	</Card>

	<Heading tag="h3" class="break-after-avoid-page print:text-gray-800">出力結果</Heading>
	{#if results.definitions}
		<Alert color="indigo">{results.definitions?.summary}</Alert>
		{#each results.definitions?.requirementDefinitions as result}
			<Card size="xl" class="break-inside-avoid-page gap-4 print:border-gray-300 print:bg-white">
				<Heading tag="h5" class="print:text-black">{result.category}</Heading>
				<Listgroup class="text-base print:border-gray-300 print:bg-white">
					{#each result.items as item}
						<ListgroupItem class="break-inside-avoid-page gap-2 print:border-gray-300">
							<dl class="flex flex-row items-center justify-between">
								<dt class="w-16 text-sm font-bold text-primary-500">
									{types[item.type] ?? ''}
								</dt>
								<dd class="flex-1 font-normal">
									<div class="text-neutral-950 dark:text-neutral-100 print:text-black">
										{item.ja}
									</div>
									<div
										class="text-sm text-neutral-600 dark:text-neutral-400 print:text-neutral-700"
									>
										{item.en}
									</div>
								</dd>
							</dl>
						</ListgroupItem>
					{:else}
						<ListgroupItem>要件定義に変換を実行してください。</ListgroupItem>
					{/each}
				</Listgroup>
			</Card>
		{/each}
		{#if processing}
			<Alert color="yellow">
				<Spinner />
				データを生成中です。しばらくお待ちください..
			</Alert>
		{/if}
	{/if}
</div>
