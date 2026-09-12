import type { BiologicalInsight } from "../genetics/evidence/insight";

export type HfeHighlightState =
	| "c282y_homozygous"
	| "c282y_h63d_double_heterozygous"
	| "c282y_heterozygous"
	| "h63d_homozygous"
	| "h63d_heterozygous"
	| "reference"
	| "unresolved";

export function hfeStateForInsight(insight: BiologicalInsight): HfeHighlightState | undefined {
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

export type Serpina1HighlightState = "zz" | "sz" | "ss" | "mz" | "ms" | "reference" | "unresolved";

export function serpina1StateForInsight(
	insight: BiologicalInsight,
): Serpina1HighlightState | undefined {
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

export type LactasePersistenceHighlightState = "persistent" | "non_persistent" | "unresolved";

export function lactasePersistenceStateForInsight(
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

export type CaffeineMetabolismHighlightState = "faster" | "slower" | "unresolved";

export function caffeineMetabolismStateForInsight(
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

export type Actn3PerformanceHighlightState = "rr" | "rx" | "xx" | "unresolved";

export function actn3PerformanceStateForInsight(
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

export type Tas2r38BitterTasteHighlightState = "pav_pav" | "pav_avi" | "avi_avi" | "unresolved";

export function tas2r38BitterTasteStateForInsight(
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

export type Aldh2AlcoholResponseHighlightState =
	| "typical_clearance"
	| "reduced_clearance"
	| "markedly_reduced_clearance"
	| "unresolved";

export function aldh2AlcoholResponseStateForInsight(
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

export type LpaCardiovascularHighlightState =
	| "reference"
	| "one_risk_allele"
	| "multiple_risk_alleles"
	| "unresolved";

export function lpaCardiovascularStateForInsight(
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

export type AmdSusceptibilityHighlightState =
	| "reference"
	| "one_risk_allele"
	| "multiple_risk_alleles"
	| "unresolved";

export function amdSusceptibilityStateForInsight(
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

export type Tcf7l2DiabetesHighlightState =
	| "reference"
	| "one_risk_allele"
	| "two_risk_alleles"
	| "unresolved";

export function tcf7l2DiabetesStateForInsight(
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

export type Lrrk2ParkinsonHighlightState =
	| "reference"
	| "heterozygous_g2019s"
	| "homozygous_g2019s"
	| "unresolved";

export function lrrk2ParkinsonStateForInsight(
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

export type ConfirmableClinicalState =
	| "reference"
	| "heterozygous_variant"
	| "homozygous_variant"
	| "unresolved";

export const CONFIRMABLE_CLINICAL_MODEL_IDS = [
	"ttr-v142i-amyloidosis-v1",
	"apob-r3527q-fh-v1",
	"f2-g20210a-thrombophilia-v1",
] as const;

export function confirmableClinicalStateForInsight(
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

export type MutyhHighlightState =
	| "reference"
	| "single_pathogenic_variant"
	| "biallelic_selected_variants"
	| "unresolved";

export function mutyhStateForInsight(insight: BiologicalInsight): MutyhHighlightState | undefined {
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

export type BrcaSelectedHighlightState =
	| "no_selected_variant_identified"
	| "one_selected_pathogenic_variant"
	| "multiple_selected_pathogenic_variants"
	| "unresolved";

export function brcaSelectedStateForInsight(
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
