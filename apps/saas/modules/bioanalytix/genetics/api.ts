import type { GeneticProfile } from "../../../types/genetics";

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
	const formData = new FormData();

	formData.append("file", file);

	if (geneticDataProcessingConsent) {
		formData.append("geneticDataProcessingConsent", "granted");
	}

	const response = await fetch("/api/genetics/upload", {
		method: "POST",
		body: formData,
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
