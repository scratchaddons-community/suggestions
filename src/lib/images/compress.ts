import Compressor from "compressorjs";

export async function compress(
	image: File,
	options: Compressor.Options | null = null,
	preset?: "preprocess",
): Promise<File> {
	return new Promise((resolve, reject) => {
		let compressorOptions: Compressor.Options | null = options;

		// Apply preset options if provided
		if (preset === "preprocess") {
			compressorOptions = {
				maxWidth: 6000,
				maxHeight: 6000,
				mimeType: "image/webp",
				quality: 0.9,
			};
		}

		new Compressor(image, {
			...compressorOptions,
			success: (compressedFile: File) => {
				resolve(compressedFile);
			},
			error: (err: Error) => {
				reject(err);
			},
		});
	});
}
