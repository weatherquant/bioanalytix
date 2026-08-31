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

export function assertMayCalculate(modelId: string): void {
	const policy = requireModelPolicy(modelId);

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
