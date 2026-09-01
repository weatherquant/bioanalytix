import type { GenotypeObservation } from "../observations/types";
import { interpretApoe } from "./apoeInterpretation";
import { interpretFactorVLeiden } from "./factorVLeidenInterpretation";
import type { BiologicalInsight } from "./insight";
import {
	findModelsWithRequiredRsids,
	requireGeneticsModel,
	type GeneticsModelDefinition,
} from "./modelRegistry";

function indexObservationsByRsid(
	observations: readonly GenotypeObservation[],
): Map<string, GenotypeObservation> {
	const index = new Map<string, GenotypeObservation>();

	for (const observation of observations) {
		index.set(observation.rsid.toLowerCase(), observation);
	}

	return index;
}

function requireObservation(
	index: Map<string, GenotypeObservation>,
	rsid: string,
): GenotypeObservation {
	const observation = index.get(rsid.toLowerCase());

	if (!observation) {
		throw new Error(`Required genotype observation is missing: ${rsid}`);
	}

	return observation;
}

function interpretModel(
	model: GeneticsModelDefinition,
	index: Map<string, GenotypeObservation>,
): BiologicalInsight {
	switch (model.id) {
		case "f5-factor-v-leiden-vte":
			return interpretFactorVLeiden(requireObservation(index, "rs6025"));

		case "apoe-common-diplotype-v1":
			return interpretApoe(
				requireObservation(index, "rs429358"),
				requireObservation(index, "rs7412"),
			);

		default:
			throw new Error(`No interpretation implementation registered for model: ${model.id}`);
	}
}

export function interpretRegisteredModel(
	modelId: string,
	observations: readonly GenotypeObservation[],
): BiologicalInsight {
	const model = requireGeneticsModel(modelId);

	const index = indexObservationsByRsid(observations);

	return interpretModel(model, index);
}

export function interpretAvailableModels(
	observations: readonly GenotypeObservation[],
): BiologicalInsight[] {
	const index = indexObservationsByRsid(observations);

	const availableModels = findModelsWithRequiredRsids(index.keys());

	return availableModels.map((model) => interpretModel(model, index));
}
