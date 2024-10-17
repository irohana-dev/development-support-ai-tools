<script lang="ts">
	import { Textarea, Button, Heading, Alert, Label, Card, P } from 'flowbite-svelte';

	import Presets from '$lib/components/Presets.svelte';
	import { generateTableData, type TableDataResult } from '$lib/gpt';
	import type { ColumnDefinition, Config } from '$lib/table-data/types';
	import DataViewer from '$lib/table-data/DataViewer.svelte';
	import DefinitionTable from '$lib/table-data/DefinitionTable.svelte';
	import Preview from '$lib/table-data/Preview.svelte';

	const USDJPY = 145.0; // 2024年の相場観より

	type RequestData = { defs: ColumnDefinition[]; properties: Config; prompt: string };
	const initialRequestData: RequestData = {
		defs: [
			{ key: 'name', type: 'fullname', description: 'In alphabet', required: true, split: true },
			{ key: 'address', type: 'address', description: 'Country name in Japanese', required: true, split: true },
			{ key: 'gender', type: 'gender', description: '', required: true },
			{ key: 'birthday', type: 'date', description: '', required: true },
			{ key: 'loginTime', type: 'time', description: 'If already logged-in, or null', required: false },
			{ key: 'countOfLogin', type: 'integer', description: 'If already logged-in, or null', required: false }
		],
		properties: { dateOrder: 'YMD', dateSeparator: '-', timeSeparator: ':' },
		prompt: 'グローバルなWebサイトにおけるDBのユーザーテーブルです。5名分のモックデータを作成してください。'
	};

	let requestData: RequestData = {
		defs: [],
		properties: { dateOrder: 'YMD', dateSeparator: '-', timeSeparator: ':' },
		prompt: ''
	};
	let processedRequestData: RequestData = {
		defs: [],
		properties: { dateOrder: 'YMD', dateSeparator: '', timeSeparator: '' },
		prompt: ''
	};

	let results: TableDataResult = {
		info: null,
		results: [{ summary: 'ここに生成結果の要約とテーブルデータが出力されます。', data: [] }],
		price: 0
	};

	let processing = false;
	let error = '';

	async function translate() {
		if (processing) return;
		processing = true;
		results = await generateTableData(requestData.defs, requestData.prompt);
		if (!results) {
			processing = false;
			error = 'AIの推論処理に失敗しました。APIキーなど設定を確認ください。';
			return;
		}
		processedRequestData = JSON.parse(JSON.stringify(requestData));
		processing = false;
	}
</script>

<div class="container m-auto flex max-w-5xl flex-col gap-8 py-6">
	<Heading tag="h2" class="print:text-gray-800">テーブルデータ生成AI</Heading>
	<Card size="xl" class="gap-4 print:border-gray-300 print:bg-white">
		<Presets
			storageKey="TestDataColumnsDefinition"
			bind:data={requestData}
			initPresetData={initialRequestData}
			initPresetName="デフォルト"
		/>
		<form on:submit|preventDefault={translate} class="flex flex-col gap-4 print:hidden">
			<Label>テーブルデータの項目定義</Label>
			<DefinitionTable bind:data={requestData.defs} bind:properties={requestData.properties} />

			<Label>出力イメージ（表形式の確認用）</Label>
			<Preview definitions={requestData.defs} properties={requestData.properties} />

			<Label for="requirements">生成するデータの要件（件数や条件など）</Label>
			<Textarea bind:value={requestData.prompt} id="requirements">
				<div slot="footer" class="flex items-center justify-between">
					<div class="flex flex-row items-center gap-4">
						<Button type="submit" disabled={processing}>テーブルデータを生成</Button>
						{#if results.price > 0}
							<P size="sm" italic>Charged ${results.price.toFixed(3)} ({(results.price * USDJPY).toFixed(1)}円)</P>
						{/if}
					</div>
					<P size="sm">※生成には10秒前後かかります。生成件数が多いほど時間がかかります。</P>
				</div>
			</Textarea>
			{#if error}
				<Alert>{error}</Alert>
			{/if}
		</form>
		<div class="hidden flex-col gap-6 print:flex">
			<div class="flex flex-col gap-4">
				<Heading tag="h5" color="text-neutral-700">生成するデータの要件（件数や条件など）</Heading>
				<P color="text-black">{requestData.prompt}</P>
			</div>
		</div>
	</Card>

	<Heading tag="h3" class="break-after-avoid-page print:text-gray-800">出力結果</Heading>
	{#if processing}
		<Alert type="info" class="py-12">
			データを生成中です。しばらくお待ちください..<br />
			※AI推論による生成のため、データ量が多いと数十秒かかる場合もあります。
		</Alert>
	{:else}
		{#if results.info}
			<Alert type="info">
				{#each results.info.split('\n') as line}
					{line}<br />
				{/each}
			</Alert>
		{/if}
		{#each results.results as result}
			<Card size="xl" class="break-inside-avoid-page gap-4 print:border-gray-300 print:bg-white">
				<P class="print:text-black">
					{#each result.summary.split('\n') as line}
						{line}<br />
					{/each}
				</P>
				<DataViewer
					definitions={processedRequestData.defs}
					properties={processedRequestData.properties}
					items={result.data}
				/>
				<div class="flex flex-row justify-end">
					<Button size="sm" disabled={result.data.length === 0}>CSVエクスポート (WIP)</Button>
				</div>
			</Card>
		{/each}
	{/if}
</div>
