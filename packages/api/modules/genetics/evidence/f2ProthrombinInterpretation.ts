import type { GenotypeObservation } from "../observations/types";
import { F2_G20210A_EVIDENCE } from "./f2Prothrombin";
import type { BiologicalInsight } from "./insight";
import { F2_PROTHROMBIN_MODEL } from "./modelRegistry";
import { interpretSingleClinicalVariant } from "./singleVariantClinicalInterpreter";

export function interpretF2Prothrombin(observation: GenotypeObservation): BiologicalInsight {
	return interpretSingleClinicalVariant(observation, {
		insightId: "f2-g20210a-thrombophilia",

		title: "Prothrombin thrombophilia susceptibility",

		domain: "thrombosis",

		model: F2_PROTHROMBIN_MODEL,

		rsid: "rs1799963",

		referenceAllele: "G",

		variantAllele: "A",

		evidenceStrength: "established",

		evidenceIds: [F2_G20210A_EVIDENCE.id],

		limitations: F2_G20210A_EVIDENCE.limitations,
	});
}
