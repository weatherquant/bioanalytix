import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { requireInterpretationEngine } from "./interpretationEngineRegistry";
import { findModelsWithRequiredRsids, requireGeneticsModel } from "./modelRegistry";

function indexObservationsByRsid(
	observations: readonly GenotypeObservation[],
): Map<string, GenotypeObservation> {
	const index = new Map<string, GenotypeObservation>();

	for (const observation of observations) {
		index.set(observation.rsid.toLowerCase(), observation);
	}

	return index;
}

export function interpretRegisteredModel(
	modelId: string,
	observations: readonly GenotypeObservation[],
): BiologicalInsight {
	const model = requireGeneticsModel(modelId);

	const index = indexObservationsByRsid(observations);

	const engine = requireInterpretationEngine(model.engine);

	return engine(model, index);
}

export function interpretAvailableModels(
	observations: readonly GenotypeObservation[],
): BiologicalInsight[] {
	const index = indexObservationsByRsid(observations);

	const models = findModelsWithRequiredRsids(index.keys());

	return models.map((model) => {
		const engine = requireInterpretationEngine(model.engine);

		return engine(model, index);
	});
}
