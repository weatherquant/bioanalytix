import type { GenotypeObservation } from "./types";

export interface ObservationValidationResult {
	valid: boolean;

	errors: string[];

	warnings: string[];
}

export function validateGenotypeObservation(
	observation: GenotypeObservation,
): ObservationValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!/^rs\d+$/.test(observation.rsid)) {
		errors.push("Observation does not contain a valid rsID.");
	}

	if (observation.callStatus !== "called") {
		errors.push("Observation does not contain a callable genotype.");
	}

	if (observation.callStatus === "called" && !observation.genotype) {
		errors.push("Called observation is missing genotype data.");
	}

	if (observation.genotype && !/^[ACGT]{2}$/.test(observation.genotype)) {
		errors.push("Genotype is not a supported diploid nucleotide call.");
	}

	if (observation.genomeBuild === "unknown") {
		warnings.push("Genome build is unknown.");
	}

	if (observation.strandOrientation === "unknown") {
		warnings.push("Strand orientation is unknown.");
	}

	if (observation.confirmationStatus === "unconfirmed") {
		warnings.push("Observation is not clinically confirmed.");
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}
