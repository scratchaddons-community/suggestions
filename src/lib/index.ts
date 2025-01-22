import { dev } from "$app/environment";

export function sleep(ms: number = 100) {
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

// https://www.npmjs.com/package/is-url
const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
const localhostDomainRE = /^localhost[:?\d]*(?:[^:?\d]\S*)?$/;
const nonLocalhostDomainRE = /^[^\s.]+\.\S{2,}$/;

export function isUrl(string: string): boolean {
	if (typeof string !== "string") {
		return false;
	}

	const match = string.match(protocolAndDomainRE);
	if (!match) {
		return false;
	}

	const everythingAfterProtocol = match[1];
	if (!everythingAfterProtocol) {
		return false;
	}

	if (
		localhostDomainRE.test(everythingAfterProtocol) ||
		nonLocalhostDomainRE.test(everythingAfterProtocol)
	) {
		return true;
	}

	return false;
}

export async function isImageUrl(url: string): Promise<boolean> {
	try {
		if (!isUrl(url)) return false;

		try {
			return await new Promise((resolve) => {
				const img = new Image();

				img.onload = () => {
					resolve(true);
				};

				img.onerror = () => {
					resolve(false);
				};

				// Add a timestamp to bypass cache
				const cacheBuster = `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`;
				img.src = cacheBuster;
			});
		} catch {
			console.log("Image loading failed, trying proxy...");
		}

		return false;
	} catch (error) {
		console.error("Error checking image URL:", error);
		return false;
	}
}
