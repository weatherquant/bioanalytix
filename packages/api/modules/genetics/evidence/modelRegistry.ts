import { APOE_RS429358_EVIDENCE, APOE_RS7412_EVIDENCE } from "./apoe";
import { FACTOR_V_LEIDEN_EVIDENCE } from "./factorVLeiden";
import type { EvidenceClass } from "./types";

export type InterpretationEngineKind =
	| "single_variant"
	| "haplotype"
	| "polygenic_score"
	| "pharmacogenomic"
	| "research_association";

export interface GeneticsModelDefinition {
	readonly id: string;

	readonly version: string;

	readonly evidenceClass: EvidenceClass;

	readonly engine: InterpretationEngineKind;

	/**
	 * rsIDs that must be available before the
	 * interpretation engine can attempt this model.
	 *
	 * Presence alone does not mean the observation
	 * is scientifically eligible for interpretation.
	 * Model-specific validation still occurs later.
	 */
	readonly requiredRsids: readonly string[];

	/**
	 * Evidence records supporting this model.
	 *
	 * A model may depend on one evidence record,
	 * multiple variant records, or eventually a
	 * polygenic score definition.
	 */
	readonly evidenceIds: readonly string[];
}

/**
 * Factor V Leiden is the reference implementation
 * for a single-variant genotype-specific model.
 */
export const FACTOR_V_LEIDEN_MODEL = {
	id: FACTOR_V_LEIDEN_EVIDENCE.id,

	version: FACTOR_V_LEIDEN_EVIDENCE.version,

	evidenceClass: FACTOR_V_LEIDEN_EVIDENCE.evidenceClass,

	engine: "single_variant",

	requiredRsids: ["rs6025"],

	evidenceIds: [FACTOR_V_LEIDEN_EVIDENCE.id],
} as const satisfies GeneticsModelDefinition;

/**
 * APOE is the reference implementation for a
 * multi-variant haplotype/diplotype model.
 */
export const APOE_COMMON_DIPLOTYPE_MODEL = {
	id: "apoe-common-diplotype-v1",

	version: "1.0.0",

	evidenceClass: "susceptibility_haplotype",

	engine: "haplotype",

	requiredRsids: ["rs429358", "rs7412"],

	evidenceIds: [APOE_RS429358_EVIDENCE.id, APOE_RS7412_EVIDENCE.id],
} as const satisfies GeneticsModelDefinition;

/**
 * Master catalogue of genetics interpretation models.
 *
 * New scientifically approved models should normally
 * enter Bioanalytix here rather than being wired
 * independently into the application.
 */
export const GENETICS_MODEL_REGISTRY = [
	FACTOR_V_LEIDEN_MODEL,
	APOE_COMMON_DIPLOTYPE_MODEL,
] as const satisfies readonly GeneticsModelDefinition[];

export function listGeneticsModels(): readonly GeneticsModelDefinition[] {
	return GENETICS_MODEL_REGISTRY;
}

export function getGeneticsModel(modelId: string): GeneticsModelDefinition | undefined {
	return GENETICS_MODEL_REGISTRY.find((model) => model.id === modelId);
}

export function requireGeneticsModel(modelId: string): GeneticsModelDefinition {
	const model = getGeneticsModel(modelId);

	if (!model) {
		throw new Error(`Unknown genetics model: ${modelId}`);
	}

	return model;
}

/**
 * Returns models for which every required rsID
 * is present in the supplied set.
 *
 * This is deliberately only an availability check.
 * It does NOT assert that the observations are valid,
 * correctly oriented, confirmed, or scientifically
 * eligible for interpretation.
 */
export function findModelsWithRequiredRsids(rsids: Iterable<string>): GeneticsModelDefinition[] {
	const availableRsids = new Set(Array.from(rsids, (rsid) => rsid.toLowerCase()));

	return GENETICS_MODEL_REGISTRY.filter((model) =>
		model.requiredRsids.every((rsid) => availableRsids.has(rsid.toLowerCase())),
	);
}
