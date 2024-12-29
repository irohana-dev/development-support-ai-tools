<script lang="ts">
	import { Card, Heading } from 'flowbite-svelte';

	const links = [
		{
			name: 'カスタム翻訳AI',
			description: '任意の用語や知識を与えることでカスタマイズ可能なAI翻訳です。',
			href: '/translation',
			img: '/translation.svg'
		},
		{
			name: '要件定義AI',
			description: 'プロジェクトの要件を分析し、明確にするためのAIツールです。',
			href: '/req-analysis',
			img: '/zoom.svg'
		},
		{
			name: 'テーブルデータ生成AI',
			description: 'テーブルデータを自動生成するためのAIツールです。',
			href: '/tabledata',
			img: '/spreadsheet.svg'
		}
	];
</script>

<div class="container m-auto flex max-w-5xl flex-col gap-8 py-6">
	<Heading tag="h2" class="print:text-gray-800">開発支援のためのAIツール群</Heading>

	<div class="flex flex-row justify-between gap-8">
		<div class="flex flex-col gap-4">
			{#each links as { name, description, href, img }}
				<Card size="lg" horizontal {href} class="gap-4 print:border-gray-300 print:bg-white">
					<div class="rounded-lg bg-white p-8">
						<img src={img} alt={name} class="h-24 w-24" />
					</div>
					<div class="flex flex-col gap-2">
						<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
							{name}
						</h5>
						<p class="mb-3 font-normal leading-tight text-gray-700 dark:text-gray-400">
							{description}
						</p>
					</div>
				</Card>
			{/each}
		</div>
		<div class="flex w-1/4 flex-col gap-4">
			<h3 class="text-lg font-bold text-primary-600">ご利用上の補足事項</h3>
			<p class="md-2">使用するAIモデルはナビバー（右上）のバージョン情報から変更できます。</p>
			<p class="md-2">
				各AIには処理後にトークン数に基づく発生コストを算出しているため、必要に応じて参考ください。
				ただし、OpenAIの最新の料金プランに準じるため、正確な請求額は料金プランまたはAPIのダッシュボードよりご確認ください。
			</p>
		</div>
	</div>
</div>
