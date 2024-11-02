<script lang="ts">
	import {
		A,
		Button,
		Checkbox,
		Label,
		Input,
		P,
		Select,
		type SelectOptionType,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import type { ColumnDefinition, Config, ValueTypes } from './types';

	const valueTypes: SelectOptionType<ValueTypes | ''>[] = [
		{ value: '', name: '-- Primitive types --', disabled: true },
		{ value: 'text', name: 'Any Text' },
		{ value: 'number', name: 'Number' },
		{ value: 'integer', name: 'Integer Number' },
		{ value: 'boolean', name: 'Boolean (Yes or No)' },
		{ value: 'enum', name: 'Select' },
		{ value: '', name: '-- Extended types --', disabled: true },
		{ value: 'fullname', name: 'Fullname (First/Middle/Last)' },
		{ value: 'gender', name: 'Gender (Male or Female)' },
		{ value: 'date', name: 'Date' },
		{ value: 'time', name: 'Time' },
		{ value: 'address', name: 'Global Address' },
		{ value: 'address_jp', name: 'JP Detail Address' }
	];
	const splitTypes = ['fullname', 'date', 'time', 'address', 'address_jp'];

	const dateOrders = [
		{ value: 'DMY', name: 'DMY (Universal)' },
		{ value: 'YMD', name: 'YMD (Asia)' },
		{ value: 'MDY', name: 'MDY (Some US island)' }
	];
	const separators = [
		{ value: 'none', name: '(none)' },
		{ value: '-', name: '-' },
		{ value: '/', name: '/' },
		{ value: ':', name: ':' }
	];

	export let data: ColumnDefinition[] = [
		{ key: '', type: 'text', description: '', required: true }
	];
	export let properties: Config = { dateOrder: 'YMD', dateSeparator: '-', timeSeparator: ':' };

	function addKey() {
		data.push({ key: '', type: 'text', description: '', required: true });
		data = data;
	}

	function removeKey(index: number) {
		data.splice(index, 1);
		data = data;
	}

	function changeType(index: number) {
		if (!splitTypes.includes(data[index].key)) delete data[index].split;
	}
</script>

<Table
	divClass="border border-gray-200 dark:border-gray-500 overflow-x-auto relative sm:rounded-lg"
>
	<TableHead>
		<TableHeadCell class="whitespace-nowrap">項目名</TableHeadCell>
		<TableHeadCell class="whitespace-nowrap">データ型</TableHeadCell>
		<TableHeadCell class="whitespace-nowrap">分割</TableHeadCell>
		<TableHeadCell class="whitespace-nowrap">必須</TableHeadCell>
		<TableHeadCell class="whitespace-nowrap">追加説明</TableHeadCell>
		<TableHeadCell class="whitespace-nowrap">操作</TableHeadCell>
	</TableHead>
	<TableBody>
		{#each data as row, i}
			<TableBodyRow>
				<TableBodyCell>
					<Input class="w-40" type="text" pattern="^[0-9A-Za-z_]+$" bind:value={row.key} />
				</TableBodyCell>
				<TableBodyCell>
					<Select
						items={valueTypes}
						bind:value={row.type}
						placeholder="Value type"
						on:change={() => changeType(i)}
					/>
				</TableBodyCell>
				<TableBodyCell>
					{#if splitTypes.includes(row.type)}
						<Checkbox bind:checked={row.split} />
					{/if}
				</TableBodyCell>
				<TableBodyCell>
					<Checkbox bind:checked={row.required} />
				</TableBodyCell>
				<TableBodyCell>
					{#if row.type === 'enum'}
						<P size="sm" class="text-orange-600">半角カンマ区切りで選択肢を記入ください</P>
					{/if}
					<Input
						type="text"
						bind:value={row.description}
						required={row.type === 'enum'}
						class={row.type === 'enum' && !row.description
							? 'w-52 border-red-600 bg-red-200'
							: 'w-60'}
					/>
				</TableBodyCell>
				<TableBodyCell>
					{#if i > 0}
						<A on:click={() => removeKey(i)}>削除</A>
					{:else}
						<div class="text-gray-300">削除</div>
					{/if}
				</TableBodyCell>
			</TableBodyRow>
		{/each}
		<TableBodyRow>
			<TableBodyCell colspan={6}>
				<div class="flex flex-row justify-between">
					<Button size="sm" on:click={addKey}>Add new key</Button>
					<div class="flex flex-row items-center gap-2">
						<Label>Date:</Label>
						<Select size="sm" class="w-40" items={dateOrders} bind:value={properties.dateOrder} />
						<Select
							size="sm"
							class="w-24"
							items={separators}
							bind:value={properties.dateSeparator}
						/>
						<Label>Time:</Label>
						<Select
							size="sm"
							class="w-24"
							items={separators}
							bind:value={properties.timeSeparator}
						/>
					</div>
				</div>
			</TableBodyCell>
		</TableBodyRow>
	</TableBody>
</Table>
