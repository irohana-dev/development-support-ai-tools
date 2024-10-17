import OpenAI from 'openai';
import { zodFunction } from 'openai/helpers/zod.mjs';
import z from 'zod';

import { PUBLIC_OPENAI_API_KEY } from '$env/static/public';

import { convert } from '$lib/table-data/convertToZod';
import type { ColumnDefinition, ColumnValue } from '$lib/table-data/types';

const client = new OpenAI({ apiKey: PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
const model = 'gpt-4o-2024-08-06';
const costFor1MReadToken = 2.5;
const costFor1MCompToken = 10.0;
const top_p = 0.5; // 0~2

// 要件定義AI
const RequestDefinitionType = z.enum(['functional', 'non-functional', 'note', 'example-code']);
const RequestDefinition = z.object({
	type: RequestDefinitionType,
	ja: z.string({ description: 'in japanese' }),
	en: z.string({ description: 'in english' })
});
const QueryTranslateRequestDefinitions = z.object({
	summary: z.string({ description: 'Summarize requirements analysis in japanese' }),
	requirementDefinitions: z.array(RequestDefinition)
});
export type TranslatedRequestDefinitions = {
	summary: string;
	requirementDefinitions: {
		type: 'functional' | 'non-functional' | 'note' | 'example-code';
		ja: string;
		en: string;
	}[];
};
export type TranslateResults = {
	info: string | null;
	results: TranslatedRequestDefinitions[];
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
		tools: [zodFunction({ name: 'query', parameters: QueryTranslateRequestDefinitions })],
		top_p
	});
	return {
		info: completion.choices[0].message.content,
		results: completion.choices[0].message.tool_calls.map(
			(call) => call.function.parsed_arguments as TranslatedRequestDefinitions
		),
		price:
			(costFor1MReadToken * (completion.usage?.prompt_tokens ?? 0)) / 1_000_000 +
			(costFor1MCompToken * (completion.usage?.completion_tokens ?? 0)) / 1_000_000
	};
}

// テーブルデータ生成AI
export type TableDataResult = {
	info: string | null;
	results: {
		summary: string;
		data: { [key: string]: ColumnValue }[];
	}[];
	price: number;
};
export async function generateTableData(definitions: ColumnDefinition[], request: string): Promise<TableDataResult> {
	const QueryTableData = z.object({
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
		tools: [zodFunction({ name: 'query', parameters: QueryTableData })],
		top_p
	});
	return {
		info: completion.choices[0].message.content,
		results: completion.choices[0].message.tool_calls.map(
			(call) => call.function.parsed_arguments as { summary: string; data: { [key: string]: ColumnValue }[] }
		),
		price:
			(costFor1MReadToken * (completion.usage?.prompt_tokens ?? 0)) / 1_000_000 +
			(costFor1MCompToken * (completion.usage?.completion_tokens ?? 0)) / 1_000_000
	};
}
