import type { BiologicalInsight } from "../genetics/evidence/insight";
import type {
	GeneticHighlight,
	GeneticHighlightCategory,
	GeneticHighlightDirection,
	GeneticPlanningRelevance,
} from "./geneticHighlight";

export const GENETIC_HIGHLIGHT_ENGINE_VERSION = "1.14.0";

function normalizeDirection(insight: BiologicalInsight): GeneticHighlightDirection {
	switch (insight.result.direction) {
		case "higher":
			return "higher";

		case "reference":
			return "reference";

		case "lower":
			return "lower";

		case "indeterminate":
		default:
			return "indeterminate";
	}
}

function summaryForInsight(insight: BiologicalInsight): string {
	const clinicalSummary = confirmableClinicalSummary(insight);

	if (clinicalSummary) {
		return clinicalSummary;
	}

	if (insight.model.id === "hfe-common-genotype-v1") {
		const state = hfeStateForInsight(insight);

		switch (state) {
			case "c282y_homozygous":
				return "Two copies of the HFE C282Y variant were identified, a genotype associated with increased susceptibility to HFE-related iron overload.";

			case "c282y_h63d_double_heterozygous":
				return "One HFE C282Y variant and one H63D variant were identified. This double-heterozygous pattern is associated with lower-penetrance iron-overload susceptibility.";

			case "c282y_heterozygous":
				return "One copy of the HFE C282Y variant was identified. This is a carrier finding rather than an elevated haemochromatosis susceptibility result.";

			case "h63d_homozygous":
				return "Two copies of the HFE H63D variant were identified. This genotype generally has much lower clinical significance than C282Y homozygosity.";

			case "h63d_heterozygous":
				return "One copy of the HFE H63D variant was identified. This is generally a low-significance carrier finding.";

			case "reference":
				return "Neither of the common HFE C282Y or H63D susceptibility patterns assessed by this model was identified.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve this HFE model reliably.";
		}
	}

	if (insight.model.id === "serpina1-common-genotype-v1") {
		const state = serpina1StateForInsight(insight);

		switch (state) {
			case "zz":
				return "Two copies of the SERPINA1 Z variant were identified. This genotype is associated with substantially increased susceptibility to alpha-1 antitrypsin deficiency.";

			case "sz":
				return "One SERPINA1 S variant and one Z variant were identified. This genotype is associated with increased susceptibility to alpha-1 antitrypsin deficiency, although severity varies substantially.";

			case "ss":
				return "Two copies of the SERPINA1 S variant were identified. This genotype is generally associated with a milder reduction in alpha-1 antitrypsin than the ZZ genotype.";

			case "mz":
				return "One copy of the SERPINA1 Z variant was identified. This is a carrier genotype with potential health and family relevance, but it is not equivalent to the higher-risk ZZ genotype.";

			case "ms":
				return "One copy of the SERPINA1 S variant was identified. This is generally a lower-significance carrier finding.";

			case "reference":
				return "Neither of the common SERPINA1 S or Z susceptibility patterns assessed by this model was identified.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve this SERPINA1 model reliably.";
		}
	}

	if (insight.model.id === "mcm6-lactase-persistence-v1") {
		const state = lactasePersistenceStateForInsight(insight);

		switch (state) {
			case "persistent":
				return "Your genotype is consistent with continued lactase production into adulthood, a pattern associated with a greater likelihood of digesting lactose.";

			case "non_persistent":
				return "Your genotype is consistent with adult lactase non-persistence. This does not necessarily mean that dairy products will cause symptoms.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve your lactase-persistence tendency reliably.";
		}
	}

	if (insight.model.id === "cyp1a2-caffeine-metabolism-v1") {
		const state = caffeineMetabolismStateForInsight(insight);

		switch (state) {
			case "faster":
				return "Your CYP1A2 result is associated with a tendency toward faster caffeine metabolism, meaning caffeine may be cleared from your system more quickly on average.";

			case "slower":
				return "Your CYP1A2 result is associated with a tendency toward slower caffeine metabolism, meaning caffeine may remain in your system for longer on average.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve your caffeine-metabolism tendency reliably.";
		}
	}

	if (insight.model.id === "actn3-muscle-performance-v1") {
		const state = actn3PerformanceStateForInsight(insight);

		switch (state) {
			case "rr":
				return "Your ACTN3 result is consistent with full alpha-actinin-3 expression. This genotype has been observed more frequently in some power- and sprint-oriented athlete groups.";

			case "rx":
				return "Your ACTN3 result contains one functional R allele and one X stop allele. This is a common mixed genotype associated with an intermediate muscle-performance profile.";

			case "xx":
				return "Your ACTN3 result is consistent with alpha-actinin-3 deficiency, a common healthy genotype associated in some studies with a greater endurance-oriented tendency.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve your ACTN3 muscle-performance tendency reliably.";
		}
	}

	if (insight.model.id === "tas2r38-bitter-taste-v1") {
		const state = tas2r38BitterTasteStateForInsight(insight);

		switch (state) {
			case "pav_pav":
				return "Your TAS2R38 result is associated with a higher tendency to perceive certain bitter compounds such as PTC and PROP more intensely.";

			case "pav_avi":
				return "Your TAS2R38 result is associated with an intermediate tendency to perceive certain bitter compounds.";

			case "avi_avi":
				return "Your TAS2R38 result is associated with a lower tendency to perceive certain bitter compounds such as PTC and PROP intensely.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve your TAS2R38 bitter-taste tendency reliably.";
		}
	}

	if (insight.model.id === "aldh2-alcohol-response-v1") {
		const state = aldh2AlcoholResponseStateForInsight(insight);

		switch (state) {
			case "typical_clearance":
				return "Your ALDH2 result is consistent with typical acetaldehyde clearance after alcohol metabolism.";

			case "reduced_clearance":
				return "Your ALDH2 result is associated with reduced acetaldehyde clearance, which can contribute to stronger flushing or other unpleasant responses after alcohol.";

			case "markedly_reduced_clearance":
				return "Your ALDH2 result is associated with markedly reduced acetaldehyde clearance, which can lead to substantial acetaldehyde accumulation after alcohol.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve your ALDH2 alcohol-response tendency reliably.";
		}
	}

	if (insight.model.id === "lpa-cardiovascular-risk-v1") {
		const state = lpaCardiovascularStateForInsight(insight);

		switch (state) {
			case "one_risk_allele":
				return "One LPA risk allele assessed by this model was identified. These variants are associated with higher lipoprotein(a) concentrations and increased coronary disease susceptibility.";

			case "multiple_risk_alleles":
				return "Multiple LPA risk alleles assessed by this model were identified. These variants are associated with higher lipoprotein(a) concentrations and increased coronary disease susceptibility.";

			case "reference":
				return "Neither of the two LPA risk alleles assessed by this model was identified.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve this LPA cardiovascular model reliably.";
		}
	}

	if (insight.model.id === "amd-common-susceptibility-v1") {
		const state = amdSusceptibilityStateForInsight(insight);

		switch (state) {
			case "one_risk_allele":
				return "One AMD risk allele assessed by this model was identified. This is associated with increased susceptibility to age-related macular degeneration.";

			case "multiple_risk_alleles":
				return "Multiple AMD risk alleles assessed by this model were identified. These variants are associated with increased susceptibility to age-related macular degeneration.";

			case "reference":
				return "The common AMD risk alleles assessed by this model were not identified.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve this AMD susceptibility model reliably.";
		}
	}

	if (insight.model.id === "tcf7l2-type-2-diabetes-v1") {
		const state = tcf7l2DiabetesStateForInsight(insight);

		switch (state) {
			case "one_risk_allele":
				return "One TCF7L2 rs7903146 risk allele was identified. This common variant is associated with increased susceptibility to type 2 diabetes.";

			case "two_risk_alleles":
				return "Two TCF7L2 rs7903146 risk alleles were identified. This genotype is associated with increased susceptibility to type 2 diabetes.";

			case "reference":
				return "The TCF7L2 rs7903146 risk allele assessed by this model was not identified.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve this type 2 diabetes susceptibility model reliably.";
		}
	}

	if (insight.model.id === "lrrk2-g2019s-parkinson-v1") {
		const state = lrrk2ParkinsonStateForInsight(insight);

		switch (state) {
			case "heterozygous_g2019s":
			case "homozygous_g2019s":
				return "The LRRK2 G2019S variant was identified in the available genotype data. This variant is associated with LRRK2-related Parkinson disease, but it has incomplete and age-dependent penetrance and should be clinically confirmed before medical or planning action.";

			case "reference":
				return "The LRRK2 G2019S variant assessed by this model was not identified.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve the LRRK2 G2019S model reliably.";
		}
	}

	if (insight.model.id === "mutyh-selected-variants-v1") {
		const state = mutyhStateForInsight(insight);

		switch (state) {
			case "single_pathogenic_variant":
				return "One selected pathogenic MUTYH variant was identified. This is primarily a carrier finding and does not establish MUTYH-associated polyposis.";

			case "biallelic_selected_variants":
				return "Two pathogenic MUTYH alleles were identified across the selected variants assessed by this model. This pattern is associated with MUTYH-associated polyposis and should be clinically confirmed before medical or planning action.";

			case "reference":
				return "Neither of the selected pathogenic MUTYH variants assessed by this model was identified.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve the selected MUTYH variants reliably.";
		}
	}

	if (insight.model.id === "brca-selected-substitution-variants-v1") {
		const state = brcaSelectedStateForInsight(insight);

		switch (state) {
			case "one_selected_pathogenic_variant":
				return "A selected pathogenic BRCA1 or BRCA2 variant was identified in the available genotype data. This is a clinically important finding that should be independently confirmed.";

			case "multiple_selected_pathogenic_variants":
				return "More than one selected pathogenic BRCA1/BRCA2 variant allele was identified in the available genotype data. This unusual result requires independent clinical confirmation before interpretation or action.";

			case "no_selected_variant_identified":
				return "None of the selected BRCA1/BRCA2 pathogenic substitution variants assessed by this Bioanalytix model was identified. This is not equivalent to a negative comprehensive BRCA genetic test.";

			case "unresolved":
			default:
				return "The available genotype data was not sufficient to resolve the selected BRCA1/BRCA2 model reliably.";
		}
	}

	switch (insight.result.direction) {
		case "higher":
			return `This model identified a higher biological susceptibility signal relevant to ${insight.title}.`;

		case "reference":
			return `This model did not identify an elevated susceptibility signal for ${insight.title}.`;

		case "lower":
			return `This model identified a lower biological susceptibility signal relevant to ${insight.title}.`;

		case "indeterminate":
		default:
			return `This model could not determine a clear susceptibility signal for ${insight.title} from the available genotype data.`;
	}
}

function explanationForInsight(insight: BiologicalInsight): string {
	switch (insight.result.direction) {
		case "higher":
			return [
				"The result indicates a genetic association identified by the Bioanalytix evidence model.",
				"It does not mean that the associated condition will occur.",
				"Health outcomes also depend on age, environment, lifestyle, other genetic factors and clinical history.",
			].join(" ");

		case "reference":
			return [
				"The genotype assessed by this model is consistent with the model's reference category.",
				"This does not mean that the associated condition cannot occur.",
				"Genetic risk is only one component of overall health risk.",
			].join(" ");

		case "lower":
			return [
				"The model identifies a lower genetic susceptibility signal relative to its reference framework.",
				"This should not be interpreted as protection from the associated condition.",
			].join(" ");

		case "indeterminate":
		default:
			return [
				"The available genotype data was not sufficient for this model to provide a reliable directional interpretation.",
				"No risk conclusion should be drawn from this result.",
			].join(" ");
	}
}

function categoryForInsight(insight: BiologicalInsight): GeneticHighlightCategory {
	switch (insight.model.id) {
		case "hfe-common-genotype-v1": {
			const state = hfeStateForInsight(insight);

			if (state === "c282y_heterozygous" || state === "h63d_heterozygous") {
				return "carrier";
			}

			return "health_risk";
		}

		case "serpina1-common-genotype-v1": {
			const state = serpina1StateForInsight(insight);

			if (state === "mz" || state === "ms") {
				return "carrier";
			}

			return "health_risk";
		}

		case "mutyh-selected-variants-v1": {
			const state = mutyhStateForInsight(insight);

			if (state === "single_pathogenic_variant") {
				return "carrier";
			}

			return "health_risk";
		}

		case "mcm6-lactase-persistence-v1":
		case "cyp1a2-caffeine-metabolism-v1":
		case "aldh2-alcohol-response-v1":
			return "nutrition_metabolism";

		case "actn3-muscle-performance-v1":
		case "tas2r38-bitter-taste-v1":
			return "trait";

		case "apoe-common-diplotype-v1":
			return "ageing_longevity";

		case "f5-factor-v-leiden-vte":
		case "lpa-cardiovascular-risk-v1":
		case "amd-common-susceptibility-v1":
		case "tcf7l2-type-2-diabetes-v1":
		case "lrrk2-g2019s-parkinson-v1":
		case "ttr-v142i-amyloidosis-v1":
		case "apob-r3527q-fh-v1":
		case "f2-g20210a-thrombophilia-v1":
		case "brca-selected-substitution-variants-v1":
			return "health_risk";

		default:
			return "health_risk";
	}
}

function informationalRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	return {
		level: "informational",

		label: "For your awareness",

		meaning:
			"This genetic result is useful information about your profile, but Bioanalytix has not identified a reason from this result alone to change or stress-test your financial assumptions.",

		whyItMatters:
			"No specific financial-plan change is suggested from this result. The finding remains part of your genetic profile and can be reassessed as the evidence library develops.",

		planningDomains: [],

		scenarioEligible: false,
	};
}

function factorVPlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	if (insight.result.direction !== "higher") {
		return informationalRelevance(insight);
	}

	return {
		level: "potential",

		label: "Worth considering",

		meaning:
			"This established genetic finding may make health-event and recovery resilience more relevant to your financial planning, but it does not predict that a thrombosis event will occur.",

		whyItMatters:
			"A significant thrombotic event could involve treatment costs, recovery time or temporary interruption to work. The useful planning question is whether your household has enough liquidity and income resilience if such a period occurred.",

		planningDomains: [
			"health_costs",
			"healthy_working_life",
			"income_interruption",
			"insurance",
		],

		suggestedQuestion:
			"Would your household remain financially resilient if a serious health event created additional treatment costs and temporarily interrupted employment income?",

		scenarioEligible: true,
	};
}

function apoePlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	if (insight.result.direction !== "higher") {
		return informationalRelevance(insight);
	}

	return {
		level: "potential",

		label: "Worth considering",

		meaning:
			"This established susceptibility finding may increase the relevance of later-life care, financial resilience and estate-readiness planning. It is not a prediction that cognitive disease will occur.",

		whyItMatters:
			"Extended cognitive impairment can create prolonged care costs, reduce financial decision-making capacity and increase reliance on a partner or family. Those consequences may matter even when a conventional retirement projection otherwise appears well funded.",

		planningDomains: ["care_dependency", "health_costs", "estate", "family"],

		suggestedQuestion:
			"Would your retirement and estate arrangements remain resilient if you required several years of additional care or support later in life?",

		scenarioEligible: true,
	};
}

function genericHigherRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	return {
		level: "potential",

		label: "Worth considering",

		meaning:
			"This genetic finding may be relevant to an aspect of your longer-term planning, but Bioanalytix does not currently have enough model-specific information to classify the financial consequence more strongly.",

		whyItMatters:
			"The finding may be worth keeping in mind when considering future health costs, work capacity, care requirements or family resilience. No financial assumption should be changed from this result alone.",

		planningDomains: ["health_costs"],

		suggestedQuestion:
			"Would your financial plan remain resilient if this health-related risk created additional costs or disruption?",

		scenarioEligible: false,
	};
}

type HfeHighlightState =
	| "c282y_homozygous"
	| "c282y_h63d_double_heterozygous"
	| "c282y_heterozygous"
	| "h63d_homozygous"
	| "h63d_heterozygous"
	| "reference"
	| "unresolved";

function hfeStateForInsight(insight: BiologicalInsight): HfeHighlightState | undefined {
	if (insight.model.id !== "hfe-common-genotype-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "c282y_homozygous":
		case "c282y_h63d_double_heterozygous":
		case "c282y_heterozygous":
		case "h63d_homozygous":
		case "h63d_heterozygous":
		case "reference":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type Serpina1HighlightState = "zz" | "sz" | "ss" | "mz" | "ms" | "reference" | "unresolved";

function serpina1StateForInsight(insight: BiologicalInsight): Serpina1HighlightState | undefined {
	if (insight.model.id !== "serpina1-common-genotype-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "zz":
		case "sz":
		case "ss":
		case "mz":
		case "ms":
		case "reference":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type LactasePersistenceHighlightState = "persistent" | "non_persistent" | "unresolved";

function lactasePersistenceStateForInsight(
	insight: BiologicalInsight,
): LactasePersistenceHighlightState | undefined {
	if (insight.model.id !== "mcm6-lactase-persistence-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "persistent":
		case "non_persistent":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type CaffeineMetabolismHighlightState = "faster" | "slower" | "unresolved";

function caffeineMetabolismStateForInsight(
	insight: BiologicalInsight,
): CaffeineMetabolismHighlightState | undefined {
	if (insight.model.id !== "cyp1a2-caffeine-metabolism-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "faster":
		case "slower":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type Actn3PerformanceHighlightState = "rr" | "rx" | "xx" | "unresolved";

function actn3PerformanceStateForInsight(
	insight: BiologicalInsight,
): Actn3PerformanceHighlightState | undefined {
	if (insight.model.id !== "actn3-muscle-performance-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "rr":
		case "rx":
		case "xx":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type Tas2r38BitterTasteHighlightState = "pav_pav" | "pav_avi" | "avi_avi" | "unresolved";

function tas2r38BitterTasteStateForInsight(
	insight: BiologicalInsight,
): Tas2r38BitterTasteHighlightState | undefined {
	if (insight.model.id !== "tas2r38-bitter-taste-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "pav_pav":
		case "pav_avi":
		case "avi_avi":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type Aldh2AlcoholResponseHighlightState =
	| "typical_clearance"
	| "reduced_clearance"
	| "markedly_reduced_clearance"
	| "unresolved";

function aldh2AlcoholResponseStateForInsight(
	insight: BiologicalInsight,
): Aldh2AlcoholResponseHighlightState | undefined {
	if (insight.model.id !== "aldh2-alcohol-response-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "typical_clearance":
		case "reduced_clearance":
		case "markedly_reduced_clearance":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type LpaCardiovascularHighlightState =
	| "reference"
	| "one_risk_allele"
	| "multiple_risk_alleles"
	| "unresolved";

function lpaCardiovascularStateForInsight(
	insight: BiologicalInsight,
): LpaCardiovascularHighlightState | undefined {
	if (insight.model.id !== "lpa-cardiovascular-risk-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "reference":
		case "one_risk_allele":
		case "multiple_risk_alleles":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type AmdSusceptibilityHighlightState =
	| "reference"
	| "one_risk_allele"
	| "multiple_risk_alleles"
	| "unresolved";

function amdSusceptibilityStateForInsight(
	insight: BiologicalInsight,
): AmdSusceptibilityHighlightState | undefined {
	if (insight.model.id !== "amd-common-susceptibility-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "reference":
		case "one_risk_allele":
		case "multiple_risk_alleles":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type Tcf7l2DiabetesHighlightState =
	| "reference"
	| "one_risk_allele"
	| "two_risk_alleles"
	| "unresolved";

function tcf7l2DiabetesStateForInsight(
	insight: BiologicalInsight,
): Tcf7l2DiabetesHighlightState | undefined {
	if (insight.model.id !== "tcf7l2-type-2-diabetes-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "reference":
		case "one_risk_allele":
		case "two_risk_alleles":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type Lrrk2ParkinsonHighlightState =
	| "reference"
	| "heterozygous_g2019s"
	| "homozygous_g2019s"
	| "unresolved";

function lrrk2ParkinsonStateForInsight(
	insight: BiologicalInsight,
): Lrrk2ParkinsonHighlightState | undefined {
	if (insight.model.id !== "lrrk2-g2019s-parkinson-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "reference":
		case "heterozygous_g2019s":
		case "homozygous_g2019s":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type ConfirmableClinicalState =
	| "reference"
	| "heterozygous_variant"
	| "homozygous_variant"
	| "unresolved";

function confirmableClinicalStateForInsight(
	insight: BiologicalInsight,
	modelIds: readonly string[],
): ConfirmableClinicalState | undefined {
	if (!modelIds.includes(insight.model.id)) {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "reference":
		case "heterozygous_variant":
		case "homozygous_variant":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

const CONFIRMABLE_CLINICAL_MODEL_IDS = [
	"ttr-v142i-amyloidosis-v1",
	"apob-r3527q-fh-v1",
	"f2-g20210a-thrombophilia-v1",
] as const;

type MutyhHighlightState =
	| "reference"
	| "single_pathogenic_variant"
	| "biallelic_selected_variants"
	| "unresolved";

function mutyhStateForInsight(insight: BiologicalInsight): MutyhHighlightState | undefined {
	if (insight.model.id !== "mutyh-selected-variants-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "reference":
		case "single_pathogenic_variant":
		case "biallelic_selected_variants":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

type BrcaSelectedHighlightState =
	| "no_selected_variant_identified"
	| "one_selected_pathogenic_variant"
	| "multiple_selected_pathogenic_variants"
	| "unresolved";

function brcaSelectedStateForInsight(
	insight: BiologicalInsight,
): BrcaSelectedHighlightState | undefined {
	if (insight.model.id !== "brca-selected-substitution-variants-v1") {
		return undefined;
	}

	const state = insight.result.genotype;

	switch (state) {
		case "no_selected_variant_identified":
		case "one_selected_pathogenic_variant":
		case "multiple_selected_pathogenic_variants":
		case "unresolved":
			return state;

		default:
			return undefined;
	}
}

function confirmableClinicalSummary(insight: BiologicalInsight): string | undefined {
	const state = confirmableClinicalStateForInsight(insight, CONFIRMABLE_CLINICAL_MODEL_IDS);

	if (!state) {
		return undefined;
	}

	if (state === "unresolved") {
		return `The available genotype data was not sufficient to resolve ${insight.title} reliably.`;
	}

	if (state === "reference") {
		switch (insight.model.id) {
			case "ttr-v142i-amyloidosis-v1":
				return "The TTR V142I variant assessed by this model was not identified.";

			case "apob-r3527q-fh-v1":
				return "The APOB R3527Q familial-hypercholesterolaemia variant assessed by this model was not identified.";

			case "f2-g20210a-thrombophilia-v1":
				return "The F2 G20210A prothrombin variant assessed by this model was not identified.";
		}
	}

	switch (insight.model.id) {
		case "ttr-v142i-amyloidosis-v1":
			return "The TTR V142I variant was identified in the available genotype data. This pathogenic variant is associated with hereditary transthyretin amyloidosis, but consumer raw data should be independently confirmed before medical or planning action.";

		case "apob-r3527q-fh-v1":
			return "The APOB R3527Q variant was identified in the available genotype data. This pathogenic variant is associated with familial hypercholesterolaemia, but consumer raw data should be independently confirmed before medical or planning action.";

		case "f2-g20210a-thrombophilia-v1":
			return "The F2 G20210A variant was identified in the available genotype data. This variant is associated with increased venous-thrombosis susceptibility, but consumer raw data should be independently confirmed before medical or planning action.";

		default:
			return undefined;
	}
}

function hfePlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = hfeStateForInsight(insight);

	switch (state) {
		case "c282y_homozygous":
			return {
				level: "potential",

				label: "Worth considering",

				meaning:
					"Two copies of the HFE C282Y variant were identified. This genotype is associated with increased susceptibility to HFE-related iron overload, although many people with this genotype never develop clinical haemochromatosis.",

				whyItMatters:
					"If clinically significant iron overload were to develop, it could create treatment, monitoring or health-related disruption over time. Bioanalytix therefore considers health-cost and healthy-working-life resilience worth testing rather than assuming that disease will occur.",

				planningDomains: ["health_costs", "healthy_working_life"],

				suggestedQuestion:
					"Would your financial plan remain resilient if a long-term health condition required recurring monitoring, treatment or periods of reduced work capacity?",

				scenarioEligible: true,
			};

		case "c282y_h63d_double_heterozygous":
			return {
				level: "potential",

				label: "Worth considering",

				meaning:
					"One C282Y and one H63D variant were identified. This double-heterozygous pattern is associated with HFE-related iron-overload susceptibility, but its clinical penetrance is substantially lower than C282Y homozygosity. Consumer genotype data does not establish whether the variants are in trans.",

				whyItMatters:
					"This result may justify keeping health-cost resilience in view, but it does not provide a basis for assuming future illness or changing financial assumptions automatically.",

				planningDomains: ["health_costs"],

				suggestedQuestion:
					"Would your plan comfortably absorb recurring health monitoring or treatment costs if they became necessary later?",

				scenarioEligible: true,
			};

		case "h63d_homozygous":
			return {
				level: "informational",

				label: "For your awareness",

				meaning:
					"Two copies of the HFE H63D variant were identified. This genotype can be associated with altered iron measures, but its clinical significance is generally much lower than C282Y homozygosity.",

				whyItMatters:
					"Bioanalytix does not currently consider this finding alone sufficient reason to change or stress-test your financial assumptions. It remains useful genetic information that can be reassessed as evidence evolves.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "c282y_heterozygous":
			return {
				level: "informational",

				label: "Carrier finding",

				meaning:
					"One copy of the HFE C282Y variant was identified. A single copy generally does not predict development of HFE-related haemochromatosis, but it may have relevance for biological relatives.",

				whyItMatters:
					"No financial-plan change is suggested from this carrier result. Its principal relevance is genetic and potentially familial rather than financial.",

				planningDomains: ["family"],

				scenarioEligible: false,
			};

		case "h63d_heterozygous":
			return {
				level: "informational",

				label: "Carrier finding",

				meaning:
					"One copy of the HFE H63D variant was identified. This is generally a low-significance finding for the individual but remains part of your genetic profile.",

				whyItMatters:
					"No financial-plan change is suggested from this result. Bioanalytix will retain it so its interpretation can be revisited as genetic evidence develops.",

				planningDomains: ["family"],

				scenarioEligible: false,
			};

		case "reference":
			return {
				level: "informational",

				label: "For your awareness",

				meaning:
					"This model did not identify either of the common HFE C282Y or H63D susceptibility patterns assessed by Bioanalytix.",

				whyItMatters:
					"No change to your financial assumptions is suggested from this HFE result. The model does not assess every possible genetic cause of iron overload.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",

				label: "Result not resolved",

				meaning:
					"The available consumer genotype data was not sufficient for Bioanalytix to resolve this HFE model reliably.",

				whyItMatters:
					"No financial-planning conclusion should be drawn from an unresolved genetic result.",

				planningDomains: [],

				scenarioEligible: false,
			};
	}
}

function serpina1PlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = serpina1StateForInsight(insight);

	switch (state) {
		case "zz":
			return {
				level: "potential",

				label: "Worth considering",

				meaning:
					"Two copies of the SERPINA1 Z variant were identified. This genotype is associated with substantially increased susceptibility to alpha-1 antitrypsin deficiency, although genotype alone does not determine whether or when clinically significant disease will occur.",

				whyItMatters:
					"If clinically significant lung or liver disease developed, it could create recurring healthcare costs, affect working capacity or increase the importance of maintaining financial resilience. Bioanalytix therefore considers health-cost and healthy-working-life scenarios worth exploring rather than assuming that disease will occur.",

				planningDomains: [
					"health_costs",
					"healthy_working_life",
					"income_interruption",
					"insurance",
				],

				suggestedQuestion:
					"Would your household remain financially resilient if a chronic health condition created recurring treatment costs or reduced your capacity to work for a period?",

				scenarioEligible: true,
			};

		case "sz":
			return {
				level: "potential",

				label: "Worth considering",

				meaning:
					"One SERPINA1 S variant and one Z variant were identified. This genotype is associated with increased susceptibility to alpha-1 antitrypsin deficiency, although clinical effects vary considerably between individuals.",

				whyItMatters:
					"This result may make health-cost and working-life resilience more relevant to your planning. It does not provide a basis for assuming future illness or automatically changing financial assumptions.",

				planningDomains: ["health_costs", "healthy_working_life", "income_interruption"],

				suggestedQuestion:
					"Would your financial plan remain resilient if a chronic health condition created additional costs or temporarily reduced your capacity to work?",

				scenarioEligible: true,
			};

		case "ss":
			return {
				level: "informational",

				label: "For your awareness",

				meaning:
					"Two copies of the SERPINA1 S variant were identified. This genotype is generally associated with a milder reduction in alpha-1 antitrypsin than the ZZ genotype and does not by itself predict clinically significant disease.",

				whyItMatters:
					"Bioanalytix does not currently consider this result alone sufficient reason to change your financial assumptions. It remains useful genetic information that can be reassessed as evidence and your circumstances develop.",

				planningDomains: ["health_costs"],

				scenarioEligible: false,
			};

		case "mz":
			return {
				level: "informational",

				label: "Carrier finding",

				meaning:
					"One copy of the SERPINA1 Z variant was identified. This is a carrier genotype rather than the higher-risk ZZ genotype. Its health significance depends on other biological, environmental and lifestyle factors, and it may also have relevance for biological relatives.",

				whyItMatters:
					"No automatic financial-plan change is suggested from this carrier result. Its principal relevance is genetic and familial, although Bioanalytix can retain it for reassessment as evidence and your planning context evolve.",

				planningDomains: ["family"],

				scenarioEligible: false,
			};

		case "ms":
			return {
				level: "informational",

				label: "Carrier finding",

				meaning:
					"One copy of the SERPINA1 S variant was identified. This is generally a lower-significance carrier genotype but may still be relevant to your genetic profile and biological relatives.",

				whyItMatters:
					"No financial-plan change is suggested from this result. Bioanalytix will retain the finding so its interpretation can be revisited as genetic evidence develops.",

				planningDomains: ["family"],

				scenarioEligible: false,
			};

		case "reference":
			return {
				level: "informational",

				label: "For your awareness",

				meaning:
					"This model did not identify either of the common SERPINA1 S or Z susceptibility patterns assessed by Bioanalytix.",

				whyItMatters:
					"No change to your financial assumptions is suggested from this SERPINA1 result. This model assesses selected common variants and does not exclude other causes of alpha-1 antitrypsin deficiency or other health conditions.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",

				label: "Result not resolved",

				meaning:
					"The available consumer genotype data was not sufficient for Bioanalytix to resolve this SERPINA1 model reliably.",

				whyItMatters:
					"No financial-planning conclusion should be drawn from an unresolved genetic result.",

				planningDomains: [],

				scenarioEligible: false,
			};
	}
}

function lactasePersistencePlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = lactasePersistenceStateForInsight(insight);

	switch (state) {
		case "persistent":
			return {
				level: "informational",

				label: "Personal characteristic",

				meaning:
					"Your genotype is consistent with lactase persistence, meaning continued production of the lactase enzyme into adulthood is more likely.",

				whyItMatters:
					"This is primarily a nutrition and digestion trait rather than a financial-planning signal. No change to your financial assumptions is suggested.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "non_persistent":
			return {
				level: "informational",

				label: "Personal characteristic",

				meaning:
					"Your genotype is consistent with adult lactase non-persistence. This can make lactose digestion less efficient, but genotype alone does not determine whether you experience symptoms from dairy products.",

				whyItMatters:
					"This is primarily a nutrition and digestion trait rather than a financial-planning signal. No change to your financial assumptions is suggested.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",

				label: "Result not resolved",

				meaning:
					"The available consumer genotype data was not sufficient for Bioanalytix to resolve this trait reliably.",

				whyItMatters:
					"No financial-planning conclusion should be drawn from an unresolved trait result.",

				planningDomains: [],

				scenarioEligible: false,
			};
	}
}

function caffeineMetabolismPlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = caffeineMetabolismStateForInsight(insight);

	switch (state) {
		case "faster":
			return {
				level: "informational",
				label: "Personal characteristic",
				meaning:
					"Your CYP1A2 genotype is associated with greater enzyme inducibility and a tendency toward faster caffeine clearance.",
				whyItMatters:
					"This may help explain why caffeine affects you differently from other people, but it is primarily a metabolism trait rather than a financial-planning signal. No change to your financial assumptions is suggested.",
				planningDomains: [],
				scenarioEligible: false,
			};

		case "slower":
			return {
				level: "informational",
				label: "Personal characteristic",
				meaning:
					"Your CYP1A2 genotype is associated with a tendency toward slower caffeine clearance. Caffeine may therefore remain active in your system for longer.",
				whyItMatters:
					"This may help explain stronger or longer-lasting effects from coffee or other caffeine sources. Sleep, tolerance, medications, smoking and habitual intake also matter. This is not a financial-planning signal.",
				planningDomains: [],
				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",
				label: "Result not resolved",
				meaning:
					"The available consumer genotype data was not sufficient for Bioanalytix to resolve this trait reliably.",
				whyItMatters:
					"No financial-planning conclusion should be drawn from an unresolved trait result.",
				planningDomains: [],
				scenarioEligible: false,
			};
	}
}

function actn3PerformancePlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = actn3PerformanceStateForInsight(insight);

	switch (state) {
		case "rr":
			return {
				level: "informational",
				label: "Personal characteristic",
				meaning:
					"Your ACTN3 genotype is consistent with full alpha-actinin-3 expression, a pattern associated in some studies with power- and sprint-oriented muscle performance.",
				whyItMatters:
					"This is an interesting physiology trait rather than a financial-planning signal. Training, age, body composition, environment and many other genes have a much larger role in actual performance.",
				planningDomains: [],
				scenarioEligible: false,
			};

		case "rx":
			return {
				level: "informational",
				label: "Personal characteristic",
				meaning:
					"You carry one functional ACTN3 R allele and one X stop allele. This common genotype sits between the two homozygous ACTN3 patterns.",
				whyItMatters:
					"This may contribute modestly to your muscle-performance phenotype, but it does not determine athletic ability or the type of exercise you should prefer. It has no direct financial-plan implication.",
				planningDomains: [],
				scenarioEligible: false,
			};

		case "xx":
			return {
				level: "informational",
				label: "Personal characteristic",
				meaning:
					"Your genotype is consistent with absence of functional alpha-actinin-3. This is a common healthy variant and has been associated in some studies with a more endurance-oriented muscle phenotype.",
				whyItMatters:
					"This may help describe part of your muscle physiology, but it does not determine athletic ability. No change to your financial assumptions is suggested.",
				planningDomains: [],
				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",
				label: "Result not resolved",
				meaning:
					"The available consumer genotype data was not sufficient for Bioanalytix to resolve this trait reliably.",
				whyItMatters:
					"No financial-planning conclusion should be drawn from an unresolved trait result.",
				planningDomains: [],
				scenarioEligible: false,
			};
	}
}

function tas2r38BitterTastePlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = tas2r38BitterTasteStateForInsight(insight);

	switch (state) {
		case "pav_pav":
			return {
				level: "informational",
				label: "Personal characteristic",
				meaning:
					"Your common TAS2R38 haplotype pattern is associated with greater sensitivity to some bitter compounds.",
				whyItMatters:
					"This may help explain why some bitter foods, drinks or flavours taste unusually strong to you. Food preference is influenced by many other sensory, cultural and behavioural factors, so this is a personal trait rather than a health or financial-planning signal.",
				planningDomains: [],
				scenarioEligible: false,
			};

		case "pav_avi":
			return {
				level: "informational",
				label: "Personal characteristic",
				meaning:
					"Your common TAS2R38 pattern is associated with an intermediate bitter-taste sensitivity phenotype.",
				whyItMatters:
					"This may contribute modestly to how strongly you perceive some bitter flavours, but it does not determine your food preferences. It has no direct financial-planning implication.",
				planningDomains: [],
				scenarioEligible: false,
			};

		case "avi_avi":
			return {
				level: "informational",
				label: "Personal characteristic",
				meaning:
					"Your common TAS2R38 haplotype pattern is associated with lower sensitivity to some bitter compounds.",
				whyItMatters:
					"This may help explain why certain bitter flavours seem less intense to you than they do to other people. It is an interesting sensory trait rather than a financial-planning signal.",
				planningDomains: [],
				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",
				label: "Result not resolved",
				meaning:
					"The available consumer genotype data was not sufficient for Bioanalytix to resolve this bitter-taste trait reliably.",
				whyItMatters:
					"No financial-planning conclusion should be drawn from an unresolved trait result.",
				planningDomains: [],
				scenarioEligible: false,
			};
	}
}

function aldh2AlcoholResponsePlanningRelevance(
	insight: BiologicalInsight,
): GeneticPlanningRelevance {
	const state = aldh2AlcoholResponseStateForInsight(insight);

	switch (state) {
		case "typical_clearance":
			return {
				level: "informational",
				label: "Personal characteristic",
				meaning: "Your ALDH2 genotype is consistent with typical acetaldehyde clearance.",
				whyItMatters:
					"This is an alcohol-metabolism characteristic rather than a financial-planning signal. Drinking behaviour and alcohol-related health outcomes depend on many other genetic, behavioural and environmental factors.",
				planningDomains: [],
				scenarioEligible: false,
			};

		case "reduced_clearance":
			return {
				level: "informational",
				label: "Personal characteristic",
				meaning:
					"Your ALDH2 genotype is associated with reduced clearance of acetaldehyde, a metabolite produced when alcohol is broken down.",
				whyItMatters:
					"This may help explain flushing or stronger unpleasant responses to alcohol. It should not be interpreted as a diagnosis or as advice about alcohol consumption, and it does not directly alter your financial plan.",
				planningDomains: [],
				scenarioEligible: false,
			};

		case "markedly_reduced_clearance":
			return {
				level: "informational",
				label: "Personal characteristic",
				meaning:
					"Your ALDH2 genotype is associated with markedly reduced acetaldehyde clearance after alcohol consumption.",
				whyItMatters:
					"This may contribute to pronounced flushing or other adverse responses to alcohol. It is primarily a metabolism result and does not automatically create a financial-planning scenario.",
				planningDomains: [],
				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",
				label: "Result not resolved",
				meaning:
					"The available consumer genotype data was not sufficient for Bioanalytix to resolve this trait reliably.",
				whyItMatters:
					"No financial-planning conclusion should be drawn from an unresolved trait result.",
				planningDomains: [],
				scenarioEligible: false,
			};
	}
}

function lpaCardiovascularPlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = lpaCardiovascularStateForInsight(insight);

	switch (state) {
		case "one_risk_allele":
		case "multiple_risk_alleles":
			return {
				level: "potential",

				label: "Worth considering",

				meaning:
					"Your genotype includes one or more LPA variants associated with higher lipoprotein(a) concentrations and increased coronary disease susceptibility. This does not mean that cardiovascular disease will occur.",

				whyItMatters:
					"Cardiovascular disease can create treatment costs, periods away from work and additional healthcare needs later in life. Bioanalytix therefore considers it reasonable to explore whether your financial plan remains resilient to a cardiovascular-health scenario without assuming that such an event will occur.",

				planningDomains: [
					"health_costs",
					"healthy_working_life",
					"income_interruption",
					"insurance",
				],

				suggestedQuestion:
					"Would your household remain financially resilient if cardiovascular treatment or recovery created additional costs or reduced your ability to work for a period?",

				scenarioEligible: true,
			};

		case "reference":
			return {
				level: "informational",

				label: "For your awareness",

				meaning:
					"This model did not identify either of the two LPA risk alleles assessed by Bioanalytix.",

				whyItMatters:
					"No financial-plan change is suggested from this result. These two variants do not capture all genetic or non-genetic causes of elevated lipoprotein(a) or cardiovascular disease.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",

				label: "Result not resolved",

				meaning:
					"The available consumer genotype data was not sufficient to resolve this LPA model reliably.",

				whyItMatters:
					"No financial-planning conclusion should be drawn from an unresolved result.",

				planningDomains: [],

				scenarioEligible: false,
			};
	}
}

function amdSusceptibilityPlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = amdSusceptibilityStateForInsight(insight);

	switch (state) {
		case "one_risk_allele":
		case "multiple_risk_alleles":
			return {
				level: "potential",

				label: "Worth considering",

				meaning:
					"Your genotype includes one or more common variants associated with increased susceptibility to age-related macular degeneration. This does not mean that vision loss or AMD will occur.",

				whyItMatters:
					"Later-life vision impairment can create treatment costs, transport dependence, home-support needs and greater reliance on a partner or paid care. Bioanalytix therefore considers it reasonable to explore whether your retirement plan remains resilient to a future vision-support scenario.",

				planningDomains: ["health_costs", "care_dependency", "family"],

				suggestedQuestion:
					"Would your retirement plan remain resilient if later-life vision problems increased treatment, transport, home-support or care costs?",

				scenarioEligible: true,
			};

		case "reference":
			return {
				level: "informational",

				label: "For your awareness",

				meaning:
					"This model did not identify the common AMD risk alleles assessed by Bioanalytix.",

				whyItMatters:
					"No financial-plan change is suggested from this result. These variants do not capture all genetic or non-genetic causes of age-related macular degeneration.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",

				label: "Result not resolved",

				meaning:
					"The available consumer genotype data was not sufficient for Bioanalytix to resolve this AMD model reliably.",

				whyItMatters:
					"No financial-planning conclusion should be drawn from an unresolved result.",

				planningDomains: [],

				scenarioEligible: false,
			};
	}
}

function tcf7l2DiabetesPlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = tcf7l2DiabetesStateForInsight(insight);

	switch (state) {
		case "one_risk_allele":
		case "two_risk_alleles":
			return {
				level: "potential",

				label: "Worth considering",

				meaning:
					"Your genotype includes a common TCF7L2 variant associated with increased susceptibility to type 2 diabetes. This does not mean that diabetes will develop.",

				whyItMatters:
					"Type 2 diabetes can create recurring healthcare and medication costs and, in some cases, complications that affect work capacity or later-life independence. Bioanalytix therefore considers it reasonable to explore whether your financial plan remains resilient to a chronic-health scenario.",

				planningDomains: ["health_costs", "healthy_working_life", "care_dependency"],

				suggestedQuestion:
					"Would your household remain financially resilient if a chronic metabolic condition created recurring treatment costs or reduced work capacity later in life?",

				scenarioEligible: true,
			};

		case "reference":
			return {
				level: "informational",

				label: "For your awareness",

				meaning:
					"This model did not identify the TCF7L2 rs7903146 risk allele assessed by Bioanalytix.",

				whyItMatters:
					"No financial-plan change is suggested from this result. Type 2 diabetes risk depends on many genetic, clinical, lifestyle and environmental factors beyond this single variant.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",

				label: "Result not resolved",

				meaning:
					"The available consumer genotype data was not sufficient for Bioanalytix to resolve this diabetes susceptibility model reliably.",

				whyItMatters:
					"No financial-planning conclusion should be drawn from an unresolved result.",

				planningDomains: [],

				scenarioEligible: false,
			};
	}
}

function lrrk2ParkinsonPlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = lrrk2ParkinsonStateForInsight(insight);

	switch (state) {
		case "heterozygous_g2019s":
		case "homozygous_g2019s":
			return {
				level: "potential",

				label: "Clinically important — confirm this result",

				meaning:
					"The available consumer genotype data indicates the LRRK2 G2019S variant, which is associated with Parkinson disease. Not everyone with this variant develops Parkinson disease, and consumer raw data should be independently confirmed.",

				whyItMatters:
					"This finding may ultimately be relevant to healthy working life, healthcare costs, later-life independence, care requirements and family planning. Bioanalytix does not use an unconfirmed consumer result to change your financial plan. Confirmation and deeper clinical context should come first.",

				planningDomains: [
					"health_costs",
					"healthy_working_life",
					"care_dependency",
					"family",
					"estate",
				],

				suggestedQuestion:
					"If this finding were independently confirmed, would you want to explore how a future neurological health or care scenario could affect your long-term plan?",

				/*
				 * Critical difference from LPA / AMD / TCF7L2:
				 *
				 * raw consumer result does NOT immediately
				 * unlock a financial scenario.
				 */
				scenarioEligible: false,
			};

		case "reference":
			return {
				level: "informational",

				label: "For your awareness",

				meaning: "The LRRK2 G2019S variant assessed by this model was not identified.",

				whyItMatters:
					"This does not mean that Parkinson disease cannot occur or that other genetic factors are absent. No financial-plan change is suggested from this result.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",

				label: "Result not resolved",

				meaning:
					"The available genotype data was not sufficient to resolve this LRRK2 model reliably.",

				whyItMatters:
					"No medical or financial-planning conclusion should be drawn from an unresolved result.",

				planningDomains: [],

				scenarioEligible: false,
			};
	}
}

function brcaSelectedPlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = brcaSelectedStateForInsight(insight);

	switch (state) {
		case "one_selected_pathogenic_variant":
		case "multiple_selected_pathogenic_variants": {
			const confirmed = insight.input.confirmationStatus === "confirmed";

			return {
				level: "potential",

				label: confirmed
					? "Important to your planning"
					: "Clinically important — confirm this result",

				meaning:
					"A selected pathogenic BRCA1 or BRCA2 variant was identified. Pathogenic variants in these genes are associated with inherited predisposition to certain cancers, but this consumer-genotype finding must be independently confirmed.",

				whyItMatters: confirmed
					? "A confirmed hereditary cancer-predisposition finding can make surveillance, treatment costs, periods away from work, insurance, estate arrangements and family considerations relevant to long-term financial resilience."
					: "Bioanalytix does not use an unconfirmed consumer-genotype BRCA finding to change your financial plan. Independent clinical confirmation and appropriate specialist counselling should come first.",

				planningDomains: [
					"health_costs",
					"healthy_working_life",
					"income_interruption",
					"insurance",
					"care_dependency",
					"premature_mortality",
					"estate",
					"family",
				],

				suggestedQuestion:
					"If this result is independently confirmed, would you like to explore how surveillance or a future cancer-treatment scenario could affect your household plan?",

				scenarioEligible: confirmed,
			};
		}

		case "no_selected_variant_identified":
			return {
				level: "informational",

				label: "Selected variants not identified",

				meaning:
					"None of the selected BRCA1/BRCA2 substitution variants assessed by this Bioanalytix model was identified.",

				whyItMatters:
					"This result does not exclude other pathogenic BRCA1 or BRCA2 variants and must not be treated as a comprehensive negative BRCA test. No financial-plan change is suggested from this selected-variant result.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",

				label: "Result not resolved",

				meaning:
					"The available genotype data was not sufficient to resolve this selected BRCA model reliably.",

				whyItMatters:
					"No medical or financial-planning conclusion should be drawn from an unresolved result.",

				planningDomains: [],

				scenarioEligible: false,
			};
	}
}

function confirmableClinicalPlanningRelevance(
	insight: BiologicalInsight,
): GeneticPlanningRelevance {
	const state = confirmableClinicalStateForInsight(insight, CONFIRMABLE_CLINICAL_MODEL_IDS);

	if (!state || state === "unresolved") {
		return {
			level: "informational",

			label: "Result not resolved",

			meaning:
				"The available genotype data was not sufficient to resolve this finding reliably.",

			whyItMatters:
				"No medical or financial-planning conclusion should be drawn from an unresolved result.",

			planningDomains: [],

			scenarioEligible: false,
		};
	}

	if (state === "reference") {
		return {
			level: "informational",

			label: "For your awareness",

			meaning:
				"The specific clinically important variant assessed by this model was not identified.",

			whyItMatters:
				"This does not exclude other genetic or non-genetic causes of the associated condition. No financial-plan change is suggested from this result.",

			planningDomains: [],

			scenarioEligible: false,
		};
	}

	const confirmed = insight.input.confirmationStatus === "confirmed";

	switch (insight.model.id) {
		case "ttr-v142i-amyloidosis-v1":
			return {
				level: "potential",

				label: confirmed
					? "Important to your planning"
					: "Clinically important — confirm this result",

				meaning:
					"The TTR V142I variant is associated with hereditary transthyretin amyloidosis, which can affect the heart, nerves and independence later in life. Not every carrier develops clinically significant disease.",

				whyItMatters: confirmed
					? "A confirmed TTR finding may justify exploring resilience to future cardiac, neurological, treatment and care costs without assuming that disease will develop."
					: "Bioanalytix does not use an unconfirmed consumer-genotype result to alter your financial plan. Clinical confirmation should come first.",

				planningDomains: [
					"health_costs",
					"healthy_working_life",
					"care_dependency",
					"partner_dependency",
					"premature_mortality",
					"estate",
				],

				suggestedQuestion:
					"If this result is confirmed, would you like to explore how future cardiac or neurological health needs could affect your long-term plan?",

				scenarioEligible: confirmed,
			};

		case "apob-r3527q-fh-v1":
			return {
				level: "potential",

				label: confirmed
					? "Important to your planning"
					: "Clinically important — confirm this result",

				meaning:
					"The APOB R3527Q variant is associated with familial hypercholesterolaemia and increased lifetime exposure to elevated LDL cholesterol.",

				whyItMatters: confirmed
					? "A confirmed familial-hypercholesterolaemia finding may justify exploring resilience to cardiovascular treatment, interruption to work and premature cardiovascular events."
					: "Bioanalytix does not use an unconfirmed consumer-genotype result to alter your financial plan. Confirmation and clinical lipid assessment should come first.",

				planningDomains: [
					"health_costs",
					"healthy_working_life",
					"income_interruption",
					"insurance",
					"premature_mortality",
				],

				suggestedQuestion:
					"If this result is confirmed, would you like to test how earlier or greater cardiovascular-health costs could affect your plan?",

				scenarioEligible: confirmed,
			};

		case "f2-g20210a-thrombophilia-v1":
			return {
				level: "potential",

				label: confirmed
					? "Important to your planning"
					: "Clinically important — confirm this result",

				meaning:
					"The F2 G20210A variant is associated with increased susceptibility to venous thromboembolism. Many carriers never experience a thrombotic event.",

				whyItMatters: confirmed
					? "A confirmed thrombophilia finding may justify exploring resilience to hospitalisation, treatment costs and temporary interruption to work without assuming that thrombosis will occur."
					: "Bioanalytix does not use an unconfirmed consumer-genotype result to alter your financial plan. Confirmation should come first.",

				planningDomains: ["health_costs", "healthy_working_life", "income_interruption"],

				suggestedQuestion:
					"If this result is confirmed, would you like to explore whether your household could absorb the financial effects of a serious thrombotic event?",

				scenarioEligible: confirmed,
			};

		default:
			return {
				level: "informational",
				label: "For your awareness",
				meaning: "This finding is part of your genetic profile.",
				whyItMatters: "No financial-plan change is suggested from this result.",
				planningDomains: [],
				scenarioEligible: false,
			};
	}
}

function mutyhPlanningRelevance(insight: BiologicalInsight): GeneticPlanningRelevance {
	const state = mutyhStateForInsight(insight);

	switch (state) {
		case "single_pathogenic_variant":
			return {
				level: "informational",

				label: "Carrier finding",

				meaning:
					"One selected pathogenic MUTYH variant was identified. A single pathogenic MUTYH variant generally represents carrier status rather than MUTYH-associated polyposis.",

				whyItMatters:
					"No financial-plan change is suggested from this carrier finding. Its principal relevance is genetic and potentially familial, and it may be worth discussing in an appropriate clinical context.",

				planningDomains: ["family"],

				suggestedQuestion:
					"Would you like to understand why a MUTYH carrier result can be relevant to biological relatives?",

				scenarioEligible: false,
			};

		case "biallelic_selected_variants": {
			const confirmed = insight.input.confirmationStatus === "confirmed";

			return {
				level: "potential",

				label: confirmed
					? "Important to your planning"
					: "Clinically important — confirm this result",

				meaning:
					"Two pathogenic MUTYH alleles were identified across the selected variants assessed by Bioanalytix. Biallelic pathogenic MUTYH variants are associated with MUTYH-associated polyposis and increased colorectal-cancer risk.",

				whyItMatters: confirmed
					? "A confirmed MUTYH-associated polyposis finding may justify exploring resilience to surveillance, treatment, time away from work and possible later-life care costs."
					: "Bioanalytix does not use an unconfirmed consumer-genotype result to change your financial plan. Clinical confirmation and appropriate specialist assessment should come first.",

				planningDomains: [
					"health_costs",
					"healthy_working_life",
					"income_interruption",
					"care_dependency",
					"estate",
					"family",
				],

				suggestedQuestion:
					"If this result is clinically confirmed, would you like to explore how long-term surveillance or cancer treatment could affect your financial resilience?",

				scenarioEligible: confirmed,
			};
		}

		case "reference":
			return {
				level: "informational",

				label: "For your awareness",

				meaning:
					"The two selected pathogenic MUTYH variants assessed by this model were not identified.",

				whyItMatters:
					"This selected-variant result does not exclude other pathogenic MUTYH variants or other causes of colorectal cancer. No financial-plan change is suggested from this result.",

				planningDomains: [],

				scenarioEligible: false,
			};

		case "unresolved":
		default:
			return {
				level: "informational",

				label: "Result not resolved",

				meaning:
					"The available genotype data was not sufficient to resolve this selected MUTYH model reliably.",

				whyItMatters:
					"No medical or financial-planning conclusion should be drawn from an unresolved result.",

				planningDomains: [],

				scenarioEligible: false,
			};
	}
}

function planningRelevanceForInsight(insight: BiologicalInsight): GeneticPlanningRelevance {
	/*
	 * Model-specific interpretation always takes
	 * precedence over generic direction-based logic.
	 *
	 * This is important because some models contain
	 * clinically meaningful states even when their
	 * BiologicalInsight direction is "reference".
	 */
	switch (insight.model.id) {
		case "hfe-common-genotype-v1":
			return hfePlanningRelevance(insight);

		case "serpina1-common-genotype-v1":
			return serpina1PlanningRelevance(insight);

		case "mcm6-lactase-persistence-v1":
			return lactasePersistencePlanningRelevance(insight);

		case "cyp1a2-caffeine-metabolism-v1":
			return caffeineMetabolismPlanningRelevance(insight);

		case "actn3-muscle-performance-v1":
			return actn3PerformancePlanningRelevance(insight);

		case "tas2r38-bitter-taste-v1":
			return tas2r38BitterTastePlanningRelevance(insight);

		case "aldh2-alcohol-response-v1":
			return aldh2AlcoholResponsePlanningRelevance(insight);

		case "lpa-cardiovascular-risk-v1":
			return lpaCardiovascularPlanningRelevance(insight);

		case "amd-common-susceptibility-v1":
			return amdSusceptibilityPlanningRelevance(insight);

		case "tcf7l2-type-2-diabetes-v1":
			return tcf7l2DiabetesPlanningRelevance(insight);

		case "lrrk2-g2019s-parkinson-v1":
			return lrrk2ParkinsonPlanningRelevance(insight);

		case "ttr-v142i-amyloidosis-v1":
		case "apob-r3527q-fh-v1":
		case "f2-g20210a-thrombophilia-v1":
			return confirmableClinicalPlanningRelevance(insight);

		case "mutyh-selected-variants-v1":
			return mutyhPlanningRelevance(insight);

		case "brca-selected-substitution-variants-v1":
			return brcaSelectedPlanningRelevance(insight);

		case "f5-factor-v-leiden-vte":
			return factorVPlanningRelevance(insight);

		case "apoe-common-diplotype-v1":
			return apoePlanningRelevance(insight);

		default:
			break;
	}

	/*
	 * Unknown/reference models fail closed.
	 */
	if (insight.result.direction !== "higher") {
		return informationalRelevance(insight);
	}

	/*
	 * A higher result from a model without explicit
	 * planning policy remains visible, but must not
	 * automatically become scenario eligible.
	 */
	return genericHigherRelevance(insight);
}

function deduplicateLimitations(limitations: string[]): string[] {
	return [...new Set(limitations)];
}

export function buildGeneticHighlights(insights: BiologicalInsight[]): GeneticHighlight[] {
	return insights.map((insight) => ({
		id: `genetic-highlight-${insight.id}`,

		title: insight.title,

		domain: insight.domain,

		direction: normalizeDirection(insight),

		evidenceStrength: insight.confidence.evidenceStrength,

		category: categoryForInsight(insight),

		summary: summaryForInsight(insight),

		explanation: explanationForInsight(insight),

		planningRelevance: planningRelevanceForInsight(insight),

		model: {
			id: insight.model.id,

			version: insight.model.version,
		},

		limitations: deduplicateLimitations(insight.limitations),

		provenance: {
			evidenceIds: [...insight.provenance.evidenceIds],

			engineVersion: GENETIC_HIGHLIGHT_ENGINE_VERSION,

			generatedAt: new Date().toISOString(),
		},
	}));
}
