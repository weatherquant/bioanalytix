import type { GenotypeObservation } from "../observations/types";
import { APOB_R3527Q_EVIDENCE } from "./apobFamilialHypercholesterolemia";
import type { BiologicalInsight } from "./insight";
import { APOB_FH_MODEL } from "./modelRegistry";
import { interpretSingleClinicalVariant } from "./singleVariantClinicalInterpreter";

export function interpretApobFamilialHypercholesterolemia(
	observation: GenotypeObservation,
): BiologicalInsight {
	return interpretSingleClinicalVariant(observation, {
		insightId: "apob-r3527q-familial-hypercholesterolemia",

		title: "APOB-related familial hypercholesterolaemia",

		domain: "cardiovascular",

		model: APOB_FH_MODEL,

		rsid: "rs5742904",

		/*
		 * rs5742904 genomic plus-strand:
		 * reference C, pathogenic T.
		 */
		referenceAllele: "C",

		variantAllele: "T",

		evidenceStrength: "established",

		evidenceIds: [APOB_R3527Q_EVIDENCE.id],

		limitations: APOB_R3527Q_EVIDENCE.limitations,
	});
}
