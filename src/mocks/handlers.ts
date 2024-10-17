import { delay, http, HttpResponse } from 'msw';
import type { ChatCompletionCreateParams } from 'openai/src/resources/index.js';

const GPT_RESULT_REQUEST_ANALYSIS = {
	choices: [
		{
			index: 0,
			message: {
				role: 'assistant',
				content: null,
				tool_calls: [
					{
						id: 'call_3LtP57eCOXKWBBMKM6akRilx',
						type: 'function',
						function: {
							name: 'query',
							arguments:
								'{"summary": "OWASP Top 10を考慮したセキュリティ要件定義", "requirementDefinitions": [{"type": "non-functional", "ja": "通信はTLS 1.2以上を使用して暗号化する。", "en": "Use TLS 1.2 or above for encrypted communications."}, {"type": "non-functional", "ja": "パスワードは強力なアルゴリズムでハッシュ化する。具体的には、bcrypt、scrypt、またはArgon2を使用する。", "en": "Hash passwords using a strong algorithm such as bcrypt, scrypt, or Argon2."}, {"type": "non-functional", "ja": "定期的にセキュリティアップデートを適用し、既知の脆弱性からシステムを保護する。", "en": "Regularly apply security updates to protect against known vulnerabilities."}, {"type": "non-functional", "ja": "インプットバリデーションを強化し、SQLインジェクションやXSS攻撃に対する対策を実施する。", "en": "Enhance input validation and implement measures against SQL injection and XSS attacks."}, {"type": "non-functional", "ja": "アクセスコントロールを強化し、最小権限の原則を適用する。", "en": "Strengthen access controls and apply the principle of least privilege."}, {"type": "non-functional", "ja": "ログイン試行制限を設けてブルートフォース攻撃を防ぐ。", "en": "Implement login attempt limits to prevent brute force attacks."}]}'
						}
					},
					{
						id: 'call_r7asScAvmSURyxHvNXrMHnxJ',
						type: 'function',
						function: {
							name: 'query',
							arguments:
								'{"summary": "機密データを含むSaaS型Webサービスにおけるセキュリティ要件の例", "requirementDefinitions": [{"type": "non-functional", "ja": "すべてのAPIエンドポイントで認証と認可を実施する。", "en": "Implement authentication and authorization on all API endpoints."}, {"type": "non-functional", "ja": "セキュリティ監査ログを定期的に確認し、不審な活動を検出する。", "en": "Regularly review security audit logs to detect suspicious activities."}, {"type": "functional", "ja": "ユーザーには二要素認証のオプションを提供する。", "en": "Provide users with an option for two-factor authentication."}, {"type": "functional", "ja": "セッション管理を強化し、長時間のアクティビティがない場合は自動的にログアウトする。", "en": "Enhance session management to automatically log users out after prolonged inactivity."}]}'
						}
					}
				],
				refusal: null
			},
			logprobs: null,
			finish_reason: 'tool_calls'
		}
	],
	usage: {
		prompt_tokens: 167,
		completion_tokens: 575,
		total_tokens: 742,
		completion_tokens_details: {
			reasoning_tokens: 0
		}
	}
};
const GPT_RESULT_TEST_DATA = {
	choices: [
		{
			index: 0,
			message: {
				role: 'assistant',
				content: null,
				tool_calls: [
					{
						id: 'call_o05UFBtCdFldktH1utn1V7zi',
						type: 'function',
						function: {
							name: 'query',
							arguments:
								'{"summary":"グローバルなWebサイトのユーザーテーブルのモックデータ。5名分。","data":[{"name":{"first":"John","middle":null,"last":"Doe"},"address":{"country":"アメリカ合衆国","zipCode":"10001","address":"123 Main St, New York, NY"},"gender":"male","birthday":{"year":1990,"month":5,"day":15},"loginTime":{"hour":14,"minute":30,"second":45},"countOfLogin":150},{"name":{"first":"Anna","middle":"Maria","last":"Smith"},"address":{"country":"イギリス","zipCode":"SW1A 1AA","address":"10 Downing St, London"},"gender":"female","birthday":{"year":1985,"month":7,"day":22},"loginTime":null,"countOfLogin":null},{"name":{"first":"Yuki","middle":null,"last":"Tanaka"},"address":{"country":"日本","zipCode":"150-0001","address":"東京都渋谷区神宮前1-1-1"},"gender":"female","birthday":{"year":1992,"month":3,"day":10},"loginTime":{"hour":9,"minute":15,"second":30},"countOfLogin":85},{"name":{"first":"Carlos","middle":null,"last":"Gomez"},"address":{"country":"スペイン","zipCode":"28013","address":"Calle de Alcalá, Madrid"},"gender":"male","birthday":{"year":1988,"month":11,"day":5},"loginTime":{"hour":20,"minute":45,"second":10},"countOfLogin":200},{"name":{"first":"Liu","middle":null,"last":"Wei"},"address":{"country":"中国","zipCode":"100000","address":"北京市朝阳区建国路1号"},"gender":"male","birthday":{"year":1995,"month":12,"day":25},"loginTime":null,"countOfLogin":null}]}'
						}
					}
				],
				refusal: null
			},
			logprobs: null,
			finish_reason: 'tool_calls'
		}
	],
	usage: {
		prompt_tokens: 211,
		completion_tokens: 436,
		total_tokens: 647,
		prompt_tokens_details: {
			cached_tokens: 0
		},
		completion_tokens_details: {
			reasoning_tokens: 0
		}
	}
};

export const handlers = [
	http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
		const requestData = (await request.json()) as ChatCompletionCreateParams;
		await delay(300);
		const requestContent = (requestData.messages[0].content as string) ?? '';
		let response = {
			id: 'chatcmpl-xxxxx',
			object: 'chat.completion',
			created: Date.now(),
			model: requestData.model,
			choices: [] as unknown[],
			usage: {},
			system_fingerprint: 'fp_1234567890'
		};
		if (requestContent.includes('要件定義')) {
			response = { ...response, ...GPT_RESULT_REQUEST_ANALYSIS };
		} else if (requestContent.includes('mock data')) {
			response = { ...response, ...GPT_RESULT_TEST_DATA };
		} else throw new Error('Unknown GPT call at MSW handler');
		return HttpResponse.json(response);
	})
];
