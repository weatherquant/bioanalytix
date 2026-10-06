import type { GenomeBuild, StrandOrientation } from "../observations/types";
import { ACTN3_PERFORMANCE_EVIDENCE } from "./actn3Performance";
import { ADH1B_ALCOHOL_METABOLISM_EVIDENCE } from "./alcoholMetabolism";
import { ALDH2_ALCOHOL_RESPONSE_EVIDENCE } from "./aldh2AlcoholResponse";
import { ARMS2_AMD_EVIDENCE, CFH_AMD_EVIDENCE } from "./amdSusceptibility";
import { APOB_R3527Q_EVIDENCE } from "./apobFamilialHypercholesterolemia";
import { APOE_RS429358_EVIDENCE, APOE_RS7412_EVIDENCE } from "./apoe";
import {
	BRCA1_R1443X_EVIDENCE,
	BRCA2_Q2342X_EVIDENCE,
	BRCA2_R2494X_EVIDENCE,
} from "./brcaSelectedVariants";
import { CAFFEINE_METABOLISM_EVIDENCE } from "./caffeineMetabolism";
import { F2_G20210A_EVIDENCE } from "./f2Prothrombin";
import { FACTOR_V_LEIDEN_EVIDENCE } from "./factorVLeiden";
import { HFE_C282Y_EVIDENCE, HFE_H63D_EVIDENCE } from "./hfe";
import { LACTASE_PERSISTENCE_EVIDENCE } from "./lactasePersistence";
import { LPA_RS10455872_EVIDENCE, LPA_RS3798220_EVIDENCE } from "./lpaCardiovascular";
import { LRRK2_G2019S_EVIDENCE } from "./lrrk2Parkinson";
import { MUTYH_G396D_EVIDENCE, MUTYH_Y179C_EVIDENCE } from "./mutyhPolyposis";
import { SERPINA1_S_EVIDENCE, SERPINA1_Z_EVIDENCE } from "./serpina1";
import {
	TAS2R38_RS10246939_EVIDENCE,
	TAS2R38_RS1726866_EVIDENCE,
	TAS2R38_RS713598_EVIDENCE,
} from "./tas2r38BitterTaste";
import { TCF7L2_DIABETES_EVIDENCE } from "./tcf7l2Diabetes";
import { TTR_V142I_EVIDENCE } from "./ttrAmyloidosis";
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

export const HFE_COMMON_GENOTYPE_MODEL: GeneticsModelDefinition = {
	id: "hfe-common-genotype-v1",

	version: "1.0.0",

	evidenceClass: "established_risk_variant",

	engine: "haplotype",

	requiredRsids: ["rs1800562", "rs1799945"],

	evidenceIds: [HFE_C282Y_EVIDENCE.id, HFE_H63D_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",

		strand: "any",

		minimumCoverage: 1,
	},
};

export const SERPINA1_COMMON_GENOTYPE_MODEL: GeneticsModelDefinition = {
	id: "serpina1-common-genotype-v1",

	version: "1.0.0",

	evidenceClass: "established_risk_variant",

	engine: "haplotype",

	requiredRsids: ["rs28929474", "rs17580"],

	evidenceIds: [SERPINA1_Z_EVIDENCE.id, SERPINA1_S_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",

		strand: "any",

		minimumCoverage: 1,
	},
};

export const LACTASE_PERSISTENCE_MODEL: GeneticsModelDefinition = {
	id: "mcm6-lactase-persistence-v1",

	version: "1.0.0",

	evidenceClass: "established_trait_variant",

	engine: "single_variant",

	requiredRsids: ["rs4988235"],

	evidenceIds: [LACTASE_PERSISTENCE_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",

		strand: "any",

		minimumCoverage: 1,
	},
};

export const CAFFEINE_METABOLISM_MODEL: GeneticsModelDefinition = {
	id: "cyp1a2-caffeine-metabolism-v1",

	version: "1.0.0",

	evidenceClass: "established_trait_variant",

	engine: "single_variant",

	requiredRsids: ["rs762551"],

	evidenceIds: [CAFFEINE_METABOLISM_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",
		strand: "any",
		minimumCoverage: 1,
	},
};

export const ACTN3_PERFORMANCE_MODEL: GeneticsModelDefinition = {
	id: "actn3-muscle-performance-v1",

	version: "1.0.0",

	evidenceClass: "established_trait_variant",

	engine: "single_variant",

	requiredRsids: ["rs1815739"],

	evidenceIds: [ACTN3_PERFORMANCE_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",
		strand: "any",
		minimumCoverage: 1,
	},
};

export const TAS2R38_BITTER_TASTE_MODEL: GeneticsModelDefinition = {
	id: "tas2r38-bitter-taste-v1",

	version: "1.0.0",

	evidenceClass: "established_trait_variant",

	engine: "haplotype",

	requiredRsids: ["rs713598", "rs1726866", "rs10246939"],

	evidenceIds: [
		TAS2R38_RS713598_EVIDENCE.id,
		TAS2R38_RS1726866_EVIDENCE.id,
		TAS2R38_RS10246939_EVIDENCE.id,
	],

	analyticalRequirements: {
		genomeBuild: "any",
		strand: "any",
		minimumCoverage: 1,
	},
};

export const ADH1B_ALCOHOL_METABOLISM_MODEL: GeneticsModelDefinition = {
	id: "adh1b-alcohol-metabolism-v1",

	version: "1.0.0",

	evidenceClass: "established_trait_variant",

	engine: "single_variant",

	requiredRsids: ["rs1229984"],

	evidenceIds: [ADH1B_ALCOHOL_METABOLISM_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",
		strand: "any",
		minimumCoverage: 1,
	},
};

export const ALDH2_ALCOHOL_RESPONSE_MODEL: GeneticsModelDefinition = {
	id: "aldh2-alcohol-response-v1",

	version: "1.0.0",

	evidenceClass: "established_trait_variant",

	engine: "single_variant",

	requiredRsids: ["rs671"],

	evidenceIds: [ALDH2_ALCOHOL_RESPONSE_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",
		strand: "any",
		minimumCoverage: 1,
	},
};

export const LPA_CARDIOVASCULAR_MODEL: GeneticsModelDefinition = {
	id: "lpa-cardiovascular-risk-v1",

	version: "1.0.0",

	evidenceClass: "established_risk_variant",

	/*
	 * This engine is being reused for a multi-locus model.
	 *
	 * We are not claiming the two loci form one biological
	 * haplotype. "haplotype" is currently the registry's
	 * multi-observation execution path.
	 */
	engine: "haplotype",

	requiredRsids: ["rs10455872", "rs3798220"],

	evidenceIds: [LPA_RS10455872_EVIDENCE.id, LPA_RS3798220_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",
		strand: "any",
		minimumCoverage: 1,
	},
};

export const AMD_SUSCEPTIBILITY_MODEL: GeneticsModelDefinition = {
	id: "amd-common-susceptibility-v1",

	version: "1.0.0",

	evidenceClass: "established_risk_variant",

	engine: "haplotype",

	requiredRsids: ["rs1061170", "rs10490924"],

	evidenceIds: [CFH_AMD_EVIDENCE.id, ARMS2_AMD_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",
		strand: "any",
		minimumCoverage: 1,
	},
};

export const TCF7L2_DIABETES_MODEL: GeneticsModelDefinition = {
	id: "tcf7l2-type-2-diabetes-v1",

	version: "1.0.0",

	evidenceClass: "established_risk_variant",

	engine: "single_variant",

	requiredRsids: ["rs7903146"],

	evidenceIds: [TCF7L2_DIABETES_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",

		strand: "any",

		minimumCoverage: 1,
	},
};

export const LRRK2_PARKINSON_MODEL: GeneticsModelDefinition = {
	id: "lrrk2-g2019s-parkinson-v1",

	version: "1.0.0",

	evidenceClass: "established_risk_variant",

	engine: "single_variant",

	requiredRsids: ["rs34637584"],

	evidenceIds: [LRRK2_G2019S_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",
		strand: "any",
		minimumCoverage: 1,
	},
};

export const TTR_AMYLOIDOSIS_MODEL: GeneticsModelDefinition = {
	id: "ttr-v142i-amyloidosis-v1",

	version: "1.0.0",

	evidenceClass: "established_risk_variant",

	engine: "single_variant",

	requiredRsids: ["rs76992529"],

	evidenceIds: [TTR_V142I_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",

		strand: "any",

		minimumCoverage: 1,
	},
};

export const APOB_FH_MODEL: GeneticsModelDefinition = {
	id: "apob-r3527q-fh-v1",

	version: "1.0.0",

	evidenceClass: "established_risk_variant",

	engine: "single_variant",

	requiredRsids: ["rs5742904"],

	evidenceIds: [APOB_R3527Q_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",

		strand: "any",

		minimumCoverage: 1,
	},
};

export const F2_PROTHROMBIN_MODEL: GeneticsModelDefinition = {
	id: "f2-g20210a-thrombophilia-v1",

	version: "1.0.0",

	evidenceClass: "established_risk_variant",

	engine: "single_variant",

	requiredRsids: ["rs1799963"],

	evidenceIds: [F2_G20210A_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",

		strand: "any",

		minimumCoverage: 1,
	},
};

export const MUTYH_POLYPOSIS_MODEL: GeneticsModelDefinition = {
	id: "mutyh-selected-variants-v1",

	version: "1.0.0",

	evidenceClass: "established_risk_variant",

	engine: "haplotype",

	requiredRsids: ["rs34612342", "rs36053993"],

	evidenceIds: [MUTYH_Y179C_EVIDENCE.id, MUTYH_G396D_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",
		strand: "any",
		minimumCoverage: 1,
	},
};

export const BRCA_SELECTED_VARIANTS_MODEL: GeneticsModelDefinition = {
	id: "brca-selected-substitution-variants-v1",

	version: "1.0.0",

	evidenceClass: "established_risk_variant",

	/*
	 * This currently uses the multi-observation execution
	 * path. It is not claiming these variants form a
	 * biological haplotype.
	 */
	engine: "haplotype",

	requiredRsids: ["rs41293455", "rs80358928", "rs80358972"],

	evidenceIds: [BRCA1_R1443X_EVIDENCE.id, BRCA2_Q2342X_EVIDENCE.id, BRCA2_R2494X_EVIDENCE.id],

	analyticalRequirements: {
		genomeBuild: "any",
		strand: "any",
		minimumCoverage: 1,
	},
};

export const GENETICS_MODEL_REGISTRY: readonly GeneticsModelDefinition[] = [
	FACTOR_V_LEIDEN_MODEL,
	APOE_COMMON_DIPLOTYPE_MODEL,
	HFE_COMMON_GENOTYPE_MODEL,
	SERPINA1_COMMON_GENOTYPE_MODEL,
	LACTASE_PERSISTENCE_MODEL,
	CAFFEINE_METABOLISM_MODEL,
	ACTN3_PERFORMANCE_MODEL,
	TAS2R38_BITTER_TASTE_MODEL,
	ADH1B_ALCOHOL_METABOLISM_MODEL,
	ALDH2_ALCOHOL_RESPONSE_MODEL,
	LPA_CARDIOVASCULAR_MODEL,
	AMD_SUSCEPTIBILITY_MODEL,
	TCF7L2_DIABETES_MODEL,
	LRRK2_PARKINSON_MODEL,
	TTR_AMYLOIDOSIS_MODEL,
	APOB_FH_MODEL,
	F2_PROTHROMBIN_MODEL,
	MUTYH_POLYPOSIS_MODEL,
	BRCA_SELECTED_VARIANTS_MODEL,
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
