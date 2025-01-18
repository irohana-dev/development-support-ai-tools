<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Checkbox,
		Textarea,
		Button,
		Heading,
		Alert,
		Label,
		Card,
		P,
		Spinner
	} from 'flowbite-svelte';

	import Presets from '$lib/components/Presets.svelte';
	import {
		generateTableData,
		type TableDataResult,
		type TableDataRow
	} from '$lib/table-data/generator';
	import type { ColumnDefinition, Config } from '$lib/table-data/types';
	import DataViewer from '$lib/table-data/DataViewer.svelte';
	import DefinitionTable from '$lib/table-data/DefinitionTable.svelte';
	import Preview from '$lib/table-data/Preview.svelte';
	import { convertColumnKey, convertColumnValue } from '$lib/table-data/convertToZod';

	type RequestData = { defs: ColumnDefinition[]; properties: Config; prompt: string };
	const initialRequestData: RequestData = {
		defs: [
			{
				key: 'name',
				type: 'fullname',
				description: 'Latin-style names in katakana',
				required: true,
				split: true
			},
			{
				key: 'address',
				type: 'address',
				description: 'Original nationality and address that does not exist on earth.',
				required: true,
				split: true
			},
			{ key: 'gender', type: 'gender', description: '', required: true },
			{
				key: 'birthday',
				type: 'date',
				description:
					'The world time in this world is 250 years, a year rotates in 6 months, and a month rotates in 20 days.',
				required: true,
				split: false
			},
			{
				key: 'loginTime',
				type: 'time',
				description: 'If already logged-in, or null',
				required: false,
				split: false
			},
			{
				key: 'countOfLogin',
				type: 'integer',
				description: 'If already logged-in, or null',
				required: false
			}
		],
		properties: { dateOrder: 'YMD', dateSeparator: '-', timeSeparator: ':' },
		prompt: 'DB user table in a virtual world of my making game. Create mock data for 5 users.'
	};

	let requestData: RequestData = {
		defs: [],
		properties: { dateOrder: 'YMD', dateSeparator: '-', timeSeparator: ':' },
		prompt: ''
	};
	let processedRequestData: RequestData = initialRequestData;

	let result: TableDataResult = {
		table: {
			summary: 'ここに生成結果の要約とテーブルデータが出力されます。サマリーは常に日本語です。',
			data: []
		},
		price: 0
	};

	let streaming = false;
	let processing = false;
	let error = '';

	async function generate() {
		if (processing) return;
		processing = true;
		error = '';
		try {
			result = { table: { summary: '', data: [] }, price: 0 };
			processedRequestData = JSON.parse(JSON.stringify(requestData));
			const newResult = await generateTableData(
				requestData.defs,
				requestData.prompt,
				// ストリーミングはMSWのmockなし
				streaming ? (table) => (result.table = table) : undefined
			);
			if (!newResult) {
				processing = false;
				error = 'AIの推論処理に失敗しました。APIキーなど設定を確認ください。';
				return;
			}
			result = newResult;
		} catch (e: unknown) {
			error = (e as Error).toString();
			console.error(e);
		} finally {
			processing = false;
		}
	}

	/**
	 * Excel等で開くことが可能なUTF-8 (BOM付き)でCSVダウンロードする
	 * @param data 対象のテーブルデータ
	 */
	function downloadCSV(data: TableDataRow[]) {
		if (!data || data.length <= 0 || processing) return;
		function convertValue(value: string) {
			if (value === 'TRUE' || value === 'FALSE') return value;
			return `"${value.replaceAll('"', '""')}"`;
		}
		const csv = [
			processedRequestData.defs
				.flatMap((d) => convertColumnKey(d.type, d.key, d.split))
				.map(convertValue)
				.join(','),
			...data.map((row) =>
				processedRequestData.defs
					.flatMap((d) => convertColumnValue(d, row[d.key], processedRequestData.properties, true))
					.map(convertValue)
					.join(',')
			)
		].join('\n');
		const a = document.createElement('a');
		const withBom = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], { type: 'text/css' });
		a.href = URL.createObjectURL(withBom);
		a.download = `tabledata_${data.length}.csv`;
		a.click();
	}

	onMount(() => {
		if (!window.__msw) streaming = true;
	});
</script>

<div class="container m-auto flex max-w-5xl flex-col gap-8 py-6">
	<Heading tag="h2" class="print:text-gray-800">テーブルデータ生成AI</Heading>
	<Card size="xl" class="gap-4 print:border-gray-300 print:bg-white">
		<Presets
			storageKey="TableDataPreset"
			bind:data={requestData}
			initPresetData={initialRequestData}
			initPresetName="デフォルト"
		/>
		<form on:submit|preventDefault={generate} class="flex flex-col gap-4 print:hidden">
			<Label>テーブルデータの項目定義</Label>
			<DefinitionTable bind:data={requestData.defs} bind:properties={requestData.properties} />

			<Label>出力イメージ（表形式の確認用）</Label>
			<Preview definitions={requestData.defs} properties={requestData.properties} />

			<Label for="requirements">生成するデータの要件（件数や条件など）</Label>
			<Textarea bind:value={requestData.prompt} id="requirements">
				<div slot="footer" class="flex items-center justify-between">
					<div class="flex flex-row items-center gap-4">
						<Button type="submit" disabled={processing}>テーブルデータを生成</Button>
						{#if result.price > 0}
							<P size="sm" italic>Charged ${result.price.toFixed(4)}</P>
						{/if}
					</div>
					<P size="sm">※項目数により、多くの場合は1件あたり1秒以上かかります。</P>
				</div>
			</Textarea>
			<Checkbox bind:checked={streaming}>生成結果をストリーミング表示する</Checkbox>
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
	<Card size="xl" class="break-inside-avoid-page gap-4 print:border-gray-300 print:bg-white">
		<P class="print:text-black">
			{#each (result.table?.summary ?? '').split('\n') as line}
				{line}<br />
			{/each}
		</P>
		<DataViewer
			definitions={processedRequestData.defs}
			properties={processedRequestData.properties}
			items={result.table?.data || []}
		/>
		{#if processing}
			<Alert color="yellow">
				<Spinner />
				データを生成中です。しばらくお待ちください..
			</Alert>
		{:else}
			<div class="flex flex-row justify-end">
				<Button
					size="sm"
					disabled={!result.table || result.table.data.length === 0}
					on:click={() => downloadCSV(result.table!.data)}>CSVエクスポート</Button
				>
			</div>
		{/if}
	</Card>
</div>
