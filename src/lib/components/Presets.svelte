<script lang="ts">
	import { Button, Input, Select } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	type Preset = {
		name: string;
		value: string;
		data: Object;
	};
	let presets: Preset[] = [];

	/**
	 * 現在選択されているプリセット名。
	 * 初期プリセットを設定できます。動的に変更しないでください。
	 */
	export let selected: string = '';
	$: selectedIndex = selected ? presets.findIndex((p) => p.value === selected) : -1;
	$: selectedPreset = selectedIndex >= 0 ? presets[selectedIndex] : null;
	$: hasEdited = selectedPreset ? JSON.stringify(selectedPreset.data) !== JSON.stringify(data) : true;

	let newName: string = '';
	$: hasNameError = !selected && (newName.trim() === '' || presets.find((p) => p.value === newName) ? true : false);

	export let storageKey: string = '';

	/**
	 * JSONで表現可能な辞書型オブジェクトデータ。
	 * 入出力が生じるため、bindして使うこと。
	 */
	export let data: Object;

	/**
	 * 初期値のプリセット名。
	 * LocalStorageに該当プリセット名がある場合は自動で読み取られる。
	 * ない場合はこのプリセット名で初期登録された状態で開始する。
	 */
	export let initPresetName: string = 'Default';
	/**
	 * LocalStorageにデータがない場合の初期値。
	 */
	export let initPresetData: Object | undefined = undefined;

	/**
	 * JSONで表現可能な辞書型データをDeep copyする。
	 */
	function duplicate(original: Object) {
		return JSON.parse(JSON.stringify(original));
	}

	/**
	 * プリセットを上書きor新規保存する。
	 */
	function savePreset() {
		const dupData = duplicate(data);
		if (selectedPreset) {
			// overwrite
			selectedPreset!.data = dupData;
			presets = presets;
		} else {
			// create preset
			presets.push({ name: newName, value: newName, data: dupData });
			presets = presets;
			selected = newName;
			newName = '';
		}

		// TODO: IndexedDBに置き換えたい
		if (storageKey) localStorage.setItem(storageKey, JSON.stringify(presets));
	}

	/**
	 * プリセットを削除する。
	 */
	function removePreset() {
		if (!selectedPreset) return;
		if (!confirm('本当に削除してよろしいですか？')) return;

		presets.splice(selectedIndex, 1);
		presets = presets;
		selected = '';

		if (storageKey) localStorage.setItem(storageKey, JSON.stringify(presets));
	}

	/**
	 * プリセットを変更してデータを読み込む。
	 */
	function changePreset() {
		if (!selectedPreset) return;

		// update data for parent component
		data = duplicate(selectedPreset.data);
		newName = '';
	}

	/**
	 * 新しいプリセットの登録モードに変える。
	 */
	function changeNewPresetState() {
		selected = '';
	}

	onMount(() => {
		// プリセットの初期化処理
		if (storageKey) {
			const jsonData = localStorage.getItem(storageKey);
			if (jsonData) presets = JSON.parse(jsonData);
		}
		if (presets.length > 0) {
			selected = presets[0].value;
			data = duplicate(presets[0].data);
		} else {
			presets = [{ name: initPresetName, value: initPresetName, data: duplicate(initPresetData!) }];
			data = duplicate(initPresetData!);
			selected = initPresetName;
		}
	});
</script>

<div class="border-1 flex w-fit flex-row items-center gap-2 rounded bg-slate-400 p-2 shadow-md dark:bg-slate-900">
	<div class="text-center text-sm font-bold text-white drop-shadow-md">PRESET</div>
	<Select items={presets} bind:value={selected} placeholder="プリセットを選択" on:change={changePreset} />
	<Input
		type="text"
		bind:value={newName}
		on:change={changeNewPresetState}
		color={hasNameError ? 'red' : 'base'}
		placeholder="新規のプリセット名"
	/>
	<Button class="text-nowrap" color="blue" on:click={savePreset} disabled={hasNameError || !hasEdited}>保存</Button>
	<Button class="text-nowrap" color="red" on:click={removePreset} disabled={selectedPreset ? false : true}>×</Button>
</div>
