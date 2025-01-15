import { dev } from "$app/environment";

export function sleep(ms: number = 1000) {
	// Have I been sleeping in PRODUCTION?!?!??!?!
	return new Promise((resolve) => setTimeout(resolve, dev ? ms : 0));
}

export const labels = {
	website: "Website",
	editor: "Editor",
	other: "Other",
	everywhere: "Everywhere",
	pending: "Pending response",
	good: "Good idea",
	implemented: "Implemented",
	"in-dev": "In development",
	incompatible: "Incompatible",
	impractical: "Impractical",
	rejected: "Rejected",
	impossible: "Impossible",
	all: "All",
};

export function toSentenceCase(input: string | null) {
	if (typeof input !== "string" || input.trim() === "") {
		return "";
	}

	const sentences = input.match(/[^.!?]+[.!?]*/g) || [];

	const processedSentences = sentences.map((sentence) => {
		sentence = sentence.trim();
		if (sentence.length === 0) {
			return "";
		}
		return sentence[0].toUpperCase() + sentence.slice(1);
	});

	return processedSentences.join(" ");
}

export const defaults = {
	uploadPreset: "testing",
	folder: "sa",
};

export const maxImages = 5;
export const maxImageSize = 10_000_000;

export const DAY_IN_MS = 86_400_000;
