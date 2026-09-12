import type { GenotypeObservation } from "../observations/types";
import { interpretActn3Performance } from "./actn3PerformanceInterpretation";
import { interpretAlcoholMetabolism } from "./alcoholMetabolismInterpretation";
import { interpretAldh2AlcoholResponse } from "./aldh2AlcoholResponseInterpretation";
import { interpretAmdSusceptibility } from "./amdSusceptibilityInterpretation";
import { interpretApobFamilialHypercholesterolemia } from "./apobFamilialHypercholesterolemiaInterpretation";
import { interpretApoe } from "./apoeInterpretation";
import { interpretBrcaSelectedVariants } from "./brcaSelectedVariantsInterpretation";
import { interpretCaffeineMetabolism } from "./caffeineMetabolismInterpretation";
import { interpretF2Prothrombin } from "./f2ProthrombinInterpretation";
import { interpretFactorVLeiden } from "./factorVLeidenInterpretation";
import { interpretHfe } from "./hfeInterpretation";
import type { BiologicalInsight } from "./insight";
import { interpretLactasePersistence } from "./lactasePersistenceInterpretation";
import { interpretLpaCardiovascular } from "./lpaCardiovascularInterpretation";
import { interpretLrrk2Parkinson } from "./lrrk2ParkinsonInterpretation";
import type { GeneticsModelDefinition } from "./modelRegistry";
import { interpretMutyhPolyposis } from "./mutyhPolyposisInterpretation";
import { interpretSerpina1 } from "./serpina1Interpretation";
import { interpretTas2r38BitterTaste } from "./tas2r38BitterTasteInterpretation";
import { interpretTcf7l2Diabetes } from "./tcf7l2DiabetesInterpretation";
import { interpretTtrAmyloidosis } from "./ttrAmyloidosisInterpretation";

export type ObservationIndex = ReadonlyMap<string, GenotypeObservation>;

export type ModelInterpreter = (
	model: GeneticsModelDefinition,
	observations: ObservationIndex,
) => BiologicalInsight;

function requireObservation(observations: ObservationIndex, rsid: string): GenotypeObservation {
	const observation = observations.get(rsid.toLowerCase());

	if (!observation) {
		throw new Error(`Required genotype observation is missing: ${rsid}`);
	}

	return observation;
}

const interpretFactorVLeidenModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "f5-factor-v-leiden-vte") {
		throw new Error(`Factor V Leiden interpreter received incompatible model: ${model.id}`);
	}

	return interpretFactorVLeiden(requireObservation(observations, "rs6025"));
};

const interpretApoeModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "apoe-common-diplotype-v1") {
		throw new Error(`APOE interpreter received incompatible model: ${model.id}`);
	}

	return interpretApoe(
		requireObservation(observations, "rs429358"),
		requireObservation(observations, "rs7412"),
	);
};

const interpretHfeModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "hfe-common-genotype-v1") {
		throw new Error(`HFE interpreter received incompatible model: ${model.id}`);
	}

	return interpretHfe(
		requireObservation(observations, "rs1800562"),

		requireObservation(observations, "rs1799945"),
	);
};

const interpretSerpina1Model: ModelInterpreter = (model, observations) => {
	if (model.id !== "serpina1-common-genotype-v1") {
		throw new Error(`SERPINA1 interpreter received incompatible model: ${model.id}`);
	}

	return interpretSerpina1(
		requireObservation(observations, "rs28929474"),

		requireObservation(observations, "rs17580"),
	);
};

const interpretLactasePersistenceModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "mcm6-lactase-persistence-v1") {
		throw new Error(`Lactase persistence interpreter received incompatible model: ${model.id}`);
	}

	return interpretLactasePersistence(requireObservation(observations, "rs4988235"));
};

const interpretCaffeineMetabolismModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "cyp1a2-caffeine-metabolism-v1") {
		throw new Error(`Caffeine metabolism interpreter received incompatible model: ${model.id}`);
	}

	return interpretCaffeineMetabolism(requireObservation(observations, "rs762551"));
};

const interpretActn3PerformanceModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "actn3-muscle-performance-v1") {
		throw new Error(`ACTN3 interpreter received incompatible model: ${model.id}`);
	}

	return interpretActn3Performance(requireObservation(observations, "rs1815739"));
};

const interpretTas2r38BitterTasteModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "tas2r38-bitter-taste-v1") {
		throw new Error(`TAS2R38 interpreter received incompatible model: ${model.id}`);
	}

	return interpretTas2r38BitterTaste(
		requireObservation(observations, "rs713598"),

		requireObservation(observations, "rs1726866"),

		requireObservation(observations, "rs10246939"),
	);
};

const interpretAlcoholMetabolismModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "adh1b-alcohol-metabolism-v1") {
		throw new Error(`ADH1B interpreter received incompatible model: ${model.id}`);
	}

	return interpretAlcoholMetabolism(requireObservation(observations, "rs1229984"));
};

const interpretAldh2AlcoholResponseModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "aldh2-alcohol-response-v1") {
		throw new Error(`ALDH2 interpreter received incompatible model: ${model.id}`);
	}

	return interpretAldh2AlcoholResponse(requireObservation(observations, "rs671"));
};

const interpretLpaCardiovascularModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "lpa-cardiovascular-risk-v1") {
		throw new Error(`LPA cardiovascular interpreter received incompatible model: ${model.id}`);
	}

	return interpretLpaCardiovascular(
		requireObservation(observations, "rs10455872"),

		requireObservation(observations, "rs3798220"),
	);
};

const interpretAmdSusceptibilityModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "amd-common-susceptibility-v1") {
		throw new Error(`AMD interpreter received incompatible model: ${model.id}`);
	}

	return interpretAmdSusceptibility(
		requireObservation(observations, "rs1061170"),

		requireObservation(observations, "rs10490924"),
	);
};

const interpretTcf7l2DiabetesModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "tcf7l2-type-2-diabetes-v1") {
		throw new Error(`TCF7L2 interpreter received incompatible model: ${model.id}`);
	}

	return interpretTcf7l2Diabetes(requireObservation(observations, "rs7903146"));
};

const interpretLrrk2ParkinsonModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "lrrk2-g2019s-parkinson-v1") {
		throw new Error(`LRRK2 interpreter received incompatible model: ${model.id}`);
	}

	return interpretLrrk2Parkinson(requireObservation(observations, "rs34637584"));
};

const interpretTtrAmyloidosisModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "ttr-v142i-amyloidosis-v1") {
		throw new Error(`TTR interpreter received incompatible model: ${model.id}`);
	}

	return interpretTtrAmyloidosis(requireObservation(observations, "rs76992529"));
};

const interpretApobFhModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "apob-r3527q-fh-v1") {
		throw new Error(`APOB interpreter received incompatible model: ${model.id}`);
	}

	return interpretApobFamilialHypercholesterolemia(requireObservation(observations, "rs5742904"));
};

const interpretF2ProthrombinModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "f2-g20210a-thrombophilia-v1") {
		throw new Error(`F2 interpreter received incompatible model: ${model.id}`);
	}

	return interpretF2Prothrombin(requireObservation(observations, "rs1799963"));
};

const interpretMutyhPolyposisModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "mutyh-selected-variants-v1") {
		throw new Error(`MUTYH interpreter received incompatible model: ${model.id}`);
	}

	return interpretMutyhPolyposis(
		requireObservation(observations, "rs34612342"),

		requireObservation(observations, "rs36053993"),
	);
};

const interpretBrcaSelectedVariantsModel: ModelInterpreter = (model, observations) => {
	if (model.id !== "brca-selected-substitution-variants-v1") {
		throw new Error(`BRCA interpreter received incompatible model: ${model.id}`);
	}

	return interpretBrcaSelectedVariants(
		requireObservation(observations, "rs41293455"),

		requireObservation(observations, "rs80358928"),

		requireObservation(observations, "rs80358972"),
	);
};

/**
 * Registry of exact scientific model implementations.
 *
 * The model registry describes what models exist.
 * This registry describes how each model is executed.
 *
 * Keeping these concerns separate allows scientific
 * model metadata to evolve independently from the
 * application orchestration layer.
 */
export const MODEL_INTERPRETER_REGISTRY = {
	"f5-factor-v-leiden-vte": interpretFactorVLeidenModel,

	"apoe-common-diplotype-v1": interpretApoeModel,

	"hfe-common-genotype-v1": interpretHfeModel,

	"serpina1-common-genotype-v1": interpretSerpina1Model,

	"mcm6-lactase-persistence-v1": interpretLactasePersistenceModel,

	"cyp1a2-caffeine-metabolism-v1": interpretCaffeineMetabolismModel,

	"actn3-muscle-performance-v1": interpretActn3PerformanceModel,

	"tas2r38-bitter-taste-v1": interpretTas2r38BitterTasteModel,

	"adh1b-alcohol-metabolism-v1": interpretAlcoholMetabolismModel,

	"aldh2-alcohol-response-v1": interpretAldh2AlcoholResponseModel,

	"lpa-cardiovascular-risk-v1": interpretLpaCardiovascularModel,

	"amd-common-susceptibility-v1": interpretAmdSusceptibilityModel,

	"tcf7l2-type-2-diabetes-v1": interpretTcf7l2DiabetesModel,

	"lrrk2-g2019s-parkinson-v1": interpretLrrk2ParkinsonModel,

	"ttr-v142i-amyloidosis-v1": interpretTtrAmyloidosisModel,

	"apob-r3527q-fh-v1": interpretApobFhModel,

	"f2-g20210a-thrombophilia-v1": interpretF2ProthrombinModel,

	"mutyh-selected-variants-v1": interpretMutyhPolyposisModel,

	"brca-selected-substitution-variants-v1": interpretBrcaSelectedVariantsModel,
} as const satisfies Record<string, ModelInterpreter>;

export function getModelInterpreter(modelId: string): ModelInterpreter | undefined {
	return (MODEL_INTERPRETER_REGISTRY as Record<string, ModelInterpreter>)[modelId];
}

export function requireModelInterpreter(modelId: string): ModelInterpreter {
	const interpreter = getModelInterpreter(modelId);

	if (!interpreter) {
		throw new Error(`No model interpreter registered for model: ${modelId}`);
	}

	return interpreter;
}
