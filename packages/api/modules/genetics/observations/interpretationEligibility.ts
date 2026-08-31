import type { GenotypeObservation } from "./types";
import { validateGenotypeObservation } from "./validateObservation";

export interface InterpretationEligibility {
	eligible: boolean;

	reasons: string[];

	warnings: string[];
}

export function assessInterpretationEligibility(
	observation: GenotypeObservation,
	expectedRsid: string,
): InterpretationEligibility {
	const validation = validateGenotypeObservation(observation);

	const reasons = [...validation.errors];

	if (observation.rsid !== expectedRsid.toLowerCase()) {
		reasons.push(`Expected ${expectedRsid.toLowerCase()} but received ${observation.rsid}.`);
	}

	return {
		eligible: reasons.length === 0,

		reasons,

		warnings: validation.warnings,
	};
}
