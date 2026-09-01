import { buildObservationIndex } from "../observations/observationIndex";
import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { requireInterpretationEngine } from "./interpretationEngineRegistry";
import { findModelsWithRequiredRsids, requireGeneticsModel } from "./modelRegistry";

export function interpretRegisteredModel(
	modelId: string,
	observations: readonly GenotypeObservation[],
): BiologicalInsight {
	const model = requireGeneticsModel(modelId);

	const resolution = buildObservationIndex(observations);

	const engine = requireInterpretationEngine(model.engine);

	return engine(model, resolution.index);
}

export function interpretAvailableModels(
	observations: readonly GenotypeObservation[],
): BiologicalInsight[] {
	const resolution = buildObservationIndex(observations);

	const models = findModelsWithRequiredRsids(resolution.index.keys());

	return models.map((model) => {
		const engine = requireInterpretationEngine(model.engine);

		return engine(model, resolution.index);
	});
}
