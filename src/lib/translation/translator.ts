import { JSONParser } from '@streamparser/json';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import z from 'zod';

import { calculatePromptCost, client, commonParams } from '$lib/gpt';

import type { WordDefinition } from './types';

const zTranslatePattern = z.object({
	en: z.string({ description: 'English translated text' }),
	// ja: z.string({ description: 'Japanese re-translated text' }),
	nuance: z.string({
		description: 'Explanation of the nuances of English sentences in Japanese'
	})
});
const zTranslateData = z.object({
	summary: z.string({ description: 'Summarize the main points of the translation in Japanese.' }),
	data: z.array(zTranslatePattern)
});

export type TranslationPattern = z.infer<typeof zTranslatePattern>;
export type TranslationData = z.infer<typeof zTranslateData>;
export type TranslationResult = {
	price: number;
	translated: null | TranslationData;
};

export async function translate(
	wordDefinitions: WordDefinition[],
	instruction: string,
	sourceText: string,
	onStream?: (result: TranslationData) => void
): Promise<TranslationResult> {
	const sysPrompt =
		'You are a professional translator. ' +
		'Below is a list of TSV format terms to consider for translation:\n\n' +
		'Category\tJapanese\tEnglish\n' +
		wordDefinitions.map((w) => `${w.category}\t${w.ja}\t${w.en}`).join('\n') +
		'\n\n' +
		instruction;

	if (onStream) {
		const stream = await client.beta.chat.completions.stream({
			...commonParams,
			messages: [
				{ role: 'system', content: sysPrompt },
				{ role: 'user', content: sourceText }
			],
			response_format: zodResponseFormat(zTranslateData, 'translated'),
			stream: true,
			stream_options: { include_usage: true }
		});
		const jsonParser = new JSONParser({
			emitPartialTokens: true,
			emitPartialValues: true,
			paths: ['$.summary', '$.data.*']
		});
		let partialData: TranslationData = { data: [], summary: '' };
		jsonParser.onValue = (p) => {
			const { key, parent, value } = p;
			if (key === 'summary') {
				partialData = parent as TranslationData;
				partialData.summary = value as string;
			}
			onStream(partialData);
		};
		for await (const chunk of stream) {
			jsonParser.write(chunk.choices[0]?.delta.content ?? '');
		}
		const completion = await stream.finalChatCompletion();
		return {
			price: calculatePromptCost(completion.usage),
			translated: completion.choices[0].message.parsed
		};
	} else {
		const completion = await client.beta.chat.completions.parse({
			...commonParams,
			messages: [
				{ content: sysPrompt, role: 'system' },
				{ content: sourceText, role: 'user' }
			],
			response_format: zodResponseFormat(zTranslateData, 'translated')
		});
		return {
			price: calculatePromptCost(completion.usage),
			translated: completion.choices[0].message.parsed
		};
	}
}
