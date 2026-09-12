import { describe, expect, it } from "vitest";

import { interpretAmdSusceptibility } from "../genetics/evidence/amdSusceptibilityInterpretation";
import { interpretFactorVLeiden } from "../genetics/evidence/factorVLeidenInterpretation";
import { interpretLpaCardiovascular } from "../genetics/evidence/lpaCardiovascularInterpretation";
import { interpretLrrk2Parkinson } from "../genetics/evidence/lrrk2ParkinsonInterpretation";
import { interpretTcf7l2Diabetes } from "../genetics/evidence/tcf7l2DiabetesInterpretation";
import type { GenotypeObservation } from "../genetics/observations/types";
import { buildPlanningInsights, PLANNING_INSIGHT_ENGINE_VERSION } from "./planningInsightEngine";

function factorVObservation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs6025",

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

function amdObservation(rsid: string, genotype: string): GenotypeObservation {
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

describe("planningInsightEngine", () => {
	it("exposes an explicit insight-engine version", () => {
		expect(PLANNING_INSIGHT_ENGINE_VERSION).toBe("1.0.0");
	});

	it("converts a higher Factor V Leiden result into a genetics-informed health-cost planning insight", () => {
		const biologicalInsight = interpretFactorVLeiden(factorVObservation("AG"));

		expect(biologicalInsight.result.direction).toBe("higher");

		const planningInsights = buildPlanningInsights({
			insights: [biologicalInsight],

			geneticUploadId: "upload-123",

			governanceContext: "development",
		});

		expect(planningInsights).toHaveLength(1);

		const insight = planningInsights[0];

		expect(insight).toBeDefined();

		expect(insight?.domain).toBe("health_costs");

		expect(insight?.title).toBe("Health-cost resilience may deserve more attention");

		expect(insight?.evidence.direction).toBe("higher");

		expect(insight?.evidence.modelIds).toContain(biologicalInsight.model.id);

		expect(insight?.financialImpact.affectedPlanAreas).toContain("retirement reserves");

		expect(insight?.provenance.geneticUploadId).toBe("upload-123");
	});

	it("does not manufacture a financial dollar range from genotype", () => {
		const biologicalInsight = interpretFactorVLeiden(factorVObservation("AG"));

		const planningInsights = buildPlanningInsights({
			insights: [biologicalInsight],

			governanceContext: "development",
		});

		expect(planningInsights).toHaveLength(1);

		expect(planningInsights[0]?.financialImpact.estimatedRange).toBeUndefined();
	});

	it("does not create a genetics-attributed planning insight for a Factor V Leiden reference result", () => {
		const biologicalInsight = interpretFactorVLeiden(factorVObservation("GG"));

		expect(biologicalInsight.result.direction).toBe("reference");

		const planningInsights = buildPlanningInsights({
			insights: [biologicalInsight],

			governanceContext: "development",
		});

		expect(planningInsights).toEqual([]);
	});

	it("retains evidence provenance without exposing genotype as financial guidance", () => {
		const biologicalInsight = interpretFactorVLeiden(factorVObservation("AG"));

		const [insight] = buildPlanningInsights({
			insights: [biologicalInsight],

			geneticUploadId: "upload-factor-v",

			governanceContext: "development",
		});

		expect(insight).toBeDefined();

		expect(insight?.provenance.modelIds).toEqual([biologicalInsight.model.id]);

		expect(insight?.provenance.geneticUploadId).toBe("upload-factor-v");

		expect(JSON.stringify(insight)).not.toContain(biologicalInsight.result.genotype ?? "");
	});

	it("creates a health-cost planning insight from elevated LPA susceptibility", () => {
		const biologicalInsight = interpretLpaCardiovascular(
			lpaObservation("rs10455872", "AG"),
			lpaObservation("rs3798220", "TT"),
		);

		const planningInsights = buildPlanningInsights({
			insights: [biologicalInsight],
			geneticUploadId: "test-upload",
			governanceContext: "development",
		});

		expect(planningInsights).toHaveLength(1);

		expect(planningInsights[0]?.domain).toBe("health_costs");

		expect(planningInsights[0]?.title).toBe(
			"Health-cost resilience may deserve more attention",
		);

		expect(planningInsights[0]?.evidence.direction).toBe("higher");

		expect(planningInsights[0]?.evidence.modelIds).toEqual(["lpa-cardiovascular-risk-v1"]);
	});

	it("creates health-cost and late-life-care planning insights from elevated AMD susceptibility", () => {
		const biologicalInsight = interpretAmdSusceptibility(
			amdObservation("rs1061170", "CT"),
			amdObservation("rs10490924", "GT"),
		);

		const planningInsights = buildPlanningInsights({
			insights: [biologicalInsight],
			geneticUploadId: "test-upload",
			governanceContext: "development",
		});

		expect(planningInsights).toHaveLength(2);

		expect(planningInsights.map((insight) => insight.domain)).toEqual(
			expect.arrayContaining(["health_costs", "late_life_care"]),
		);

		expect(planningInsights.every((insight) => insight.evidence.direction === "higher")).toBe(
			true,
		);

		expect(
			planningInsights.every((insight) =>
				insight.evidence.modelIds.includes("amd-common-susceptibility-v1"),
			),
		).toBe(true);
	});

	it("creates health-cost and late-life-care planning insights from elevated TCF7L2 susceptibility", () => {
		const biologicalInsight = interpretTcf7l2Diabetes(tcf7l2Observation("CT"));

		const planningInsights = buildPlanningInsights({
			insights: [biologicalInsight],

			geneticUploadId: "test-upload",

			governanceContext: "development",
		});

		expect(planningInsights).toHaveLength(2);

		expect(planningInsights.map((insight) => insight.domain)).toEqual(
			expect.arrayContaining(["health_costs", "late_life_care"]),
		);

		expect(
			planningInsights.every((insight) =>
				insight.evidence.modelIds.includes("tcf7l2-type-2-diabetes-v1"),
			),
		).toBe(true);
	});

	it("does not create planning insights from an unconfirmed LRRK2 G2019S result", () => {
		const biologicalInsight = interpretLrrk2Parkinson(lrrk2Observation("AG", "unconfirmed"));

		const planningInsights = buildPlanningInsights({
			insights: [biologicalInsight],
			geneticUploadId: "test-upload",
			governanceContext: "development",
		});

		expect(planningInsights).toEqual([]);
	});

	it("creates planning insights only after LRRK2 G2019S confirmation", () => {
		const biologicalInsight = interpretLrrk2Parkinson(lrrk2Observation("AG", "confirmed"));

		const planningInsights = buildPlanningInsights({
			insights: [biologicalInsight],
			geneticUploadId: "test-upload",
			governanceContext: "development",
		});

		expect(planningInsights.map((insight) => insight.domain)).toEqual(
			expect.arrayContaining(["health_costs", "late_life_care"]),
		);

		expect(
			planningInsights.every((insight) =>
				insight.evidence.modelIds.includes("lrrk2-g2019s-parkinson-v1"),
			),
		).toBe(true);
	});
});
