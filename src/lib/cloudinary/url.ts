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
			transformations = "c_limit/w_600/f_avif/q_auto:low/if_h_gt_4000/h_4000/if_end";
		}

		return `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_NAME}/image/upload/${transformations}/${id}`;
	}

	if (transformationsArr) {
		return "";
	}

	return `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_NAME}/image/upload/${id}`;
}
