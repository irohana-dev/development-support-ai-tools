import { delay, http, HttpResponse } from 'msw';
import type { ChatCompletionCreateParams } from 'openai/src/resources/index.js';

const GPT_RESULT_REQUEST_ANALYSIS = {
	choices: [
		{
			index: 0,
			message: {
				role: 'assistant',
				content:
					'{"summary":"このシステムは、OWASP Top 10に基づいてセキュリティを確保するため、以下の要件を定義します。","requirementDefinitions":[{"category":"セキュリティ要件","items":[{"type":"functional","ja":"通信はすべてHTTPSを使用して暗号化する。","en":"All communications must be encrypted using HTTPS."},{"type":"functional","ja":"パスワードはハッシュ化してデータベースに保存する。","en":"Passwords must be hashed before storing in the database."},{"type":"functional","ja":"SQLインジェクションを防ぐために、すべてのデータベースクエリに対してプリペアドステートメントを使用する。","en":"Use prepared statements for all database queries to prevent SQL injection."},{"type":"functional","ja":"クロスサイトスクリプティング（XSS）を防ぐために、ユーザー入力を適切にエスケープする。","en":"Properly escape user inputs to prevent Cross-Site Scripting (XSS)."},{"type":"functional","ja":"セッション管理を強化し、セッションIDを定期的に更新する。","en":"Enhance session management by regularly updating session IDs."},{"type":"functional","ja":"不正なアクセスを防ぐために、強力な認証と認可のメカニズムを実装する。","en":"Implement strong authentication and authorization mechanisms to prevent unauthorized access."},{"type":"functional","ja":"CSRFトークンを使用してクロスサイトリクエストフォージェリ（CSRF）を防ぐ。","en":"Use CSRF tokens to prevent Cross-Site Request Forgery (CSRF)."},{"type":"functional","ja":"データ漏洩を防ぐために、データベース暗号化を実施する。","en":"Implement database encryption to prevent data leakage."},{"type":"functional","ja":"エラーメッセージに機密情報を含めない。","en":"Do not include sensitive information in error messages."},{"type":"functional","ja":"セキュリティログを監視し、不審な活動を検出する。","en":"Monitor security logs to detect suspicious activities."}]},{"category":"非機能要件","items":[{"type":"non-functional","ja":"システムは毎秒1000リクエストを処理できるスケーラビリティを持つ。","en":"The system must have scalability to handle 1000 requests per second."},{"type":"non-functional","ja":"99.9%の可用性を保証する。","en":"Ensure 99.9% availability."},{"type":"non-functional","ja":"データのバックアップは毎日実施される。","en":"Data backups must be performed daily."},{"type":"non-functional","ja":"ユーザーの認証は2要素認証をサポートする。","en":"User authentication must support two-factor authentication."}]}]}',
				refusal: null
			},
			logprobs: null,
			finish_reason: 'stop'
		}
	],
	usage: {
		prompt_tokens: 227,
		completion_tokens: 662,
		total_tokens: 889,
		prompt_tokens_details: {
			cached_tokens: 0
		},
		completion_tokens_details: {
			reasoning_tokens: 0
		}
	}
};

const GPT_RESULT_TABLE_DATA = {
	choices: [
		{
			index: 0,
			message: {
				role: 'assistant',
				content:
					'{"summary":"以下は、架空の世界における5人のユーザーのデータです。","data":[{"name":{"first":"アレックス","middle":null,"last":"スミス"},"address":{"country":"ファンタジア","zipCode":"123-456","address":"サンセット通り5番地"},"gender":"male","birthday":{"year":100,"month":3,"day":15},"loginTime":{"hour":14,"minute":30,"second":45},"countOfLogin":120},{"name":{"first":"エミリー","middle":"ジェーン","last":"ジョンソン"},"address":{"country":"エルドラド","zipCode":"789-012","address":"グリーンフィールド通り10番地"},"gender":"female","birthday":{"year":200,"month":5,"day":18},"loginTime":null,"countOfLogin":null},{"name":{"first":"マイケル","middle":null,"last":"ウィリアムズ"},"address":{"country":"ネバーランド","zipCode":"345-678","address":"オーシャンビュー通り3番地"},"gender":"male","birthday":{"year":150,"month":2,"day":10},"loginTime":{"hour":9,"minute":15,"second":30},"countOfLogin":85},{"name":{"first":"ソフィア","middle":"マリー","last":"ブラウン"},"address":{"country":"アトランティス","zipCode":"901-234","address":"ムーンライト通り7番地"},"gender":"female","birthday":{"year":180,"month":1,"day":5},"loginTime":{"hour":20,"minute":45,"second":10},"countOfLogin":150},{"name":{"first":"ジェームズ","middle":null,"last":"ジョーンズ"},"address":{"country":"シャングリラ","zipCode":"567-890","address":"スターフォール通り2番地"},"gender":"male","birthday":{"year":130,"month":4,"day":12},"loginTime":null,"countOfLogin":null}]}',
				refusal: null
			},
			logprobs: null,
			finish_reason: 'stop'
		}
	],
	usage: {
		prompt_tokens: 347,
		completion_tokens: 449,
		total_tokens: 796,
		prompt_tokens_details: {
			cached_tokens: 0
		},
		completion_tokens_details: {
			reasoning_tokens: 0
		}
	}
};

const GPT_RESULT_TRANSLATION = {
	choices: [
		{
			index: 0,
			message: {
				role: 'assistant',
				content:
					'{"summary":"XXXのinputが空欄の時にエラーが発生するため、修正を依頼しています。","data":[{"en":"Please fix the error that occurs when the input for XXX is left blank.","nuance":null},{"en":"Could you correct the issue that arises when the input for XXX is empty?" ,"nuance":null},{"en":"I would appreciate it if you could resolve the error that happens when the input for XXX is not filled in." ,"nuance":null}]}',
				refusal: null
			},
			logprobs: null,
			finish_reason: 'stop'
		}
	],
	usage: {
		prompt_tokens: 187,
		completion_tokens: 110,
		total_tokens: 297,
		prompt_tokens_details: {
			cached_tokens: 0,
			audio_tokens: 0
		},
		completion_tokens_details: {
			reasoning_tokens: 0,
			audio_tokens: 0,
			accepted_prediction_tokens: 0,
			rejected_prediction_tokens: 0
		}
	}
};

export const handlers = [
	http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
		const requestData = (await request.json()) as ChatCompletionCreateParams;
		if (requestData.stream) return HttpResponse.error();
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
			response = { ...response, ...GPT_RESULT_TABLE_DATA };
		} else if (requestContent.includes('translate')) {
			response = { ...response, ...GPT_RESULT_TRANSLATION };
		} else throw new Error('Unknown GPT call at MSW handler');
		return HttpResponse.json(response);
	})
];
