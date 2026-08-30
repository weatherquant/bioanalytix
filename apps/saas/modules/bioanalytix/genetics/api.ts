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

export async function uploadGeneticFile(file: File): Promise<GeneticProfile> {
	const formData = new FormData();

	formData.append("file", file);

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
