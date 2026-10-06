import type { BiologicalInsight } from "./insight";
import { getModelPolicy, type ModelGovernance } from "./modelPolicy";

export class ModelPolicyError extends Error {
	constructor(message: string) {
		super(message);

		this.name = "ModelPolicyError";
	}
}

export function requireModelPolicy(modelId: string): ModelGovernance {
	const policy = getModelPolicy(modelId);

	if (!policy) {
		throw new ModelPolicyError(`No governance policy exists for model ${modelId}.`);
	}

	return policy;
}

/**
 * Calculation is allowed for implemented models
 * during development and validation when the
 * granular calculation permission is enabled.
 *
 * Scientific approval is deliberately NOT required
 * merely to execute a model in development. A model
 * has to be executable before it can be validated
 * and reviewed.
 */
export function assertMayCalculate(modelId: string): void {
	const policy = requireModelPolicy(modelId);

	if (policy.lifecycle.implementation === "retired") {
		throw new ModelPolicyError(`Model ${modelId} is retired and may not calculate a result.`);
	}

	if (!policy.permissions.calculateResult) {
		throw new ModelPolicyError(`Model ${modelId} is not permitted to calculate a result.`);
	}
}

export function assertMayDisplay(insight: BiologicalInsight): void {
	const policy = requireModelPolicy(insight.model.id);

	if (!policy.permissions.displayResult) {
		throw new ModelPolicyError(
			`Model ${insight.model.id} is not permitted to display results.`,
		);
	}
}

export function assertMayGeneratePlanningExposures(insight: BiologicalInsight): void {
	const policy = requireModelPolicy(insight.model.id);

	if (!policy.permissions.generatePlanningExposures) {
		throw new ModelPolicyError(
			`Model ${insight.model.id} is not permitted to generate planning exposures.`,
		);
	}
}

export function assertMayUseAbsoluteRisk(insight: BiologicalInsight): void {
	const policy = requireModelPolicy(insight.model.id);

	if (!policy.permissions.calculateAbsoluteRisk) {
		throw new ModelPolicyError(
			`Model ${insight.model.id} is not permitted to calculate absolute risk.`,
		);
	}
}

export function assertMayUseInLongevityModel(insight: BiologicalInsight): void {
	const policy = requireModelPolicy(insight.model.id);

	if (!policy.permissions.useInLongevityModel) {
		throw new ModelPolicyError(
			`Model ${insight.model.id} is not permitted to modify the longevity model.`,
		);
	}
}

export function assertMayModifyFinancialParameters(insight: BiologicalInsight): void {
	const policy = requireModelPolicy(insight.model.id);

	if (!policy.permissions.modifyFinancialParameters) {
		throw new ModelPolicyError(
			`Model ${insight.model.id} is not permitted to modify financial parameters.`,
		);
	}
}

/**
 * This is intentionally stronger than
 * assertMayCalculate().
 *
 * It answers whether the model has completed the
 * governance lifecycle required for production
 * release.
 */
export function assertApprovedForRelease(modelId: string): void {
	const policy = requireModelPolicy(modelId);

	if (policy.review.status !== "approved") {
		throw new ModelPolicyError(`Model ${modelId} has not received scientific approval.`);
	}

	if (policy.lifecycle.release !== "approved_for_release") {
		throw new ModelPolicyError(`Model ${modelId} is not approved for production release.`);
	}
}
