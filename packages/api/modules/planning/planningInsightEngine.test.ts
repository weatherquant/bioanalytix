import { describe, expect, it } from "vitest";

import { interpretFactorVLeiden } from "../genetics/evidence/factorVLeidenInterpretation";
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

		confirmationStatus: "unconfirmed",

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
});
