import { db } from "../client";

export async function getCurrentBioPlanningProfile(householdId: string) {
	return db.bioPlanningProfile.findFirst({
		where: {
			householdId,
			current: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function replaceCurrentBioPlanningProfile({
	householdId,
	geneticUploadId,
	profileVersion,
	profile,
}: {
	householdId: string;
	geneticUploadId?: string;
	profileVersion: string;
	profile: object;
}) {
	return db.$transaction(async (tx) => {
		await tx.bioPlanningProfile.updateMany({
			where: {
				householdId,
				current: true,
			},
			data: {
				current: false,
			},
		});

		return tx.bioPlanningProfile.create({
			data: {
				householdId,
				geneticUploadId,
				profileVersion,
				profile,
				current: true,
			},
		});
	});
}
