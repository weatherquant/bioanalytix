import { describe, expect, it } from "vitest";

import { interpretApobFamilialHypercholesterolemia } from "../genetics/evidence/apobFamilialHypercholesterolemiaInterpretation";
import { interpretApoe } from "../genetics/evidence/apoeInterpretation";
import { interpretBrcaSelectedVariants } from "../genetics/evidence/brcaSelectedVariantsInterpretation";
import { interpretF2Prothrombin } from "../genetics/evidence/f2ProthrombinInterpretation";
import { interpretFactorVLeiden } from "../genetics/evidence/factorVLeidenInterpretation";
import { interpretLpaCardiovascular } from "../genetics/evidence/lpaCardiovascularInterpretation";
import { interpretLrrk2Parkinson } from "../genetics/evidence/lrrk2ParkinsonInterpretation";
import { interpretMutyhPolyposis } from "../genetics/evidence/mutyhPolyposisInterpretation";
import { interpretTcf7l2Diabetes } from "../genetics/evidence/tcf7l2DiabetesInterpretation";
import { interpretTtrAmyloidosis } from "../genetics/evidence/ttrAmyloidosisInterpretation";
import { createGenotypeObservation } from "../genetics/observations/createObservation";
import type { GenotypeObservation } from "../genetics/observations/types";
import { biologicalInsightToPlanningExposures } from "./geneticsBridge";

function factorVObservation(genotype: string) {
	return createGenotypeObservation({
		rsid: "rs6025",
		genotype,
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		parserVersion: "genetics-parser-v1",
	});
}

function apoeObservation(rsid: "rs429358" | "rs7412", genotype?: string) {
	return createGenotypeObservation({
		rsid,
		genotype,
		sourceType: "consumer_raw_data",
		provider: "23andMe",
		parserVersion: "genetics-parser-v1",
	});
}

function lpaObservation(rsid: string, genotype: string): GenotypeObservation {
	return {
		rsid,

		genotype,

		genomeBuild: "GRCh37",

		callStatus: "called",

		source: {
			type: "consumer_genotype",
			provider: "23andMe",
		},

		strandOrientation: "unknown",
		confirmationStatus: "unconfirmed",

		provenance: {
			parserVersion: "test",
		},
		limitations: [],
	};
}

function tcf7l2Observation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs7903146",
		genotype,
		genomeBuild: "GRCh37",
		callStatus: "called",
		source: {
			type: "consumer_genotype",
			provider: "23andMe",
		},
		strandOrientation: "unknown",
		confirmationStatus: "unconfirmed",
		provenance: {
			parserVersion: "test",
		},
		limitations: [],
	};
}

function lrrk2Observation(
	genotype: string,
	confirmationStatus: "confirmed" | "unconfirmed" = "unconfirmed",
): GenotypeObservation {
	return {
		rsid: "rs34637584",

		genotype,

		genomeBuild: "GRCh37",

		callStatus: "called",

		source: {
			type: "consumer_genotype",

			provider: "23andMe",
		},

		strandOrientation: "unknown",

		confirmationStatus,

		provenance: {
			parserVersion: "test",
		},

		limitations: [],
	};
}

function clinicalObservation(
	rsid: string,
	genotype: string,
	confirmationStatus: "confirmed" | "unconfirmed" = "unconfirmed",
): GenotypeObservation {
	return {
		rsid,
		genotype,
		genomeBuild: "GRCh37",
		callStatus: "called",
		source: {
			type: "consumer_genotype",
			provider: "23andMe",
		},
		strandOrientation: "unknown",
		confirmationStatus,
		provenance: {
			parserVersion: "test",
		},
		limitations: [],
	};
}

describe("genetics to planning bridge", () => {
	it("creates qualified planning exposures for a Factor V Leiden carrier", () => {
		const insight = interpretFactorVLeiden(factorVObservation("AG"));

		const exposures = biologicalInsightToPlanningExposures(insight);

		expect(exposures.length).toBeGreaterThan(0);

		expect(exposures.every((exposure) => exposure.basis === "biological_insight")).toBe(true);

		expect(exposures.every((exposure) => exposure.qualifications.length > 0)).toBe(true);

		expect(
			exposures.every((exposure) => exposure.uncertainty?.evidenceStrength === "established"),
		).toBe(true);

		expect(
			exposures.every(
				(exposure) => exposure.uncertainty?.confirmationStatus === "unconfirmed",
			),
		).toBe(true);
	});

	it("does not attribute planning exposures to a Factor V Leiden reference genotype", () => {
		const insight = interpretFactorVLeiden(factorVObservation("GG"));

		expect(biologicalInsightToPlanningExposures(insight)).toEqual([]);
	});

	it("creates care and household resilience exposures for an APOE e3/e4 result", () => {
		const insight = interpretApoe(
			apoeObservation("rs429358", "CT"),
			apoeObservation("rs7412", "CC"),
		);

		const exposures = biologicalInsightToPlanningExposures(insight);

		expect(exposures.length).toBeGreaterThan(0);

		expect(exposures.map((exposure) => exposure.domain)).toContain("care_dependency");

		expect(exposures.map((exposure) => exposure.domain)).toContain("estate");

		expect(exposures.map((exposure) => exposure.domain)).toContain("partner_dependency");
	});

	it("does not attribute planning exposures to APOE e3/e3", () => {
		const insight = interpretApoe(
			apoeObservation("rs429358", "TT"),
			apoeObservation("rs7412", "CC"),
		);

		expect(biologicalInsightToPlanningExposures(insight)).toEqual([]);
	});

	it("does not attribute planning exposures to an unresolved APOE result", () => {
		const insight = interpretApoe(
			apoeObservation("rs429358", "CT"),
			apoeObservation("rs7412", undefined),
		);

		expect(biologicalInsightToPlanningExposures(insight)).toEqual([]);
	});

	it("carries explicit financial-use constraints on every biological exposure", () => {
		const insight = interpretFactorVLeiden(factorVObservation("AG"));

		const exposures = biologicalInsightToPlanningExposures(insight);

		for (const exposure of exposures) {
			expect(exposure.constraints.diagnosticInferencePermitted).toBe(false);

			expect(exposure.constraints.absoluteRiskConversionPermitted).toBe(false);

			expect(exposure.constraints.directLongevityAdjustmentPermitted).toBe(false);

			expect(exposure.constraints.deterministicFinancialAdjustmentPermitted).toBe(false);
		}
	});

	it("does not expose genotype-specific biological identifiers across the planning boundary", () => {
		const insight = interpretFactorVLeiden(factorVObservation("AG"));

		const exposures = biologicalInsightToPlanningExposures(insight);

		const serialized = JSON.stringify(exposures).toLowerCase();

		expect(serialized).not.toContain("rs6025");

		expect(serialized).not.toContain("factor-v-leiden-vte");

		expect(serialized).not.toContain('"genotype"');

		expect(serialized).not.toContain('"haplotype"');

		expect(serialized).not.toContain('"absoluterisk"');
	});

	it("fails closed for production planning while the model is not scientifically approved and released", () => {
		const insight = interpretFactorVLeiden(factorVObservation("AG"));

		const exposures = biologicalInsightToPlanningExposures(insight, "production");

		expect(exposures).toEqual([]);
	});

	it("creates planning exposures for an elevated LPA cardiovascular finding", () => {
		const insight = interpretLpaCardiovascular(
			lpaObservation("rs10455872", "AG"),
			lpaObservation("rs3798220", "TT"),
		);

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures).toHaveLength(3);

		expect(exposures.map((exposure) => exposure.domain)).toEqual(
			expect.arrayContaining(["health_costs", "healthy_working_life", "premature_mortality"]),
		);
	});

	it("creates a health-cost resilience exposure from elevated LPA susceptibility", () => {
		const insight = interpretLpaCardiovascular(
			lpaObservation("rs10455872", "AG"),
			lpaObservation("rs3798220", "TT"),
		);

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		const healthCostExposure = exposures.find((exposure) => exposure.domain === "health_costs");

		expect(healthCostExposure).toBeDefined();

		expect(healthCostExposure?.significance).toBe("moderate");

		expect(healthCostExposure?.basis).toBe("biological_insight");

		expect(healthCostExposure?.rationale).toContain("cardiovascular");
	});

	it("does not create planning exposures for a reference LPA result", () => {
		const insight = interpretLpaCardiovascular(
			lpaObservation("rs10455872", "AA"),
			lpaObservation("rs3798220", "TT"),
		);

		expect(insight.result.direction).toBe("reference");

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures).toEqual([]);
	});

	it("does not create planning exposures for an unresolved LPA result", () => {
		const insight = interpretLpaCardiovascular(
			lpaObservation("rs10455872", "--"),
			lpaObservation("rs3798220", "TT"),
		);

		expect(insight.result.direction).toBe("indeterminate");

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures).toEqual([]);
	});

	it("does not convert multiple LPA risk alleles into genotype-derived financial assumptions", () => {
		const insight = interpretLpaCardiovascular(
			lpaObservation("rs10455872", "AG"),
			lpaObservation("rs3798220", "CT"),
		);

		expect(insight.result.genotype).toBe("multiple_risk_alleles");

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures.length).toBe(3);

		for (const exposure of exposures) {
			expect(exposure.constraints).toBeDefined();

			expect(exposure.basis).toBe("biological_insight");
		}
	});

	it("does not expose LPA genotype or rsIDs through the planning exposure boundary", () => {
		const insight = interpretLpaCardiovascular(
			lpaObservation("rs10455872", "AG"),
			lpaObservation("rs3798220", "TT"),
		);

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		const serialized = JSON.stringify(exposures);

		expect(serialized).not.toContain("rs10455872");

		expect(serialized).not.toContain("rs3798220");

		expect(serialized).not.toContain("one_risk_allele");

		expect(serialized).not.toContain("lpa-cardiovascular-risk-v1");
	});

	it("creates planning exposures for elevated TCF7L2 diabetes susceptibility", () => {
		const insight = interpretTcf7l2Diabetes(tcf7l2Observation("CT"));

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures).toHaveLength(3);

		expect(exposures.map((exposure) => exposure.domain)).toEqual(
			expect.arrayContaining(["health_costs", "healthy_working_life", "care_dependency"]),
		);
	});

	it("does not create planning exposures for a reference TCF7L2 result", () => {
		const insight = interpretTcf7l2Diabetes(tcf7l2Observation("CC"));

		expect(insight.result.direction).toBe("reference");

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures).toEqual([]);
	});

	it("does not expose TCF7L2 genotype or rsID through the planning exposure boundary", () => {
		const insight = interpretTcf7l2Diabetes(tcf7l2Observation("CT"));

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		const serialized = JSON.stringify(exposures);

		expect(serialized).not.toContain("rs7903146");

		expect(serialized).not.toContain("one_risk_allele");

		expect(serialized).not.toContain("tcf7l2-type-2-diabetes-v1");
	});

	it("keeps two TCF7L2 risk alleles within the same scenario-planning boundary", () => {
		const insight = interpretTcf7l2Diabetes(tcf7l2Observation("TT"));

		expect(insight.result.genotype).toBe("two_risk_alleles");

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures).toHaveLength(3);

		expect(exposures.map((exposure) => exposure.domain)).toEqual(
			expect.arrayContaining(["health_costs", "healthy_working_life", "care_dependency"]),
		);
	});

	it("does not create planning exposures from an unconfirmed LRRK2 G2019S result", () => {
		const insight = interpretLrrk2Parkinson(lrrk2Observation("AG", "unconfirmed"));

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures).toEqual([]);
	});

	it("allows planning exposures after LRRK2 G2019S confirmation", () => {
		const insight = interpretLrrk2Parkinson(lrrk2Observation("AG", "confirmed"));

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures.map((exposure) => exposure.domain)).toEqual(
			expect.arrayContaining([
				"health_costs",
				"healthy_working_life",
				"care_dependency",
				"partner_dependency",
				"estate",
			]),
		);
	});

	it.each([
		{
			name: "TTR V142I",
			build: (status: "confirmed" | "unconfirmed") =>
				interpretTtrAmyloidosis(clinicalObservation("rs76992529", "AG", status)),
		},
		{
			name: "APOB R3527Q",
			build: (status: "confirmed" | "unconfirmed") =>
				interpretApobFamilialHypercholesterolemia(
					clinicalObservation("rs5742904", "CT", status),
				),
		},
		{
			name: "F2 G20210A",
			build: (status: "confirmed" | "unconfirmed") =>
				interpretF2Prothrombin(clinicalObservation("rs1799963", "AG", status)),
		},
	])("does not create planning exposures from unconfirmed $name", ({ build }) => {
		const exposures = biologicalInsightToPlanningExposures(build("unconfirmed"), "development");

		expect(exposures).toEqual([]);
	});

	it.each([
		{
			name: "TTR V142I",
			build: () =>
				interpretTtrAmyloidosis(clinicalObservation("rs76992529", "AG", "confirmed")),
			expectedDomain: "care_dependency",
		},
		{
			name: "APOB R3527Q",
			build: () =>
				interpretApobFamilialHypercholesterolemia(
					clinicalObservation("rs5742904", "CT", "confirmed"),
				),
			expectedDomain: "premature_mortality",
		},
		{
			name: "F2 G20210A",
			build: () =>
				interpretF2Prothrombin(clinicalObservation("rs1799963", "AG", "confirmed")),
			expectedDomain: "health_costs",
		},
	])("allows planning exposures after confirmed $name", ({ build, expectedDomain }) => {
		const exposures = biologicalInsightToPlanningExposures(build(), "development");

		expect(exposures.length).toBeGreaterThan(0);

		expect(exposures.map((exposure) => exposure.domain)).toContain(expectedDomain);
	});

	it("keeps TTR, APOB and F2 raw genetic identifiers outside the financial planning boundary", () => {
		const insights = [
			interpretTtrAmyloidosis(clinicalObservation("rs76992529", "AG", "confirmed")),

			interpretApobFamilialHypercholesterolemia(
				clinicalObservation("rs5742904", "CT", "confirmed"),
			),

			interpretF2Prothrombin(clinicalObservation("rs1799963", "AG", "confirmed")),
		];

		const exposures = insights.flatMap((insight) =>
			biologicalInsightToPlanningExposures(insight, "development"),
		);

		const serialized = JSON.stringify(exposures);

		expect(serialized).not.toContain("rs76992529");

		expect(serialized).not.toContain("rs5742904");

		expect(serialized).not.toContain("rs1799963");

		expect(serialized).not.toContain("heterozygous_variant");
	});

	it("does not create planning exposures from monoallelic MUTYH carrier status", () => {
		const insight = interpretMutyhPolyposis(
			clinicalObservation("rs34612342", "CT", "confirmed"),
			clinicalObservation("rs36053993", "CC", "confirmed"),
		);

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures).toEqual([]);
	});

	it("does not create planning exposures from unconfirmed biallelic MUTYH findings", () => {
		const insight = interpretMutyhPolyposis(
			clinicalObservation("rs34612342", "CT", "unconfirmed"),
			clinicalObservation("rs36053993", "CT", "unconfirmed"),
		);

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures).toEqual([]);
	});

	it("creates planning exposures after biallelic MUTYH findings are confirmed", () => {
		const insight = interpretMutyhPolyposis(
			clinicalObservation("rs34612342", "CT", "confirmed"),
			clinicalObservation("rs36053993", "CT", "confirmed"),
		);

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures.map((exposure) => exposure.domain)).toEqual(
			expect.arrayContaining([
				"health_costs",
				"healthy_working_life",
				"income_interruption",
				"care_dependency",
				"estate",
			]),
		);
	});

	it("does not create planning exposures from an unconfirmed selected BRCA finding", () => {
		const insight = interpretBrcaSelectedVariants(
			clinicalObservation("rs41293455", "AG", "unconfirmed"),
			clinicalObservation("rs80358928", "CC", "unconfirmed"),
			clinicalObservation("rs80358972", "CC", "unconfirmed"),
		);

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures).toEqual([]);
	});

	it("creates planning exposures after a selected BRCA finding is clinically confirmed", () => {
		const insight = interpretBrcaSelectedVariants(
			clinicalObservation("rs41293455", "AG", "confirmed"),
			clinicalObservation("rs80358928", "CC", "confirmed"),
			clinicalObservation("rs80358972", "CC", "confirmed"),
		);

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		expect(exposures.map((exposure) => exposure.domain)).toEqual(
			expect.arrayContaining([
				"health_costs",
				"healthy_working_life",
				"income_interruption",
				"care_dependency",
				"premature_mortality",
				"insurance",
				"estate",
			]),
		);
	});

	it("keeps selected BRCA variant identifiers outside the financial planning boundary", () => {
		const insight = interpretBrcaSelectedVariants(
			clinicalObservation("rs41293455", "AG", "confirmed"),
			clinicalObservation("rs80358928", "CC", "confirmed"),
			clinicalObservation("rs80358972", "CC", "confirmed"),
		);

		const exposures = biologicalInsightToPlanningExposures(insight, "development");

		const serialized = JSON.stringify(exposures);

		expect(serialized).not.toContain("rs41293455");

		expect(serialized).not.toContain("rs80358928");

		expect(serialized).not.toContain("rs80358972");

		expect(serialized).not.toContain("one_selected_pathogenic_variant");
	});
});
