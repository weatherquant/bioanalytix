import { describe, expect, it } from "vitest";

import { interpretActn3Performance } from "../genetics/evidence/actn3PerformanceInterpretation";
import { interpretAldh2AlcoholResponse } from "../genetics/evidence/aldh2AlcoholResponseInterpretation";
import { interpretBrcaSelectedVariants } from "../genetics/evidence/brcaSelectedVariantsInterpretation";
import { interpretCaffeineMetabolism } from "../genetics/evidence/caffeineMetabolismInterpretation";
import { interpretFactorVLeiden } from "../genetics/evidence/factorVLeidenInterpretation";
import { interpretHfe } from "../genetics/evidence/hfeInterpretation";
import { interpretLactasePersistence } from "../genetics/evidence/lactasePersistenceInterpretation";
import { interpretLpaCardiovascular } from "../genetics/evidence/lpaCardiovascularInterpretation";
import { interpretMutyhPolyposis } from "../genetics/evidence/mutyhPolyposisInterpretation";
import { interpretSerpina1 } from "../genetics/evidence/serpina1Interpretation";
import { interpretTas2r38BitterTaste } from "../genetics/evidence/tas2r38BitterTasteInterpretation";
import { interpretTcf7l2Diabetes } from "../genetics/evidence/tcf7l2DiabetesInterpretation";
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
		strandOrientation: "unknown",
		confirmationStatus: "unconfirmed",
		provenance: {
			parserVersion: "test",
		},
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
		strandOrientation: "unknown",
		confirmationStatus: "unconfirmed",
		provenance: {
			parserVersion: "test",
		},
		limitations: [],
	};
}

function serpina1Observation(rsid: string, genotype: string): GenotypeObservation {
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

function lactaseObservation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs4988235",

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

function caffeineObservation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs762551",
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

function actn3Observation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs1815739",
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

function tas2r38Observation(rsid: string, genotype: string): GenotypeObservation {
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

function aldh2Observation(genotype: string): GenotypeObservation {
	return {
		rsid: "rs671",
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

function mutyhObservation(
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

describe("geneticHighlightEngine", () => {
	it("exposes a versioned highlight engine", () => {
		expect(GENETIC_HIGHLIGHT_ENGINE_VERSION).toBe("1.14.0");
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

	it("surfaces SERPINA1 ZZ as a planning-relevant health-risk finding", () => {
		const insight = interpretSerpina1(
			serpina1Observation("rs28929474", "AA"),
			serpina1Observation("rs17580", "AA"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("health_risk");

		expect(highlight?.planningRelevance.level).toBe("potential");

		expect(highlight?.planningRelevance.label).toBe("Worth considering");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(true);

		expect(highlight?.planningRelevance.planningDomains).toContain("health_costs");

		expect(highlight?.planningRelevance.planningDomains).toContain("healthy_working_life");
	});

	it("surfaces SERPINA1 SZ as worth considering", () => {
		const insight = interpretSerpina1(
			serpina1Observation("rs28929474", "AG"),
			serpina1Observation("rs17580", "AT"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("health_risk");

		expect(highlight?.planningRelevance.level).toBe("potential");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(true);
	});

	it("surfaces SERPINA1 MZ as an informational carrier finding", () => {
		const insight = interpretSerpina1(
			serpina1Observation("rs28929474", "AG"),
			serpina1Observation("rs17580", "AA"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("carrier");

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.label).toBe("Carrier finding");

		expect(highlight?.planningRelevance.planningDomains).toContain("family");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("keeps SERPINA1 SS informational rather than promoting it into a scenario", () => {
		const insight = interpretSerpina1(
			serpina1Observation("rs28929474", "GG"),
			serpina1Observation("rs17580", "TT"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("health_risk");

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("keeps a SERPINA1 reference result useful rather than hiding it", () => {
		const insight = interpretSerpina1(
			serpina1Observation("rs28929474", "GG"),
			serpina1Observation("rs17580", "AA"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.label).toBe("For your awareness");

		expect(highlight?.planningRelevance.whyItMatters.length).toBeGreaterThan(0);

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("surfaces lactase persistence as an informational nutrition trait", () => {
		const insight = interpretLactasePersistence(lactaseObservation("CT"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("nutrition_metabolism");

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.label).toBe("Personal characteristic");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("surfaces lactase non-persistence without treating it as a health-risk scenario", () => {
		const insight = interpretLactasePersistence(lactaseObservation("CC"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("nutrition_metabolism");

		expect(highlight?.summary).toContain("adult lactase non-persistence");

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("does not generate financial planning relevance from a lactase trait", () => {
		const insight = interpretLactasePersistence(lactaseObservation("TT"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.planningDomains).toEqual([]);

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("surfaces faster caffeine metabolism as an informational nutrition trait", () => {
		const insight = interpretCaffeineMetabolism(caffeineObservation("AA"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("nutrition_metabolism");

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.label).toBe("Personal characteristic");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("surfaces slower caffeine metabolism without treating it as a health-risk finding", () => {
		const insight = interpretCaffeineMetabolism(caffeineObservation("AC"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.summary).toContain("slower caffeine metabolism");

		expect(highlight?.category).toBe("nutrition_metabolism");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("does not generate financial planning relevance from caffeine metabolism", () => {
		const insight = interpretCaffeineMetabolism(caffeineObservation("CC"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.planningDomains).toEqual([]);

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("surfaces ACTN3 RR as an informational trait", () => {
		const insight = interpretActn3Performance(actn3Observation("CC"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("trait");

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.label).toBe("Personal characteristic");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("surfaces ACTN3 XX as an endurance-associated personal characteristic", () => {
		const insight = interpretActn3Performance(actn3Observation("TT"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("trait");

		expect(highlight?.summary).toContain("endurance-oriented");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("does not generate financial planning relevance from ACTN3", () => {
		const insight = interpretActn3Performance(actn3Observation("CT"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.planningDomains).toEqual([]);

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("surfaces TAS2R38 PAV/PAV as a higher bitter-sensitivity trait", () => {
		const insight = interpretTas2r38BitterTaste(
			tas2r38Observation("rs713598", "CC"),
			tas2r38Observation("rs1726866", "GG"),
			tas2r38Observation("rs10246939", "CC"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("trait");

		expect(highlight?.summary).toContain("higher tendency");

		expect(highlight?.planningRelevance.label).toBe("Personal characteristic");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("surfaces TAS2R38 AVI/AVI as a lower bitter-sensitivity trait", () => {
		const insight = interpretTas2r38BitterTaste(
			tas2r38Observation("rs713598", "GG"),
			tas2r38Observation("rs1726866", "AA"),
			tas2r38Observation("rs10246939", "TT"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("trait");

		expect(highlight?.summary).toContain("lower tendency");

		expect(highlight?.planningRelevance.level).toBe("informational");
	});

	it("does not generate financial planning relevance from TAS2R38", () => {
		const insight = interpretTas2r38BitterTaste(
			tas2r38Observation("rs713598", "CG"),
			tas2r38Observation("rs1726866", "AG"),
			tas2r38Observation("rs10246939", "CT"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.planningDomains).toEqual([]);

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("surfaces typical ALDH2 clearance as an informational metabolism trait", () => {
		const insight = interpretAldh2AlcoholResponse(aldh2Observation("GG"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("nutrition_metabolism");

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.label).toBe("Personal characteristic");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("surfaces reduced ALDH2 clearance without turning it into a financial scenario", () => {
		const insight = interpretAldh2AlcoholResponse(aldh2Observation("AG"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("nutrition_metabolism");

		expect(highlight?.summary).toContain("reduced acetaldehyde clearance");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("does not generate financial planning relevance from ALDH2", () => {
		const insight = interpretAldh2AlcoholResponse(aldh2Observation("AA"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.planningDomains).toEqual([]);

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("surfaces an elevated LPA finding as planning relevant", () => {
		const insight = interpretLpaCardiovascular(
			lpaObservation("rs10455872", "AG"),

			lpaObservation("rs3798220", "TT"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("health_risk");

		expect(highlight?.planningRelevance.level).toBe("potential");

		expect(highlight?.planningRelevance.label).toBe("Worth considering");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(true);

		expect(highlight?.planningRelevance.planningDomains).toContain("health_costs");

		expect(highlight?.planningRelevance.planningDomains).toContain("healthy_working_life");
	});

	it("keeps a reference LPA result informational", () => {
		const insight = interpretLpaCardiovascular(
			lpaObservation("rs10455872", "AA"),

			lpaObservation("rs3798220", "TT"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("does not automatically alter financial assumptions from LPA genetics", () => {
		const insight = interpretLpaCardiovascular(
			lpaObservation("rs10455872", "AG"),

			lpaObservation("rs3798220", "CT"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.scenarioEligible).toBe(true);

		expect(highlight?.planningRelevance.planningDomains).toEqual(
			expect.arrayContaining([
				"health_costs",
				"healthy_working_life",
				"income_interruption",
				"insurance",
			]),
		);
	});

	it("surfaces elevated TCF7L2 diabetes susceptibility as planning relevant", () => {
		const insight = interpretTcf7l2Diabetes(tcf7l2Observation("CT"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("health_risk");

		expect(highlight?.planningRelevance.level).toBe("potential");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(true);

		expect(highlight?.planningRelevance.planningDomains).toEqual(
			expect.arrayContaining(["health_costs", "healthy_working_life", "care_dependency"]),
		);
	});

	it("keeps a reference TCF7L2 result informational", () => {
		const insight = interpretTcf7l2Diabetes(tcf7l2Observation("CC"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("does not turn two TCF7L2 risk alleles into automatic financial assumptions", () => {
		const insight = interpretTcf7l2Diabetes(tcf7l2Observation("TT"));

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.scenarioEligible).toBe(true);

		expect(highlight?.planningRelevance.level).toBe("potential");
	});

	it("surfaces monoallelic MUTYH as an informational carrier finding", () => {
		const insight = interpretMutyhPolyposis(
			mutyhObservation("rs34612342", "CT"),
			mutyhObservation("rs36053993", "CC"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.category).toBe("carrier");

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);
	});

	it("requires confirmation before a biallelic MUTYH result becomes scenario eligible", () => {
		const unconfirmed = interpretMutyhPolyposis(
			mutyhObservation("rs34612342", "CT", "unconfirmed"),
			mutyhObservation("rs36053993", "CT", "unconfirmed"),
		);

		const confirmed = interpretMutyhPolyposis(
			mutyhObservation("rs34612342", "CT", "confirmed"),
			mutyhObservation("rs36053993", "CT", "confirmed"),
		);

		const [unconfirmedHighlight] = buildGeneticHighlights([unconfirmed]);

		const [confirmedHighlight] = buildGeneticHighlights([confirmed]);

		expect(unconfirmedHighlight?.planningRelevance.scenarioEligible).toBe(false);

		expect(confirmedHighlight?.planningRelevance.scenarioEligible).toBe(true);
	});

	it("does not describe absence of selected BRCA variants as a comprehensive negative result", () => {
		const insight = interpretBrcaSelectedVariants(
			clinicalObservation("rs41293455", "GG"),
			clinicalObservation("rs80358928", "CC"),
			clinicalObservation("rs80358972", "CC"),
		);

		const [highlight] = buildGeneticHighlights([insight]);

		expect(highlight?.planningRelevance.level).toBe("informational");

		expect(highlight?.planningRelevance.scenarioEligible).toBe(false);

		expect(highlight?.summary).toContain("not equivalent to a negative comprehensive BRCA");
	});

	it("requires confirmation before a selected pathogenic BRCA result becomes scenario eligible", () => {
		const unconfirmed = interpretBrcaSelectedVariants(
			clinicalObservation("rs41293455", "AG", "unconfirmed"),
			clinicalObservation("rs80358928", "CC", "unconfirmed"),
			clinicalObservation("rs80358972", "CC", "unconfirmed"),
		);

		const confirmed = interpretBrcaSelectedVariants(
			clinicalObservation("rs41293455", "AG", "confirmed"),
			clinicalObservation("rs80358928", "CC", "confirmed"),
			clinicalObservation("rs80358972", "CC", "confirmed"),
		);

		const [unconfirmedHighlight] = buildGeneticHighlights([unconfirmed]);

		const [confirmedHighlight] = buildGeneticHighlights([confirmed]);

		expect(unconfirmedHighlight?.planningRelevance.scenarioEligible).toBe(false);

		expect(unconfirmedHighlight?.planningRelevance.label).toContain("confirm");

		expect(confirmedHighlight?.planningRelevance.scenarioEligible).toBe(true);
	});
});
