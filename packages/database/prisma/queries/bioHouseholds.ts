import { db } from "../client";
import type { Prisma } from "../generated/client";

export async function getPrimaryBioHouseholdForUser(userId: string) {
	return db.bioHousehold.findFirst({
		where: {
			ownerUserId: userId,
			status: {
				not: "ARCHIVED",
			},
		},
		orderBy: {
			createdAt: "asc",
		},
	});
}

export async function getBioHouseholdForUser({
	householdId,
	userId,
}: {
	householdId: string;
	userId: string;
}) {
	return db.bioHousehold.findFirst({
		where: {
			id: householdId,
			ownerUserId: userId,
		},
	});
}

export async function createBioHouseholdForUser({
	userId,
	name,
}: {
	userId: string;
	name?: string;
}) {
	return db.bioHousehold.create({
		data: {
			ownerUserId: userId,
			name: name ?? "My household",
			onboardingStep: 1,
			onboardingComplete: false,
		},
	});
}

export async function getOrCreatePrimaryBioHousehold({
	userId,
	name,
}: {
	userId: string;
	name?: string;
}) {
	const existing = await getPrimaryBioHouseholdForUser(userId);

	if (existing) {
		return existing;
	}

	return createBioHouseholdForUser({
		userId,
		name,
	});
}

async function updateOwnedBioHousehold({
	householdId,
	userId,
	data,
}: {
	householdId: string;
	userId: string;
	data: Prisma.BioHouseholdUpdateManyMutationInput;
}) {
	const result = await db.bioHousehold.updateMany({
		where: {
			id: householdId,
			ownerUserId: userId,
		},
		data,
	});

	if (result.count !== 1) {
		return undefined;
	}

	return db.bioHousehold.findUnique({
		where: {
			id: householdId,
		},
	});
}

export async function saveBioHouseholdOnboardingDraft({
	householdId,
	userId,
	onboardingDraft,
	onboardingStep,
}: {
	householdId: string;
	userId: string;
	onboardingDraft: Prisma.InputJsonValue;
	onboardingStep: number;
}) {
	return updateOwnedBioHousehold({
		householdId,
		userId,
		data: {
			onboardingDraft,
			onboardingStep,
		},
	});
}

export async function updateBioHouseholdFinancialState({
	householdId,
	userId,
	financialState,
}: {
	householdId: string;
	userId: string;
	financialState: Prisma.InputJsonValue;
}) {
	return updateOwnedBioHousehold({
		householdId,
		userId,
		data: {
			financialState,
		},
	});
}

export async function updateBioHouseholdOnboardingProgress({
	householdId,
	userId,
	onboardingStep,
}: {
	householdId: string;
	userId: string;
	onboardingStep: number;
}) {
	return updateOwnedBioHousehold({
		householdId,
		userId,
		data: {
			onboardingStep,
		},
	});
}

export async function completeBioHouseholdOnboarding({
	householdId,
	userId,
	financialState,
}: {
	householdId: string;
	userId: string;
	financialState: Prisma.InputJsonValue;
}) {
	return updateOwnedBioHousehold({
		householdId,
		userId,
		data: {
			status: "ACTIVE",
			financialState,
			onboardingDraft: {
				unset: true,
			},
			onboardingStep: 4,
			onboardingComplete: true,
		},
	});
}
