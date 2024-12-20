export function sleep(ms: number = 3000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
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
