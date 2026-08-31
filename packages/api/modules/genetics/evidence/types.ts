export type GenomeBuild = "GRCh37" | "GRCh38" | "unknown";

export type EvidenceClass =
	| "established_risk_variant"
	| "susceptibility_haplotype"
	| "pharmacogenomic"
	| "polygenic_score"
	| "research_association";

export type EvidenceStrength = "established" | "strong" | "moderate" | "limited" | "insufficient";

export type InterpretationStatus =
	| "approved"
	| "research_only"
	| "insufficient_evidence"
	| "retired";

export type EffectMeasure =
	| "odds_ratio"
	| "hazard_ratio"
	| "relative_risk"
	| "beta"
	| "log_odds"
	| "log_hazard"
	| "none";

export type InheritanceModel =
	| "additive"
	| "dominant"
	| "recessive"
	| "genotype_specific"
	| "haplotype"
	| "polygenic"
	| "not_applicable";

export interface EvidenceSource {
	id: string;

	type:
		| "pubmed"
		| "doi"
		| "clinvar"
		| "gwas_catalog"
		| "pgs_catalog"
		| "cpic"
		| "guideline"
		| "other";

	title: string;

	identifier?: string;
	publicationYear?: number;

	accessedAt: string;
}

export interface VariantDefinition {
	rsid: string;

	gene?: string;

	genomeBuild: GenomeBuild;

	chromosome?: string;
	position?: number;

	referenceAllele?: string;
	alternateAllele?: string;

	hgvs?: string;
}

export interface PopulationDescriptor {
	label: string;

	ancestry?: string[];
	country?: string[];

	sampleSize?: number;

	notes?: string;
}

export interface EffectEstimate {
	measure: EffectMeasure;

	value?: number;

	confidenceInterval?: {
		lower: number;
		upper: number;
	};

	pValue?: number;
}

export interface VariantEvidence {
	id: string;
	version: string;

	variant: VariantDefinition;

	phenotype: {
		name: string;
		ontologyId?: string;
	};

	evidenceClass: EvidenceClass;
	evidenceStrength: EvidenceStrength;

	effectAllele?: string;
	otherAllele?: string;

	inheritanceModel: InheritanceModel;

	effect?: EffectEstimate;

	developmentPopulation?: PopulationDescriptor;
	validationPopulations?: PopulationDescriptor[];

	replicated?: boolean;

	sources: EvidenceSource[];

	status: InterpretationStatus;

	review: {
		reviewed: boolean;
		reviewer?: string;
		reviewedAt?: string;
	};

	limitations: string[];
}
