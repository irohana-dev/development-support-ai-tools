import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import z from 'zod';

import { PUBLIC_OPENAI_API_KEY } from '$env/static/public';

import { convert } from '$lib/table-data/convertToZod';
import type { ColumnDefinition, ColumnValue } from '$lib/table-data/types';

const client = new OpenAI({ apiKey: PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

// 'gpt-4o-mini' or 'gpt-4o-2024-08-06'
const model = 'gpt-4o-2024-08-06';
const costFor1MReadToken = 2.5;
const costFor1MCompToken = 10.0;
const top_p = 0.5; // 0~2

// 要件定義AI
const zRequestDefinitionType = z.enum(['functional', 'non-functional', 'note', 'example-code']);
const zRequestDefinitionItem = z.object({
	type: zRequestDefinitionType,
	ja: z.string({ description: 'in japanese' }),
	en: z.string({ description: 'in english' })
});
const zRequestDefinition = z.object({
	category: z.string(),
	items: z.array(zRequestDefinitionItem)
});
const zTranslatedRequestDefinitions = z.object({
	summary: z.string({ description: 'Summarize requirements analysis in japanese' }),
	requirementDefinitions: z.array(zRequestDefinition)
});
export type RequestDefinitionItem = z.infer<typeof zRequestDefinitionItem>;
export type RequestDefinition = z.infer<typeof zRequestDefinition>;
export type TranslatedRequestDefinitions = z.infer<typeof zTranslatedRequestDefinitions>;
export type TranslateResults = {
	definitions: TranslatedRequestDefinitions | null;
	price: number;
};

export async function translateRequirementsToDefinitions(
	systemDesc: string,
	request: string
): Promise<TranslateResults> {
	const completion = await client.beta.chat.completions.parse({
		model,
		messages: [
			{
				role: 'system',
				content: `以下システムに対して、要求に基づき要件定義してください。\nシステムの解説:\n${systemDesc}`
			},
			{ role: 'user', content: request }
		],
		response_format: zodResponseFormat(zTranslatedRequestDefinitions, 'definitions'),
		top_p
	});
	return {
		definitions: completion.choices[0].message.parsed,
		price:
			(costFor1MReadToken * (completion.usage?.prompt_tokens ?? 0)) / 1_000_000 +
			(costFor1MCompToken * (completion.usage?.completion_tokens ?? 0)) / 1_000_000
	};
}

// テーブルデータ生成AI
export type TableDataRow = { [key: string]: ColumnValue };
export type TableDataResult = {
	table: { summary: string; data: TableDataRow[] } | null;
	price: number;
};

export async function generateTableData(definitions: ColumnDefinition[], request: string): Promise<TableDataResult> {
	const zQueryTableData = z.object({
		summary: z.string({ description: 'Summarize data info in Japanese' }),
		data: z.array(convert(definitions))
	});
	const completion = await client.beta.chat.completions.parse({
		model,
		messages: [
			{
				role: 'system',
				content: `Please generate mock data based on requirements.`
			},
			{ role: 'user', content: request }
		],
		response_format: zodResponseFormat(zQueryTableData, 'table'),
		top_p
	});
	return {
		table: completion.choices[0].message.parsed as { summary: string; data: TableDataRow[] } | null,
		price:
			(costFor1MReadToken * (completion.usage?.prompt_tokens ?? 0)) / 1_000_000 +
			(costFor1MCompToken * (completion.usage?.completion_tokens ?? 0)) / 1_000_000
	};
}
