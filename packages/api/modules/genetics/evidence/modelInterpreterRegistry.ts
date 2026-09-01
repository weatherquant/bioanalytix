import type { GenotypeObservation } from "../observations/types";
import { interpretApoe } from "./apoeInterpretation";
import { interpretFactorVLeiden } from "./factorVLeidenInterpretation";
import type { BiologicalInsight } from "./insight";
import type { GeneticsModelDefinition } from "./modelRegistry";

export type ObservationIndex = ReadonlyMap<string, GenotypeObservation>;

export type ModelInterpreter = (
	model: GeneticsModelDefinition,
	observations: ObservationIndex,
) => BiologicalInsight;

function requireObservation(observations: ObservationIndex, rsid: string): GenotypeObservation {
	const observation = observations.get(rsid.toLowerCase());

	if (!observation) {
		throw new Error(`Required genotype observation is missing: ${rsid}`);
	}

	return observation;
}

const interpretFactorVLeidenModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "f5-factor-v-leiden-vte") {
		throw new Error(`Factor V Leiden interpreter received incompatible model: ${model.id}`);
	}

	return interpretFactorVLeiden(requireObservation(observations, "rs6025"));
};

const interpretApoeModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "apoe-common-diplotype-v1") {
		throw new Error(`APOE interpreter received incompatible model: ${model.id}`);
	}

	return interpretApoe(
		requireObservation(observations, "rs429358"),
		requireObservation(observations, "rs7412"),
	);
};

/**
 * Registry of exact scientific model implementations.
 *
 * The model registry describes what models exist.
 * This registry describes how each model is executed.
 *
 * Keeping these concerns separate allows scientific
 * model metadata to evolve independently from the
 * application orchestration layer.
 */
export const MODEL_INTERPRETER_REGISTRY = {
	"f5-factor-v-leiden-vte": interpretFactorVLeidenModel,

	"apoe-common-diplotype-v1": interpretApoeModel,
} as const satisfies Record<string, ModelInterpreter>;

export function getModelInterpreter(modelId: string): ModelInterpreter | undefined {
	return (MODEL_INTERPRETER_REGISTRY as Record<string, ModelInterpreter>)[modelId];
}

export function requireModelInterpreter(modelId: string): ModelInterpreter {
	const interpreter = getModelInterpreter(modelId);

	if (!interpreter) {
		throw new Error(`No model interpreter registered for model: ${modelId}`);
	}

	return interpreter;
}
