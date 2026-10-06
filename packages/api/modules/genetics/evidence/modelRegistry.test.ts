import { describe, expect, it } from "vitest";

import {
	APOE_COMMON_DIPLOTYPE_MODEL,
	FACTOR_V_LEIDEN_MODEL,
	findModelsWithRequiredRsids,
	getGeneticsModel,
	listGeneticsModels,
	requireGeneticsModel,
} from "./modelRegistry";

describe("genetics model registry", () => {
	it("registers Factor V Leiden", () => {
		const model = getGeneticsModel("f5-factor-v-leiden-vte");

		expect(model).toBeDefined();

		expect(model?.engine).toBe("single_variant");

		expect(model?.requiredRsids).toEqual(["rs6025"]);
	});

	it("registers the common APOE diplotype model", () => {
		const model = getGeneticsModel("apoe-common-diplotype-v1");

		expect(model).toBeDefined();

		expect(model?.engine).toBe("haplotype");

		expect(model?.requiredRsids).toEqual(["rs429358", "rs7412"]);
	});

	it("requires both APOE loci before the model is available", () => {
		const models = findModelsWithRequiredRsids(["rs429358"]);

		expect(models.map((model) => model.id)).not.toContain("apoe-common-diplotype-v1");
	});

	it("finds APOE when both required loci are available", () => {
		const models = findModelsWithRequiredRsids(["rs7412", "rs429358"]);

		expect(models.map((model) => model.id)).toContain("apoe-common-diplotype-v1");
	});

	it("finds Factor V Leiden independently of APOE", () => {
		const models = findModelsWithRequiredRsids(["rs6025"]);

		expect(models.map((model) => model.id)).toEqual(["f5-factor-v-leiden-vte"]);
	});

	it("finds multiple models from a larger variant set", () => {
		const models = findModelsWithRequiredRsids([
			"rs123",
			"rs6025",
			"rs429358",
			"rs7412",
			"rs999",
		]);

		expect(models.map((model) => model.id)).toEqual([
			"f5-factor-v-leiden-vte",
			"apoe-common-diplotype-v1",
		]);
	});

	it("fails closed when a model is unknown", () => {
		expect(() => requireGeneticsModel("unknown-model")).toThrow("Unknown genetics model");
	});

	it("exposes the registered models through the catalogue", () => {
		expect(listGeneticsModels()).toContain(FACTOR_V_LEIDEN_MODEL);

		expect(listGeneticsModels()).toContain(APOE_COMMON_DIPLOTYPE_MODEL);
	});
});
