<script lang="ts">
	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import type { ColumnDefinition, ColumnValue, Config, ValueTypes } from './types';
	import { convertColumnKey, convertColumnValue } from './convertToZod';

	const examples: { [type in ValueTypes]: ColumnValue } = {
		text: 'Lorem ipsum..',
		number: 12345.6,
		integer: 1234,
		boolean: true,
		enum: 'First',
		fullname: { first: 'Kerry', middle: 'T.', last: 'Andrew' },
		date: { year: 2000, month: 1, day: 1 },
		time: { hour: 12, minute: 30, second: 0 },
		address: { country: 'United State', address: '1234 ABC STREET #450 Seattle WA', zipCode: '12345' },
		address_jp: { zipCode: '123-4567', prefecture: '東京都', municipality: '千代田区', others: '丸の内1-2-3' },
		gender: 'male'
	};

	export let definitions: ColumnDefinition[];
	export let properties: Config = { dateOrder: 'YMD', dateSeparator: '-', timeSeparator: ':' };
</script>

<Table divClass="border border-gray-200 dark:border-gray-500 overflow-x-auto relative sm:rounded-lg">
	<TableHead>
		{#each definitions as def}
			{#each convertColumnKey(def.type, def.key, def.split) as key}
				<TableHeadCell class="normal-case">{key}</TableHeadCell>
			{/each}
		{/each}
	</TableHead>
	<TableBody>
		<TableBodyRow>
			{#each definitions as def}
				{#each convertColumnValue(def.type, examples[def.type], def.split, properties) as value}
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
	</TableBody>
</Table>
