import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import z from 'zod';

import { calculatePromptCost, client, commonParams } from '$lib/gpt';

const zRequestDefinitionType = z.enum(['functional', 'non-functional', 'note', 'example-code']);
const zRequestDefinitionItem = z.object({
	type: zRequestDefinitionType,
	en: z.string({ description: 'in english' }),
	ja: z.string({ description: 'in japanese' })
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
	definitions: null | TranslatedRequestDefinitions;
	price: number;
};

export async function translateRequirementsToDefinitions(
	systemDesc: string,
	request: string
): Promise<TranslateResults> {
	const completion = await client.beta.chat.completions.parse({
		...commonParams,
		messages: [
			{
				role: 'system',
				content: `以下システムに対して、要求に基づき要件定義してください。\nシステムの解説:\n${systemDesc}`
			},
			{ role: 'user', content: request }
		],
		response_format: zodResponseFormat(zTranslatedRequestDefinitions, 'definitions')
	});
	return {
		definitions: completion.choices[0].message.parsed,
		price: calculatePromptCost(completion.usage)
	};
}
