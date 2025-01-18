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
	import { translate, type TranslationResult } from '$lib/translation/translator';
	import type { WordDefinition, Config } from '$lib/translation/types';
	import WordTable from '$lib/translation/WordTable.svelte';

	type RequestData = { defs: WordDefinition[]; properties: Config; prompt: string };
	const initialRequestData: RequestData = {
		defs: [
			{
				category: '当社名',
				ja: 'サンプル株式会社',
				en: 'Example Inc.'
			},
			{
				category: 'ユーザーの職業',
				ja: 'Webエンジニア',
				en: 'SE(Web)'
			}
		],
		properties: {},
		prompt: 'Translate the comment that requests the next bug fix into 3 pattern English.'
	};

	let requestData: RequestData = {
		defs: [],
		properties: { dateOrder: 'YMD', dateSeparator: '-', timeSeparator: ':' },
		prompt: ''
	};
	let processedRequestData: RequestData = initialRequestData;
	let sourceText = 'XXXのinputを空欄にするとエラーが出るため修正してください';

	let result: TranslationResult = {
		translated: {
			summary: 'ここに翻訳観点の要点が示され、この下に翻訳結果が出力されます。',
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
		try {
			result = { translated: { summary: '', data: [] }, price: 0 };
			const newResult = await translate(
				requestData.defs,
				requestData.prompt,
				sourceText,
				// ストリーミングはMSWのmockなし
				streaming ? (table) => (result.translated = table) : undefined
			);
			if (!newResult) {
				processing = false;
				error = 'AIの推論処理に失敗しました。APIキーなど設定を確認ください。';
				return;
			}
			processedRequestData = JSON.parse(JSON.stringify(requestData));
			result = newResult;
		} catch (e: unknown) {
			error = (e as Error).toString();
		} finally {
			processing = false;
		}
	}

	onMount(() => {
		if (!window.__msw) streaming = true;
	});
</script>

<div class="container m-auto flex max-w-5xl flex-col gap-8 py-6">
	<Heading tag="h2" class="print:text-gray-800">カスタム翻訳AI</Heading>
	<Card size="xl" class="gap-4 print:border-gray-300 print:bg-white">
		<Presets
			storageKey="TranslationPreset"
			bind:data={requestData}
			initPresetData={initialRequestData}
			initPresetName="デフォルト"
		/>
		<form on:submit|preventDefault={generate} class="flex flex-col gap-4 print:hidden">
			<Label>用語定義（ドメイン知識の付与）</Label>
			<WordTable bind:data={requestData.defs} bind:properties={requestData.properties} />

			<Label for="instruction">翻訳指示文（英語推奨）</Label>
			<Textarea bind:value={requestData.prompt} id="instruction" />
			<hr class="border-gray-700" />
			<Label for="sourceText">原文（プリセット対象外）</Label>
			<Textarea bind:value={sourceText} id="sourceText" rows={4}>
				<div slot="footer" class="flex items-center justify-between">
					<div class="flex flex-row items-center gap-4">
						<Button type="submit" disabled={processing}>翻訳</Button>
						{#if result.price > 0}
							<P size="sm" italic>Charged ${result.price.toFixed(4)}</P>
						{/if}
					</div>
					<P size="sm">※項目数により、多くの場合は1件あたり1秒以上かかります。</P>
				</div>
			</Textarea>
			<Checkbox bind:checked={streaming}>翻訳結果をストリーミング表示する</Checkbox>
			{#if error}
				<Alert>{error}</Alert>
			{/if}
		</form>
		<div class="hidden flex-col gap-6 print:flex">
			<div class="flex flex-col gap-4">
				<Heading tag="h5" color="text-neutral-700">翻訳指示文とテキスト</Heading>
				<P color="text-black">{requestData.prompt}</P>
			</div>
		</div>
	</Card>

	<Heading tag="h3" class="break-after-avoid-page print:text-gray-800">出力結果</Heading>
	<Card size="xl" class="break-inside-avoid-page gap-4 print:border-gray-300 print:bg-white">
		<P class="print:text-black">
			<div class="font-bold">翻訳要点：</div>
			{#each (result.translated?.summary ?? '出力結果がありません').split('\n') as line}
				{line}<br />
			{/each}
		</P>
		{#each result.translated?.data ?? [] as pattern, i}
			<P
				class="overflow-hidden rounded border border-gray-300 bg-gray-50 dark:bg-gray-900 print:border-gray-300 print:bg-white print:text-black"
			>
				<div class="w-32 rounded-br bg-gray-700 p-1 text-center text-xs text-gray-300">
					TRANSLATION #{i + 1}
				</div>
				<div class="px-2 py-4 text-blue-900 dark:text-blue-200">
					{#each pattern.en.split('\n') as line}
						{line}<br />
					{/each}
				</div>
				<hr class="border-gray-700 dark:border-gray-700" />
				{#if pattern.nuance}
					<hr class="border-gray-700 dark:border-gray-700" />
					<div class="p-2 text-xs text-gray-800 dark:text-gray-300">
						{#each pattern.nuance.split('\n') as line}
							{line}<br />
						{/each}
					</div>
				{/if}
			</P>
		{/each}
		{#if processing}
			<Alert color="yellow">
				<Spinner />
				データを生成中です。しばらくお待ちください..
			</Alert>
		{/if}
	</Card>
</div>
