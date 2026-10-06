import type { GenotypeObservation } from "../observations/types";
import type { BiologicalInsight } from "./insight";
import { TTR_AMYLOIDOSIS_MODEL } from "./modelRegistry";
import { interpretSingleClinicalVariant } from "./singleVariantClinicalInterpreter";
import { TTR_V142I_EVIDENCE } from "./ttrAmyloidosis";

export function interpretTtrAmyloidosis(observation: GenotypeObservation): BiologicalInsight {
	return interpretSingleClinicalVariant(observation, {
		insightId: "ttr-v142i-amyloidosis-susceptibility",

		title: "Hereditary transthyretin amyloidosis susceptibility",

		domain: "systemic",

		model: TTR_AMYLOIDOSIS_MODEL,

		rsid: "rs76992529",

		referenceAllele: "G",

		variantAllele: "A",

		evidenceStrength: "established",

		evidenceIds: [TTR_V142I_EVIDENCE.id],

		limitations: TTR_V142I_EVIDENCE.limitations,
	});
}
