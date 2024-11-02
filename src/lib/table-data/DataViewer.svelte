<script lang="ts">
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import type { ColumnDefinition, ColumnValue, Config } from './types';
	import { convertColumnKey, convertColumnValue } from './convertToZod';

	export let definitions: ColumnDefinition[];
	export let properties: Config = { dateOrder: 'YMD', dateSeparator: '-', timeSeparator: ':' };
	export let items: { [k: string]: ColumnValue }[];
</script>

<Table
	divClass="border border-gray-200 dark:border-gray-500 overflow-x-auto relative sm:rounded-lg"
	hoverable
>
	<TableHead>
		{#each definitions as def}
			{#each convertColumnKey(def.type, def.key, def.split) as key}
				<TableHeadCell class="normal-case">{key}</TableHeadCell>
			{/each}
		{/each}
	</TableHead>
	<TableBody>
		{#each items as row}
			<TableBodyRow>
				{#each definitions as def}
					{#each row && convertColumnValue(def, row[def.key], properties) as value}
						<TableBodyCell>
							{#if def.type === 'enum'}
								{def.description?.split(/\s*,\s*/)[0]}
							{:else}
								{#each value.split('\n') as line}
									{line}<br />
								{/each}
							{/if}
						</TableBodyCell>
					{/each}
				{/each}
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>
