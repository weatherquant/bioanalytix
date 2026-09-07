import { db } from "../client";
import type { BioScenarioSource } from "../generated/client";

export async function createBioScenarioRun({
	householdId,
	scenarioQuestionId,
	source,
	planningExposureId,
	parameters,
	result,
	engineVersion,
}: {
	householdId: string;
	scenarioQuestionId: string;
	source: BioScenarioSource;
	planningExposureId?: string | null;
	parameters: object;
	result: object;
	engineVersion: string;
}) {
	return db.bioScenarioRun.create({
		data: {
			householdId,
			scenarioQuestionId,
			source,
			planningExposureId: planningExposureId ?? null,
			parameters,
			result,
			engineVersion,
		},
	});
}

export async function listBioScenarioRunsForHousehold(householdId: string) {
	return db.bioScenarioRun.findMany({
		where: {
			householdId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function listBioScenarioRunsForQuestion({
	householdId,
	scenarioQuestionId,
}: {
	householdId: string;
	scenarioQuestionId: string;
}) {
	return db.bioScenarioRun.findMany({
		where: {
			householdId,
			scenarioQuestionId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function getLatestBioScenarioRunForQuestion({
	householdId,
	scenarioQuestionId,
}: {
	householdId: string;
	scenarioQuestionId: string;
}) {
	return db.bioScenarioRun.findFirst({
		where: {
			householdId,
			scenarioQuestionId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}
