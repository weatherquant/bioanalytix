import type { BiologicalInsight } from "../genetics/evidence/insight";
import {
	CONFIRMABLE_CLINICAL_MODEL_IDS,
	actn3PerformanceStateForInsight,
	aldh2AlcoholResponseStateForInsight,
	amdSusceptibilityStateForInsight,
	brcaSelectedStateForInsight,
	caffeineMetabolismStateForInsight,
	confirmableClinicalStateForInsight,
	hfeStateForInsight,
	lactasePersistenceStateForInsight,
	lpaCardiovascularStateForInsight,
	lrrk2ParkinsonStateForInsight,
	mutyhStateForInsight,
	serpina1StateForInsight,
	tas2r38BitterTasteStateForInsight,
	tcf7l2DiabetesStateForInsight,
} from "./geneticHighlightStates";

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

export function summaryForGeneticInsight(insight: BiologicalInsight): string {
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
