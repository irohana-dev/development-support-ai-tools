<script lang="ts">
	import {
		A,
		Button,
		Input,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import type { WordDefinition, Config } from './types';

	export let data: WordDefinition[] = [{ category: '', ja: '', en: '' }];
	// svelte-ignore export_let_unused
	export let properties: Config = {};

	function addWord() {
		data.push({ category: '', ja: '', en: '' });
		data = data;
	}

	function removeWord(index: number) {
		data.splice(index, 1);
		data = data;
	}
</script>

<Table
	divClass="border border-gray-200 dark:border-gray-500 overflow-x-auto relative sm:rounded-lg"
>
	<TableHead>
		<!-- TODO: 並び替え -->
		<TableHeadCell class="whitespace-nowrap">カテゴリー</TableHeadCell>
		<TableHeadCell class="whitespace-nowrap">日本語名</TableHeadCell>
		<TableHeadCell class="whitespace-nowrap">英語名</TableHeadCell>
		<TableHeadCell class="whitespace-nowrap">操作</TableHeadCell>
	</TableHead>
	<TableBody>
		{#each data as row, i}
			<TableBodyRow>
				<TableBodyCell>
					<Input class="w-40" type="text" bind:value={row.category} />
				</TableBodyCell>
				<TableBodyCell>
					<Input class="w-72" type="text" bind:value={row.ja} />
				</TableBodyCell>
				<TableBodyCell>
					<Input class="w-72" type="text" bind:value={row.en} />
				</TableBodyCell>
				<TableBodyCell>
					{#if i > 0}
						<A on:click={() => removeWord(i)}>削除</A>
					{:else}
						<div class="text-gray-300">削除</div>
					{/if}
				</TableBodyCell>
			</TableBodyRow>
		{/each}
		<TableBodyRow class="bg-gray-50 dark:bg-gray-600">
			<TableBodyCell colspan={6}>
				<div class="flex flex-row justify-between">
					<Button size="sm" on:click={addWord}>新しい用語を追加</Button>
					<div class="flex flex-row items-center gap-2"></div>
				</div>
			</TableBodyCell>
		</TableBodyRow>
	</TableBody>
</Table>
