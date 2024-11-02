<script lang="ts">
	import {
		Textarea,
		Button,
		Listgroup,
		ListgroupItem,
		Heading,
		Alert,
		Label,
		Card,
		P
	} from 'flowbite-svelte';

	import {
		translateRequirementsToDefinitions,
		type TranslateResults
	} from '$lib/req-to-defs/translator';

	const USDJPY = 145.0; // 2024年の相場観より

	let descriptionText = '個人情報を含む企業の機密データを扱うSaaS型のWebサービスを開発する。';
	let requirementsText =
		'OWASP10に基づきセキュリティを確保してほしい。通信方法やパスワード保管方法など。';

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

	let processing = false;
	let error = '';

	async function translate() {
		if (processing) return;
		processing = true;
		results = await translateRequirementsToDefinitions(descriptionText, requirementsText);
		if (!results) {
			processing = false;
			error = 'AIの推論処理に失敗しました。APIキーなど設定を確認ください。';
			return;
		}
		processing = false;
	}
</script>

<div class="container m-auto flex max-w-5xl flex-col gap-8 py-6">
	<Heading tag="h2" class="print:text-gray-800">要件定義AI</Heading>
	<form on:submit|preventDefault={translate} class="flex flex-col gap-4 print:hidden">
		<div>
			<Label for="description">システム説明</Label>
			<Textarea bind:value={descriptionText} id="description" class="bg-white dark:bg-gray-800" />
		</div>
		<div>
			<Label for="requirements">要求分析</Label>
			<Textarea bind:value={requirementsText} id="requirements">
				<div slot="footer" class="flex items-center justify-between">
					<div class="flex flex-row items-center gap-4">
						<Button type="submit" disabled={processing}>要件定義に変換</Button>
						{#if results.price > 0}
							<P size="sm" italic
								>Charged ${results.price.toFixed(3)} ({(results.price * USDJPY).toFixed(1)}円)</P
							>
						{/if}
					</div>
					<P size="sm">※変換には10秒前後かかります</P>
				</div>
			</Textarea>
		</div>
		{#if error}
			<Alert>{error}</Alert>
		{/if}
	</form>
	<div class="hidden flex-col gap-6 print:flex">
		<div class="flex flex-col gap-4">
			<Heading tag="h5" color="text-neutral-700">システム説明</Heading>
			<P color="text-black">{descriptionText}</P>
		</div>
		<div class="flex flex-col gap-4">
			<Heading tag="h5" color="text-neutral-700">要求分析</Heading>
			<P color="text-black">{requirementsText}</P>
		</div>
	</div>

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
	{/if}
</div>
