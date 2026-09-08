import { describe, expect, it } from "vitest";

import { interpretFactorVLeiden } from "../genetics/evidence/factorVLeidenInterpretation";
import { interpretHfe } from "../genetics/evidence/hfeInterpretation";
import type { GenotypeObservation } from "../genetics/observations/types";
import { buildGeneticHighlights, GENETIC_HIGHLIGHT_ENGINE_VERSION } from "./geneticHighlightEngine";

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

function hfeObservation(rsid: string, genotype: string): GenotypeObservation {
	return {
		rsid,
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

describe("geneticHighlightEngine", () => {
	it("exposes a versioned highlight engine", () => {
		expect(GENETIC_HIGHLIGHT_ENGINE_VERSION).toBe("1.1.0");
	});

	it("classifies a reference Factor V Leiden result as informational", () => {
		const biologicalInsight = interpretFactorVLeiden(factorVObservation("GG"));

		const [highlight] = buildGeneticHighlights([biologicalInsight]);

		expect(highlight).toBeDefined();

		expect(highlight?.direction).toBe("reference");

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.label).toBe("For your awareness");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);

		expect(highlight?.planningRelevance.planningDomains).toEqual([]);
	});

	it("classifies a higher Factor V Leiden result as worth considering", () => {
		const biologicalInsight = interpretFactorVLeiden(factorVObservation("AG"));

		const [highlight] = buildGeneticHighlights([biologicalInsight]);

		expect(highlight).toBeDefined();

		expect(highlight?.direction).toBe("higher");

		expect(highlight?.planningRelevance.level).toBe("potential");

		expect(highlight?.planningRelevance.label).toBe("Worth considering");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(true);

		expect(highlight?.planningRelevance.planningDomains).toContain("health_costs");

		expect(highlight?.planningRelevance.planningDomains).toContain("healthy_working_life");
	});

	it("provides a user-facing so-what for a planning-relevant result", () => {
		const biologicalInsight = interpretFactorVLeiden(factorVObservation("AG"));

		const [highlight] = buildGeneticHighlights([biologicalInsight]);

		expect(highlight?.planningRelevance.whyItMatters.length).toBeGreaterThan(0);

		expect(highlight?.planningRelevance.suggestedQuestion).toBeTruthy();
	});

	it("deduplicates repeated limitations", () => {
		const biologicalInsight = interpretFactorVLeiden(factorVObservation("AG"));

		biologicalInsight.limitations.push("Duplicate limitation", "Duplicate limitation");

		const [highlight] = buildGeneticHighlights([biologicalInsight]);

		const occurrences =
			highlight?.limitations.filter((item) => item === "Duplicate limitation").length ?? 0;

		expect(occurrences).toBe(1);
	});

	it("surfaces C282Y homozygosity as a planning-relevant health-risk finding", () => {
		const insight = interpretHfe(
			hfeObservation("rs1800562", "AA"),
			hfeObservation("rs1799945", "CC"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("health_risk");

		expect(highlight?.planningRelevance.level).toBe("potential");

		expect(highlight?.planningRelevance.label).toBe("Worth considering");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(true);
	});

	it("surfaces C282Y heterozygosity as an informational carrier finding", () => {
		const insight = interpretHfe(
			hfeObservation("rs1800562", "AG"),
			hfeObservation("rs1799945", "CC"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("carrier");

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.label).toBe("Carrier finding");

		expect(highlight?.planningRelevance.planningDomains).toContain("family");
	});

	it("does not promote H63D homozygosity into a financial scenario automatically", () => {
		const insight = interpretHfe(
			hfeObservation("rs1800562", "GG"),
			hfeObservation("rs1799945", "GG"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("keeps an HFE reference result useful rather than hiding it", () => {
		const insight = interpretHfe(
			hfeObservation("rs1800562", "GG"),
			hfeObservation("rs1799945", "CC"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.label).toBe("For your awareness");

		expect(highlight?.planningRelevance.whyItMatters.length).toBeGreaterThan(0);
	});
});
