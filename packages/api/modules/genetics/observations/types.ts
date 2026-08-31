export type GenomeBuild = "GRCh37" | "GRCh38" | "unknown";

export type GenotypeSource =
	| "consumer_raw_data"
	| "clinical_test"
	| "research_dataset"
	| "manual_entry"
	| "unknown";

export type GenotypeCallStatus = "called" | "no_call" | "invalid" | "missing";

export type StrandOrientation = "forward" | "reverse" | "unknown";

export type ConfirmationStatus = "unconfirmed" | "confirmed" | "not_required";

export interface GenotypeObservation {
	rsid: string;

	genotype?: string;

	callStatus: GenotypeCallStatus;

	source: {
		type: GenotypeSource;
		provider?: string;
		fileFormat?: string;
	};

	genomeBuild: GenomeBuild;

	strandOrientation: StrandOrientation;

	confirmationStatus: ConfirmationStatus;

	observedAt?: string;

	provenance: {
		parserVersion: string;
		sourceRecord?: string;
	};

	limitations: string[];
}
