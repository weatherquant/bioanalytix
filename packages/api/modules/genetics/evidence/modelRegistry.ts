import type { GenomeBuild, StrandOrientation } from "../observations/types";
import { APOE_RS429358_EVIDENCE, APOE_RS7412_EVIDENCE } from "./apoe";
import { FACTOR_V_LEIDEN_EVIDENCE } from "./factorVLeiden";
import type { EvidenceClass } from "./types";

export type InterpretationEngineKind =
	| "single_variant"
	| "haplotype"
	| "polygenic_score"
	| "pharmacogenomic"
	| "research_association";

export interface AnalyticalInputRequirements {
	/**
	 * Allowed genome builds for this interpretation.
	 *
	 * "any" means the current implementation can
	 * interpret the model without requiring a known
	 * build-specific coordinate.
	 */
	genomeBuild: "any" | "known" | readonly GenomeBuild[];

	/**
	 * Strand requirements for valid interpretation.
	 */
	strand: "any" | "known" | "forward" | "model_specific";

	/**
	 * Fraction of required model loci that must be
	 * analytically usable.
	 *
	 * Required loci themselves are defined once,
	 * at GeneticsModelDefinition.requiredRsids.
	 */
	minimumCoverage: number;
}

export interface GeneticsModelDefinition {
	readonly id: string;

	readonly version: string;

	readonly evidenceClass: EvidenceClass;

	readonly engine: InterpretationEngineKind;

	/**
	 * Canonical locus requirements for the model.
	 *
	 * This is the single source of truth for which
	 * rsIDs are required by the interpretation.
	 */
	readonly requiredRsids: readonly string[];

	/**
	 * Evidence records supporting this model.
	 */
	readonly evidenceIds: readonly string[];

	/**
	 * Technical requirements for interpreting the
	 * required observations.
	 *
	 * Planning permissions, clinical boundaries and
	 * release governance deliberately do not belong
	 * here. Those are controlled by modelPolicy.
	 */
	readonly analyticalRequirements: AnalyticalInputRequirements;
}

export const FACTOR_V_LEIDEN_MODEL: GeneticsModelDefinition = {
	id: FACTOR_V_LEIDEN_EVIDENCE.id,

	version: FACTOR_V_LEIDEN_EVIDENCE.version,

	evidenceClass: FACTOR_V_LEIDEN_EVIDENCE.evidenceClass,

	engine: "single_variant",

	requiredRsids: ["rs6025"],

	evidenceIds: [FACTOR_V_LEIDEN_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",

		strand: "any",

		minimumCoverage: 1,
	},
};

export const APOE_COMMON_DIPLOTYPE_MODEL: GeneticsModelDefinition = {
	id: "apoe-common-diplotype-v1",

	version: "1.0.0",

	evidenceClass: "susceptibility_haplotype",

	engine: "haplotype",

	requiredRsids: ["rs429358", "rs7412"],

	evidenceIds: [APOE_RS429358_EVIDENCE.id, APOE_RS7412_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",

		strand: "any",

		minimumCoverage: 1,
	},
};

export const GENETICS_MODEL_REGISTRY: readonly GeneticsModelDefinition[] = [
	FACTOR_V_LEIDEN_MODEL,
	APOE_COMMON_DIPLOTYPE_MODEL,
];

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
 * Finds models for which every required rsID is
 * present.
 *
 * This is only an availability check.
 *
 * Presence does not establish analytical validity,
 * planning eligibility, clinical validity or fitness
 * for medical use.
 */
export function findModelsWithRequiredRsids(rsids: Iterable<string>): GeneticsModelDefinition[] {
	const available = new Set(Array.from(rsids).map((rsid) => rsid.toLowerCase()));

	return GENETICS_MODEL_REGISTRY.filter((model) =>
		model.requiredRsids.every((rsid) => available.has(rsid.toLowerCase())),
	);
}

/**
 * Type-level documentation of provenance dimensions
 * that analytical requirements may constrain in
 * future models.
 */
export interface ModelAnalyticalProvenance {
	genomeBuild: GenomeBuild;

	strandOrientation: StrandOrientation;
}
