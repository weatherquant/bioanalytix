import type { GeneticsModelDefinition } from "../evidence/modelRegistry";
import type { GenotypeObservation } from "./types";
import { validateGenotypeObservation } from "./validateObservation";

export interface InterpretationEligibility {
	eligible: boolean;

	/**
	 * Existing interpretation code expects `reasons`.
	 *
	 * These are hard eligibility failures which prevent
	 * an observation from being used by the model.
	 */
	reasons: string[];

	/**
	 * Non-blocking provenance, confirmation or scientific
	 * qualification messages.
	 */
	warnings: string[];
}

function genomeBuildEligible(
	observation: GenotypeObservation,
	model: GeneticsModelDefinition,
): boolean {
	const requirement = model.inputRequirements.analytical.genomeBuild;

	if (requirement === "any") {
		return true;
	}

	if (requirement === "known") {
		return observation.genomeBuild !== "unknown";
	}

	return requirement.includes(observation.genomeBuild);
}

function strandEligible(observation: GenotypeObservation, model: GeneticsModelDefinition): boolean {
	const requirement = model.inputRequirements.analytical.strand;

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
 * Hard analytical failures are returned in `reasons`.
 * Qualifications that should remain visible but do not
 * prevent interpretation are returned in `warnings`.
 */
export function assessModelObservationEligibility(
	observation: GenotypeObservation,
	expectedRsid: string,
	model: GeneticsModelDefinition,
): InterpretationEligibility {
	const validation = validateGenotypeObservation(observation);

	/**
	 * Preserve the existing interpretation contract:
	 * validator errors become hard eligibility reasons.
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

	/**
	 * Planning restrictions are qualifications here,
	 * not analytical failures.
	 *
	 * Whether an interpreted insight may actually create
	 * PlanningExposure[] will be enforced separately by
	 * the planning eligibility layer.
	 */
	if (
		observation.source.type === "consumer_raw_data" &&
		!model.inputRequirements.planning.consumerRawDataPermitted
	) {
		warnings.push(
			`Consumer raw genotype data is not permitted for planning use by model ${model.id}.`,
		);
	}

	if (
		model.inputRequirements.planning.clinicalConfirmationRequired &&
		observation.confirmationStatus !== "confirmed"
	) {
		warnings.push(
			`Clinical confirmation is required before model ${model.id} may contribute to planning scenarios.`,
		);
	}

	/**
	 * Clinical confirmation is deliberately separate
	 * from analytical interpretation and financial
	 * risk-resilience planning.
	 */
	if (
		model.inputRequirements.clinical.confirmationRequired &&
		observation.confirmationStatus !== "confirmed"
	) {
		warnings.push("This result requires confirmation before clinical or medical action.");
	}

	return {
		eligible: reasons.length === 0,
		reasons,
		warnings,
	};
}

/**
 * Existing compatibility API.
 *
 * FVL and APOE currently call this function. We retain
 * its original return contract while the interpreters
 * are migrated deliberately to model-aware eligibility.
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
