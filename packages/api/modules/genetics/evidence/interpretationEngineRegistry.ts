import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { requireModelInterpreter, type ObservationIndex } from "./modelInterpreterRegistry";
import type { GeneticsModelDefinition } from "./modelRegistry";

export type InterpretationEngine = (
	model: GeneticsModelDefinition,
	observations: ReadonlyMap<string, GenotypeObservation>,
) => BiologicalInsight;

function executeRegisteredModel(
	model: GeneticsModelDefinition,
	observations: ObservationIndex,
): BiologicalInsight {
	const interpreter = requireModelInterpreter(model.id);

	return interpreter(model, observations);
}

/**
 * Engine families define the scientific interpretation
 * architecture supported by Bioanalytix.
 *
 * Exact model implementations live separately in the
 * model interpreter registry.
 */
const singleVariantEngine: InterpretationEngine = (model, observations) => {
	if (model.engine !== "single_variant") {
		throw new Error(
			`Single-variant engine received incompatible model engine: ${model.engine}`,
		);
	}

	return executeRegisteredModel(model, observations);
};

const haplotypeEngine: InterpretationEngine = (model, observations) => {
	if (model.engine !== "haplotype") {
		throw new Error(`Haplotype engine received incompatible model engine: ${model.engine}`);
	}

	return executeRegisteredModel(model, observations);
};

export const INTERPRETATION_ENGINE_REGISTRY = {
	single_variant: singleVariantEngine,

	haplotype: haplotypeEngine,
} as const satisfies Partial<Record<GeneticsModelDefinition["engine"], InterpretationEngine>>;

export function getInterpretationEngine(
	engineKind: GeneticsModelDefinition["engine"],
): InterpretationEngine | undefined {
	return (
		INTERPRETATION_ENGINE_REGISTRY as Partial<
			Record<GeneticsModelDefinition["engine"], InterpretationEngine>
		>
	)[engineKind];
}

export function requireInterpretationEngine(
	engineKind: GeneticsModelDefinition["engine"],
): InterpretationEngine {
	const engine = getInterpretationEngine(engineKind);

	if (!engine) {
		throw new Error(`No interpretation engine registered for engine kind: ${engineKind}`);
	}

	return engine;
}
