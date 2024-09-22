import OpenAI from 'openai';
import z from 'zod';
import { zodFunction } from 'openai/helpers/zod.mjs';

import { PUBLIC_OPENAI_API_KEY } from '$env/static/public';

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

const client = new OpenAI({ apiKey: PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

export async function translateRequirementsToDefinitions(
	systemDesc: string,
	request: string
): Promise<TranslateResults> {
	const completion = await client.beta.chat.completions.parse({
		model: 'gpt-4o-2024-08-06',
		messages: [
			{
				role: 'system',
				content: `以下システムに対して、要求に基づき要件定義してください。\nシステムの解説:\n${systemDesc}`
			},
			{ role: 'user', content: request }
		],
		tools: [zodFunction({ name: 'query', parameters: QueryTranslateRequestDefinitions })],
		top_p: 0.5
	});
	return {
		info: completion.choices[0].message.content,
		results: completion.choices[0].message.tool_calls.map(
			(call) => call.function.parsed_arguments as TranslatedRequestDefinitions
		),
		price:
			(2.5 * (completion.usage?.prompt_tokens ?? 0)) / 1_000_000 +
			(10.0 * (completion.usage?.completion_tokens ?? 0)) / 1_000_000
	};
}
