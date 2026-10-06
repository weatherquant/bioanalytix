import { describe, expect, it } from "vitest";

import { parse23andMe, parse23andMeRecords } from "./parser";

describe("23andMe parser", () => {
	it("parses a structurally valid genotype record", () => {
		const raw = ["# example file", "rs6025\t1\t169519049\tag"].join("\n");

		const records = parse23andMeRecords(raw);

		expect(records).toHaveLength(1);

		expect(records[0]).toMatchObject({
			rsid: "rs6025",
			chromosome: "1",
			position: "169519049",
			genotype: "AG",
			lineNumber: 2,
		});
	});

	it("preserves the original source record", () => {
		const row = "rs6025\t1\t169519049\tAG";

		const records = parse23andMeRecords(row);

		expect(records[0]?.sourceRecord).toBe(row);
	});

	it("rejects malformed genotype representations rather than repairing them", () => {
		const raw = "rs6025\t1\t169519049\tA-G";

		expect(parse23andMeRecords(raw)).toEqual([]);
	});

	it("excludes explicit no-calls", () => {
		const raw = ["rs1\t1\t100\t--", "rs2\t1\t200\t00"].join("\n");

		expect(parse23andMeRecords(raw)).toEqual([]);
	});

	it("retains backwards-compatible Record output", () => {
		const raw = ["rs6025\t1\t169519049\tAG", "rs429358\t19\t44908684\tCT"].join("\n");

		expect(parse23andMe(raw)).toEqual({
			rs6025: "AG",
			rs429358: "CT",
		});
	});
});
