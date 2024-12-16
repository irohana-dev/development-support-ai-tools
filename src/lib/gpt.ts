import OpenAI from 'openai';

import { PUBLIC_OPENAI_API_KEY } from '$env/static/public';

export const client = new OpenAI({
	apiKey: PUBLIC_OPENAI_API_KEY,
	dangerouslyAllowBrowser: true
});

export type ModelName = 'gpt-4o' | 'gpt-4o-mini';
export const commonParams = {
	// 'gpt-4o' or 'gpt-4o-mini'
	model: 'gpt-4o-mini' as ModelName,
	top_p: 0.5 // 0.0-(1.0)-2.0
};

const costsIn1MTokens = {
	'gpt-4o': {
		inputText: 2.5,
		inputCached: 1.25,
		inputAudio: 100.0,
		outputText: 10.0,
		outputAudio: 200.0
	},
	'gpt-4o-mini': {
		inputText: 0.15,
		inputCached: 0.075,
		inputAudio: 100.0,
		outputText: 0.6,
		outputAudio: 200.0
	}
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

	const costs = costsIn1MTokens[commonParams.model];
	return (
		(costs.inputText * input_raw_tokens) / 1_000_000 +
		(costs.inputAudio * input_audio_tokens) / 1_000_000 +
		(costs.inputCached * input_cached_tokens) / 1_000_000 +
		(costs.outputText * output_raw_tokens) / 1_000_000 +
		(costs.outputAudio * output_audio_tokens) / 1_000_000
	);
}

export function setModel(model: ModelName) {
	commonParams.model = model ?? 'gpt-4o-mini';
}
