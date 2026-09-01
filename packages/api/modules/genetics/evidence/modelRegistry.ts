import type {
	ConfirmationStatus,
	GenomeBuild,
	GenotypeSource,
	StrandOrientation,
} from "../observations/types";
import { APOE_RS429358_EVIDENCE, APOE_RS7412_EVIDENCE } from "./apoe";
import { FACTOR_V_LEIDEN_EVIDENCE } from "./factorVLeiden";
import type { EvidenceClass, EvidenceStrength } from "./types";

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
	 * "any" means the model can be interpreted without
	 * build-specific coordinates because its current
	 * implementation is rsID/genotype based.
	 */
	genomeBuild: "any" | "known" | readonly GenomeBuild[];

	/**
	 * Strand requirements for valid interpretation.
	 */
	strand: "any" | "known" | "forward" | "model_specific";

	requiredRsids: readonly string[];

	/**
	 * Fraction of required loci that must be present.
	 *
	 * Current registered models require full coverage.
	 */
	minimumCoverage: number;
}

export interface PlanningInputRequirements {
	/**
	 * Whether this model may contribute to financial
	 * resilience scenarios.
	 */
	permitted: boolean;

	/**
	 * Minimum scientific evidence level required before
	 * the result can affect planning scenarios.
	 */
	minimumEvidenceStrength: EvidenceStrength;

	/**
	 * Consumer raw genotype data may be useful for
	 * risk-resilience planning without being sufficient
	 * for clinical decision-making.
	 */
	consumerRawDataPermitted: boolean;

	/**
	 * Whether clinical confirmation is required before
	 * this result may create planning scenarios.
	 */
	clinicalConfirmationRequired: boolean;
}

export interface ClinicalInputRequirements {
	/**
	 * Bioanalytix does not treat consumer raw genetic
	 * data as sufficient for medical action.
	 */
	confirmationRequired: boolean;

	medicalActionFromConsumerRawData: false;
}

export interface ModelInputRequirements {
	analytical: AnalyticalInputRequirements;
	planning: PlanningInputRequirements;
	clinical: ClinicalInputRequirements;
}

export interface GeneticsModelDefinition {
	readonly id: string;
	readonly version: string;
	readonly evidenceClass: EvidenceClass;
	readonly engine: InterpretationEngineKind;
	readonly requiredRsids: readonly string[];
	readonly evidenceIds: readonly string[];
	readonly inputRequirements: ModelInputRequirements;
}

export const FACTOR_V_LEIDEN_MODEL: GeneticsModelDefinition = {
	id: FACTOR_V_LEIDEN_EVIDENCE.id,
	version: FACTOR_V_LEIDEN_EVIDENCE.version,
	evidenceClass: FACTOR_V_LEIDEN_EVIDENCE.evidenceClass,
	engine: "single_variant",
	requiredRsids: ["rs6025"],
	evidenceIds: [FACTOR_V_LEIDEN_EVIDENCE.id],
	inputRequirements: {
		analytical: {
			genomeBuild: "any",
			strand: "any",
			requiredRsids: ["rs6025"],
			minimumCoverage: 1,
		},
		planning: {
			permitted: true,
			minimumEvidenceStrength: "established",
			consumerRawDataPermitted: true,
			clinicalConfirmationRequired: false,
		},
		clinical: {
			confirmationRequired: true,
			medicalActionFromConsumerRawData: false,
		},
	},
};

export const APOE_COMMON_DIPLOTYPE_MODEL: GeneticsModelDefinition = {
	id: "apoe-common-diplotype-v1",
	version: "1.0.0",
	evidenceClass: "susceptibility_haplotype",
	engine: "haplotype",
	requiredRsids: ["rs429358", "rs7412"],
	evidenceIds: [APOE_RS429358_EVIDENCE.id, APOE_RS7412_EVIDENCE.id],
	inputRequirements: {
		analytical: {
			genomeBuild: "any",
			strand: "any",
			requiredRsids: ["rs429358", "rs7412"],
			minimumCoverage: 1,
		},
		planning: {
			permitted: true,
			minimumEvidenceStrength: "established",
			consumerRawDataPermitted: true,
			clinicalConfirmationRequired: false,
		},
		clinical: {
			confirmationRequired: true,
			medicalActionFromConsumerRawData: false,
		},
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
 * Finds models for which every required rsID is present.
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
 * Kept here as type-level documentation of the
 * provenance dimensions that input requirements may
 * constrain in future models.
 */
export type ModelInputProvenance = {
	source: GenotypeSource;
	genomeBuild: GenomeBuild;
	strandOrientation: StrandOrientation;
	confirmationStatus: ConfirmationStatus;
};
