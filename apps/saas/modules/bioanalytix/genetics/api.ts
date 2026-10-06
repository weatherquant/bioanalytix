import type { GeneticProfile } from "../../../types/genetics";
import { extractSupportedGenotypes } from "./extractSupportedGenotypes";

const MAX_DNA_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const ALLOWED_DNA_FILE_EXTENSIONS = [".txt", ".csv"];

export async function getGeneticProfile(): Promise<GeneticProfile | null> {
	const response = await fetch("/api/genetic-profile", {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Unable to load genetic profile.");
	}

	const result = await response.json();

	return result.data ?? null;
}

export async function uploadGeneticFile(
	file: File,
	geneticDataProcessingConsent: boolean,
): Promise<GeneticProfile> {
	if (!geneticDataProcessingConsent) {
		throw new Error("Consent to process genetic data is required before selecting a DNA file.");
	}

	if (file.size > MAX_DNA_FILE_SIZE_BYTES) {
		throw new Error("DNA file must be 25 MB or smaller.");
	}

	const fileName = file.name.toLowerCase();

	if (!ALLOWED_DNA_FILE_EXTENSIONS.some((extension) => fileName.endsWith(extension))) {
		throw new Error("DNA file must be a .txt or .csv file.");
	}

	const extracted = await extractSupportedGenotypes(file);

	const fileBuffer = await file.arrayBuffer();

	const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer);

	const sha256 = Array.from(new Uint8Array(hashBuffer))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");

	if (extracted.records.length === 0) {
		throw new Error("No supported Bioanalytix genetic markers were found in this file.");
	}

	const response = await fetch("/api/genetics/upload", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			records: extracted.records,
			geneticDataProcessingConsent: "granted",
			source: {
				originalFileName: file.name,
				fileSize: file.size,
				mimeType: file.type || null,
				sourceLineCount: extracted.sourceLineCount,
				validGenotypeCount: extracted.validGenotypeCount,
				sha256,
			},
		}),
		credentials: "include",
	});

	if (!response.ok) {
		const result = await response.json().catch(() => null);

		throw new Error(result?.error ?? "Unable to process your genetic file.");
	}

	const result = await response.json();

	return result.data ?? result;
}

export async function deleteGeneticData(): Promise<void> {
	const response = await fetch("/api/genetics", {
		method: "DELETE",
		credentials: "include",
	});

	if (!response.ok) {
		const result = await response.json().catch(() => null);

		throw new Error(result?.error ?? "Unable to delete genetic data.");
	}
}
