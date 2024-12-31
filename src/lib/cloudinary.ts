import { PUBLIC_CLOUDINARY_KEY, PUBLIC_CLOUDINARY_NAME } from "$env/static/public";
import { defaults } from "$lib";

type ProgressCallback = (progress: number) => void;
type SuccessCallback = (result: App.UploadApiResponse) => void;
type ErrorCallback = (error: App.UploadApiErrorResponse) => void;

class CloudinaryUploader {
	private progressCallback?: ProgressCallback;
	private successCallback?: SuccessCallback;
	private errorCallback?: ErrorCallback;
	private imageData: string;

	constructor(imageData: string) {
		this.imageData = imageData;
	}

	onProgress(callback: ProgressCallback) {
		this.progressCallback = callback;
		return this;
	}

	onSuccess(callback: SuccessCallback) {
		this.successCallback = callback;
		return this;
	}

	onError(callback: ErrorCallback) {
		this.errorCallback = callback;
		return this;
	}

	async start() {
		if (!PUBLIC_CLOUDINARY_KEY) {
			const error = new Error("No API key");
			this.errorCallback?.({ ...error, http_code: 400 });
			throw error;
		}

		const dataToSign = { upload_preset: defaults.uploadPreset, folder: defaults.folder };

		const response = await fetch("/api/signature", {
			method: "POST",
			body: JSON.stringify({
				dataToSign,
			}),
		});

		type DataToSign = typeof dataToSign & { timestamp: string };
		type SignatureResponse = { signature: string; signedData: DataToSign };

		const { signature, signedData }: SignatureResponse = await response.json();

		return new Promise((resolve, reject) => {
			const formData = new FormData();

			formData.append("file", this.imageData);
			formData.append("api_key", PUBLIC_CLOUDINARY_KEY);
			formData.append("signature", signature);
			formData.append("upload_preset", signedData.upload_preset);
			formData.append("timestamp", signedData.timestamp);
			formData.append("folder", signedData.folder);

			const xhr = new XMLHttpRequest();
			xhr.onreadystatechange = async () => {
				if (xhr.readyState !== 4) return;

				if (xhr.status !== 200) {
					const error = new Error("Upload failed");
					this.errorCallback?.({ ...error, http_code: xhr.status });
					reject(error);
					return;
				}

				try {
					const res: App.UploadApiResponse = JSON.parse(xhr.responseText);
					if (!res || !res.public_id) {
						const error = new Error("Invalid response from Cloudinary");
						this.errorCallback?.({ ...error, http_code: xhr.status });
						reject(error);
						return;
					}

					const imageUrl = res.secure_url;
					if (!imageUrl) {
						this.errorCallback?.({
							message: "Invalid response from Cloudinary",
							http_code: xhr.status,
							name: "invalid-response",
						});
						return;
					}

					const request = new Request(`/api/image/moderation`, {
						method: "POST",
						body: JSON.stringify({ imageUrl }),
					});

					const response = await fetch(request);

					const moderationResponse: App.ModerationResult = await response.json();

					const results = moderationResponse.data.analysis.responses.map(
						(response) => response.value,
					);
					const nsfw = results.includes("yes");

					if (nsfw) {
						await cloudinary.delete(res.public_id, null);
						this.errorCallback?.({
							message: "Image has been flagged as NSFW",
							name: "nsfw",
							http_code: 403,
						});
						return;
					}

					this.successCallback?.(res);
					resolve(res);
				} catch (error) {
					this.errorCallback?.({
						http_code: xhr.status,
						message: (error as Error).message,
						name: (error as Error).name,
					});
					return;
				}
			};

			xhr.upload.addEventListener("progress", (e) => {
				const progress = Math.round((e.loaded * 100.0) / e.total);
				this.progressCallback?.(progress);
			});

			xhr.open("post", `https://api.cloudinary.com/v1_1/${PUBLIC_CLOUDINARY_NAME}/auto/upload`);
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			xhr.send(formData);
		});
	}
}

export const cloudinary = {
	upload: (imageData: string) => {
		return new CloudinaryUploader(imageData);
	},
	delete: async (publicId: string, imageId: string | null) => {
		if (!publicId) return { message: "Falsy publicId" };

		const dataToSign = { public_id: publicId };

		const response = await fetch("/api/signature", {
			method: "POST",
			body: JSON.stringify({
				dataToSign,
			}),
		});

		type DataToSign = typeof dataToSign & { timestamp: string };
		type SignatureResponse = { signature: string; signedData: DataToSign };

		const { signature, signedData }: SignatureResponse = await response.json();

		const formData = new FormData();
		formData.append("public_id", signedData.public_id);
		formData.append("timestamp", signedData.timestamp);
		formData.append("api_key", PUBLIC_CLOUDINARY_KEY);
		formData.append("signature", signature);

		const request = new Request(
			`https://api.cloudinary.com/v1_1/${PUBLIC_CLOUDINARY_NAME}/image/destroy`,
			{
				method: "POST",
				body: formData,
			},
		);

		await fetch(request);

		return imageId;
	},
};
