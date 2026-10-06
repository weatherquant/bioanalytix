export type ResearchEvidenceType =
	| "systematic_review"
	| "meta_analysis"
	| "clinical_guideline"
	| "cohort_study"
	| "clinical_trial"
	| "other";

export type ResearchSignal = "worth_knowing" | "worth_following" | "established_evidence";

export interface BioanalytixResearchItem {
	id: string;

	title: string;
	source: string;
	publicationDate: string;
	url: string;

	summary: string;
	whyItMatters: string;
	takeaway: string;

	topics: string[];
	relatedGenes: string[];
	relatedHighlightIds?: string[];

	evidenceType: ResearchEvidenceType;
	signal: ResearchSignal;

	limitations: string[];
}

export const BIOANALYTIX_RESEARCH_CATALOG: readonly BioanalytixResearchItem[] = [
	{
		id: "apoe-dementia-after-90-2026",
		title: "APOE and dementia risk in very late life",
		source: "PubMed",
		publicationDate: "2026",
		url: "https://pubmed.ncbi.nlm.nih.gov/42551464/",
		summary:
			"Researchers examined how APOE relates to dementia incidence among people reaching very advanced ages. The work helps refine our understanding of how a well-established genetic susceptibility factor behaves later in life rather than treating its effect as constant across every age.",
		whyItMatters:
			"APOE is represented in your Bioanalytix genetic evidence, so research that improves understanding of APOE across the lifespan may be useful to follow.",
		takeaway:
			"This research adds context to an established biological pathway. It does not predict whether an individual will develop dementia and does not by itself change your longevity or retirement-planning assumptions.",
		topics: ["Brain health", "Healthy ageing", "Longevity"],
		relatedGenes: ["APOE"],
		evidenceType: "cohort_study",
		signal: "worth_following",
		limitations: [
			"Population research does not provide an individual prediction.",
			"APOE is neither necessary nor sufficient for late-onset Alzheimer disease.",
			"Age, ancestry, health, environment and other factors affect observed outcomes.",
		],
	},
	{
		id: "hfe-haemochromatosis-modifiers-2026",
		title: "What researchers are learning about HFE-related outcomes",
		source: "PubMed",
		publicationDate: "2026",
		url: "https://pubmed.ncbi.nlm.nih.gov/41951274/",
		summary:
			"Recent research has continued to investigate why people with HFE-related genetic susceptibility can experience very different outcomes. Work on genetic and other modifiers may eventually help explain some of that variation.",
		whyItMatters:
			"HFE is represented in your Bioanalytix profile. This makes developments in HFE research worth following, while keeping the study population and your own genetic finding clearly separate.",
		takeaway:
			"This is a research pathway to stay informed about, not a new personal risk estimate. The study population is not equivalent to every person carrying an HFE variant.",
		topics: ["Iron metabolism", "Liver health", "Genetic modifiers"],
		relatedGenes: ["HFE"],
		evidenceType: "cohort_study",
		signal: "worth_following",
		limitations: [
			"Findings from HFE C282Y homozygotes should not be assumed to apply directly to a person carrying one C282Y copy.",
			"Genotype alone does not determine whether clinically significant iron overload will occur.",
			"Consumer genotype data is not equivalent to clinical confirmation.",
		],
	},
	{
		id: "human-lifespan-heritability-2026",
		title: "How much of human lifespan may be influenced by genetics?",
		source: "PubMed",
		publicationDate: "2026",
		url: "https://pubmed.ncbi.nlm.nih.gov/41610249/",
		summary:
			"Researchers continue to refine estimates of the genetic contribution to human lifespan. New methods are helping separate inherited biological effects from environmental, demographic and family influences that can make longevity appear more heritable than it is.",
		whyItMatters:
			"Longevity is central to long-term planning, but no single genetic result tells Bioanalytix how long you will live. Research like this helps explain why longevity should be explored as a range rather than treated as a DNA-derived prediction.",
		takeaway:
			"Genetics can contribute to longevity, but lifespan emerges from many biological and non-biological influences. Bioanalytix therefore uses explicit planning horizons rather than converting DNA into a predicted age at death.",
		topics: ["Longevity", "Healthy ageing", "Genetics"],
		relatedGenes: [],
		evidenceType: "other",
		signal: "worth_knowing",
		limitations: [
			"Heritability describes variation across populations rather than an individual's expected lifespan.",
			"Estimates depend on study design, population and methodology.",
			"Population-level genetic influence should not be converted into an individual lifespan adjustment.",
		],
	},
];
