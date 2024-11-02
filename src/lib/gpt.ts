import OpenAI from 'openai';

import { PUBLIC_OPENAI_API_KEY } from '$env/static/public';

export const client = new OpenAI({
	apiKey: PUBLIC_OPENAI_API_KEY,
	dangerouslyAllowBrowser: true
});

export const commonParams = {
	// 'gpt-4o-mini' or 'gpt-4o-2024-08-06'
	model: 'gpt-4o-2024-08-06',
	top_p: 0.5 // 0.0-(1.0)-2.0
};

const costsIn1MTokens = {
	inputAudio: 100.0,
	inputCached: 1.25,
	inputText: 2.5,
	outputAudio: 200.0,
	outputText: 10.0
	// gpt-4o-miniは以下
	// inputText: 0.150,
	// inputAudio: 0,
	// inputCached: 0.075,
	// outputText: 0.6,
	// outputAudio: 0
};

/**
 * 処理トークン数から消費したクレジット数（コスト）を算出する。
 * なおo1のReasoningトークンは非対応。
 * @param usage `completion.usage`を指定
 * @returns USD単位の発生費用
 */
export function calculatePromptCost(usage?: OpenAI.Completions.CompletionUsage) {
	if (!usage) return 0;
	const input_audio_tokens = usage.prompt_tokens_details?.audio_tokens ?? 0;
	const input_cached_tokens = usage.prompt_tokens_details?.cached_tokens ?? 0;
	const input_raw_tokens = usage.prompt_tokens - input_audio_tokens - input_cached_tokens;

	const output_audio_tokens = usage.completion_tokens_details?.audio_tokens ?? 0;
	const output_raw_tokens = usage.completion_tokens - output_audio_tokens;
	return (
		(costsIn1MTokens.inputText * input_raw_tokens) / 1_000_000 +
		(costsIn1MTokens.inputAudio * input_audio_tokens) / 1_000_000 +
		(costsIn1MTokens.inputCached * input_cached_tokens) / 1_000_000 +
		(costsIn1MTokens.outputText * output_raw_tokens) / 1_000_000 +
		(costsIn1MTokens.outputAudio * output_audio_tokens) / 1_000_000
	);
}
