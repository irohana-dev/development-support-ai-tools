import { delay, http, HttpResponse } from 'msw';
import type { ChatCompletionCreateParams } from 'openai/src/resources/index.js';

export const handlers = [
	http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
		const requestData = (await request.json()) as ChatCompletionCreateParams;
		await delay(500);
		return HttpResponse.json({
			id: 'chatcmpl-AABWHjKwzoFqiicZ7sdFisF2cSIi1',
			object: 'chat.completion',
			created: Date.now(),
			model: requestData.model,
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
			},
			system_fingerprint: 'fp_7568d46099'
		});
	})
];
