import { describe, expect, it } from "vitest";

import { biologicalInsightToPlanningExposures } from "../../planning/geneticsBridge";
import { observationsFrom23andMeRaw } from "../observations/from23andMe";
import { interpretAvailableModels } from "./interpretationDispatcher";

function observationsFromRaw(raw: string) {
	return observationsFrom23andMeRaw(raw, {
		parserVersion: "23andme-parser-v1",
	});
}

describe("genetics scientific pipeline", () => {
	it("flows raw DNA through parsing, observations and registered interpretation", () => {
		const raw = [
			"# Bioanalytix integration fixture",
			"rs6025\t1\t169519049\tAG",
			"rs429358\t19\t44908684\tCT",
			"rs7412\t19\t44908822\tCC",
		].join("\n");

		const observations = observationsFromRaw(raw);

		const insights = interpretAvailableModels(observations);

		expect(observations).toHaveLength(3);

		expect(insights.map((insight) => insight.model.id)).toEqual([
			"f5-factor-v-leiden-vte",
			"apoe-common-diplotype-v1",
		]);

		const factorV = insights.find((insight) => insight.model.id === "f5-factor-v-leiden-vte");

		const apoe = insights.find((insight) => insight.model.id === "apoe-common-diplotype-v1");

		expect(factorV?.result.direction).toBe("higher");

		expect(apoe?.result.direction).toBe("higher");

		expect(apoe?.result.haplotype).toBe("e3/e4");
	});

	it("preserves provenance and confirmation state across the interpretation boundary", () => {
		const raw = ["# source metadata", "rs6025\t1\t169519049\tAG"].join("\n");

		const observations = observationsFromRaw(raw);

		const observation = observations[0];

		expect(observation?.source.type).toBe("consumer_raw_data");

		expect(observation?.confirmationStatus).toBe("unconfirmed");

		expect(observation?.provenance.parserVersion).toBe("23andme-parser-v1");

		expect(observation?.provenance.sourceRecord).toContain("line=2");

		expect(observation?.provenance.sourceRecord).toContain("position=169519049");

		const insights = interpretAvailableModels(observations);

		expect(insights).toHaveLength(1);

		expect(insights[0]?.input.source).toBe("consumer_raw_data");

		expect(insights[0]?.input.confirmationStatus).toBe("unconfirmed");
	});

	it("converts supported higher biological findings into governed planning exposures", () => {
		const raw = [
			"rs6025\t1\t169519049\tAG",
			"rs429358\t19\t44908684\tCT",
			"rs7412\t19\t44908822\tCC",
		].join("\n");

		const insights = interpretAvailableModels(observationsFromRaw(raw));

		const exposures = insights.flatMap((insight) =>
			biologicalInsightToPlanningExposures(insight),
		);

		expect(exposures).toHaveLength(7);

		expect(exposures.map((exposure) => exposure.domain)).toEqual([
			"healthy_working_life",
			"health_costs",
			"premature_mortality",
			"care_dependency",
			"healthy_working_life",
			"estate",
			"partner_dependency",
		]);

		expect(exposures.every((exposure) => exposure.basis === "biological_insight")).toBe(true);
	});

	it("does not manufacture biological or planning findings from insufficient or malformed DNA", () => {
		const raw = [
			// Invalid Factor V Leiden call.
			"rs6025\t1\t169519049\tA-G",

			// Only one of the two required
			// APOE loci is present.
			"rs429358\t19\t44908684\tCT",
		].join("\n");

		const observations = observationsFromRaw(raw);

		/**
		 * The malformed rs6025 record is rejected
		 * structurally. rs429358 remains a valid
		 * observation, but it is insufficient for
		 * the registered APOE diplotype model.
		 */
		expect(observations.map((observation) => observation.rsid)).toEqual(["rs429358"]);

		const insights = interpretAvailableModels(observations);

		expect(insights).toEqual([]);

		const exposures = insights.flatMap((insight) =>
			biologicalInsightToPlanningExposures(insight),
		);

		expect(exposures).toEqual([]);
	});

	it("does not create genotype-attributed planning exposures from reference findings", () => {
		const raw = [
			// Factor V Leiden reference genotype.
			"rs6025\t1\t169519049\tGG",

			// Common APOE e3/e3 diplotype.
			"rs429358\t19\t44908684\tTT",
			"rs7412\t19\t44908822\tCC",
		].join("\n");

		const insights = interpretAvailableModels(observationsFromRaw(raw));

		expect(insights).toHaveLength(2);

		expect(insights.every((insight) => insight.result.direction === "reference")).toBe(true);

		const exposures = insights.flatMap((insight) =>
			biologicalInsightToPlanningExposures(insight),
		);

		expect(exposures).toEqual([]);
	});
});
