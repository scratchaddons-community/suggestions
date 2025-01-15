import { PUBLIC_CLOUDINARY_NAME } from "$env/static/public";

export function generateUrl(
	id?: string | null,
	transformationsArr?: string[],
	preset?: "thumbnail",
) {
	if (!id) return "";

	let transformations = "";

	if (preset) {
		if (preset === "thumbnail") {
			transformations =
				"c_limit/if_w_gt_600/w_600/if_end/f_avif/q_auto:low/if_h_gt_4000/h_4000/if_end";
		}

		return `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_NAME}/image/upload/${transformations}/${id}`;
	}

	if (transformationsArr) {
		return "";
	}

	return `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_NAME}/image/upload/${id}`;
}

export function getTransformedResolutions({ width, height }: { width?: number; height?: number }) {
	if (!(width && height)) return undefined;

	const aspectRatio = width / height;
	const targetWidth = 600;
	const maxHeight = 4000;

	let newWidth = Math.min(width, targetWidth);
	let newHeight = newWidth / aspectRatio;

	if (newHeight > maxHeight) {
		newHeight = maxHeight;
		newWidth = maxHeight * aspectRatio;
	}

	return {
		width: Math.round(newWidth),
		height: Math.round(newHeight),
	};
}
