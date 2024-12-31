// See https://svelte.dev/docs/kit/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import("$lib/server/auth").SessionValidationResult["user"];
			session: import("$lib/server/auth").SessionValidationResult["session"];
		}

		interface UploadApiResponse {
			public_id: string;
			version: number;
			signature: string;
			width: number;
			height: number;
			format: string;
			resource_type: "image" | "video" | "raw" | "auto";
			created_at: string;
			tags: Array<string>;
			pages: number;
			bytes: number;
			type: string;
			etag: string;
			placeholder: boolean;
			url: string;
			secure_url: string;
			access_mode: string;
			original_filename: string;
			moderation: Array<string>;
			access_control: Array<string>;
			context: object; //won't change since it's response, we need to discuss documentation team about it before implementing.
			metadata: object; //won't change since it's response, we need to discuss documentation team about it before implementing.
			colors?: [string, number][];

			[futureKey: string]: unknown;
		}

		interface UploadApiErrorResponse {
			message: string;
			name: string;
			http_code: number;

			[futureKey: string]: unknown;
		}

		interface ModerationResult {
			limits: {
				usage: {
					type: string;
					count: number;
				};
			};
			request_id: string;
			data: {
				entity: string;
				analysis: {
					responses: {
						prompt: string;
						value: string;
					}[];
					model_version: number;
				};
			};
		}
	}
}

export {};
