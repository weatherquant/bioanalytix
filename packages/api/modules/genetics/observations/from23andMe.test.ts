import { describe, expect, it } from "vitest";

import { observationsFrom23andMeRaw } from "./from23andMe";

describe("23andMe observation adapter", () => {
	it("creates provenance-bearing observations from raw data", () => {
		const raw = "rs6025\t1\t169519049\tAG";

		const observations = observationsFrom23andMeRaw(raw, {
			parserVersion: "23andme-parser-v1",
		});

		expect(observations).toHaveLength(1);

		const observation = observations[0];

		expect(observation?.rsid).toBe("rs6025");

		expect(observation?.genotype).toBe("AG");

		expect(observation?.source.type).toBe("consumer_raw_data");

		expect(observation?.source.provider).toBe("23andMe");

		expect(observation?.confirmationStatus).toBe("unconfirmed");
	});

	it("does not invent genome build or strand orientation", () => {
		const observations = observationsFrom23andMeRaw("rs6025\t1\t169519049\tAG", {
			parserVersion: "23andme-parser-v1",
		});

		const observation = observations[0];

		expect(observation?.genomeBuild).toBe("unknown");

		expect(observation?.strandOrientation).toBe("unknown");
	});

	it("retains source location provenance", () => {
		const observations = observationsFrom23andMeRaw(
			["# metadata", "rs6025\t1\t169519049\tAG"].join("\n"),
			{
				parserVersion: "23andme-parser-v1",
			},
		);

		expect(observations[0]?.provenance.sourceRecord).toContain("line=2");

		expect(observations[0]?.provenance.sourceRecord).toContain("position=169519049");
	});

	it("allows genome metadata only when explicitly supplied", () => {
		const observations = observationsFrom23andMeRaw("rs6025\t1\t169519049\tAG", {
			parserVersion: "23andme-parser-v1",
			genomeBuild: "GRCh37",
			strandOrientation: "forward",
		});

		expect(observations[0]?.genomeBuild).toBe("GRCh37");

		expect(observations[0]?.strandOrientation).toBe("forward");
	});

	it("does not convert malformed provider calls into observations", () => {
		const observations = observationsFrom23andMeRaw("rs6025\t1\t169519049\tA-G", {
			parserVersion: "23andme-parser-v1",
		});

		expect(observations).toEqual([]);
	});
});
