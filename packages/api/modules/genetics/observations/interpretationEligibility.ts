import type { GeneticsModelDefinition } from "../evidence/modelRegistry";
import type { GenotypeObservation } from "./types";
import { validateGenotypeObservation } from "./validateObservation";

export interface InterpretationEligibility {
	eligible: boolean;

	/**
	 * Hard analytical eligibility failures which prevent
	 * an observation from being used by the model.
	 */
	reasons: string[];

	/**
	 * Non-blocking provenance or analytical
	 * qualification messages.
	 *
	 * Planning governance, clinical-use restrictions
	 * and production-release permissions are enforced
	 * in their respective governance layers rather than
	 * here.
	 */
	warnings: string[];
}

function genomeBuildEligible(
	observation: GenotypeObservation,
	model: GeneticsModelDefinition,
): boolean {
	const requirement = model.analyticalRequirements.genomeBuild;

	if (requirement === "any") {
		return true;
	}

	if (requirement === "known") {
		return observation.genomeBuild !== "unknown";
	}

	return requirement.includes(observation.genomeBuild);
}

function strandEligible(observation: GenotypeObservation, model: GeneticsModelDefinition): boolean {
	const requirement = model.analyticalRequirements.strand;

	if (requirement === "any" || requirement === "model_specific") {
		return true;
	}

	if (requirement === "known") {
		return observation.strandOrientation !== "unknown";
	}

	return observation.strandOrientation === "forward";
}

/**
 * Model-aware analytical eligibility.
 *
 * This function answers only whether an observation
 * is technically suitable for interpretation by the
 * specified model.
 *
 * Hard analytical failures are returned in `reasons`.
 * Non-blocking analytical or provenance qualifications
 * are returned in `warnings`.
 *
 * Planning eligibility, clinical-use restrictions and
 * release governance are intentionally enforced
 * elsewhere.
 */
export function assessModelObservationEligibility(
	observation: GenotypeObservation,
	expectedRsid: string,
	model: GeneticsModelDefinition,
): InterpretationEligibility {
	const validation = validateGenotypeObservation(observation);

	/**
	 * Preserve the observation-validation contract:
	 * validator errors become hard analytical failures.
	 */
	const reasons = [...validation.errors];

	const warnings = [...validation.warnings];

	if (observation.rsid.toLowerCase() !== expectedRsid.toLowerCase()) {
		reasons.push(`Expected ${expectedRsid} but received ${observation.rsid}.`);
	}

	if (!genomeBuildEligible(observation, model)) {
		reasons.push(`Genome build ${observation.genomeBuild} does not satisfy model ${model.id}.`);
	}

	if (!strandEligible(observation, model)) {
		reasons.push(
			`Strand orientation ${observation.strandOrientation} does not satisfy model ${model.id}.`,
		);
	}

	return {
		eligible: reasons.length === 0,

		reasons,

		warnings,
	};
}

/**
 * Compatibility API for callers that require generic
 * observation validation without model-specific build
 * or strand requirements.
 *
 * This function deliberately performs no planning,
 * clinical or release-governance assessment.
 */
export function assessInterpretationEligibility(
	observation: GenotypeObservation,
	expectedRsid: string,
): InterpretationEligibility {
	const validation = validateGenotypeObservation(observation);

	const reasons = [...validation.errors];

	const warnings = [...validation.warnings];

	if (observation.rsid.toLowerCase() !== expectedRsid.toLowerCase()) {
		reasons.push(`Expected ${expectedRsid} but received ${observation.rsid}.`);
	}

	return {
		eligible: reasons.length === 0,

		reasons,

		warnings,
	};
}
